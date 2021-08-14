// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../../openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract YourErc20 is ERC20 {
    constructor() ERC20("nameDummy", "symbolDummy") {
    }
    function Erc20_Create(uint256 amount)
    public {
        _mint(msg.sender, amount);
    }
    function Erc20_GetBalance(address xOwner)
    public view
    returns(uint256 balance) {
        balance = balanceOf(xOwner);
    }
    function Erc20_SendToHolder(
    address xHolder20, uint256 amount)
    public {
        api_OnERC20Received(xHolder20, amount);
        transfer(xHolder20, amount);
    }
    function api_OnERC20Received(
    address xHolder20, uint256 amount)
    private {
        require(xHolder20 != address(0), "[ERR] Invalid xHolder20.");
        bytes memory data = abi.encode(address(this));
        (bool success, bytes memory result) = xHolder20.call(abi.encodeWithSignature(
        "OnERC20Received(address,address,uint256,bytes)",
        msg.sender, msg.sender, amount, data));
        require(success, string(result));
    }
}

