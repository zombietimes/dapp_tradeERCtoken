// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./OrderBase.sol";
import "../Common/LibDataList.sol";

contract Holders is OrderBase {
    constructor() {
    }

    address private s_xTrade;
    function RegistTrade(
    address xTrade)
    public {
        require(s_xTrade == address(0), "[ERR] Already done.");
        s_xTrade = xTrade;
    }
    modifier mTrade() {
        require(msg.sender != address(0));
        require(msg.sender == s_xTrade);
        _;
    }

    address private s_xHolderWei;
    address private s_xHolder20;
    address private s_xHolder721;
    address private s_xHolder1155;
    function RegistHolderWei(
    address xHolderWei)
    public {
        require(s_xHolderWei == address(0), "[ERR] Already done.");
        s_xHolderWei = xHolderWei;
    }
    function RegistHolder20(
    address xHolder20)
    public {
        require(s_xHolder20 == address(0), "[ERR] Already done.");
        s_xHolder20 = xHolder20;
    }
    function RegistHolder721(
    address xHolder721)
    public {
        require(s_xHolder721 == address(0), "[ERR] Already done.");
        s_xHolder721 = xHolder721;
    }
    function RegistHolder1155(
    address xHolder1155)
    public {
        require(s_xHolder1155 == address(0), "[ERR] Already done.");
        s_xHolder1155 = xHolder1155;
    }
    function isValidHolder()
    private view
    returns(bool) {
        if ((msg.sender == s_xHolderWei)||
            (msg.sender == s_xHolder20)||
            (msg.sender == s_xHolder721)||
            (msg.sender == s_xHolder1155)) {
            return true;
        }
        else{
            return false;
        }
    }
    modifier mHolder() {
        require(msg.sender != address(0));
        require(isValidHolder() == true);
        _;
    }
    function getHolderAny(
    uint32 kindHolder)
    private view
    returns(address xHolderAny) {
        if(kindHolder == KIND_HOLDER_WEI){
            xHolderAny = s_xHolderWei;
        }
        else if(kindHolder == KIND_HOLDER_ERC20){
            xHolderAny = s_xHolder20;
        }
        else if(kindHolder == KIND_HOLDER_ERC721){
            xHolderAny = s_xHolder721;
        }
        else if(kindHolder == KIND_HOLDER_ERC1155){
            xHolderAny = s_xHolder1155;
        }
        require(xHolderAny != address(0), "[ERR] Invalid xHolder.");
    }

    // [address xSender][DataList idTradeList]
    mapping(address => DataList) private s_idTradeLists;
    function ShowIdTradeListLen(
    address xSender)
    public
    returns(uint32 listLen) {
        listLen = LibDataList.GetIndexLastNext(s_idTradeLists[xSender]) - 1;
        emit InfoU32(listLen);
    }
    function ShowIdTradeList(
    address xSender, uint32 indexAt)
    public
    returns(bool isValid, address xToken, uint256 idTrade) {
        (isValid, xToken, idTrade) = LibDataList.Get(s_idTradeLists[xSender], indexAt);
        emit InfoBool(isValid);
        emit InfoAddress(xToken);
        emit InfoU256(idTrade);
    }

    uint32 constant KIND_HOLDER_WEI = 1;
    uint32 constant KIND_HOLDER_ERC20 = 20;
    uint32 constant KIND_HOLDER_ERC721 = 721;
    uint32 constant KIND_HOLDER_ERC1155 = 1155;
    struct TradeInfo {
        uint32 kindHolder;
        address xToken;
        uint256 tokenId;
    }
    // [uint256 idTrade][TradeInfo tradeInfo]
    mapping(uint256 => TradeInfo) private s_tradeInfos;
    function Api_GetIdTrade(
    uint32 kindHolder, address xSender, address xToken, uint256 tokenId)
    public mHolder
    returns(uint256 idTrade) {
        idTrade = calcIdTrade(kindHolder, xToken, tokenId);
        LibDataList.Add(s_idTradeLists[xSender], xToken, idTrade);
        s_tradeInfos[idTrade].kindHolder = kindHolder;
        s_tradeInfos[idTrade].xToken = xToken;
        s_tradeInfos[idTrade].tokenId = tokenId;
    }
    function CalcIdTrade(
    uint32 kindHolder, address xToken, uint256 tokenId)
    public
    returns(uint256 idTrade) {
        idTrade = calcIdTrade(kindHolder, xToken, tokenId);
        emit InfoU256(idTrade);
    }
    function calcIdTrade(
    uint32 kindHolder, address xToken, uint256 tokenId)
    private pure
    returns(uint256 idTrade) {
        idTrade = uint256(keccak256(abi.encodePacked(kindHolder, xToken, tokenId)));
    }
    function ShowIdTradeInfo(
    uint256 idTrade)
    public
    returns(uint32 kindHolder, address xToken, uint256 tokenId) {
        kindHolder = s_tradeInfos[idTrade].kindHolder;
        xToken = s_tradeInfos[idTrade].xToken;
        tokenId = s_tradeInfos[idTrade].tokenId;
        emit InfoU32(kindHolder);
        emit InfoAddress(xToken);
        emit InfoU256(tokenId);
    }

    function AddOrderSell(
    uint256 idTradeSelf, uint256 idTradePeer, uint256 rate, uint256 amount)
    public {
        // idTradeSelf : Holder#deposit > Holder#onOrder
        api_SendToOnOrder(idTradeSelf, amount);
        api_AddOrder(idTradeSelf, idTradePeer, rate, ORDER_KIND_SELL, msg.sender, amount);
    }
    function AddOrderBuy(
    uint256 idTradeSelf, uint256 idTradePeer, uint256 rate, uint256 amount)
    public {
        // idTradePeer : Holder#deposit > Holder#onOrder
        uint256 amountOnOrder = amount * rate;
        api_SendToOnOrder(idTradePeer, amountOnOrder);
        api_AddOrder(idTradeSelf, idTradePeer, rate, ORDER_KIND_BUY, msg.sender, amount);
    }
    function api_SendToOnOrder(
    uint256 idTrade, uint256 amountOnOrder)
    private {
        // Holder#deposit > Holder#onOrder
        uint32 kindHolder = s_tradeInfos[idTrade].kindHolder;
        address xHolderAny = getHolderAny(kindHolder);
        (bool success, bytes memory result) = xHolderAny.call(abi.encodeWithSignature(
        "Api_SendToOnOrder(address,uint256,uint256)", msg.sender, idTrade, amountOnOrder));
        require(success, string(result));
    }
    function api_AddOrder(
    uint256 idTradeSelf, uint256 idTradePeer, uint256 rate, uint8 orderKind,
    address xOwner, uint256 amount)
    private {
        require(s_xTrade != address(0), "[ERR] Invalid xTrade.");
        (bool success, bytes memory result) = s_xTrade.call(abi.encodeWithSignature(
        "Api_AddOrder(uint256,uint256,uint256,uint8,address,uint256)",
        idTradeSelf, idTradePeer, rate, orderKind, xOwner, amount));
        require(success, string(result));
    }

    function Api_Payback(
    address xSelf, uint256 idTrade, uint256 amount)
    public mTrade {
        uint32 kindHolder = s_tradeInfos[idTrade].kindHolder;
        api_SendToDeposit(kindHolder, xSelf, xSelf, idTrade, amount);
    }
    function Api_Trade(
    uint256 idTradeSelf, uint256 idTradePeer, uint256 rate,
    address xSeller, address xBuyer, uint256 amountSell)
    public mTrade {
        // idTradeSelf#xSeller <> idTradePeer#xBuyer
        uint32 kindHolderSelf = s_tradeInfos[idTradeSelf].kindHolder;
        uint32 kindHolderPeer = s_tradeInfos[idTradePeer].kindHolder;
        uint256 amountBuy = amountSell * rate;
        api_SendToDeposit(kindHolderSelf, xSeller, xBuyer, idTradeSelf, amountSell);
        api_SendToDeposit(kindHolderPeer, xBuyer, xSeller, idTradePeer, amountBuy);
    }
    function api_SendToDeposit(
    uint32 kindHolder, address xSelf, address xPeer, uint256 idTrade, uint256 amount)
    private {
        address xHolderAny = getHolderAny(kindHolder);
        // Holder#onOrder > xPeer : balance
        (bool success, bytes memory result) = xHolderAny.call(abi.encodeWithSignature(
        "Api_SendToDeposit(address,address,uint256,uint256)", xSelf, xPeer, idTrade, amount));
        require(success, string(result));
    }

    function Withdraw(
    uint256 idTrade, uint256 amount)
    public {
        uint32 kindHolder = s_tradeInfos[idTrade].kindHolder;
        address xHolderAny = getHolderAny(kindHolder);
        address xToken = s_tradeInfos[idTrade].xToken;
        // Holder#onOrder > Holder#deposit
        (bool success, bytes memory result) = xHolderAny.call(abi.encodeWithSignature(
        "Api_Withdraw(uint256,address,address,uint256)", idTrade, msg.sender, xToken, amount));
        require(success, string(result));
    }

}
