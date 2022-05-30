const { BigNumber, ethers } = require("ethers");
const AppUtils = require('./AppUtils');

module.exports = class MoneyMgr {

    static lastArbOnlyBal = null;

    static async getBalance(bArbOnly) {

        try {

            //console.log('checking balance.');
            let bal;
            if (bArbOnly) {
                bal = await AppUtils.uniswapArbitrage.getERC20Balance(AppUtils.ArbConfig.loanTokenAddress);
                this.lastArbOnlyBal = bal;
            }
            else {
                bal = await AppUtils.demoLoanContract.getERC20Balance(AppUtils.ArbConfig.loanTokenAddress);
            }

            //const allowence = await loanTokenContract.allowance(signer.getAddress(), bArbOnly ? ArbConfig.uniswapArbContractAddress : ArbConfig.arbContractAddress);

            const strBal = ethers.utils.formatUnits(bal, AppUtils.loanTokenDecimals);
            //const strAllowance = ethers.utils.formatUnits(allowence, loanTokenDecimals);
            AppUtils.logMsgToFile('Contract balance = ' + strBal /*+ ', Allowence = ' + strAllowance*/, true);

            return bal;

        }
        catch (e) {
            AppUtils.logError(e);
        }

    }

    static async deposit(bArbOnly, amount) {

        try {

            const gPrice = await AppUtils.getExecGasPrice();

            AppUtils.logMsgToFile('deposit ' + amount);
            const nDepAmount = ethers.utils.parseUnits(amount, AppUtils.loanTokenDecimals);
            const allowence = await AppUtils.loanTokenContract.allowance(AppUtils.signer.getAddress(), bArbOnly ? AppUtils.ArbConfig.uniswapArbContractAddress : AppUtils.ArbConfig.arbContractAddress);

            if (allowence.eq(BigNumber.from(0))) {
                AppUtils.logMsgToFile('Need to set allowance.', true);

                /*const est = await loanTokenContract.estimateGas.approve(ArbConfig.arbContractAddress, nDepAmount, { gasPrice: gPrice });
                console.log(`approve gas units ${est.toNumber()}`); //ftm live = 48343
                console.log(ethers.utils.formatEther(gPrice.mul(est)));*/

                let trs = await AppUtils.loanTokenContract.approve(bArbOnly ? AppUtils.ArbConfig.uniswapArbContractAddress : AppUtils.ArbConfig.arbContractAddress,
                    ethers.constants.MaxUint256, { gasPrice: gPrice });
                AppUtils.logMsgToFile(trs.hash, true);
            }

            /*let est2 = await demoLoanContract.estimateGas.deposit(ArbConfig.loanTokenAddress, nDepAmount, { gasPrice: gPrice });
            console.log(`dep gas units ${est2.toNumber()}`); //ftm live = 67980 //ftm test = 65846
            console.log(ethers.utils.formatEther(gPrice.mul(est2)));*/


            //ethers.utils.formatEther(
            if (bArbOnly) {
                let trs = await AppUtils.uniswapArbitrage.deposit(AppUtils.ArbConfig.loanTokenAddress, nDepAmount, { gasPrice: gPrice });
                AppUtils.logMsgToFile(trs.hash, true);
            }
            else {
                let trs = await AppUtils.demoLoanContract.deposit(AppUtils.ArbConfig.loanTokenAddress, nDepAmount, { gasPrice: gPrice });
                AppUtils.logMsgToFile(trs.hash, true);
            }

        }
        catch (e) {
            AppUtils.logError(e);
            //console.log(e);
        }
    }

    static async withdraw(bArbOnly, amount) {
        try {

            const gPrice = await AppUtils.getExecGasPrice();
            if (amount != undefined && amount != null && amount != '') {

                const nAmount = ethers.utils.parseUnits(amount, AppUtils.loanTokenDecimals);

                if (bArbOnly) {
                    let trs = await AppUtils.uniswapArbitrage.withdraw(AppUtils.ArbConfig.loanTokenAddress, nAmount, { gasPrice: gPrice });
                    AppUtils.logMsgToFile(trs.hash, true);
                }
                else {
                    let trs = await AppUtils.demoLoanContract.withdraw(AppUtils.ArbConfig.loanTokenAddress, nAmount, { gasPrice: gPrice });
                    AppUtils.logMsgToFile(trs.hash, true);
                }
            }
            else {
                if (bArbOnly) {
                    let trs = await AppUtils.uniswapArbitrage.withdrawAll(AppUtils.ArbConfig.loanTokenAddress, { gasPrice: gPrice });
                    AppUtils.logMsgToFile(trs.hash, true);
                }
                else {
                    let trs = await AppUtils.demoLoanContract.withdrawAll(AppUtils.ArbConfig.loanTokenAddress, { gasPrice: gPrice });
                    AppUtils.logMsgToFile(trs.hash, true);
                }
            }

        }
        catch (e) {
            AppUtils.logError(e);
        }
    }
}