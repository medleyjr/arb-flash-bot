
const { Contract, ethers, BigNumber } = require("ethers");
const AppUtils = require('./AppUtils');
const MoneyMgr = require('./MoneyMgr');

var ArbConfig = null;

console.log(process.env.NETWORK);

if (process.env.NETWORK === 'FTMLIVE') {
    ArbConfig = require('./Config/FTMLiveConfig');
}
else if (process.env.NETWORK === 'ONELIVE') {
    ArbConfig = require('./Config/OneLiveConfig');
}
else {
    ArbConfig = require('./Config/FTMTestConfig');
}


const ERC20 = require("./artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json");
const FactoryABI = require("./artifacts/interfaces/IUniswapV2Factory.json");
const PairABI = require("./artifacts/interfaces/IUniswapV2Pair.json");
const BatchFlashDemo = require("./artifacts/contracts/BatchFlashDemo.sol/BatchFlashDemo.json");
const UniswapArbitrage = require("./artifacts/contracts/UniswapArbitrage.sol/UniswapArbitrage.json");
const RouterABI = require("./artifacts/interfaces/IUniswapV2Router02.sol/IUniswapV2Router02.json");


// The ERC-20 Contract ABI, which is a common contract interface
// for tokens (this is the Human-Readable ABI format)
const lpABI = [
    // An event triggered whenever anyone transfers to someone else
    "event Transfer(address indexed from, address indexed to, uint amount)",
    "event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)"
];


AppUtils.logMsgToFile('Starting Jaco Arb', true);


const provider = new ethers.providers.JsonRpcProvider(ArbConfig.rpcUrl);
const provider2 = new ethers.providers.JsonRpcProvider(ArbConfig.rpcUrl2);
const signer = new ethers.Wallet(ArbConfig.walletPrivateKey, provider);
const demoLoanContract = new ethers.Contract(ArbConfig.arbContractAddress, BatchFlashDemo.abi, signer);
const uniswapArbitrage = new ethers.Contract(ArbConfig.uniswapArbContractAddress, UniswapArbitrage.abi, signer);
const loanTokenContract = new Contract(ArbConfig.loanTokenAddress, ERC20.abi, signer);
let loanTokenDecimals = 0;
let tokensChanged = [];
let dexObjList = [];
let loanAmount = null;
let bProcessingPriceChanges = true;

AppUtils.ERC20 = ERC20;
AppUtils.ArbConfig = ArbConfig;
AppUtils.signer = signer;
AppUtils.demoLoanContract = demoLoanContract;
AppUtils.uniswapArbitrage = uniswapArbitrage;
AppUtils.provider = provider;
let arbErrors = 0;



async function flashLoanArb(swapTokenAddress, buyRouterAddress, sellRouterAddress) {
    try {
        const gPrice = await AppUtils.getExecGasPrice();

        if (gPrice.toNumber() > 2200000000000) {
            AppUtils.logMsgToFile('Gas price to high', true);
            return;
        }
        /*let est = await demoLoanContract.estimateGas.flashloan(ArbConfig.loanTokenAddress, loanAmount, swapTokenAddress, buyRouterAddress, sellRouterAddress, { gasLimit: 9_000_000, gasPrice: gPrice.toNumber() });
        console.log(`approve gas units ${est.toNumber()}`); //ftm live = 546682
        console.log(ethers.utils.formatEther(gPrice.mul(est)));*/

        let trs = await demoLoanContract.flashloan(ArbConfig.loanTokenAddress, loanAmount, swapTokenAddress, buyRouterAddress, sellRouterAddress, { gasPrice: gPrice.toNumber() });
        AppUtils.logMsgToFile(trs.hash, true);
    }
    catch (e) {
        AppUtils.logError(e);
    }

    process.exit();
}


function getAmountOutInternal(amountIn, reserveIn, reserveOut, fee) {
    let amountInWithFee = amountIn.mul(BigNumber.from(1000 - (fee * 10)));
    let numerator = amountInWithFee.mul(reserveOut);
    let denominator = reserveIn.mul(BigNumber.from(1000)).add(amountInWithFee);
    amountOut = numerator.div(denominator);
    return amountOut;
}


