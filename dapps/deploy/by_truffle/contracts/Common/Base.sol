// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Base {
    address internal s_xOwner;
    constructor() {
        s_xOwner = msg.sender;
    }
    modifier mOwner() {
        require(msg.sender == s_xOwner, "[ERR]Not owner of contract.");
        _;
    }

    event InfoAddress(address target);
    event InfoBool(bool target);
    event InfoU256(uint256 target);
    event InfoU32(uint32 target);
}

