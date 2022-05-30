// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "../interfaces/IUniswapV2Router02.sol";
import "../interfaces/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract UniswapArbitrage
{
    using SafeMath for uint256;
    address public owner;

    //--------------------------------------------------------------------
    // MODIFIERS

    modifier onlyOwner() 
    {
        require(msg.sender == owner, "only owner can call this");
        _;
    }
  
    constructor() 
    {        
        owner = msg.sender;
    }

    function doArbitrage(uint256 profitMargin, uint256 amount, address baseCoinAddress, address swapCoinAddress, address buyRouterAddress, address sellRouterAddress) public 
    {
        require(profitMargin > 900 && profitMargin < 1100, "Invalid profit margin");

        uint256 amountOut = swap(amount, baseCoinAddress, swapCoinAddress, buyRouterAddress);        

        uint256 amountIn = swap(amountOut, swapCoinAddress, baseCoinAddress, sellRouterAddress); 

        require(amountIn > (amount*profitMargin)/1000, "UniswapArbitrage. Arbitrage not profitable");
    }

    function swap(uint256 amountIn, address sell_token, address buy_token, address _routerAddress) public returns (uint256) 
    {
        uint256 allowance = IERC20(sell_token).allowance(address(this), _routerAddress);

        if(allowance == 0)
            IERC20(sell_token).approve(_routerAddress, type(uint256).max);

        uint256 amountOutMin = (getPrice( sell_token, buy_token, amountIn, _routerAddress) * 88) / 100;

        address[] memory path = new address[](2);
        path[0] = sell_token;
        path[1] = buy_token;
    
        uint256 amountOut = IUniswapV2Router02(_routerAddress).swapExactTokensForTokens(amountIn, amountOutMin, path, address(this), block.timestamp )[1];
        return amountOut;
    }

    function getPrice(address sell_token, address buy_token, uint256 amount, address _routerAddress) public view returns (uint256) 
    {
        address[] memory pairs = new address[](2);
        pairs[0] = sell_token;
        pairs[1] = buy_token;
        uint256 price = IUniswapV2Router02(_routerAddress).getAmountsOut(amount, pairs)[1];

        return price;
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
        IERC20(_erc20Address).transfer(msg.sender, balance);
    }

    function getERC20Balance(address _erc20Address) public view returns (uint256)
    {
        return IERC20(_erc20Address).balanceOf(address(this));
    }
}