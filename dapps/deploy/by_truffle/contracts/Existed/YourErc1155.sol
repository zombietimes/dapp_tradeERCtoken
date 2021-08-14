// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../../openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";

contract YourErc1155 is ERC1155 {
    constructor() ERC1155("https://github.com/zombietimes2") {
    }
    function Erc1155_Create(uint256 tokenId, uint256 amount)
    public {
        _mint(msg.sender, tokenId, amount, "0x0");
    }
    function Erc1155_GetBalance(address xOwner, uint256 tokenId)
    public view
    returns(uint256 balance) {
        balance = balanceOf(xOwner, tokenId);
    }
    function Erc1155_SendToHolder(
    address xHolder1155, uint256 tokenId, uint256 amount)
    public {
        bytes memory data = abi.encode(address(this));
        safeTransferFrom(msg.sender, xHolder1155, tokenId, amount, data);
    }
}

