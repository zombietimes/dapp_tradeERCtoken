// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./OrderBase.sol";
import "../Common/LibDataList.sol";

contract Trade is OrderBase {
    constructor(address xHolders) {
        s_xHolders = xHolders;
    }
    address private s_xHolders;
    modifier mHolders() {
        require(msg.sender != address(0));
        require(msg.sender == s_xHolders);
        _;
    }
    
    struct OrderInfo {
        DataList[ORDER_KIND_NUM] dataList;
    }
    // [uint256 idTradeSelf][uint256 idTradePeer][uint256 rate][OrderInfo orderInfo]
    mapping(uint256 => mapping(uint256 => mapping(uint256 => OrderInfo))) private s_trades;
    function Api_AddOrder(
    uint256 idTradeSelf, uint256 idTradePeer, uint256 rate, uint8 orderKind,
    address xOwner, uint256 amount)
    public mHolders {
        OrderInfo storage s_orderInfo = s_trades[idTradeSelf][idTradePeer][rate];
        LibDataList.Add(s_orderInfo.dataList[orderKind], xOwner, amount);
    }

    function GetOrderInfo(
    uint256 idTradeSelf, uint256 idTradePeer, uint256 rate, uint8 orderKind)
    public
    returns(uint32 indexStart, uint32 indexAt) {
        OrderInfo storage s_orderInfo = s_trades[idTradeSelf][idTradePeer][rate];
        DataList storage s_dataList = s_orderInfo.dataList[orderKind];
        indexStart = s_dataList.indexStart;
        indexAt = s_dataList.indexAt;
        emit InfoU32(indexStart);
        emit InfoU32(indexAt);
    }
    function GetOrder(
    uint256 idTradeSelf, uint256 idTradePeer, uint256 rate, uint8 orderKind, uint32 indexAt)
    public
    returns(bool isValid, address xOwner, uint256 amount) {
        OrderInfo storage s_orderInfo = s_trades[idTradeSelf][idTradePeer][rate];
        (isValid, xOwner, amount) = LibDataList.Get(s_orderInfo.dataList[orderKind], indexAt);
        emit InfoBool(isValid);
        emit InfoAddress(xOwner);
        emit InfoU256(amount);
    }

    uint8 constant SELF_KIND_SELLER = 0;
    uint8 constant SELF_KIND_BUYER = 1;
    uint8 constant MATCH_ORDER_CNT_MAX = 4;
    struct ArgsMatchOrders {
        uint8 orderKindSelf;
        uint32 indexOrderSelf;
        uint256 amountReqSelf;
    }
    struct DoneMatchOrders {
        uint8 selfKind;
        address xSeller;
        address xBuyer;
        uint256 amountSell;
    }
    function CancelOrder(uint256 idTradeSelf, uint256 idTradePeer, uint256 rate,
    uint8 orderKindSelf, uint32 indexOrderSelf)
    public {
        (bool isValid, address xOwner, uint256 amount)
         = GetOrder(idTradeSelf, idTradePeer, rate, orderKindSelf, indexOrderSelf);
        require(isValid == true, "[ERR]No data.");
        require(xOwner == msg.sender, "[ERR]Not owner.");
        require(amount != 0, "[ERR]No amount.");
        OrderInfo storage s_orderInfo = s_trades[idTradeSelf][idTradePeer][rate];
        LibDataList.SetData(s_orderInfo.dataList[orderKindSelf], indexOrderSelf, 0);
        (uint8 selfKind,) = analyzeOrderKindInfo(orderKindSelf);
        if(selfKind == SELF_KIND_SELLER){
            // idTradeSelf : xHolder > msg.sender
            payback(msg.sender, idTradeSelf, amount);
        }
        else{
            // idTradePeer : xHolder > msg.sender
            uint256 amountReq = amount * rate;
            payback(msg.sender, idTradePeer, amountReq);
        }
        emit infoCancel(idTradeSelf, idTradePeer, rate, orderKindSelf, indexOrderSelf, amount);
    }
    event infoCancel(uint256 idTradeSelf, uint256 idTradePeer, uint256 rate,
    uint8 orderKindSelf, uint32 indexOrderSelf, uint256 amount);

    function analyzeOrderKindInfo(uint8 orderKindSelf)
    public pure
    returns(uint8 selfKind, uint8 orderKindPeer) {
        if(orderKindSelf == ORDER_KIND_SELL){
            selfKind = SELF_KIND_SELLER;
            orderKindPeer = ORDER_KIND_BUY;
        }
        else if(orderKindSelf == ORDER_KIND_BUY){
            selfKind = SELF_KIND_BUYER;
            orderKindPeer = ORDER_KIND_SELL;
        }
        else{
            require((orderKindSelf == ORDER_KIND_SELL)||(orderKindSelf == ORDER_KIND_BUY),
            "[ERR]Invalid order kind.");
        }
    }

    struct TempMatchOrders {
        uint8 selfKind;
        uint8 orderKindPeer;
        uint32 indexOrderPeer;
        bool isValidSelf;
        bool isValidPeer;
        address xOwnerSelf;
        address xOwnerPeer;
        uint256 amountSelf;
        uint256 amountPeer;
    }
    function MatchOrders(uint256 idTradeSelf, uint256 idTradePeer, uint256 rate,
    uint8 orderKindSelf, uint32 indexOrderSelf, uint256 amountReqSelf)
    public {
        OrderInfo storage s_orderInfo = s_trades[idTradeSelf][idTradePeer][rate];
        ArgsMatchOrders memory args;
        args.orderKindSelf = orderKindSelf;
        args.indexOrderSelf = indexOrderSelf;
        args.amountReqSelf = amountReqSelf;
        DoneMatchOrders[MATCH_ORDER_CNT_MAX] memory doneList = matchOrders(s_orderInfo, args);
        address xMsgSender = msg.sender;
        for(uint8 matchOrderCnt = 0; matchOrderCnt < MATCH_ORDER_CNT_MAX; matchOrderCnt+=1){
            DoneMatchOrders memory done = doneList[matchOrderCnt];
            if(done.xSeller == address(0)){
                break;
            }
            trade(idTradeSelf, idTradePeer, rate, done.xSeller, done.xBuyer, done.amountSell);
            emit infoMatching(idTradeSelf, idTradePeer, rate,
            done.xSeller, done.xBuyer, done.amountSell, xMsgSender);
        }
    }
    event infoMatching(uint256 idTradeSelf, uint256 idTradePeer, uint256 rate, address xSelf, address xPeer,
    uint256 amountSell, address xMsgSender);
    function matchOrders(
    OrderInfo storage s_orderInfo, ArgsMatchOrders memory args)
    private
    returns(DoneMatchOrders[MATCH_ORDER_CNT_MAX] memory doneList) {
        TempMatchOrders memory temp;
        DataList storage s_orderListSelf = s_orderInfo.dataList[args.orderKindSelf];
        require(LibDataList.IsUsed(s_orderListSelf) == true, "[ERR]No self order.");
        (temp.isValidSelf, temp.xOwnerSelf, temp.amountSelf) = LibDataList.Get(s_orderListSelf, args.indexOrderSelf);
        require(temp.isValidSelf == true, "[ERR]Invalid indexOrderSelf.");
        require(args.amountReqSelf <= temp.amountSelf, "[ERR]Not enough amountReqSelf.");
        (temp.selfKind, temp.orderKindPeer) = analyzeOrderKindInfo(args.orderKindSelf);
        DataList storage s_orderListPeer = s_orderInfo.dataList[temp.orderKindPeer];
        require(LibDataList.IsUsed(s_orderListPeer) == true, "[ERR]No peer order.");
        uint256 amountRemain = args.amountReqSelf;
        uint32 indexFromPeer = INDEX_MIN;
        uint32 listLenPeer = LibDataList.GetIndexLastNext(s_orderListPeer);
        uint8 matchOrderCnt = 0;
        for(uint32 cnt=0; cnt<listLenPeer; cnt+=1){
            (temp.isValidPeer, temp.indexOrderPeer, temp.xOwnerPeer, temp.amountPeer)
             = LibDataList.GetValid(s_orderListPeer, indexFromPeer);
            if(temp.isValidPeer == false){
                break;
            }
            indexFromPeer = temp.indexOrderPeer + 1;
            if(temp.amountPeer != 0){
                (amountRemain, doneList[matchOrderCnt])
                 = matchOrder(s_orderListSelf, s_orderListPeer, args, temp, amountRemain);
                matchOrderCnt += 1;
                if(matchOrderCnt >= MATCH_ORDER_CNT_MAX){
                    break;
                }
                if(amountRemain <= 0){
                    break;
                }
            }
        }
    }
    function matchOrder(
    DataList storage s_orderListSelf, DataList storage s_orderListPeer,
    ArgsMatchOrders memory args, TempMatchOrders memory temp, uint256 amountRemain)
    private
    returns(uint256 amountRemainNew, DoneMatchOrders memory done) {
        if(temp.xOwnerSelf != temp.xOwnerPeer){
            if(amountRemain <= temp.amountPeer){
                done.amountSell = amountRemain;
                amountRemainNew = 0;
            }
            else{
                done.amountSell = temp.amountPeer;
                amountRemainNew = amountRemain - done.amountSell;
            }
            LibDataList.SubtractData(s_orderListSelf, args.indexOrderSelf, done.amountSell);
            LibDataList.SubtractData(s_orderListPeer, temp.indexOrderPeer, done.amountSell);
            if(done.amountSell > 0){
                done.selfKind = temp.selfKind;
                if(done.selfKind == SELF_KIND_SELLER){
                    done.xSeller = temp.xOwnerSelf;
                    done.xBuyer = temp.xOwnerPeer;
                }
                else{
                    done.xSeller = temp.xOwnerPeer;
                    done.xBuyer = temp.xOwnerSelf;
                }
            }
            (,,uint256 amountSelfAfter) = LibDataList.Get(s_orderListSelf, args.indexOrderSelf);
            if(amountSelfAfter == 0){
                LibDataList.Remove(s_orderListSelf, args.indexOrderSelf);
            }
            (,,uint256 amountPeerAfter) = LibDataList.Get(s_orderListPeer, temp.indexOrderPeer);
            if(amountPeerAfter == 0){
                LibDataList.Remove(s_orderListPeer, temp.indexOrderPeer);
            }
        }
    }
    function payback(
    address xSelf, uint256 idTrade, uint256 amount)
    private {
        require(s_xHolders != address(0), "[ERR] Invalid xHolders.");
        (bool success, bytes memory result) = s_xHolders.call(abi.encodeWithSignature(
        "Api_Payback(address,uint256,uint256)", xSelf, idTrade, amount));
        require(success, string(result));
    }
    function trade(
    uint256 idTradeSelf, uint256 idTradePeer, uint256 rate,
    address xSeller, address xBuyer, uint256 amountSell)
    private {
        require(s_xHolders != address(0), "[ERR] Invalid xHolders.");
        (bool success, bytes memory result) = s_xHolders.call(abi.encodeWithSignature(
        "Api_Trade(uint256,uint256,uint256,address,address,uint256)"
        , idTradeSelf, idTradePeer, rate, xSeller, xBuyer, amountSell));
        require(success, string(result));
    }
}

