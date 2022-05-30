const { sign } = require("crypto");
const { BigNumber, ethers } = require("ethers");
const fs = require('fs');

module.exports = class AppUtils {

    static ERC20 = null;
    static ArbConfig = null;
    static signer = null;
    static provider = null;
    static uniswapArbitrage = null;
    static demoLoanContract = null;
    static loanTokenDecimals = null;
    static loanTokenContract = null;

    static async GetAccountBalance() {
        const bal = await AppUtils.provider.getBalance(AppUtils.signer.getAddress());
        return this.bigNToDec(bal, 18, 4);
    }

    //Convert a BigNumber to a js decimal value
    static bigNToDec(amount, decimals, decPlaces) {
        const remainder = amount.mod(1 * 10 ** (decimals - decPlaces));
        //return amount.sub(remainder).toNumber();
        return Number(ethers.utils.formatUnits(amount.sub(remainder), decimals));
        //console.log(ethers.utils.formatEther(pnl.sub(remainder)));
    }

    static getCoinIndexInDex(iDex, address) {

        for (let j = 0; j < AppUtils.ArbConfig.dexList[iDex].coins.length; j++) {
            if (address === AppUtils.ArbConfig.dexList[iDex].coins[j].address)
                return j;
        }

        return -1;
    }

    //below 600 gwei is ok. (0.0000006)
    static async getGasPrice() {

        const gas = await AppUtils.signer.getFeeData();
        //console.log(`gas price ${ethers.utils.formatEther(gas.gasPrice)}`);
        AppUtils.logMsgToFile(`gas price in wei ${ethers.utils.formatUnits(gas.gasPrice, "gwei")}`, true);

        return gas.gasPrice;

    }


    static async getReserves(address1, address2, pair) {
        try {

            // Get reserves
            const reservesRaw = await pair.getReserves();

            // Put the results in the right order
            const results = [
                (await pair.token0()) === address1 ? reservesRaw[0] : reservesRaw[1],
                (await pair.token1()) === address2 ? reservesRaw[1] : reservesRaw[0],
            ];

            return results;

        } catch (e) {
            this.logError(e);
            return [ethers.constants.Zero, ethers.constants.Zero];
        }
    }

    static async getExecGasPrice() {

        const gasObj = await AppUtils.signer.getFeeData();
        const gasPrice = gasObj.gasPrice;

        //add 20%, i.e.: gas + gas/5
        //const g = gasPrice.add(gasPrice.div(BigNumber.from(2)));
        const g = gasPrice.mul(BigNumber.from(2));

        //console.log(`gas price ${ethers.utils.formatEther(gas.gasPrice)}`);
        //AppUtils.logMsgToFile(`exec gas price in wei ${ethers.utils.formatUnits(g, "gwei")}`);
        //AppUtils.logMsgToFile(g.toNumber());
        return g;
    }

    static async logError(e) {

        let err = e;
        while (err.error != undefined) {
            err = err.error;
        }

        if (err.message != undefined) {
            AppUtils.logMsgToFile(err.message, true);
        }
        else {
            AppUtils.logMsgToFile(err.message, true);
        }
    }

    static async logMsgToFile(str, bConsole) {
        try {
            fs.appendFileSync('./log.txt', `${new Date().toLocaleString()} - ${str} \n`);
            if (bConsole != undefined && bConsole)
                console.log(str);
        }
        catch (e) {
            console.log(e);
        }

    }

    static async delay(ms) {
        if (ms === 0) {
            return;
        }
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async processTrsRsp(title, trs) {
        AppUtils.logMsgToFile(`${title} hash ${trs.hash}`, true);
        AppUtils.logMsgToFile(JSON.stringify(trs));

        const receipt = await this.provider.waitForTransaction(trs.hash, 1, 150000);

        if (receipt == null || receipt == undefined) {
            AppUtils.logMsgToFile(`${title} trs failed. hash ${trs.hash}`, true);
            return true;
        }
        else {
            AppUtils.logMsgToFile(receipt?.status == 1 ? 'trs success!!' : 'trs failed!!', true);
            AppUtils.logMsgToFile(JSON.stringify(receipt));

            return (receipt?.status == 1);
        }
    }

    /*static async getAmountOut(address1, address2, amountIn, routerContract) {

        try {
            const values_out = await routerContract.getAmountsOut(amountIn, [address1, address2]);
            return values_out[1];
        }
        catch (e) {
            AppUtils.logError(e.message);
            return false;
        }
    }*/
}