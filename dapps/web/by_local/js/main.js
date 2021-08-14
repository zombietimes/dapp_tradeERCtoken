var ZTIMES = ZTIMES || {};
ZTIMES.UTL = {
  init: function(){
    console.log("ZTIMES.UTL.init()");
  },
  test: function(){
    console.log("ZTIMES.UTL.test()");
  },
  GetRandom: function(rangeMax){
    return Math.floor( Math.random() * rangeMax );
  },
  ToStr: function(num){
    return num.toString(10);
  },
  FillZero2: function(num){
    return ("0"+num).slice(-2);
  },
  GetTimeStamp: function(){
    const date = new Date();
    const year = date.getFullYear();
    const month = this.FillZero2(date.getMonth()+1);
    const day = this.FillZero2(date.getDate());
    const hour = this.FillZero2(date.getHours());
    const minute = this.FillZero2(date.getMinutes());
    const second = this.FillZero2(date.getSeconds());
    return (year+"/"+month+"/"+day+" "+hour+":"+minute+":"+second);
  },
};
ZTIMES.ACCOUNTS = {
  init: function(){
    console.log("ZTIMES.ACCOUNTS.init()");
    this.UNIT = new ZTIMES.ACCOUNTS.UNIT();
    this.SELF = new ZTIMES.ACCOUNTS.DB("#SELF",false);
    this.PEER = new ZTIMES.ACCOUNTS.DB("#PEER",true);
  },
  test: function(){
    console.log("ZTIMES.ACCOUNTS.test()");
  },
  UNIT: function(){},
  DB: function(keyStorage,isBlank){
    this.keyStorage = keyStorage;
    this.xSelected = "";
    this.accounts = {};
    this.onLoad(isBlank);
  },
};
ZTIMES.ACCOUNTS.UNIT.prototype = {
  selected: "Wei",
  Change: function(unitOld){
    let unitNew = "Wei";
    if(unitOld === "Wei"){
      unitNew = "Ether";
    }
    else if(unitOld === "Ether"){
      unitNew = "Wei";
    }
    this.selected = unitNew;
    return unitNew;
  },
  Get: function(){
    return this.selected;
  },
  GetAmountText: function(amount,unit){
    const amountText = amount + ' ' + unit;
    return amountText;
  },
  GetAmount: function(amountText){
    const textList = amountText.split(' ');
    const amount = textList[0];
    const unit = textList[1];
    return Number(amount);
  },
};
ZTIMES.ACCOUNTS.DB.prototype = {
  onLoad: function(isBlank){
    if(typeof(Storage) === "undefined"){
      console.log("Not supported.");
      return;
    }
    this.accounts = this.storageReadAll();
    if(isBlank === true){
      this.addInit();
      this.xSelected = "";
    }
    else{
      this.xSelected = this.getFirst();
    }
  },
  addInit: function(){
    const xAddress = "";
    const name = "";
    this.accounts[xAddress] = {"name":name};
  },
  storageReadAll: function(){
    const accounts = JSON.parse(localStorage.getItem(this.keyStorage));
    if(accounts === null){
      return {};
    }
    return accounts;
  },
  storageWrite: function(xAddress,name){
    const accounts = JSON.parse(localStorage.getItem(this.keyStorage));
    if(accounts === null){
      const accountsNew = {};
      accountsNew[xAddress] = {"name":name};
      localStorage.setItem(this.keyStorage,JSON.stringify(accountsNew));
    }
    else{
      accounts[xAddress] = {"name":name};
      localStorage.setItem(this.keyStorage,JSON.stringify(accounts));
    }
  },
  Set: function(xAddress,name){
    if(this.isValidAddress(xAddress) === false){
      return;
    }
    if(this.isValidName(name) === false){
      return;
    }
    this.accounts[xAddress] = {"name":name};
    this.xSelected = xAddress;
    this.storageWrite(xAddress,name);
  },
  isValidAddress: function(xAddress){
    if(xAddress === ""){
      alert("Invalid address.");
      return false;
    }
    const result = ZTIMES.BLOCKCHAIN.IsAddress(xAddress);
    if(result === null){
      alert("Invalid address.");
      return false;
    }
    return true;
  },
  isValidName: function(name){
    if(name === ""){
      return true;
    }
    const result = name.match(/^[\w\d\s]{1,32}$/gm);
    if(result === null){
      alert("Invalid name.");
      return false;
    }
    return true;
  },
  GetSelected: function(){
    const xAddress = this.xSelected;
    if(xAddress === ""){
      return {"xAddress":"","name":""};
    }
    else{
      const name = this.accounts[xAddress].name;
      return {"xAddress":xAddress,"name":name};
    }
  },
  GetPrevious: function(){
    let xAddressPrevious = "#NONE";
    for(let xAddress in this.accounts){
      if(xAddress === this.xSelected){
        break;
      }
      xAddressPrevious = xAddress;
    }
    if(xAddressPrevious === "#NONE"){
      xAddressPrevious = this.getLast();
    }
    this.xSelected = xAddressPrevious;
    return this.GetSelected();
  },
  GetNext: function(){
    let isSelected = false;
    let xAddressNext = "#NONE";
    for(let xAddress in this.accounts){
      if(isSelected == true){
        xAddressNext = xAddress;
        break;
      }
      if(xAddress === this.xSelected){
        isSelected = true;
      }
    }
    if(xAddressNext === "#NONE"){
      xAddressNext = this.getFirst();
    }
    this.xSelected = xAddressNext;
    return this.GetSelected();
  },
  getFirst: function(){
    let xAddressFirst = "";
    for(let xAddress in this.accounts){
      xAddressFirst = xAddress;
      break;
    }
    return xAddressFirst;
  },
  getLast: function(){
    let xAddressLast = "";
    for(let xAddress in this.accounts){
      xAddressLast = xAddress;
    }
    return xAddressLast;
  },
  GetName: function(xAddress){
    return this.accounts[xAddress].name;
  },
  GetNameToAddress: function(name){
    let xAddressRet = "";
    for(let xAddress in this.accounts){
      if(name === this.accounts[xAddress].name){
        xAddressRet = xAddress;
        break;
      }
    }
    return xAddressRet;
  },
};