async function checkIfPricesChanged() {
    //console.log('checking the markets...');

    if (tokensChanged.length == 0 || bProcessingPriceChanges)
        return;

    bProcessingPriceChanges = true;
    let coins = '';
    for (let i = 0; i < tokensChanged.length; i++) {
        coins += tokensChanged[i].code + ', ';
    }

    AppUtils.logMsgToFile(`Processing ${tokensChanged.length} coin price changes: ${coins}`);
    //console.log(tokensChanged);

    var tokens = tokensChanged.slice();
    tokensChanged = [];

    const gPrice = await AppUtils.getExecGasPrice();

    const accBal = await AppUtils.GetAccountBalance();
    if (accBal < ArbConfig.minAccountValue) {
        AppUtils.logMsgToFile('Account balance is too low. ' + accBal, true);
        process.exit();
    }

    /*if (gPrice.toNumber() > 500000000000) {
        console.log('Gas price to high');
        return;
    }*/

    //const profitRequired = gPrice.toNumber() / ArbConfig.gasProfitRatio;

    for (let iToken = 0; iToken < tokens.length; iToken++) {

        for (let iBuyDex = 0; iBuyDex < ArbConfig.dexList.length; iBuyDex++) {

            let iCoinBuyIndex = AppUtils.getCoinIndexInDex(iBuyDex, tokens[iToken].address);

            if (iCoinBuyIndex == -1)
                continue;


            //console.log(dexObjList[iBuyDex].coinList[0]);
            /*const amountOut = await getAmountOut(ArbConfig.loanTokenAddress, ArbConfig.dexList[iBuyDex].coins[iCoinBuyIndex].address, loanAmount, dexObjList[iBuyDex].routerContract, signer);
            const amountOutInternal = getAmountOutInternal(loanAmount,
                dexObjList[iBuyDex].coinList[iCoinBuyIndex].reserves[1], dexObjList[iBuyDex].coinList[iCoinBuyIndex].reserves[0],
                ArbConfig.dexList[iBuyDex].feePerc);*/
            //console.log(`Amount out ${ethers.utils.formatEther(amountOut)} Internal amount out ${ethers.utils.formatEther(amountOutInternal)}`);

            for (let iSellDex = 0; iSellDex < ArbConfig.dexList.length; iSellDex++) {

                if (iBuyDex == iSellDex)
                    continue;

                let iCoinSellIndex = AppUtils.getCoinIndexInDex(iSellDex, tokens[iToken].address);

                if (iCoinSellIndex == -1)
                    continue;

                const result = await checkForArb(iBuyDex, iCoinBuyIndex, iSellDex, iCoinSellIndex, gPrice);

                if (result) {
                    bProcessingPriceChanges = false;
                    return;
                }

                /*const amountIn = await getAmountOut(ArbConfig.dexList[iSellDex].coins[iCoinSellIndex].address, ArbConfig.loanTokenAddress, amountOut, dexObjList[iSellDex].routerContract, signer);

                const amountInInternal = getAmountOutInternal(amountOutInternal,
                    dexObjList[iSellDex].coinList[iCoinSellIndex].reserves[0], dexObjList[iSellDex].coinList[iCoinSellIndex].reserves[1],
                    ArbConfig.dexList[iSellDex].feePerc);
                //console.log(`Amount in ${ethers.utils.formatEther(amountIn)} Internal amount in ${ethers.utils.formatEther(amountInInternal)}`);

                const pnl = AppUtils.bigNToDec(amountIn.sub(loanAmount), loanTokenDecimals, 6);
                const nLoanAmount = AppUtils.bigNToDec(loanAmount, loanTokenDecimals, 6);
                const pnlPerc = (pnl / nLoanAmount) * 100;

                const requiredPnl = profitRequired + (nLoanAmount * 0.001);
                if (pnl > 0) {
                    AppUtils.logMsgToFile(`PnL value: ${pnl}. Pnl required ${requiredPnl} PnL %: ${pnlPerc}. buy dex ${ArbConfig.dexList[iBuyDex].name}, sell dex ${ArbConfig.dexList[iSellDex].name}, coin ${ArbConfig.dexList[iSellDex].coins[iCoinSellIndex].code}`);
                }

                if (pnl > (requiredPnl)) {

                    AppUtils.logMsgToFile(`ARB OPERTUNITY!!! PnL value: ${pnl}. PnL %: ${pnlPerc}. buy dex ${ArbConfig.dexList[iBuyDex].name}, sell dex ${ArbConfig.dexList[iSellDex].name}, coin ${ArbConfig.dexList[iSellDex].coins[iCoinSellIndex].code}`, true);

                    //await simpleFlashLoan(tokens[iToken], ArbConfig.dexList[iBuyDex].swapRouterAddress, ArbConfig.dexList[iSellDex].swapRouterAddress);

                    try {
                        const trs = await uniswapArbitrage.doArbitrage(BigNumber.from(10009), loanAmount, ArbConfig.loanTokenAddress,
                            tokens[iToken], ArbConfig.dexList[0].swapRouterAddress, ArbConfig.dexList[1].swapRouterAddress, { gasPrice: gPrice });
                        AppUtils.logMsgToFile(trs.hash, true);
                    }
                    catch (e) {
                        AppUtils.logError(e);
                    }
                    await MoneyMgr.getBalance(true);

                    return;
                }*/
            }

        }

    }

    bProcessingPriceChanges = false;
}

