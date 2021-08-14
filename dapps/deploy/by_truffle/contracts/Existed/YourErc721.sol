// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../../openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

contract YourErc721 is ERC721 {
    constructor() ERC721("nameDummy", "symbolDummy") {
    }
    function Erc721_Create(uint256 tokenId)
    public {
        _safeMint(msg.sender, tokenId);
    }
    function Erc721_IsOwner(address xOwner, uint256 tokenId)
    public view
    returns(bool isOwner) {
        if(xOwner == ownerOf(tokenId)){
            isOwner = true;
        }
        else{
            isOwner = false;
        }
    }
    function Erc721_SendToHolder(
    address xHolder721, uint256 tokenId)
    public {
        bytes memory data = abi.encode(address(this));
        safeTransferFrom(msg.sender, xHolder721, tokenId, data);
    }
}