ZTIMES.BLOCKCHAIN = {
  contractObjs: {
    "YourErc20" : null,
    "YourErc721" : null,
    "YourErc1155" : null,
    "Holders" : null,
    "HolderWei" : null,
    "Holder20" : null,
    "Holder721" : null,
    "Holder1155" : null,
    "Trade" : null,
  },
  web3Js: null,
  init: async function(){
    console.log("ZTIMES.BLOCKCHAIN.init()");
//    if((typeof window.ethereum !== 'undefined')||(typeof window.web3 !== 'undefined')){
      // const provider = window['ethereum'] || window.web3.currentProvider;
      // this.web3Js = new Web3(provider);
      // ethereum.autoRefreshOnNetworkChange = false;
      // const accounts = await ethereum.enable()
      // console.log(accounts);
      // console.log("isMetaMask : " + ethereum.isMetaMask);
      // console.log("networkVersion : " + ethereum.networkVersion);
      // console.log("selectedAddress : " + ethereum.selectedAddress);
//      console.log("MetaMask is not supported.");
//    }
//    else{
      console.log('<Ganache : web3>');
//      const accessUrl = 'http://127.0.0.1:7545';
//      const provider = new Web3.providers.HttpProvider(accessUrl);
      const accessUrl = 'ws://127.0.0.1:7545';
      const provider = new Web3.providers.WebsocketProvider(accessUrl);
      this.web3Js = new Web3(provider);
      this.initContracts(this.contractObjs);
//    }
  },
  test: function(){
    console.log("ZTIMES.BLOCKCHAIN.test()");
  },
  initContracts: function(contractObjs){
    Object.keys(contractObjs).forEach(function(contractName){
      contractObjs[contractName] = new ZTIMES.BLOCKCHAIN.CONTRACT(contractName);
    });
  },
  CONTRACT: function(contractName){
    this.xAddressContract = null;
    this.instance = null;
    this.init(contractName);
  },
  ContractAddress: async function(contractName){
    const contractObj = this.contractObjs[contractName];
    return contractObj.xAddressContract;
  },
  ContractCall: async function(contractName,strMethod,...params){
    const contractObj = this.contractObjs[contractName];
    const result = contractObj.ContractCall(strMethod,...params);
    return result;
  },
  ContractSend: async function(contractName,strMethod,...params){
    const contractObj = this.contractObjs[contractName];
    contractObj.ContractSend(strMethod,...params);
  },
  GetEventDetail(receiptEvents,eventName,eventIndex,eventParam){
    // @note: receipt.events.$eventName[$eventIndex].returnValues.$eventParam
    if(receiptEvents.hasOwnProperty(eventName) === true){
      const eventList = receiptEvents[eventName];
      if(eventList[eventIndex] !== undefined){
        const returnValues = eventList[eventIndex].returnValues;
        if(returnValues.hasOwnProperty(eventParam) === true){
          const eventValue = returnValues[eventParam];
          return eventValue;
        }
      }
    }
  },
  ReadyWallet: function(password){
    const wallet = this.web3Js.eth.accounts.wallet.load(password);
    if(wallet.length === 0){
      const entropy = this.getEntropy();
      this.web3Js.eth.accounts.wallet.create(2,entropy);
      const walletLen = this.web3Js.eth.accounts.wallet.length;
      for(let cnt=0;cnt<walletLen;cnt+=1){
        const accountWallet = this.web3Js.eth.accounts.wallet[cnt];
        console.log(accountWallet);
        let name = "";
        if(cnt === 0){
          name = "PlayerP";
        }
        else if(cnt === 1){
          name = "PlayerQ";
        }
        ZTIMES.ACCOUNTS.SELF.Set(accountWallet.address,name);
      }
      this.web3Js.eth.accounts.wallet.save(password);
    }
    else{
      const walletLen = wallet.length;
      for(let cnt=0;cnt<walletLen;cnt+=1){
        const accountWallet = wallet[cnt];
        console.log(accountWallet);
        const name = ZTIMES.ACCOUNTS.SELF.GetName(accountWallet.address);
        ZTIMES.ACCOUNTS.SELF.Set(accountWallet.address,name);
      }
    }
  },
  getEntropy: function(){
    // const entropy = '54674321§3456764321§345674321§3453647544±±±§±±±!!!43534534534534';
    const message = Math.random().toString();
    const entropy = this.web3Js.eth.accounts.hashMessage(message);
    return entropy;
  },
  ImportAcount: function(password,privateKey,address,name){
    this.web3Js.eth.accounts.wallet.add({
      privateKey: privateKey,
      address: address
    });
    ZTIMES.ACCOUNTS.SELF.Set(address,name);
    this.web3Js.eth.accounts.wallet.save(password);
  },
  GetBalance: async function (xAddress) {
    const balance = await this.web3Js.eth.getBalance(xAddress);
    return balance;
  },
  SendWei: async function(xSelf,xPeer,amount,gas){
    await this.web3Js.eth.sendTransaction({from:xSelf,to:xPeer,value:amount,gas:gas});
  },
  GetAmount: function(amountOld,unitNew){
    if(unitNew === "Wei"){
      return this.web3Js.utils.toWei(amountOld.toString(),'ether');
    }
    else if(unitNew === "Ether"){
      return this.web3Js.utils.fromWei(amountOld.toString(),'ether');
    }
    else{
      console.log("[ERR]GetAmount() unitNew:" + unitNew);
    }
  },
  IsAddress: function(xAddress){
    return this.web3Js.utils.isAddress(xAddress);
  },
};
ZTIMES.BLOCKCHAIN.CONTRACT.prototype = {
  init: function(contractName){
    const contractJson = this.getContractJson(contractName);
    const contractABI = contractJson["abi"];
    // const networkId = ethereum.networkVersion;
    const networkId = 5777;
    this.xAddressContract = contractJson["networks"][networkId].address;
    this.instance = new ZTIMES.BLOCKCHAIN.web3Js.eth.Contract(contractABI,this.xAddressContract);
    return this.instance;
  },
  getContractJson: function(contractName){
    // @note: abiJson_xxxx.js is required.
//    return AbiJson;
    const AbiJson = eval("AbiJson_" + contractName);
    return AbiJson;
  },
  ContractCall: async function(strMethod,...params){
    try{
      let result = "";
      const method = this.getMethod(strMethod);
      const payload = this.getPayload(params);
      const applyMethod = method.apply(this,params);
      const applyCall = applyMethod.call.apply(this,payload);
      await applyCall.then(function(ret){
        result = ret;
      });
      return result;
    }
    catch(e){ console.log(e); }
    finally{}
  },
  ContractSend: async function(strMethod,...params){
    try{
      const method = this.getMethod(strMethod);
      const callback = this.getCallback(params);
      const payload = this.getPayload(params);
      const applyMethod = method.apply(this,params);
      if(payload === undefined){
        await applyMethod.send()
        .on('receipt', function(receipt){
          if(callback !== undefined){ callback("#Event",receipt.events); }
        })
        .on("error",function(error){
          console.log(error);
          if(callback !== undefined){ callback("#Error",error); }
        });
      }
      else{
        await applyMethod.send(payload)
        .on('receipt', function(receipt){
          if(callback !== undefined){ callback("#Event",receipt.events); }
        })
        .on("error",function(error){
          console.log(error);
          if(callback !== undefined){ callback("#Error",error); }
        });
      }
    }
    catch(e){ console.log(e); }
    finally{}
  },
  getMethod: function(strMethod){
    const method = this.instance.methods[strMethod];
    return method;
  },
  getCallback: function(params){
    const paramsLast = params.slice(-1)[0];
    const type = Object.prototype.toString.call(paramsLast);
    if(type === "[object Function]"){
      const callback = params.pop();
      return callback;
    }
    else{
      return undefined;
    }
  },
  getPayload: function(params){
    const paramsLast = params.slice(-1)[0];
    const type = Object.prototype.toString.call(paramsLast);
    if(type === "[object Object]"){   // pairs
      const payload = params.pop();
      return payload;
    }
    else{
      return undefined;
    }
  },
};

ZTIMES.CONTRACT_LIB = {
  passPhrase: "secret passPhrase",
  Encrypt: function(rawText){
    const encryptedText = CryptoJS.AES.encrypt(rawText,this.passPhrase).toString();
    return encryptedText;
  },
  Decrypt: function(encryptedText){
    const rawText = CryptoJS.AES.decrypt(encryptedText,this.passPhrase).toString(CryptoJS.enc.Utf8);
    return rawText;
  },
};