async function checkForArb(iBuyDex, iCoinBuyIndex, iSellDex, iCoinSellIndex, gPrice) {

    //const cashIter = 4;
    const amountIncr = ethers.utils.parseEther('4');//loanAmount.div(8);
    let buyAmount = amountIncr;
    let cashBuyAmount = null;
    let prevPnl = -1;
    let prevBuyAmount = buyAmount;
    let pnl = 0;
    let cashPnl = 0;
    //let i = 0;
    const maxAmount = loanAmount;//ethers.utils.parseEther('200');

    //AppUtils.logMsgToFile(`Max amount ${ethers.utils.formatEther(maxAmount)}`);

    while (pnl > prevPnl) {

        //AppUtils.logMsgToFile(`Buy amount ${ethers.utils.formatEther(buyAmount)}`);

        if (prevBuyAmount.lte(loanAmount)) {
            cashPnl = pnl;
            cashBuyAmount = prevBuyAmount;
        }

        if (buyAmount.gt(maxAmount)) {
            break;
        }

        //i++;
        prevPnl = pnl;
        prevBuyAmount = buyAmount;

        /*if (buyAmount.gt(ethers.utils.parseEther('30'))) {
            console.log('lets break');
        }*/

        const amountOut = getAmountOutInternal(buyAmount,
            dexObjList[iBuyDex].coinList[iCoinBuyIndex].reserves[1], dexObjList[iBuyDex].coinList[iCoinBuyIndex].reserves[0],
            ArbConfig.dexList[iBuyDex].feePerc);

        const amountIn = getAmountOutInternal(amountOut,
            dexObjList[iSellDex].coinList[iCoinSellIndex].reserves[0], dexObjList[iSellDex].coinList[iCoinSellIndex].reserves[1],
            ArbConfig.dexList[iSellDex].feePerc);

        pnl = AppUtils.bigNToDec(amountIn.sub(buyAmount), loanTokenDecimals, 6);

        if (prevBuyAmount.lte(loanAmount)) {
            buyAmount = buyAmount.add(amountIncr);
        }
        else {
            buyAmount = buyAmount.mul(BigNumber.from(2));
        }

    }

    pnl = prevPnl;
    buyAmount = prevBuyAmount;

    let nLoanAmount = AppUtils.bigNToDec(cashBuyAmount, loanTokenDecimals, 6);
    let pnlPerc = (cashPnl / nLoanAmount) * 100;

    //const gasCost = gPrice.toNumber() / ArbConfig.gasProfitRatio;
    const gasCost = AppUtils.bigNToDec(gPrice.mul(350000), loanTokenDecimals, 6);
    let requireFlashloan = false;
    let requiredPnl = gasCost + (nLoanAmount * 0.002);

    //lets try flash loan pnl if cash pnl is too low
    if (cashPnl < requiredPnl && buyAmount.gt(loanAmount)) {
        nLoanAmount = AppUtils.bigNToDec(buyAmount, loanTokenDecimals, 6);
        pnlPerc = (pnl / nLoanAmount) * 100;

        //gas fee = 0.11FTM when gas price = 161 wei
        requiredPnl = (gasCost * 5) + (nLoanAmount * 0.0009);
        requireFlashloan = true;
    }
    else {
        pnl = cashPnl;
        buyAmount = cashBuyAmount;
    }

    if (pnl > 0) {
        AppUtils.logMsgToFile(`PnL value: ${pnl}. Pnl required ${requiredPnl} PnL %: ${pnlPerc}. Buy amout ${nLoanAmount}. buy dex ${ArbConfig.dexList[iBuyDex].name}, sell dex ${ArbConfig.dexList[iSellDex].name}, coin ${ArbConfig.dexList[iSellDex].coins[iCoinSellIndex].code}`);

        //wait 20 seconds and recalc pnl to see if reserves were updated.
        await AppUtils.delay(20);

        const sellCoinAdrress = ArbConfig.dexList[iSellDex].coins[iCoinSellIndex].address;

        const amountOut = getAmountOutInternal(buyAmount,
            dexObjList[iBuyDex].coinList[iCoinBuyIndex].reserves[1], dexObjList[iBuyDex].coinList[iCoinBuyIndex].reserves[0],
            ArbConfig.dexList[iBuyDex].feePerc);

        const amountIn = getAmountOutInternal(amountOut,
            dexObjList[iSellDex].coinList[iCoinSellIndex].reserves[0], dexObjList[iSellDex].coinList[iCoinSellIndex].reserves[1],
            ArbConfig.dexList[iSellDex].feePerc);

        let pnl_new = AppUtils.bigNToDec(amountIn.sub(buyAmount), loanTokenDecimals, 6);

        const ext_values_out = await dexObjList[iBuyDex].routerContract.getAmountsOut(buyAmount, [ArbConfig.loanTokenAddress, sellCoinAdrress]);
        const ext_values_in = await dexObjList[iSellDex].routerContract.getAmountsOut(ext_values_out[1], [sellCoinAdrress, ArbConfig.loanTokenAddress]);
        pnl_ext = AppUtils.bigNToDec(ext_values_in[1].sub(buyAmount), loanTokenDecimals, 6);

        if (pnl_new != pnl_ext) {
            /*const amountOut = getAmountOutInternal(buyAmount,
                dexObjList[iBuyDex].coinList[iCoinBuyIndex].reserves[1], dexObjList[iBuyDex].coinList[iCoinBuyIndex].reserves[0],
                ArbConfig.dexList[iBuyDex].feePerc);

            const amountIn = getAmountOutInternal(amountOut,
                dexObjList[iSellDex].coinList[iCoinSellIndex].reserves[0], dexObjList[iSellDex].coinList[iCoinSellIndex].reserves[1],
                ArbConfig.dexList[iSellDex].feePerc);*/

            AppUtils.logMsgToFile(`Amount out ${ethers.utils.formatEther(ext_values_out[1])} Internal amount out ${ethers.utils.formatEther(amountOut)}`);
            AppUtils.logMsgToFile(`Amount in ${ethers.utils.formatEther(ext_values_in[1])} Internal amount out ${ethers.utils.formatEther(amountIn)}`);

            AppUtils.logMsgToFile(`pnl_new CHANGED from ${pnl_new} to ${pnl_ext}`);
            pnl_new = pnl_ext;
        }

        if (pnl != pnl_new) {
            AppUtils.logMsgToFile(`pnl changed from ${pnl} to ${pnl_new}`);
            pnl = pnl_new;
        }
    }

    if (pnl > requiredPnl) {

        AppUtils.logMsgToFile(`ARB OPERTUNITY!!! PnL value: ${pnl}. PnL %: ${pnlPerc}. Buy amout ${nLoanAmount}. buy dex ${ArbConfig.dexList[iBuyDex].name}, sell dex ${ArbConfig.dexList[iSellDex].name}, coin ${ArbConfig.dexList[iSellDex].coins[iCoinSellIndex].code}`, true);

        try {

            const sellCoinAdrress = ArbConfig.dexList[iSellDex].coins[iCoinSellIndex].address;

            if (requireFlashloan) {
                const trs = await demoLoanContract.flashloan(ArbConfig.loanTokenAddress, buyAmount, sellCoinAdrress, ArbConfig.dexList[iBuyDex].swapRouterAddress, ArbConfig.dexList[iSellDex].swapRouterAddress, { gasPrice: gPrice });

                await AppUtils.delay(500);

                const bal = await MoneyMgr.getBalance(false);
                AppUtils.logMsgToFile(`balance = ${bal}. Flash loan Arb hash ${trs.hash}`, true);
                AppUtils.logMsgToFile(trs);

            }
            else {
                const trs = await uniswapArbitrage.doArbitrage(BigNumber.from(1002), buyAmount, ArbConfig.loanTokenAddress,
                    sellCoinAdrress, ArbConfig.dexList[iBuyDex].swapRouterAddress, ArbConfig.dexList[iSellDex].swapRouterAddress, { gasPrice: gPrice.toNumber(), gasLimit: 350000 });

                const rsp = await AppUtils.processTrsRsp('arb', trs);
                if (rsp) {
                    const oldLoanAmount = loanAmount;
                    loanAmount = await MoneyMgr.getBalance(true);
                    if (loanAmount.lt(oldLoanAmount)) {
                        AppUtils.logMsgToFile('contract loan amount was reduced.');
                        arbErrors++;
                    }
                }
                else {
                    arbErrors++;
                }
            }


        }
        catch (e) {
            AppUtils.logError(e);
            arbErrors++;
        }

        if (arbErrors >= 5) {
            console.log('To many errors');
            process.exit();
        }

        return true;
    }

    return false;
}

