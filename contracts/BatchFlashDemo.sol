// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

//import "hardhat/console.sol";

import "./aave/FlashLoanSimpleReceiverBase.sol";
import "../interfaces/aave/IPoolAddressesProvider.sol";
import "../interfaces/aave/IPool.sol";
import "../interfaces/IUniswapV2Router02.sol";
import "../interfaces/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";


/*
 * A contract that executes the following logic in a single atomic transaction:
 *
 *   1. Gets a batch flash loan of AAVE, DAI and LINK
 *   2. Deposits all of this flash liquidity onto the Aave V2 lending pool
 *   3. Borrows 100 LINK based on the deposited collateral
 *   4. Repays 100 LINK and unlocks the deposited collateral
 *   5. Withdrawls all of the deposited collateral (AAVE/DAI/LINK)
 *   6. Repays batch flash loan including the 9bps fee
 *
 */
contract BatchFlashDemo is FlashLoanSimpleReceiverBase {

    using SafeMath for uint256;
    address public owner;
    address public loanCoinAddress;
    address public swapCoinAddress;
    address public buyRouterAddress;
    address public sellRouterAddress;    

    //event FirstSwapAmount(uint256 _value);
    //event TimestampLog(uint, uint);

    //--------------------------------------------------------------------
    // MODIFIERS

    modifier onlyOwner() 
    {
        require(msg.sender == owner, "only owner can call this");
        _;
    }
  
    constructor(address _lendingPoolAddress) 
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_lendingPoolAddress))
    {        
        owner = msg.sender;
    }
    
    /**
        This function is called after your contract has received the flash loaned amount
     */
    function executeOperation(address asset, uint256 amount, uint256 premium, address initiator,  bytes calldata params) external override returns (bool) 
    {   
        uint256 amountOut = _swap( amount, loanCoinAddress, swapCoinAddress, buyRouterAddress);

        uint256 amountIn = _swap(amountOut, swapCoinAddress, loanCoinAddress, sellRouterAddress);       

        uint256 amountOwing = amount.add(premium);

        require(amountIn < amountOwing, "Profit not enough");
        IERC20(asset).approve(address(POOL), amountOwing);             

        return true;
    }

    function _swap(uint256 amountIn, address sell_token, address buy_token, address _routerAddress) internal returns (uint256) 
    {        
        uint256 allowance = IERC20(sell_token).allowance(address(this), _routerAddress);

        if(allowance == 0)
            IERC20(sell_token).approve(_routerAddress, type(uint256).max);

        uint256 amountOutMin = (_getPrice( sell_token, buy_token, amountIn, _routerAddress) * 95) / 100;

        address[] memory path = new address[](2);
        path[0] = sell_token;
        path[1] = buy_token;
    
        uint256 amountOut = IUniswapV2Router02(_routerAddress).swapExactTokensForTokens(amountIn, amountOutMin, path, address(this), block.timestamp )[1];
        return amountOut;
    }

    function _getPrice(address sell_token, address buy_token, uint256 amount, address _routerAddress) internal view returns (uint256) 
    {
        address[] memory pairs = new address[](2);
        pairs[0] = sell_token;
        pairs[1] = buy_token;
        uint256 price = IUniswapV2Router02(_routerAddress).getAmountsOut(amount, pairs)[1];

        return price;
    }

    function flashloan(address _loanCoinAddress, uint256 _amount, address _swapCoinAddress, address _buyRouterAddress, address _sellRouterAddress) public onlyOwner 
    {
        loanCoinAddress     = _loanCoinAddress;  
        swapCoinAddress     = _swapCoinAddress;
        buyRouterAddress    = _buyRouterAddress;      
        sellRouterAddress   = _sellRouterAddress;

        bytes memory params = "";
        uint16 referralCode = 0;
        POOL.flashLoanSimple(address(this), _loanCoinAddress, _amount, params, referralCode); 
    }
   
    function deposit(address _erc20Address, uint256 amount) public onlyOwner 
    {        
        require(amount > 0, "Deposit amount must be greater than 0");
        IERC20(_erc20Address).transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(address _erc20Address, uint256 amount) public onlyOwner 
    {
        uint256 balance = getERC20Balance(_erc20Address);
        require(amount <= balance, "Not enough amount deposited");
        //IERC20(_erc20Address).transferFrom(address(this), msg.sender, amount);
        IERC20(_erc20Address).transfer(msg.sender, amount);
    }

    function withdrawAll(address _erc20Address) public onlyOwner 
    {
        uint256 balance = getERC20Balance(_erc20Address);
        require(balance > 0, "Nothing deposited");
        //IERC20(_erc20Address).transferFrom(address(this), msg.sender, balance);
        IERC20(_erc20Address).transfer(msg.sender, balance);
    }

    function getERC20Balance(address _erc20Address) public view returns (uint256)
    {
        return IERC20(_erc20Address).balanceOf(address(this));
    }
    
    /*
     * Rugpull all ERC20 tokens from the contract
     */
   /* function rugPull() public payable onlyOwner 
    {
        // withdraw all ETH
        //msg.sender.call{value: address(this).balance}("");

        // withdraw all x ERC20 tokens
        IERC20(loanCoinAddress).transfer(msg.sender, IERC20(loanCoinAddress).balanceOf(address(this)));
    }*/
}
