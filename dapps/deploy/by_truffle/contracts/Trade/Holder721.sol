// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../../openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./HolderBase.sol";

contract Holder721 is ERC721Holder, HolderBase {
    constructor(address xHolders) {
        s_xHolders = xHolders;
    }

    function onERC721Received(
    address xSender, address, uint256 tokenId, bytes memory data)
    public virtual override returns (bytes4) {
        // xSender > Holder#deposit
        address xToken = abi.decode(data, (address));
        uint256 idTrade = createIdTrade(xSender, xToken, tokenId);
        s_balances[xSender].deposit[idTrade] = 1;
        return this.onERC721Received.selector;
    }
    //[uint256 idTrade][uint256 tokenId]
    mapping(uint256 => uint256) private s_tokenIds;
    function createIdTrade(
    address xSender, address xToken, uint256 tokenId)
    private
    returns(uint256 idTrade) {
        idTrade = api_GetIdTrade(721, xSender, xToken, tokenId);
        s_tokenIds[idTrade] = tokenId;
        api_Erc721_Tradable(xToken);
    }
    function api_Erc721_Tradable(
    address xToken)
    private {
        // xHolder721 >> xHolders
        require(xToken != address(0), "[ERR] Invalid xToken.");
        (bool success, bytes memory result) = xToken.call(abi.encodeWithSignature(
        "setApprovalForAll(address,bool)", s_xHolders, true));
        require(success, string(result));
    }

    function Api_Withdraw(
    uint256 idTrade, address xOwner, address xToken, uint256)
    public mHolders {
        uint256 balance = s_balances[xOwner].deposit[idTrade];
        require(balance == 1, "[ERR] Not owner.");
        require(xToken != address(0), "[ERR] Invalid xToken.");
        s_balances[xOwner].deposit[idTrade] = 0;
        uint256 tokenId = s_tokenIds[idTrade];
        // Holder#deposit > xPeer : transfer
        (bool success, bytes memory result) = xToken.call(abi.encodeWithSignature(
        "safeTransferFrom(address,address,uint256)",
        address(this), xOwner, tokenId));
        require(success, string(result));
    }
}