ZTIMES.CONTRACT_ACCESSOR = {
  gas: 4712388,
  gasPrice: 100000000000,	//= 1000 gwei = 1 szabo
  KIND_BALANCE_Deposit: 0,
  KIND_BALANCE_OnOrder: 1,
  init: function(){
    console.log("ZTIMES.CONTRACT_ACCESSOR.init()");
  },
  test: async function(){
    console.log("ZTIMES.CONTRACT_ACCESSOR.test()");
  },
  getPayload(xAddressSelf,wei){
    if(wei != undefined){
      return {from:xAddressSelf,value:wei,gas:this.gas,gasPrice:this.gasPrice};
    }
    return {from:xAddressSelf,gas:this.gas,gasPrice:this.gasPrice};
  },

  CreateERC20: async function(xAddressSelf,amount){
    await ZTIMES.BLOCKCHAIN.ContractSend('YourErc20','Erc20_Create',amount,this.getPayload(xAddressSelf));
  },
  CreateERC721: async function(xAddressSelf,tokenId){
    await ZTIMES.BLOCKCHAIN.ContractSend('YourErc721','Erc721_Create',tokenId,this.getPayload(xAddressSelf));
  },
  CreateERC1155: async function(xAddressSelf,tokenId,amount){
    await ZTIMES.BLOCKCHAIN.ContractSend('YourErc1155','Erc1155_Create',tokenId,amount,this.getPayload(xAddressSelf));
  },

  GetBalanceWei: async function(xAddressSelf){
    const balance = await ZTIMES.BLOCKCHAIN.GetBalance(xAddressSelf);
    return balance;
  },
  GetBalance20: async function(xAddressSelf){
    const balance = await ZTIMES.BLOCKCHAIN.ContractCall('YourErc20','Erc20_GetBalance',xAddressSelf);
    if(balance === undefined){return 0;}
    return balance;
  },
  GetBalance721: async function(xAddressSelf,tokenID){
    const balance = await ZTIMES.BLOCKCHAIN.ContractCall('YourErc721','Erc721_IsOwner',xAddressSelf,tokenID);
    if(balance === undefined){return 0;}
    else if(balance === false){return 0;}
    else if(balance === true){return 1;}
    return balance;
  },
  GetBalance1155: async function(xAddressSelf,tokenID){
    const balance = await ZTIMES.BLOCKCHAIN.ContractCall('YourErc1155','Erc1155_GetBalance',xAddressSelf,tokenID);
    if(balance === undefined){return 0;}
    return balance;
  },

  SendToHolderWei: async function(xAddressSelf,wei){
    await ZTIMES.BLOCKCHAIN.ContractSend('HolderWei','Wei_SendToHolder',this.getPayload(xAddressSelf,wei));
  },
  SendToHolder20: async function(xAddressSelf,amount){
    const xHolder20 = await ZTIMES.BLOCKCHAIN.ContractAddress('Holder20');
    await ZTIMES.BLOCKCHAIN.ContractSend('YourErc20','Erc20_SendToHolder',xHolder20,amount,this.getPayload(xAddressSelf));
  },
  SendToHolder721: async function(xAddressSelf,tokenId){
    const xHolder721 = await ZTIMES.BLOCKCHAIN.ContractAddress('Holder721');
    await ZTIMES.BLOCKCHAIN.ContractSend('YourErc721','Erc721_SendToHolder',xHolder721,tokenId,this.getPayload(xAddressSelf));
  },
  SendToHolder1155: async function(xAddressSelf,tokenId,amount){
    const xHolder1155 = await ZTIMES.BLOCKCHAIN.ContractAddress('Holder1155');
    await ZTIMES.BLOCKCHAIN.ContractSend('YourErc1155','Erc1155_SendToHolder',xHolder1155,tokenId,amount,this.getPayload(xAddressSelf));
  },

  CalcIdTrade: async function(kindHolder,xToken,tokenId){
    const idTrade = await ZTIMES.BLOCKCHAIN.ContractCall('Holders','CalcIdTrade',kindHolder,xToken,tokenId);
    return idTrade;
  },
  GetIndexLastInIdTradeList: async function(xAddressSelf){
    const listLen = await ZTIMES.BLOCKCHAIN.ContractCall('Holders','ShowIdTradeListLen',xAddressSelf);
    const indexLast = Number(listLen);
    return indexLast;
  },
  GetIdTrade: async function(xAddressSelf,index){
    const idTradeData = await ZTIMES.BLOCKCHAIN.ContractCall('Holders','ShowIdTradeList',xAddressSelf,index);
    // isValid,xToken,idTrade
    const idTrade = idTradeData.idTrade;
    return idTrade;
  },
  GetTradeInfo: async function(idTrade){
    const tradeInfo = await ZTIMES.BLOCKCHAIN.ContractCall('Holders','ShowIdTradeInfo',idTrade);
    return tradeInfo;    // kindHolder,xToken,tokenId
  },

  GetDepositWei: async function(xAddressSelf,idTrade){
    const balance = await ZTIMES.BLOCKCHAIN.ContractCall('HolderWei','ShowBalance',xAddressSelf,ZTIMES.CONTRACT_ACCESSOR.KIND_BALANCE_Deposit,idTrade);
    return balance;
  },
  GetOnOrderWei: async function(xAddressSelf,idTrade){
    const balance = await ZTIMES.BLOCKCHAIN.ContractCall('HolderWei','ShowBalance',xAddressSelf,ZTIMES.CONTRACT_ACCESSOR.KIND_BALANCE_OnOrder,idTrade);
    return balance;
  },
  GetDeposit20: async function(xAddressSelf,idTrade){
    const balance = await ZTIMES.BLOCKCHAIN.ContractCall('Holder20','ShowBalance',xAddressSelf,ZTIMES.CONTRACT_ACCESSOR.KIND_BALANCE_Deposit,idTrade);
    return balance;
  },
  GetOnOrder20: async function(xAddressSelf,idTrade){
    const balance = await ZTIMES.BLOCKCHAIN.ContractCall('Holder20','ShowBalance',xAddressSelf,ZTIMES.CONTRACT_ACCESSOR.KIND_BALANCE_OnOrder,idTrade);
    return balance;
  },
  GetDeposit721: async function(xAddressSelf,idTrade){
    const balance = await ZTIMES.BLOCKCHAIN.ContractCall('Holder721','ShowBalance',xAddressSelf,ZTIMES.CONTRACT_ACCESSOR.KIND_BALANCE_Deposit,idTrade);
    return balance;
  },
  GetOnOrder721: async function(xAddressSelf,idTrade){
    const balance = await ZTIMES.BLOCKCHAIN.ContractCall('Holder721','ShowBalance',xAddressSelf,ZTIMES.CONTRACT_ACCESSOR.KIND_BALANCE_OnOrder,idTrade);
    return balance;
  },
  GetDeposit1155: async function(xAddressSelf,idTrade){
    const balance = await ZTIMES.BLOCKCHAIN.ContractCall('Holder1155','ShowBalance',xAddressSelf,ZTIMES.CONTRACT_ACCESSOR.KIND_BALANCE_Deposit,idTrade);
    return balance;
  },
  GetOnOrder1155: async function(xAddressSelf,idTrade){
    const balance = await ZTIMES.BLOCKCHAIN.ContractCall('Holder1155','ShowBalance',xAddressSelf,ZTIMES.CONTRACT_ACCESSOR.KIND_BALANCE_OnOrder,idTrade);
    return balance;
  },

  SendFromHolderWei: async function(xAddressSelf,idTrade){
    await ZTIMES.BLOCKCHAIN.ContractSend('HolderWei','Wei_SendFromHolder',idTrade,this.getPayload(xAddressSelf));
  },
  SendFromHolder20: async function(xAddressSelf,idTrade,amount){
    await ZTIMES.BLOCKCHAIN.ContractSend('Holders','Withdraw',idTrade,amount,this.getPayload(xAddressSelf));
  },
  SendFromHolder721: async function(xAddressSelf,idTrade){
    const amount = 1;
    await ZTIMES.BLOCKCHAIN.ContractSend('Holders','Withdraw',idTrade,amount,this.getPayload(xAddressSelf));
  },
  SendFromHolder1155: async function(xAddressSelf,idTrade,amount){
    await ZTIMES.BLOCKCHAIN.ContractSend('Holders','Withdraw',idTrade,amount,this.getPayload(xAddressSelf));
  },

  AddOrderSell: async function(xAddressSelf,idTradeSelf,idTradePeer,rate,amount){
    await ZTIMES.BLOCKCHAIN.ContractSend('Holders','AddOrderSell',idTradeSelf,idTradePeer,rate,amount,this.getPayload(xAddressSelf));
  },
  AddOrderBuy: async function(xAddressSelf,idTradeSelf,idTradePeer,rate,amount){
    await ZTIMES.BLOCKCHAIN.ContractSend('Holders','AddOrderBuy',idTradeSelf,idTradePeer,rate,amount,this.getPayload(xAddressSelf));
  },
  GetOrderInfo: async function(idTradeSelf,idTradePeer,rate,orderKind){
    const result = await ZTIMES.BLOCKCHAIN.ContractCall('Trade','GetOrderInfo',idTradeSelf,idTradePeer,rate,orderKind);
    return result;	// indexStart,listLen
  },
  GetOrder: async function(idTradeSelf,idTradePeer,rate,orderKind,indexOrder){
    const result = await ZTIMES.BLOCKCHAIN.ContractCall('Trade','GetOrder',idTradeSelf,idTradePeer,rate,orderKind,indexOrder);
    return result;	// xAddressSelf,amount
  },
  MatchOrders: async function(xAddressSelf,idTradeSelf,idTradePeer,rate,orderKindSelf,indexOrderSelf,amountReqSelf){
    await ZTIMES.BLOCKCHAIN.ContractSend('Trade','MatchOrders',idTradeSelf,idTradePeer,rate,orderKindSelf,indexOrderSelf,amountReqSelf,this.getPayload(xAddressSelf));
  },
  CancelOrder: async function(xAddressSelf,idTradeSelf,idTradePeer,rate,orderKindSelf,indexOrderSelf){
    await ZTIMES.BLOCKCHAIN.ContractSend('Trade','CancelOrder',idTradeSelf,idTradePeer,rate,orderKindSelf,indexOrderSelf,this.getPayload(xAddressSelf));
  },

  // ShowInfo: async function(xAddressSelf,func){
  //   await ZTIMES.BLOCKCHAIN.ContractSend(contractName,'ShowInfo',{from:xAddressSelf,gas:this.gas,gasPrice:this.gasPrice},function(kind,result){
  //     if(kind === "#Event"){
  //       const xOnOrder = ZTIMES.BLOCKCHAIN.GetEventDetail(result,"InfoAddress",0,"target");
  //       console.log(xOnOrder);
  //       const xDigitalItems = ZTIMES.BLOCKCHAIN.GetEventDetail(result,"InfoAddress",1,"target");
  //       console.log(xDigitalItems);
  //       func(xDigitalItems);
  //     }
  //   });
  // },
}

