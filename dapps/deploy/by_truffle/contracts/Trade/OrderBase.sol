// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../Common/Base.sol";

contract OrderBase is Base {
    uint8 constant ORDER_KIND_SELL = 0;
    uint8 constant ORDER_KIND_BUY = 1;
    uint8 constant ORDER_KIND_NUM = 2;

    constructor() {
    }
}
    

