
# Arbitrage Flashloan Bot

This repository contains the smart contracts source code and javascript nodejs source code to execute arbitrage flashloan trades on EVM compatible block chains. The nodejs application will monitor prices changes and test if an arbitrage opportunity is available. This project is a playground project and not a completed project.

Two smart contracts are used. The UniswapArbitrage is used when no flashloan is required and the BatchFlashDemo is used when a flash loan is required. These two solidity files in the contracts folder will not compile at this location. Its for display purpose only is currently compiled with hardhat in another project.