ZTIMES.GUI = {
 init: function(){
   console.log("ZTIMES.GUI.init()");
   this.WALLET = new ZTIMES.GUI.WALLET();
   this.BALANCE = new ZTIMES.GUI.BALANCE();
   this.DAPP = new ZTIMES.GUI.DAPP();
 },
 test: function(){
   console.log("ZTIMES.GUI.test()");
 },
 setup: function(){
 },
 keyDown: function(){
   return (this.isTouch ? 'touchstart':'mousedown');
 },
 keyMove: function(){
   return (this.isTouch ? 'touchmove':'mousemove');
 },
 keyUp: function(){
   return (this.isTouch ? 'touchend':'mouseup');
 },
 addKeyUp: function(id,action){
   try{
     document.getElementById(id).addEventListener(this.keyUp(),action,false);
   }
   catch(e){ console.log(e); }
   finally{}
 },
 addChange: function(id,action){
   try{
     document.getElementById(id).addEventListener('change',action,false);
   }
   catch(e){ console.log(e); }
   finally{}
 },
 editInnerText: function(id,text){
   try{
     document.getElementById(id).innerText = text;
   }
   catch(e){ console.log(e); }
   finally{}
 },
 editValueText: function(id,text){
   try{
     document.getElementById(id).value = text;
   }
   catch(e){ console.log(e); }
   finally{}
 },
 refValueText: function(id){
   try{
     return document.getElementById(id).value;
   }
   catch(e){ console.log(e); }
   finally{}
 },
 showDiv: function(id){
   try{
     const el = document.getElementById(id);
     el.style.display = "block";
   }
   catch(e){ console.log(e); }
   finally{}
 },
 hideDiv: function(id){
   try{
     const el = document.getElementById(id);
     el.style.display = "none";
   }
   catch(e){ console.log(e); }
   finally{}
 },
 WALLET: function(){
   this.init();
 },
 BALANCE: function(){
   this.init();
 },
 DAPP: function(){
   this.init();
 },
};
ZTIMES.GUI.WALLET.prototype = {
 init: function(){
   ZTIMES.GUI.addKeyUp('iWalletReady',async function(){
     ZTIMES.GUI.editInnerText('iWalletInfo',"Processing...");
     setTimeout(ZTIMES.GUI.WALLET.timeoutWalletReady,100);
   },false);
   ZTIMES.GUI.addKeyUp('iImportAction',async function(){
     ZTIMES.GUI.editInnerText('iWalletInfo',"Processing...");
     setTimeout(ZTIMES.GUI.WALLET.timeoutImport,100);
   },false);
 },
 timeoutWalletReady: async function(){
   const password = ZTIMES.GUI.refValueText('iWalletPassword');
   const xPlayers = await ZTIMES.BLOCKCHAIN.ReadyWallet(password);
   ZTIMES.GUI.editInnerText('iWalletInfo',"Ready OK.");
   const xPlayerP = ZTIMES.ACCOUNTS.SELF.GetNameToAddress("PlayerP");
   const xPlayerQ = ZTIMES.ACCOUNTS.SELF.GetNameToAddress("PlayerQ");
   ZTIMES.GUI.editInnerText('iAddressP',xPlayerP);
   ZTIMES.GUI.editInnerText('iAddressQ',xPlayerQ);
   const xGanache0 = ZTIMES.ACCOUNTS.SELF.GetNameToAddress("Ganache0");
   ZTIMES.GUI.editInnerText('iAddressG',xGanache0);
   ZTIMES.GUI.WALLET.dispBalance('iAmountP',xPlayerP);
   ZTIMES.GUI.WALLET.dispBalance('iAmountQ',xPlayerQ);
   ZTIMES.GUI.DAPP.ready();
 },
 timeoutImport: async function(){
   const privateKey = ZTIMES.GUI.refValueText('iImportPrivateKey');
   const address = ZTIMES.GUI.refValueText('iImportAddress');
   const password = ZTIMES.GUI.refValueText('iWalletPassword');
   const name = "Ganache0";
   await ZTIMES.BLOCKCHAIN.ImportAcount(password,privateKey,address,name);
   ZTIMES.GUI.editValueText('iImportPrivateKey',"");
   ZTIMES.GUI.editValueText('iImportAddress',"");
   ZTIMES.GUI.editInnerText('iWalletInfo',"Done.");
   const xGanache0 = ZTIMES.ACCOUNTS.SELF.GetNameToAddress(name);
   ZTIMES.GUI.editInnerText('iAddressG',xGanache0);
 },
 dispBalance: async function(id,xAddress){
   const balance = await ZTIMES.BLOCKCHAIN.GetBalance(xAddress);
   const unit = "Wei";
   const amountText = ZTIMES.ACCOUNTS.UNIT.GetAmountText(balance,unit);
   ZTIMES.GUI.editValueText(id,amountText);
   console.log(amountText);
 },
 onLoad: function(){
 },
};
ZTIMES.GUI.BALANCE.prototype = {
 init: function(){
   ZTIMES.GUI.addKeyUp('iSendToWallet',async function(){
     ZTIMES.GUI.editInnerText('iSendInfo',"Processing...");
     setTimeout(ZTIMES.GUI.BALANCE.timeoutSendToWallet,100);
   },false);
 },
 onLoad: function(){
 },
 timeoutSendToWallet: function(){
   ZTIMES.GUI.BALANCE.sendWei();
 },
 sendWei: async function(){
   const xSelf = ZTIMES.GUI.refValueText('iAddressG');
   if(xSelf === ""){
     alert("Invalid imported address.");
     return;
   }
   const xPlayerP = ZTIMES.GUI.refValueText('iAddressP');
   if(xPlayerP === ""){
     alert("Invalid addressP.");
     return;
   }
   const xPlayerQ = ZTIMES.GUI.refValueText('iAddressQ');
   if(xPlayerQ === ""){
     alert("Invalid addressQ.");
     return;
   }
   const amountText = ZTIMES.GUI.refValueText('iAmountG');
   const amount = ZTIMES.ACCOUNTS.UNIT.GetAmount(amountText);
   if(amount === 0){
     alert("Invalid imported amount.");
     return;
   }
   const unit = "Wei";
   const gas = '5000000';
   await ZTIMES.BLOCKCHAIN.SendWei(xSelf,xPlayerP,amount,gas);
   await ZTIMES.BLOCKCHAIN.SendWei(xSelf,xPlayerQ,amount,gas);
   ZTIMES.GUI.editInnerText('iSendInfo',"Sent to PlayerP and PlayerQ.");
   ZTIMES.GUI.WALLET.dispBalance('iAmountP',xPlayerP);
   ZTIMES.GUI.WALLET.dispBalance('iAmountQ',xPlayerQ);
 },
};
ZTIMES.GUI.DAPP.prototype = {
 zPlayer: "PlayerP",
 xPlayer: 0,
 zSellerKind: "",
 zBuyerKind: "",
 zSellerIdTrade: 0,
 zBuyerIdTrade: 0,
 TokenId_WEI: 0,
 TokenId_ERC20: 0,
 TokenId_ERC721C: 10,
 TokenId_ERC721D: 20,
 TokenId_ERC1155E: 11,
 TokenId_ERC1155F: 22,
 rate: 1,
 ORDER_KIND_SELL: 0,
 ORDER_KIND_BUY: 1,
 ready: async function(){
   // const xCreator = ZTIMES.ACCOUNTS.SELF.GetNameToAddress("PlayerP");
   //  this.idItem = await ZTIMES.CONTRACT_ACCESSOR.Item_GetIdItem(xCreator,"ItemA");
   //  this.refreshOrderList();
 },
 init: function(){
   ZTIMES.GUI.addKeyUp('iZPlayerP',async function(){
     ZTIMES.GUI.DAPP.SetPlayer("PlayerP");
     ZTIMES.GUI.editInnerText('iDappInfo',"Activate PlayerP.");
   },false);
   ZTIMES.GUI.addKeyUp('iZPlayerQ',async function(){
     ZTIMES.GUI.DAPP.SetPlayer("PlayerQ");
     ZTIMES.GUI.editInnerText('iDappInfo',"Activate PlayerQ.");
   },false);

   ZTIMES.GUI.addKeyUp('iCreateAssets',async function(){
     ZTIMES.GUI.DAPP.CreateAssets();
     ZTIMES.GUI.editInnerText('iDappInfo',"Created initial assets.");
   },false);

   ZTIMES.GUI.addKeyUp('iSendToHolderWei',async function(){
     ZTIMES.GUI.DAPP.DepositWei(100);
     ZTIMES.GUI.editInnerText('iDappInfo',"Deposit to Holder : 100 Wei.");
   },false);
   ZTIMES.GUI.addKeyUp('iSendFromHolderWei',async function(){
     ZTIMES.GUI.DAPP.WithdrawWei();
     ZTIMES.GUI.editInnerText('iDappInfo',"Withdraw from Holder : all Wei.");
   },false);
   ZTIMES.GUI.addKeyUp('iSellOrderWei',async function(){
     ZTIMES.GUI.DAPP.AddSellOrderWei(10);
     ZTIMES.GUI.editInnerText('iDappInfo',"Sell order : 10 Wei.");
   },false);
   ZTIMES.GUI.addKeyUp('iBuyOrderWei',async function(){
     ZTIMES.GUI.DAPP.AddBuyOrderWei(10);
     ZTIMES.GUI.editInnerText('iDappInfo',"Buy order : 10 Wei.");
   },false);

   ZTIMES.GUI.addKeyUp('iSendToHolder20',async function(){
     ZTIMES.GUI.DAPP.DepositERC20(100);
     ZTIMES.GUI.editInnerText('iDappInfo',"Deposit to Holder : 100 ERC20.");
   },false);
   ZTIMES.GUI.addKeyUp('iSendFromHolder20',async function(){
     ZTIMES.GUI.DAPP.WithdrawERC20(100);
     ZTIMES.GUI.editInnerText('iDappInfo',"Withdraw from Holder : 100 ERC20.");
   },false);
   ZTIMES.GUI.addKeyUp('iSellOrder20',async function(){
     ZTIMES.GUI.DAPP.AddSellOrder20(10);
     ZTIMES.GUI.editInnerText('iDappInfo',"Sell order : 10 ERC20.");
   },false);
   ZTIMES.GUI.addKeyUp('iBuyOrder20',async function(){
     ZTIMES.GUI.DAPP.AddBuyOrder20(10);
     ZTIMES.GUI.editInnerText('iDappInfo',"Buy order : 10 ERC20.");
   },false);

   ZTIMES.GUI.addKeyUp('iSendToHolder721C',async function(){
     ZTIMES.GUI.DAPP.DepositERC721C();
     ZTIMES.GUI.editInnerText('iDappInfo',"Deposit to Holder : ERC721-ItemC.");
   },false);
   ZTIMES.GUI.addKeyUp('iSendToHolder721D',async function(){
     ZTIMES.GUI.DAPP.DepositERC721D();
     ZTIMES.GUI.editInnerText('iDappInfo',"Deposit to Holder : ERC721-ItemD.");
   },false);
   ZTIMES.GUI.addKeyUp('iSendFromHolder721C',async function(){
     ZTIMES.GUI.DAPP.WithdrawERC721C();
     ZTIMES.GUI.editInnerText('iDappInfo',"Withdraw from Holder : ERC721-ItemC.");
   },false);
   ZTIMES.GUI.addKeyUp('iSendFromHolder721D',async function(){
     ZTIMES.GUI.DAPP.WithdrawERC721D();
     ZTIMES.GUI.editInnerText('iDappInfo',"Withdraw from Holder : ERC721-ItemD.");
   },false);
   ZTIMES.GUI.addKeyUp('iSellOrder721C',async function(){
     ZTIMES.GUI.DAPP.AddSellOrder721C();
     ZTIMES.GUI.editInnerText('iDappInfo',"Sell order : ERC721-ItemC.");
   },false);
   ZTIMES.GUI.addKeyUp('iBuyOrder721C',async function(){
     ZTIMES.GUI.DAPP.AddBuyOrder721C();
     ZTIMES.GUI.editInnerText('iDappInfo',"Buy order : ERC721-ItemC.");
   },false);
   ZTIMES.GUI.addKeyUp('iSellOrder721D',async function(){
     ZTIMES.GUI.DAPP.AddSellOrder721D();
     ZTIMES.GUI.editInnerText('iDappInfo',"Sell order : ERC721-ItemD.");
   },false);
   ZTIMES.GUI.addKeyUp('iBuyOrder721D',async function(){
     ZTIMES.GUI.DAPP.AddBuyOrder721D();
     ZTIMES.GUI.editInnerText('iDappInfo',"Buy order : ERC721-ItemD.");
   },false);

  ZTIMES.GUI.addKeyUp('iSendToHolder1155E',async function(){
    ZTIMES.GUI.DAPP.DepositERC1155E(100);
    ZTIMES.GUI.editInnerText('iDappInfo',"Deposit to Holder : 100 ERC1155-ItemE.");
  },false);
  ZTIMES.GUI.addKeyUp('iSendToHolder1155F',async function(){
    ZTIMES.GUI.DAPP.DepositERC1155F(100);
    ZTIMES.GUI.editInnerText('iDappInfo',"Deposit to Holder : 100 ERC1155-ItemF.");
  },false);
  ZTIMES.GUI.addKeyUp('iSendFromHolder1155E',async function(){
    ZTIMES.GUI.DAPP.WithdrawERC1155E(100);
    ZTIMES.GUI.editInnerText('iDappInfo',"Withdraw from Holder : 100 ERC1155-ItemE.");
  },false);
  ZTIMES.GUI.addKeyUp('iSendFromHolder1155F',async function(){
    ZTIMES.GUI.DAPP.WithdrawERC1155F(100);
    ZTIMES.GUI.editInnerText('iDappInfo',"Withdraw from Holder : 100 ERC1155-ItemF.");
  },false);
  ZTIMES.GUI.addKeyUp('iSellOrder1155E',async function(){
    ZTIMES.GUI.DAPP.AddSellOrder1155E(10);
    ZTIMES.GUI.editInnerText('iDappInfo',"Sell order : 10 ERC1155-ItemE.");
  },false);
  ZTIMES.GUI.addKeyUp('iBuyOrder1155E',async function(){
    ZTIMES.GUI.DAPP.AddBuyOrder1155E(10);
    ZTIMES.GUI.editInnerText('iDappInfo',"Buy order : 10 ERC1155-ItemE.");
  },false);
  ZTIMES.GUI.addKeyUp('iSellOrder1155F',async function(){
    ZTIMES.GUI.DAPP.AddSellOrder1155F(10);
    ZTIMES.GUI.editInnerText('iDappInfo',"Sell order : 10 ERC1155-ItemF.");
  },false);
  ZTIMES.GUI.addKeyUp('iBuyOrder1155F',async function(){
    ZTIMES.GUI.DAPP.AddBuyOrder1155F(10);
    ZTIMES.GUI.editInnerText('iDappInfo',"Buy order : 10 ERC1155-ItemF.");
  },false);

  ZTIMES.GUI.addKeyUp('iSellerKindWei',async function(){
    ZTIMES.GUI.DAPP.SetSellerKind("Wei");
    ZTIMES.GUI.editInnerText('iDappInfo',"Selected Wei.");
  },false);
  ZTIMES.GUI.addKeyUp('iSellerKind20',async function(){
    ZTIMES.GUI.DAPP.SetSellerKind("ERC20");
    ZTIMES.GUI.editInnerText('iDappInfo',"Selected ERC20.");
  },false);
  ZTIMES.GUI.addKeyUp('iSellerKind721C',async function(){
    ZTIMES.GUI.DAPP.SetSellerKind("ERC721C");
    ZTIMES.GUI.editInnerText('iDappInfo',"Selected ERC721C.");
  },false);
  ZTIMES.GUI.addKeyUp('iSellerKind721D',async function(){
    ZTIMES.GUI.DAPP.SetSellerKind("ERC721D");
    ZTIMES.GUI.editInnerText('iDappInfo',"Selected ERC721D.");
  },false);
  ZTIMES.GUI.addKeyUp('iSellerKind1155E',async function(){
    ZTIMES.GUI.DAPP.SetSellerKind("ERC1155E");
    ZTIMES.GUI.editInnerText('iDappInfo',"Selected ERC1155E.");
  },false);
  ZTIMES.GUI.addKeyUp('iSellerKind1155F',async function(){
    ZTIMES.GUI.DAPP.SetSellerKind("ERC1155F");
    ZTIMES.GUI.editInnerText('iDappInfo',"Selected ERC1155F.");
  },false);

  ZTIMES.GUI.addKeyUp('iBuyerKindWei',async function(){
    ZTIMES.GUI.DAPP.SetBuyerKind("Wei");
    ZTIMES.GUI.editInnerText('iDappInfo',"Selected Wei.");
  },false);
  ZTIMES.GUI.addKeyUp('iBuyerKind20',async function(){
    ZTIMES.GUI.DAPP.SetBuyerKind("ERC20");
    ZTIMES.GUI.editInnerText('iDappInfo',"Selected ERC20.");
  },false);
  ZTIMES.GUI.addKeyUp('iBuyerKind721C',async function(){
    ZTIMES.GUI.DAPP.SetBuyerKind("ERC721C");
    ZTIMES.GUI.editInnerText('iDappInfo',"Selected ERC721C.");
  },false);
  ZTIMES.GUI.addKeyUp('iBuyerKind721D',async function(){
    ZTIMES.GUI.DAPP.SetBuyerKind("ERC721D");
    ZTIMES.GUI.editInnerText('iDappInfo',"Selected ERC721D.");
  },false);
  ZTIMES.GUI.addKeyUp('iBuyerKind1155E',async function(){
    ZTIMES.GUI.DAPP.SetBuyerKind("ERC1155E");
    ZTIMES.GUI.editInnerText('iDappInfo',"Selected ERC1155E.");
  },false);
  ZTIMES.GUI.addKeyUp('iBuyerKind1155F',async function(){
    ZTIMES.GUI.DAPP.SetBuyerKind("ERC1155F");
    ZTIMES.GUI.editInnerText('iDappInfo',"Selected ERC1155F.");
  },false);

  ZTIMES.GUI.addKeyUp('iShowMarket',async function(){
    ZTIMES.GUI.DAPP.ShowMarket();
    ZTIMES.GUI.editInnerText('iDappInfo',"Updeted market board.");
  },false);

  ZTIMES.GUI.addKeyUp('iSell0',async function(){
    ZTIMES.GUI.DAPP.MatchOrders(ZTIMES.GUI.DAPP.ORDER_KIND_SELL,0);
    ZTIMES.GUI.editInnerText('iDappInfo',"Tried to match orders.");
  },false);
  ZTIMES.GUI.addKeyUp('iSell1',async function(){
    ZTIMES.GUI.DAPP.MatchOrders(ZTIMES.GUI.DAPP.ORDER_KIND_SELL,1);
    ZTIMES.GUI.editInnerText('iDappInfo',"Tried to match orders.");
  },false);
  ZTIMES.GUI.addKeyUp('iSell2',async function(){
    ZTIMES.GUI.DAPP.MatchOrders(ZTIMES.GUI.DAPP.ORDER_KIND_SELL,2);
    ZTIMES.GUI.editInnerText('iDappInfo',"Tried to match orders.");
  },false);
  ZTIMES.GUI.addKeyUp('iSell3',async function(){
    ZTIMES.GUI.DAPP.MatchOrders(ZTIMES.GUI.DAPP.ORDER_KIND_SELL,3);
    ZTIMES.GUI.editInnerText('iDappInfo',"Tried to match orders.");
  },false);
  ZTIMES.GUI.addKeyUp('iBuy0',async function(){
    ZTIMES.GUI.DAPP.MatchOrders(ZTIMES.GUI.DAPP.ORDER_KIND_BUY,0);
    ZTIMES.GUI.editInnerText('iDappInfo',"Tried to match orders.");
  },false);
  ZTIMES.GUI.addKeyUp('iBuy1',async function(){
    ZTIMES.GUI.DAPP.MatchOrders(ZTIMES.GUI.DAPP.ORDER_KIND_BUY,1);
    ZTIMES.GUI.editInnerText('iDappInfo',"Tried to match orders.");
  },false);
  ZTIMES.GUI.addKeyUp('iBuy2',async function(){
    ZTIMES.GUI.DAPP.MatchOrders(ZTIMES.GUI.DAPP.ORDER_KIND_BUY,2);
    ZTIMES.GUI.editInnerText('iDappInfo',"Tried to match orders.");
  },false);
  ZTIMES.GUI.addKeyUp('iBuy3',async function(){
    ZTIMES.GUI.DAPP.MatchOrders(ZTIMES.GUI.DAPP.ORDER_KIND_BUY,3);
    ZTIMES.GUI.editInnerText('iDappInfo',"Tried to match orders.");
  },false);
//     ZTIMES.GUI.addKeyUp('iDebug',async function(){
//       ZTIMES.CONTRACT_ACCESSOR.ShowInfo(contractName,ZTIMES.GUI.DAPP.xPlayer,function(data){
//         const text = "Contract address: " + data;
//         ZTIMES.GUI.editInnerText('iDebugInfo',text);
//       });
//     },false);
 },

 SetPlayer: async function(zPlayer){
   this.zPlayer = zPlayer;
   this.xPlayer = ZTIMES.ACCOUNTS.SELF.GetNameToAddress(this.zPlayer);
   ZTIMES.GUI.editInnerText('iZAddress',this.xPlayer);
   this.refreshBalanceWei(this);
   this.refreshBalance20(this);
   this.refreshBalance721C(this);
   this.refreshBalance721D(this);
   this.refreshBalance1155E(this);
   this.refreshBalance1155F(this);
   this.refreshHolderDepositWei(this);
   this.refreshHolderDeposit20(this);
   this.refreshHolderDeposit721C(this);
   this.refreshHolderDeposit721D(this);
   this.refreshHolderDeposit1155E(this);
   this.refreshHolderDeposit1155F(this);
   this.refreshHolderOnOrderWei(this);
   this.refreshHolderOnOrder20(this);
   this.refreshHolderOnOrder721C(this);
   this.refreshHolderOnOrder721D(this);
   this.refreshHolderOnOrder1155E(this);
   this.refreshHolderOnOrder1155F(this);
 },

 CreateAssets: async function(){
   const xPlayerP = ZTIMES.GUI.refValueText('iAddressP');
   if(xPlayerP === ""){
     alert("Invalid addressP.");
     return;
   }
   const xPlayerQ = ZTIMES.GUI.refValueText('iAddressQ');
   if(xPlayerQ === ""){
     alert("Invalid addressQ.");
     return;
   }
   setTimeout(ZTIMES.GUI.DAPP.CreateERC20,1000,this,xPlayerP);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance20,2000,this);
   setTimeout(ZTIMES.GUI.DAPP.CreateERC721C,3000,this,xPlayerP);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance721C,4000,this);
   setTimeout(ZTIMES.GUI.DAPP.CreateERC721D,1500,this,xPlayerQ);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance721D,2500,this);
   setTimeout(ZTIMES.GUI.DAPP.CreateERC1155E,5000,this,xPlayerP);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance1155E,6000,this);
   setTimeout(ZTIMES.GUI.DAPP.CreateERC1155F,3500,this,xPlayerQ);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance1155F,4500,this);
 },
 CreateERC20: async function(it,xPlayer){
   await ZTIMES.CONTRACT_ACCESSOR.CreateERC20(xPlayer,100);
 },
 CreateERC721C: async function(it,xPlayer){
   await ZTIMES.CONTRACT_ACCESSOR.CreateERC721(xPlayer,ZTIMES.GUI.DAPP.TokenId_ERC721C);
 },
 CreateERC721D: async function(it,xPlayer){
   await ZTIMES.CONTRACT_ACCESSOR.CreateERC721(xPlayer,ZTIMES.GUI.DAPP.TokenId_ERC721D);
 },
 CreateERC1155E: async function(it,xPlayer){
   await ZTIMES.CONTRACT_ACCESSOR.CreateERC1155(xPlayer,ZTIMES.GUI.DAPP.TokenId_ERC1155E,100);
 },
 CreateERC1155F: async function(it,xPlayer){
   await ZTIMES.CONTRACT_ACCESSOR.CreateERC1155(xPlayer,ZTIMES.GUI.DAPP.TokenId_ERC1155F,100);
 },

 refreshBalanceWei: async function(it){
   if(it === undefined){it = this;}
   const balance = await ZTIMES.CONTRACT_ACCESSOR.GetBalanceWei(it.xPlayer);
   ZTIMES.GUI.editInnerText('iZAmountWei',balance);
   const xPlayerP = ZTIMES.GUI.refValueText('iAddressP');
   if(xPlayerP === it.xPlayer){
     ZTIMES.GUI.WALLET.dispBalance('iAmountP',it.xPlayer);
   }
   else{
     const xPlayerQ = ZTIMES.GUI.refValueText('iAddressQ');
     if(xPlayerQ === it.xPlayer){
       ZTIMES.GUI.WALLET.dispBalance('iAmountQ',it.xPlayer);
     }
   }
 },
 refreshBalance20: async function(it){
   if(it === undefined){it = this;}
   const balance = await ZTIMES.CONTRACT_ACCESSOR.GetBalance20(it.xPlayer);
   ZTIMES.GUI.editInnerText('iZAmount20',balance);
 },
 refreshBalance721C: async function(it){
   if(it === undefined){it = this;}
   const tokenID = ZTIMES.GUI.DAPP.TokenId_ERC721C;
   const balance = await ZTIMES.CONTRACT_ACCESSOR.GetBalance721(it.xPlayer,tokenID);
   ZTIMES.GUI.editInnerText('iZAmount721C',balance);
 },
 refreshBalance721D: async function(it){
   if(it === undefined){it = this;}
   const tokenID = ZTIMES.GUI.DAPP.TokenId_ERC721D;
   const balance = await ZTIMES.CONTRACT_ACCESSOR.GetBalance721(it.xPlayer,tokenID);
   ZTIMES.GUI.editInnerText('iZAmount721D',balance);
 },
 refreshBalance1155E: async function(it){
   if(it === undefined){it = this;}
   const tokenID = ZTIMES.GUI.DAPP.TokenId_ERC1155E;
   const balance = await ZTIMES.CONTRACT_ACCESSOR.GetBalance1155(it.xPlayer,tokenID);
   ZTIMES.GUI.editInnerText('iZAmount1155E',balance);
 },
 refreshBalance1155F: async function(it){
   if(it === undefined){it = this;}
   const tokenID = ZTIMES.GUI.DAPP.TokenId_ERC1155F;
   const balance = await ZTIMES.CONTRACT_ACCESSOR.GetBalance1155(it.xPlayer,tokenID);
   ZTIMES.GUI.editInnerText('iZAmount1155F',balance);
 },

 refreshHolderDepositWei: async function(it){
   if(it === undefined){it = this;}
   const idTrade = await it.toIdTrade("Wei");
   if(idTrade === undefined){
     ZTIMES.GUI.editInnerText('iHolderDepositWei','-');
   }
   else{
     const balance = await ZTIMES.CONTRACT_ACCESSOR.GetDepositWei(it.xPlayer,idTrade);
     ZTIMES.GUI.editInnerText('iHolderDepositWei',balance);
   }
 },
 refreshHolderDeposit20: async function(it){
   if(it === undefined){it = this;}
   const idTrade = await it.toIdTrade("ERC20");
   if(idTrade === undefined){
     ZTIMES.GUI.editInnerText('iHolderDeposit20','-');
   }
   else{
     const balance = await ZTIMES.CONTRACT_ACCESSOR.GetDeposit20(it.xPlayer,idTrade);
     ZTIMES.GUI.editInnerText('iHolderDeposit20',balance);
   }
 },
 refreshHolderDeposit721C: async function(it){
   if(it === undefined){it = this;}
   const idTrade = await it.toIdTrade("ERC721C");
   if(idTrade === undefined){
     ZTIMES.GUI.editInnerText('iHolderDeposit721C','-');
   }
   else{
     const balance = await ZTIMES.CONTRACT_ACCESSOR.GetDeposit721(it.xPlayer,idTrade);
     ZTIMES.GUI.editInnerText('iHolderDeposit721C',balance);
   }
 },
 refreshHolderDeposit721D: async function(it){
   if(it === undefined){it = this;}
   const idTrade = await it.toIdTrade("ERC721D");
   if(idTrade === undefined){
     ZTIMES.GUI.editInnerText('iHolderDeposit721D','-');
   }
   else{
     const balance = await ZTIMES.CONTRACT_ACCESSOR.GetDeposit721(it.xPlayer,idTrade);
     ZTIMES.GUI.editInnerText('iHolderDeposit721D',balance);
   }
 },
 refreshHolderDeposit1155E: async function(it){
   if(it === undefined){it = this;}
   const idTrade = await it.toIdTrade("ERC1155E");
   if(idTrade === undefined){
     ZTIMES.GUI.editInnerText('iHolderDeposit1155E','-');
   }
   else{
     const balance = await ZTIMES.CONTRACT_ACCESSOR.GetDeposit1155(it.xPlayer,idTrade);
     ZTIMES.GUI.editInnerText('iHolderDeposit1155E',balance);
   }
 },
 refreshHolderDeposit1155F: async function(it){
   if(it === undefined){it = this;}
   const idTrade = await it.toIdTrade("ERC1155F");
   if(idTrade === undefined){
     ZTIMES.GUI.editInnerText('iHolderDeposit1155F','-');
   }
   else{
     const balance = await ZTIMES.CONTRACT_ACCESSOR.GetDeposit1155(it.xPlayer,idTrade);
     ZTIMES.GUI.editInnerText('iHolderDeposit1155F',balance);
   }
 },

 refreshHolderOnOrderWei: async function(it){
   if(it === undefined){it = this;}
   const idTrade = await it.toIdTrade("Wei");
   if(idTrade === undefined){
     ZTIMES.GUI.editInnerText('iHolderOnOrderWei','-');
   }
   else{
     const balance = await ZTIMES.CONTRACT_ACCESSOR.GetOnOrderWei(it.xPlayer,idTrade);
     ZTIMES.GUI.editInnerText('iHolderOnOrderWei',balance);
   }
 },
 refreshHolderOnOrder20: async function(it){
   if(it === undefined){it = this;}
   const idTrade = await it.toIdTrade("ERC20");
   if(idTrade === undefined){
     ZTIMES.GUI.editInnerText('iHolderOnOrder20','-');
   }
   else{
     const balance = await ZTIMES.CONTRACT_ACCESSOR.GetOnOrder20(it.xPlayer,idTrade);
     ZTIMES.GUI.editInnerText('iHolderOnOrder20',balance);
   }
 },
 refreshHolderOnOrder721C: async function(it){
   if(it === undefined){it = this;}
   const idTrade = await it.toIdTrade("ERC721C");
   if(idTrade === undefined){
     ZTIMES.GUI.editInnerText('iHolderOnOrder721C','-');
   }
   else{
     const balance = await ZTIMES.CONTRACT_ACCESSOR.GetOnOrder721(it.xPlayer,idTrade);
     ZTIMES.GUI.editInnerText('iHolderOnOrder721C',balance);
   }
 },
 refreshHolderOnOrder721D: async function(it){
   if(it === undefined){it = this;}
   const idTrade = await it.toIdTrade("ERC721D");
   if(idTrade === undefined){
     ZTIMES.GUI.editInnerText('iHolderOnOrder721D','-');
   }
   else{
     const balance = await ZTIMES.CONTRACT_ACCESSOR.GetOnOrder721(it.xPlayer,idTrade);
     ZTIMES.GUI.editInnerText('iHolderOnOrder721D',balance);
   }
 },
 refreshHolderOnOrder1155E: async function(it){
   if(it === undefined){it = this;}
   const idTrade = await it.toIdTrade("ERC1155E");
   if(idTrade === undefined){
     ZTIMES.GUI.editInnerText('iHolderOnOrder1155E','-');
   }
   else{
     const balance = await ZTIMES.CONTRACT_ACCESSOR.GetOnOrder1155(it.xPlayer,idTrade);
     ZTIMES.GUI.editInnerText('iHolderOnOrder1155E',balance);
   }
 },
 refreshHolderOnOrder1155F: async function(it){
   if(it === undefined){it = this;}
   const idTrade = await it.toIdTrade("ERC1155F");
   if(idTrade === undefined){
     ZTIMES.GUI.editInnerText('iHolderOnOrder1155F','-');
   }
   else{
     const balance = await ZTIMES.CONTRACT_ACCESSOR.GetOnOrder1155(it.xPlayer,idTrade);
     ZTIMES.GUI.editInnerText('iHolderOnOrder1155F',balance);
   }
 },

 SetSellerKind: async function(strKind){
   this.zSellerKind = strKind;
   this.zSellerIdTrade = await this.toIdTrade(strKind);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
 },
 SetBuyerKind: async function(strKind){
   this.zBuyerKind = strKind;
   this.zBuyerIdTrade = await this.toIdTrade(strKind);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
 },

 toIdTrade: async function(strKind){
   let idTrade;
   if(strKind === "Wei"){
     idTrade = await this.calcIdTrade(1,ZTIMES.GUI.DAPP.TokenId_WEI);
   }
   else if(strKind === "ERC20"){
     idTrade = await this.calcIdTrade(20,ZTIMES.GUI.DAPP.TokenId_ERC20);
   }
   else if(strKind === "ERC721C"){
     idTrade = await this.calcIdTrade(721,ZTIMES.GUI.DAPP.TokenId_ERC721C);
   }
   else if(strKind === "ERC721D"){
     idTrade = await this.calcIdTrade(721,ZTIMES.GUI.DAPP.TokenId_ERC721D);
   }
   else if(strKind === "ERC1155E"){
     idTrade = await this.calcIdTrade(1155,ZTIMES.GUI.DAPP.TokenId_ERC1155E);
   }
   else if(strKind === "ERC1155F"){
     idTrade = await this.calcIdTrade(1155,ZTIMES.GUI.DAPP.TokenId_ERC1155F);
   }
   else{
     console.log("[ERR]Invalid strKind.");
   }
   return idTrade;
 },
 calcIdTrade: async function(kindHolder,tokenId){
   const xToken = await this.toXToken(kindHolder);
   const idTrade = await ZTIMES.CONTRACT_ACCESSOR.CalcIdTrade(kindHolder,xToken,tokenId);
   return idTrade;
 },
 toXToken: async function(kindHolder){
   if(kindHolder === 1){
     return await ZTIMES.BLOCKCHAIN.ContractAddress('HolderWei');
   }
   else if(kindHolder === 20){
     return await ZTIMES.BLOCKCHAIN.ContractAddress('YourErc20');
   }
   else if(kindHolder === 721){
     return await ZTIMES.BLOCKCHAIN.ContractAddress('YourErc721');
   }
   else if(kindHolder === 1155){
     return await ZTIMES.BLOCKCHAIN.ContractAddress('YourErc1155');
   }
 },
 getIdTrade: async function(xAddressSelf){
   const index = await ZTIMES.CONTRACT_ACCESSOR.GetIndexLastInIdTradeList(xAddressSelf);
   const idTrade = await ZTIMES.CONTRACT_ACCESSOR.GetIdTrade(xAddressSelf,index);
   return idTrade;
 },
 getTradeInfo: async function(idTrade){
   const tradeInfo = await ZTIMES.CONTRACT_ACCESSOR.GetTradeInfo(idTrade);
   return tradeInfo;    // kindHolder,xToken,tokenId
 },

 DepositWei: async function(wei){
   await ZTIMES.CONTRACT_ACCESSOR.SendToHolderWei(this.xPlayer,wei);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDepositWei,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalanceWei,1000,this);
 },
 WithdrawWei: async function(){
   const idTrade = await this.toIdTrade("Wei");
   await ZTIMES.CONTRACT_ACCESSOR.SendFromHolderWei(this.xPlayer,idTrade);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalanceWei,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDepositWei,1000,this);
 },
 AddSellOrderWei: async function(amount){
   if(this.zSellerKind !== "Wei"){alert("Select Wei of Order Seller.");return;}
   if(this.zBuyerKind === ""){alert("Select any Order Buyer.");return;}
   await ZTIMES.CONTRACT_ACCESSOR.AddOrderSell(this.xPlayer,this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrderWei,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDepositWei,1000,this);
 },
 AddBuyOrderWei: async function(amount){
   if(this.zSellerKind === ""){alert("Select any Order Seller.");return;}
   if(this.zBuyerKind !== "Wei"){alert("Select Wei of Order Buyer.");return;}
   await ZTIMES.CONTRACT_ACCESSOR.AddOrderBuy(this.xPlayer,this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrderWei,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDepositWei,1000,this);
 },

 DepositERC20: async function(amount){
   await ZTIMES.CONTRACT_ACCESSOR.SendToHolder20(this.xPlayer,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit20,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance20,1000,this);
 },
 WithdrawERC20: async function(amount){
   const idTrade = await this.toIdTrade("ERC20");
   await ZTIMES.CONTRACT_ACCESSOR.SendFromHolder20(this.xPlayer,idTrade,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance20,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit20,1000,this);
 },
 AddSellOrder20: async function(amount){
   if(this.zSellerKind !== "ERC20"){alert("Select ERC20 of Order Seller.");return;}
   if(this.zBuyerKind === ""){alert("Select any Order Buyer.");return;}
   await ZTIMES.CONTRACT_ACCESSOR.AddOrderSell(this.xPlayer,this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder20,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit20,1000,this);
 },
 AddBuyOrder20: async function(amount){
   if(this.zSellerKind === ""){alert("Select any Order Seller.");return;}
   if(this.zBuyerKind !== "ERC20"){alert("Select ERC20 of Order Buyer.");return;}
   await ZTIMES.CONTRACT_ACCESSOR.AddOrderBuy(this.xPlayer,this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder20,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit20,1000,this);
 },

 DepositERC721C: async function(){
   const tokenId = ZTIMES.GUI.DAPP.TokenId_ERC721C;
   await ZTIMES.CONTRACT_ACCESSOR.SendToHolder721(this.xPlayer,tokenId);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit721C,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance721C,1000,this);
 },
 WithdrawERC721C: async function(){
   const idTrade = await this.toIdTrade("ERC721C");
   await ZTIMES.CONTRACT_ACCESSOR.SendFromHolder721(this.xPlayer,idTrade);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance721C,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit721C,1000,this);
 },
 DepositERC721D: async function(){
   const tokenId = ZTIMES.GUI.DAPP.TokenId_ERC721D;
   await ZTIMES.CONTRACT_ACCESSOR.SendToHolder721(this.xPlayer,tokenId);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit721D,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance721D,1000,this);
 },
 WithdrawERC721D: async function(){
   const idTrade = await this.toIdTrade("ERC721D");
   await ZTIMES.CONTRACT_ACCESSOR.SendFromHolder721(this.xPlayer,idTrade);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance721D,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit721D,1000,this);
 },
 AddSellOrder721C: async function(){
   if(this.zSellerKind !== "ERC721C"){alert("Select ERC721C of Order Seller.");return;}
   if(this.zBuyerKind === ""){alert("Select any Order Buyer.");return;}
   const amount = 1;
   await ZTIMES.CONTRACT_ACCESSOR.AddOrderSell(this.xPlayer,this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder721C,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit721C,1000,this);
 },
 AddBuyOrder721C: async function(){
   if(this.zSellerKind === ""){alert("Select any Order Seller.");return;}
   if(this.zBuyerKind !== "ERC721C"){alert("Select ERC721C of Order Buyer.");return;}
   const amount = 1;
   await ZTIMES.CONTRACT_ACCESSOR.AddOrderBuy(this.xPlayer,this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder721C,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit721C,1000,this);
 },
 AddSellOrder721D: async function(){
   if(this.zSellerKind !== "ERC721D"){alert("Select ERC721D of Order Seller.");return;}
   if(this.zBuyerKind === ""){alert("Select any Order Buyer.");return;}
   const amount = 1;
   await ZTIMES.CONTRACT_ACCESSOR.AddOrderSell(this.xPlayer,this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder721D,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit721D,1000,this);
 },
 AddBuyOrder721D: async function(){
   if(this.zSellerKind === ""){alert("Select any Order Seller.");return;}
   if(this.zBuyerKind !== "ERC721D"){alert("Select ERC721D of Order Buyer.");return;}
   const amount = 1;
   await ZTIMES.CONTRACT_ACCESSOR.AddOrderBuy(this.xPlayer,this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder721D,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit721D,1000,this);
 },

 DepositERC1155E: async function(amount){
   const tokenId = ZTIMES.GUI.DAPP.TokenId_ERC1155E;
   await ZTIMES.CONTRACT_ACCESSOR.SendToHolder1155(this.xPlayer,tokenId,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit1155E,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance1155E,1000,this);
 },
 WithdrawERC1155E: async function(amount){
   const idTrade = await this.toIdTrade("ERC1155E");
   await ZTIMES.CONTRACT_ACCESSOR.SendFromHolder1155(this.xPlayer,idTrade,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance1155E,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit1155E,1000,this);
 },
 DepositERC1155F: async function(amount){
   const tokenId = ZTIMES.GUI.DAPP.TokenId_ERC1155F;
   await ZTIMES.CONTRACT_ACCESSOR.SendToHolder1155(this.xPlayer,tokenId,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit1155F,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance1155F,1000,this);
 },
 WithdrawERC1155F: async function(amount){
   const idTrade = await this.toIdTrade("ERC1155F");
   await ZTIMES.CONTRACT_ACCESSOR.SendFromHolder1155(this.xPlayer,idTrade,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshBalance1155F,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit1155F,1000,this);
 },
 AddSellOrder1155E: async function(amount){
   if(this.zSellerKind !== "ERC1155E"){alert("Select ERC1155E of Order Seller.");return;}
   if(this.zBuyerKind === ""){alert("Select any Order Buyer.");return;}
   await ZTIMES.CONTRACT_ACCESSOR.AddOrderSell(this.xPlayer,this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder1155E,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit1155E,1000,this);
 },
 AddBuyOrder1155E: async function(amount){
   if(this.zSellerKind === ""){alert("Select any Order Seller.");return;}
   if(this.zBuyerKind !== "ERC1155E"){alert("Select ERC1155E of Order Buyer.");return;}
   await ZTIMES.CONTRACT_ACCESSOR.AddOrderBuy(this.xPlayer,this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder1155E,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit1155E,1000,this);
 },
 AddSellOrder1155F: async function(amount){
   if(this.zSellerKind !== "ERC1155F"){alert("Select ERC1155F of Order Seller.");return;}
   if(this.zBuyerKind === ""){alert("Select any Order Buyer.");return;}
   await ZTIMES.CONTRACT_ACCESSOR.AddOrderSell(this.xPlayer,this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder1155F,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit1155F,1000,this);
 },
 AddBuyOrder1155F: async function(amount){
   if(this.zSellerKind === ""){alert("Select any Order Seller.");return;}
   if(this.zBuyerKind !== "ERC1155F"){alert("Select ERC1155F of Order Buyer.");return;}
   await ZTIMES.CONTRACT_ACCESSOR.AddOrderBuy(this.xPlayer,this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,amount);
   setTimeout(ZTIMES.GUI.DAPP.refreshOrderList,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder1155F,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit1155F,1000,this);
 },

 ShowMarket: async function(){
   this.refreshOrderList(this);
 },
 MatchOrders: async function(orderKindSelf,indexShow){
   if(this.xPlayer === 0){
     alert("Select a player.");
     return;
   }
   const retOrderList = await ZTIMES.CONTRACT_ACCESSOR.GetOrderInfo(this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,orderKindSelf);
   const indexStart = Number(retOrderList.indexStart);  //1 origin
   const listLen = Number(retOrderList.indexAt);
   const indexOrderSelf = indexStart+indexShow;
   const retOrder = await ZTIMES.CONTRACT_ACCESSOR.GetOrder(this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,orderKindSelf,indexOrderSelf);
   const amountReqSelf = Number(retOrder.amount);
   await ZTIMES.CONTRACT_ACCESSOR.MatchOrders(this.xPlayer,this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,orderKindSelf,indexOrderSelf,amountReqSelf);
   this.refreshOrderList(this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDepositWei,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrderWei,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit20,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder20,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit721C,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder721C,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit721D,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder721D,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit1155E,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder1155E,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderDeposit1155F,1000,this);
   setTimeout(ZTIMES.GUI.DAPP.refreshHolderOnOrder1155F,1000,this);
 },
 refreshOrderList: async function(it){
   if(it === undefined){it = this;}
   it.showOrderList(ZTIMES.GUI.DAPP.ORDER_KIND_SELL);
   it.showOrderList(ZTIMES.GUI.DAPP.ORDER_KIND_BUY);
 },
 showOrderList: async function(orderKind){
   const retOrderList = await ZTIMES.CONTRACT_ACCESSOR.GetOrderInfo(this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,orderKind);
   const indexStart = Number(retOrderList.indexStart);
   const listLen = Number(retOrderList.indexAt);
   if(indexStart === 0){
     for(let indexShow=Number(0); indexShow<Number(4); indexShow+=Number(1)){
       this.showOrderBlank(orderKind,indexShow);
     }
   }
   else{
     let indexOrder=Number(indexStart);
     for(let indexShow=Number(0); indexShow<Number(4); indexShow+=Number(1)){
       if(indexOrder<listLen){
         this.showOrder(orderKind,indexOrder,indexShow);
       }
       else{
         this.showOrderBlank(orderKind,indexShow);
       }
       indexOrder+=Number(1);
     }
   }
 },
 showOrder: async function(orderKind,indexOrder,indexShow){
   const retOrder = await ZTIMES.CONTRACT_ACCESSOR.GetOrder(this.zSellerIdTrade,this.zBuyerIdTrade,this.rate,orderKind,indexOrder);
   if((retOrder === undefined)||(retOrder.isValid === false)){
     this.showOrderBlank(orderKind,indexShow);
   }
   else{
     const xOwner = retOrder.xOwner;
     const amount = Number(retOrder.amount);
     const zPlayer = this.fromAddressToName(xOwner);
     const domId = this.getOrderDomId(orderKind,indexShow);
     const text = this.getOrderText(zPlayer,amount);
     ZTIMES.GUI.editInnerText(domId,text);
   }
 },
 showOrderBlank: async function(orderKind,indexShow){
   const domId = this.getOrderDomId(orderKind,indexShow);
   ZTIMES.GUI.editInnerText(domId,"");
 },
 fromAddressToName: function(xPlayer){
   const xPlayerP = ZTIMES.GUI.refValueText('iAddressP');
   if(xPlayer === xPlayerP){
     return "PlayerP";
   }
   const xPlayerQ = ZTIMES.GUI.refValueText('iAddressQ');
   if(xPlayer === xPlayerQ){
     return "PlayerQ";
   }
 },
 getOrderText: function(zPlayer,amount){
   const text = "[" + amount + " : " + zPlayer + "]";
   return text;
 },
 getOrderDomId: function(orderKind,indexShow){
   if(orderKind === ZTIMES.GUI.DAPP.ORDER_KIND_SELL){
     return "iSellList" + indexShow;
   }
   if(orderKind === ZTIMES.GUI.DAPP.ORDER_KIND_BUY){
     return "iBuyList" + indexShow;
   }
 },
};

ZTIMES.RUN = {
  init: function(){
    ZTIMES.ACCOUNTS.init();
    ZTIMES.BLOCKCHAIN.init();
    ZTIMES.CONTRACT_ACCESSOR.init();
    ZTIMES.GUI.init();
    ZTIMES.GUI.editInnerText('iWalletInfo',"Not ready.");
  },
  test: async function(){
    ZTIMES.ACCOUNTS.test();
    ZTIMES.BLOCKCHAIN.test();
    ZTIMES.CONTRACT_ACCESSOR.test();
    ZTIMES.GUI.test();
  },
};
window.addEventListener('load',async function(){
  ZTIMES.RUN.init();
  ZTIMES.RUN.test();
});

// ethereum.on('accountsChanged',function(accounts){
//   console.log("changed : " + accounts);
// });
