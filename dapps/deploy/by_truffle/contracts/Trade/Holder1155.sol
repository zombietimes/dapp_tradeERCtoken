// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../../openzeppelin-contracts/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./HolderBase.sol";

contract Holder1155 is ERC1155Holder, HolderBase {
    constructor(address xHolders) {
        s_xHolders = xHolders;
    }

    function onERC1155Received(
    address xSender, address, uint256 tokenId, uint256 amount, bytes memory data)
    public virtual override returns (bytes4) {
        address xToken = abi.decode(data, (address));
        uint256 idTrade = createIdTrade(xSender, xToken, tokenId);
        // xSender > Holder#deposit
        s_balances[xSender].deposit[idTrade] += amount;
        return this.onERC1155Received.selector;
    }
    //[uint256 idTrade][uint256 tokenId]
    mapping(uint256 => uint256) private s_tokenIds;
    function createIdTrade(
    address xSender, address xToken, uint256 tokenId)
    private
    returns(uint256 idTrade) {
        idTrade = api_GetIdTrade(1155, xSender, xToken, tokenId);
        s_tokenIds[idTrade] = tokenId;
        api_Erc1155_Tradable(xToken);
    }
    function api_Erc1155_Tradable(
    address xToken)
    private {
        // xHolder1155 >> xHolders
        require(xToken != address(0), "[ERR] Invalid xToken.");
        (bool success, bytes memory result) = xToken.call(abi.encodeWithSignature(
        "setApprovalForAll(address,bool)", s_xHolders, true));
        require(success, string(result));
    }

    function Api_Withdraw(
    uint256 idTrade, address xOwner, address xToken, uint256 amountDeposit)
    public mHolders {
        uint256 balance = s_balances[xOwner].deposit[idTrade];
        require(balance >= amountDeposit, "[ERR] Not enough amountWtihdraw.");
        require(xToken != address(0), "[ERR] Invalid xToken.");
        s_balances[xOwner].deposit[idTrade] -= amountDeposit;
        uint256 tokenId = s_tokenIds[idTrade];
        // Holder#deposit > xPeer : transfer
        (bool success, bytes memory result) = xToken.call(abi.encodeWithSignature(
        "safeTransferFrom(address,address,uint256,uint256,bytes)",
        address(this), xOwner, tokenId, amountDeposit, ""));
        require(success, string(result));
    }
}
