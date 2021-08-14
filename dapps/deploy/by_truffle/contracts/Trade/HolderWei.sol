// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./HolderBase.sol";

contract HolderWei is HolderBase {
    constructor(address xHolders) {
        s_xHolders = xHolders;
    }

    function Wei_GetBalance(
    address xOwner, uint256 idTrade)
    public view
    returns(uint256 balance) {
        balance = s_balances[xOwner].deposit[idTrade];
    }
    function Wei_SendToHolder()
    public payable  {
        uint256 idTrade = createIdTrade(msg.sender);
        s_balances[msg.sender].deposit[idTrade] += msg.value;
    }
    function Wei_SendFromHolder(
    uint256 idTrade)
    public payable {
        uint256 balance = s_balances[msg.sender].deposit[idTrade];
        if(balance > 0){
            s_balances[msg.sender].deposit[idTrade] = 0;
            payable(msg.sender).transfer(balance);
        }
    }
    function createIdTrade(
    address xSender)
    private
    returns(uint256 idTrade) {
        address xToken = address(this);
        uint256 tokenId = 0;
        idTrade = api_GetIdTrade(1, xSender, xToken, tokenId);
    }

    function Api_Withdraw(
    uint256 idTrade, address xOwner, address xToken, uint256 amountDeposit)
    public mHolders {
        uint256 balance = s_balances[xOwner].deposit[idTrade];
        require(balance >= amountDeposit, "[ERR] Not enough amountWtihdraw.");
        emit infoWithdrawable(idTrade, xOwner, xToken, amountDeposit);
    }
    event infoWithdrawable(uint256 idTrade, address xOwner, address xToken, uint256 amountDeposit);
}