async function listenPriceEvents() {

    for (let i = 0; i < ArbConfig.dexList.length; i++) {

        const factoryContract = new Contract(ArbConfig.dexList[i].swapFactoryAddress, FactoryABI.abi, signer);
        const routerContract = new Contract(ArbConfig.dexList[i].swapRouterAddress, RouterABI.abi, signer);

        dexObjList.push(
            {
                'factoryContract': factoryContract,
                'routerContract': routerContract,
                'coinList': []
            }
        );

        for (let j = 0; j < ArbConfig.dexList[i].coins.length; j++) {

            const pairAddress = await factoryContract.getPair(ArbConfig.loanTokenAddress, ArbConfig.dexList[i].coins[j].address);
            const pairContract = new Contract(pairAddress, PairABI.abi, signer);
            const pairContract2 = new Contract(pairAddress, PairABI.abi, provider2);

            AppUtils.logMsgToFile(`Listen on dex ${ArbConfig.dexList[i].name} coin ${ArbConfig.dexList[i].coins[j].code}, pair address ${pairAddress}`);

            let coinObj = {
                'coin': ArbConfig.dexList[i].coins[j],
                'pairContract': pairContract,
                'reserves': []
            };

            dexObjList[i].coinList.push(coinObj);

            /*let filter = pairContract.filters.Swap();
            pairContract.on(filter, async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {

                //console.log(sender); //log the router address
                if (tokensChanged.find(t => t.address == ArbConfig.dexList[i].coins[j].address) == undefined)
                    tokensChanged.push(ArbConfig.dexList[i].coins[j]);

                reserves = await AppUtils.getReserves(ArbConfig.dexList[i].coins[j].address, ArbConfig.loanTokenAddress, pairContract);

                AppUtils.logMsgToFile(`Price changes reserves for ${ArbConfig.dexList[i].coins[j].code} on dex ${ArbConfig.dexList[i].name}, r0 = ${reserves[0]}, r1 = ${reserves[1]}`)

            });*/

            let filterSync = pairContract.filters.Sync();
            pairContract.on(filterSync, async (reserve0, reserve1, event) => {

                //if (tokensChanged.find(t => t.address == ArbConfig.dexList[i].coins[j].address) == undefined)
                //    tokensChanged.push(ArbConfig.dexList[i].coins[j]);

                reserves = [
                    (await pairContract.token0()) === ArbConfig.dexList[i].coins[j].address ? reserve0 : reserve1,
                    (await pairContract.token1()) === ArbConfig.loanTokenAddress ? reserve1 : reserve0
                ];


                AppUtils.logMsgToFile(`Sync changes reserves for ${ArbConfig.dexList[i].coins[j].code} on dex ${ArbConfig.dexList[i].name}, r0 = ${reserves[0]}, r1 = ${reserves[1]}`);


                //console.log(`Sync changes reserves for ${ArbConfig.dexList[i].coins[j].code}, r0 = ${coinObj.reserves[0]}, r1 = ${coinObj.reserves[1]}`)
            });


            let filterSync2 = pairContract2.filters.Sync();
            pairContract2.on(filterSync2, async (reserve0, reserve1, event) => {
                if (tokensChanged.find(t => t.address == ArbConfig.dexList[i].coins[j].address) == undefined)
                    tokensChanged.push(ArbConfig.dexList[i].coins[j]);

                coinObj.reserves = [
                    (await pairContract.token0()) === ArbConfig.dexList[i].coins[j].address ? reserve0 : reserve1,
                    (await pairContract.token1()) === ArbConfig.loanTokenAddress ? reserve1 : reserve0
                ];

                AppUtils.logMsgToFile(`Sync2 changes reserves for ${ArbConfig.dexList[i].coins[j].code} on dex ${ArbConfig.dexList[i].name}, r0 = ${coinObj.reserves[0]}, r1 = ${coinObj.reserves[1]}`);

            });


            //add all the coins at startup for initial checking
            if (tokensChanged.find(t => t == ArbConfig.dexList[i].coins[j].address) == undefined)
                tokensChanged.push(ArbConfig.dexList[i].coins[j]);

            coinObj.reserves = await AppUtils.getReserves(ArbConfig.dexList[i].coins[j].address, ArbConfig.loanTokenAddress, pairContract);
            //AppUtils.logMsgToFile(`reserves for ${ArbConfig.dexList[i].coins[j].code} on dex ${ArbConfig.dexList[i].name}, r0 = ${coinObj.reserves[0]}, r1 = ${coinObj.reserves[1]}`)
        }
    }

    bProcessingPriceChanges = false;
    /*provider.on("block", (blockNumber) => {
        AppUtils.logMsgToFile('New block number ' + blockNumber);
    })*/
}

