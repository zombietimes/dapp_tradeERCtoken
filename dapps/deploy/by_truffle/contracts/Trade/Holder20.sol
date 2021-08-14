// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./HolderBase.sol";

contract Holder20 is HolderBase {
    constructor(address xHolders) {
        s_xHolders = xHolders;
    }

    function OnERC20Received(
    address xSender, address, uint256 amount, bytes memory data)
    public {
        // xSender > Holder#deposit
        address xToken = abi.decode(data, (address));
        uint256 idTrade = createIdTrade(xSender, xToken, amount);
        s_balances[xSender].deposit[idTrade] += amount;
    }
    function createIdTrade(
    address xSender, address xToken, uint256 amount)
    private
    returns(uint256 idTrade) {
        uint256 tokenId = 0;
        idTrade = api_GetIdTrade(20, xSender, xToken, tokenId);
        api_Erc20_Tradable(xToken, amount);
    }
    function api_Erc20_Tradable(
    address xToken, uint256 amount)
    private {
        // xHolder20 >> xHolders
        require(xToken != address(0), "[ERR] Invalid xToken.");
        (bool success, bytes memory result) = xToken.call(abi.encodeWithSignature(
        "approve(address,uint256)", s_xHolders, amount));
        require(success, string(result));
    }

    function Api_Withdraw(
    uint256 idTrade, address xOwner, address xToken, uint256 amountDeposit)
    public mHolders {
        uint256 balance = s_balances[xOwner].deposit[idTrade];
        require(balance >= amountDeposit, "[ERR] Not enough amountWtihdraw.");
        require(xToken != address(0), "[ERR] Invalid xToken.");
        s_balances[xOwner].deposit[idTrade] -= amountDeposit;
        // Holder#deposit > xPeer : transfer
        (bool success, bytes memory result) = xToken.call(abi.encodeWithSignature(
        "transfer(address,uint256)", xOwner, amountDeposit));
        require(success, string(result));
    }
}
