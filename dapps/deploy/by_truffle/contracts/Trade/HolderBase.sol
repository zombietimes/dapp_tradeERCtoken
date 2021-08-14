// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../Common/Base.sol";

contract HolderBase is Base {
    constructor() {
    }
    address internal s_xHolders;
    modifier mHolders() {
        require(msg.sender != address(0));
        require(msg.sender == s_xHolders);
        _;
    }

    function api_GetIdTrade(
    uint32 kindHolder, address xSender, address xToken, uint256 tokenId)
    internal
    returns(uint256 idTrade) {
        require(s_xHolders != address(0), "[ERR] Invalid s_xHolders.");
        (bool success, bytes memory result) = s_xHolders.call(abi.encodeWithSignature(
        "Api_GetIdTrade(uint32,address,address,uint256)", kindHolder, xSender, xToken, tokenId));
        require(success, string(result));
        (idTrade) = abi.decode(result, (uint256));
    }

    struct Balance {
        // [uint256 idTrade][uint256 amount]
        mapping(uint256 => uint256) deposit;
        mapping(uint256 => uint256) onOrder;
    }
    // [address xOwner][Balance balances]
    mapping(address => Balance) internal s_balances;
    uint8 constant KIND_BALANCE_Deposit = 0;
    uint8 constant KIND_BALANCE_OnOrder = 1;
    function ShowBalance(
    address xOwner, uint8 kindBalance, uint256 idTrade)
    public view
    returns(uint256 balance) {
         if(kindBalance == KIND_BALANCE_Deposit){
             balance = s_balances[xOwner].deposit[idTrade];
         }
         else if(kindBalance == KIND_BALANCE_OnOrder){
             balance = s_balances[xOwner].onOrder[idTrade];
         }
         else{
             require(false, "[ERR] Invalid kindBalance.");
         }
    }

    function Api_SendToOnOrder(
    address xSelf, uint256 idTrade, uint256 amountOnOrder)
    public mHolders {
        // Holder#deposit > Holder#onOrder
        require(s_balances[xSelf].deposit[idTrade] >= amountOnOrder, "[ERR] Not enough amountOnOrder.");
        s_balances[xSelf].deposit[idTrade] -= amountOnOrder;
        s_balances[xSelf].onOrder[idTrade] += amountOnOrder;
    }
    function Api_SendToDeposit(
    address xSelf, address xPeer, uint256 idTrade, uint256 amountDeposit)
    public mHolders {
        // Holder#onOrder > Holder#deposit
        require(s_balances[xSelf].onOrder[idTrade] >= amountDeposit, "[ERR] Not enough amountDeposit.");
        s_balances[xSelf].onOrder[idTrade] -= amountDeposit;
        s_balances[xPeer].deposit[idTrade] += amountDeposit;
    }


}