async function runAsync(bArbOnly) {

    loanTokenDecimals = await loanTokenContract.decimals();

    AppUtils.loanTokenDecimals = loanTokenDecimals;
    AppUtils.loanTokenContract = loanTokenContract;

    const b = await AppUtils.GetAccountBalance();
    console.log(`account balance ${b}`);

    loanAmount = await MoneyMgr.getBalance(true); //ethers.utils.parseUnits("200.0", loanTokenDecimals);


    /*for (let i = 0; i < 2; i++) {
        const gPrice = await AppUtils.getExecGasPrice();
        const trs = await uniswapArbitrage.doArbitrage(BigNumber.from(1040), ethers.utils.parseUnits("20.0", loanTokenDecimals), ArbConfig.loanTokenAddress,
            '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E', ArbConfig.dexList[0].swapRouterAddress, ArbConfig.dexList[2].swapRouterAddress, { gasPrice: gPrice.toNumber(), gasLimit: 350000 });

        await AppUtils.processTrsRsp('arb', trs);
        //AppUtils.logMsgToFile(`Arb hash ${trs.hash}`, true);
    }
    process.exit();
    return;*/


    if (process.argv.length > 2) {
        if (process.argv[2] == 'bal') {
            await MoneyMgr.getBalance(bArbOnly);
        }
        else if (process.argv[2] == 'dep') {
            if (process.argv.length > 3) {
                await MoneyMgr.deposit(bArbOnly, process.argv[3]);
            }
            else {
                AppUtils.logMsgToFile('No deposit amount in command line param.', true);
            }
        }
        else if (process.argv[2] == 'gas') {
            await AppUtils.getGasPrice();
            const gPrice = await AppUtils.getExecGasPrice();
        }
        else if (process.argv[2] == 'withdraw') {
            if (process.argv.length > 3) {
                await MoneyMgr.withdraw(bArbOnly, process.argv[3]);
            }
            else {
                await MoneyMgr.withdraw(bArbOnly);
            }

        }
        else if (process.argv[2] == 'trans') {
            if (process.argv.length > 3) {
                const trs = await provider.getTransaction(process.argv[3]);
                console.log(trs);
                const receipt = await provider.getTransactionReceipt(process.argv[3]);
                console.log(receipt);
            }
            else {
                AppUtils.logMsgToFile('No hash in command line param.', true);
            }
        }
        else {
            AppUtils.logMsgToFile('Invalid command line param.', true);
        }

        process.exit();
    }
    else {
        await listenPriceEvents();
    }

}

runAsync(false).then(
    function (value) { },
    function (error) { console.log(error) }
);

// Check markets every n seconds
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 500 // 0.5 seconds
const marketChecker = setInterval(async () => { await checkIfPricesChanged() }, POLLING_INTERVAL)

