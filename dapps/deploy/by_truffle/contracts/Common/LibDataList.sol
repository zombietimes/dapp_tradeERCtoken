// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

struct DataBody {
    bool isValid;
    address xOwner;
    uint256 data;
}
struct DataList {
    uint32 indexStart;
    uint32 indexAt;
    uint32 indexMissing;
    // [uint32 index][DataBody dataBody]
    mapping(uint32 => DataBody) datas;
}

uint32 constant INDEX_INVALID = 0;
uint32 constant INDEX_MIN = 1;
uint32 constant INDEX_MAX = 2**32 - 2;
uint32 constant INDEX_NOT_MISSING = 0;

library LibDataList {
    function IsUsed(DataList storage s_dataList)
    public view
    returns(bool isUsed) {
        if((s_dataList.indexStart == INDEX_INVALID)||
           (s_dataList.indexAt == INDEX_INVALID)){
            isUsed = false;
        }
        else{
            isUsed = true;
        }
    }
    function Add(DataList storage s_dataList, address xOwner, uint256 data)
    public
    returns(uint32 index) {
        if(s_dataList.indexMissing == INDEX_NOT_MISSING){
            require(s_dataList.indexAt + 1 <= INDEX_MAX, "[ERR]DataList is full.");
            if(s_dataList.indexAt == INDEX_INVALID){
                s_dataList.indexAt = INDEX_MIN;
            }
            s_dataList.datas[s_dataList.indexAt] = DataBody(true, xOwner, data);
            index = s_dataList.indexAt;
            s_dataList.indexAt += 1;
        }
        else{
            s_dataList.datas[s_dataList.indexMissing] = DataBody(true, xOwner, data);
            index = s_dataList.indexMissing;
        }
        updateIndexInfo(s_dataList);
    }
    function Remove(DataList storage s_dataList, uint32 index)
    public mIndex(s_dataList, index) {
        uint32 indexLast = s_dataList.indexAt - 1;
        if(index == indexLast){
            s_dataList.indexAt = index;	//approximately
        }
        s_dataList.datas[index].isValid = false;
        updateIndexInfo(s_dataList);
    }
    function updateIndexInfo(DataList storage s_dataList)
    private {
        (uint32 indexFirstValid, uint32 indexFirstInvalid) = analyzeIndex(s_dataList);
        if(indexFirstValid == INDEX_INVALID){
            s_dataList.indexStart = INDEX_MIN;
        }
        else{
            s_dataList.indexStart = indexFirstValid;
        }
        if(indexFirstInvalid == INDEX_INVALID){
            s_dataList.indexMissing = INDEX_NOT_MISSING;
        }
        else{
            s_dataList.indexMissing = indexFirstInvalid;
        }
    }
    function analyzeIndex(DataList storage s_dataList)
    private view
    returns(uint32 indexFirstValid, uint32 indexFirstInvalid) {
        for(uint32 index = INDEX_MIN; index < s_dataList.indexAt; index += 1){
            if(indexFirstValid == INDEX_INVALID){
                if(s_dataList.datas[index].isValid == true){
                    indexFirstValid = index;
                }
            }
            if(indexFirstInvalid == INDEX_INVALID){
                if(s_dataList.datas[index].isValid == false){
                    indexFirstInvalid = index;
                }
            }
            if((indexFirstValid != INDEX_INVALID)&&(indexFirstInvalid != INDEX_INVALID)){
                break;
            }
        }
    }
    function GetIndexStart(DataList storage s_dataList)
    public view
    returns(uint32 indexStart) {
        indexStart = s_dataList.indexStart;
    }
    function GetIndexLastNext(DataList storage s_dataList)
    public view
    returns(uint32 indexLastNext) {
        indexLastNext = s_dataList.indexAt;
    }
    function Get(DataList storage s_dataList, uint32 index)
    public mIndex(s_dataList, index) view
    returns(bool isValid, address xOwner, uint256 data) {
        isValid = s_dataList.datas[index].isValid;
        xOwner = s_dataList.datas[index].xOwner;
        data = s_dataList.datas[index].data;
    }
    function GetValid(DataList storage s_dataList, uint32 indexFrom)
    public mIndex(s_dataList, indexFrom) view
    returns(bool isValid, uint32 index, address xOwner, uint256 data) {
        if(indexFrom <= INDEX_MIN){
            indexFrom = s_dataList.indexStart;
        }
        uint32 indexLastNext = s_dataList.indexAt;
        for(index = indexFrom; index < indexLastNext; index+=1){
            isValid = s_dataList.datas[index].isValid;
            if(isValid == true){
                xOwner = s_dataList.datas[index].xOwner;
                data = s_dataList.datas[index].data;
                break;
            }
        }
    }
    function GetIndexViaOwner(DataList storage s_dataList, address xOwner)
    public view
    returns(uint32 indexTarget) {
        uint32 indexStart = s_dataList.indexStart;
        uint32 indexLastNext = s_dataList.indexAt;
        for(uint32 index = indexStart; index < indexLastNext; index+=1){
            if(s_dataList.datas[index].isValid == true){
                if(s_dataList.datas[index].xOwner == xOwner){
                    indexTarget = index;
                    break;
                }
            }
        }
    }
    function RemoveViaOwner(DataList storage s_dataList, address xOwner)
    public {
        uint32 index = GetIndexViaOwner(s_dataList, xOwner);
        Remove(s_dataList, index);
    }
    function SetData(DataList storage s_dataList, uint32 index, uint256 data)
    public mIndex(s_dataList, index) {
        require(s_dataList.datas[index].isValid == true, "[ERR]Invalid index.");
        s_dataList.datas[index].data = data;
    }
    function SubtractData(DataList storage s_dataList, uint32 index, uint256 subtractData)
    public mIndex(s_dataList, index) {
        require(s_dataList.datas[index].isValid == true, "[ERR]Invalid index.");
        require(s_dataList.datas[index].data >= subtractData, "[ERR]Invalid subtractData.");
        s_dataList.datas[index].data -= subtractData;
    }

    modifier mIndex(DataList storage s_dataList, uint32 index) {
        require(index >= INDEX_MIN, "[ERR]Index is too small. 1 origin.");
        require(index < s_dataList.indexAt, "[ERR]Index is too large.");
        _;
    }
}

