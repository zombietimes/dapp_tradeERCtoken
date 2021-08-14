====
web3.eth.getAccounts().then(ret=>accounts=ret)

----
YourErc20.deployed().then(ret=>instanceE20=ret)
YourErc721.deployed().then(ret=>instanceE721=ret)
YourErc1155.deployed().then(ret=>instanceE1155=ret)
Holders.deployed().then(ret=>instanceHoloders=ret)
HolderWei.deployed().then(ret=>instanceHoloderWei=ret)
Holder20.deployed().then(ret=>instanceHoloder20=ret)
Holder721.deployed().then(ret=>instanceHoloder721=ret)
Holder1155.deployed().then(ret=>instanceHoloder1155=ret)
Trade.deployed().then(ret=>instanceTrade=ret)

-- Wei --
instanceHoloderWei.Wei_SendToHolder({from:accounts[1],value:100}).then(ret=>result=ret)
instanceHoloderWei.Wei_SendToHolder({from:accounts[2],value:100}).then(ret=>result=ret)
instanceHoloders.ShowIdTradeListLen(accounts[1]).then(ret=>result=ret)
indexP = result.logs[0].args.target
instanceHoloders.ShowIdTradeListLen(accounts[2]).then(ret=>result=ret)
indexQ = result.logs[0].args.target
instanceHoloders.ShowIdTradeList(accounts[1],indexP).then(ret=>result=ret)
idTradeP = result.logs[2].args.target
instanceHoloders.ShowIdTradeList(accounts[2],indexQ).then(ret=>result=ret)
idTradeQ = result.logs[2].args.target
instanceHoloders.ShowIdTradeInfo(idTradeP).then(ret=>result=ret)
instanceHoloders.ShowIdTradeInfo(idTradeQ).then(ret=>result=ret)
result.logs
//idTradeP equals to idTradeQ

web3.eth.getBalance(accounts[1])
web3.eth.getBalance(accounts[2])
web3.eth.getBalance(HolderWei.address)
(await instanceHoloderWei.Wei_GetBalance(accounts[1],idTradeP)).toNumber()
(await instanceHoloderWei.Wei_GetBalance(accounts[2],idTradeQ)).toNumber()

instanceHoloderWei.Wei_SendFromHolder(idTradeP,{from:accounts[1]}).then(ret=>result=ret)
instanceHoloderWei.Wei_SendFromHolder(idTradeQ,{from:accounts[2]}).then(ret=>result=ret)

(await instanceHoloderWei.ShowBalance(accounts[1],0,idTradeP)).toNumber()	80
(await instanceHoloderWei.ShowBalance(accounts[1],1,idTradeP)).toNumber()	20
(await instanceHoloderWei.ShowBalance(accounts[1],0,idTradeQ)).toNumber()
(await instanceHoloderWei.ShowBalance(accounts[1],1,idTradeQ)).toNumber()

(await instanceHoloderWei.ShowBalance(accounts[2],0,idTradeP)).toNumber()
(await instanceHoloderWei.ShowBalance(accounts[2],1,idTradeP)).toNumber()
(await instanceHoloderWei.ShowBalance(accounts[2],0,idTradeQ)).toNumber()	70
(await instanceHoloderWei.ShowBalance(accounts[2],1,idTradeQ)).toNumber()	30

idTradeX = idTradeP
idTradeY = idTradeQ

-- ERC20 --
instanceE20.Erc20_Create(100,{from:accounts[1]}).then(ret=>result=ret)
instanceE20.Erc20_Create(100,{from:accounts[2]}).then(ret=>result=ret)

instanceE20.Erc20_SendToHolder(Holder20.address,100,{from:accounts[1]}).then(ret=>result=ret)
instanceE20.Erc20_SendToHolder(Holder20.address,100,{from:accounts[2]}).then(ret=>result=ret)
instanceHoloders.ShowIdTradeListLen(accounts[1]).then(ret=>result=ret)
indexG = result.logs[0].args.target
instanceHoloders.ShowIdTradeListLen(accounts[2]).then(ret=>result=ret)
indexH = result.logs[0].args.target
instanceHoloders.ShowIdTradeList(accounts[1],indexG).then(ret=>result=ret)
idTradeG = result.logs[2].args.target
instanceHoloders.ShowIdTradeList(accounts[2],indexH).then(ret=>result=ret)
idTradeH = result.logs[2].args.target
instanceHoloders.ShowIdTradeInfo(idTradeG).then(ret=>result=ret)
instanceHoloders.ShowIdTradeInfo(idTradeH).then(ret=>result=ret)
result.logs
//idTradeG equals to idTradeH

(await instanceE20.Erc20_GetBalance(accounts[1])).toNumber()
(await instanceE20.Erc20_GetBalance(accounts[2])).toNumber()
(await instanceE20.Erc20_GetBalance(Holder20.address)).toNumber()

instanceHoloders.Withdraw(idTradeG,10,{from:accounts[1]}).then(ret=>result=ret)
instanceHoloders.Withdraw(idTradeH,10,{from:accounts[2]}).then(ret=>result=ret)

(await instanceHoloder20.ShowBalance(accounts[1],0,idTradeG)).toNumber()	70
(await instanceHoloder20.ShowBalance(accounts[1],1,idTradeG)).toNumber()	20
(await instanceHoloder20.ShowBalance(accounts[2],0,idTradeH)).toNumber()	60
(await instanceHoloder20.ShowBalance(accounts[2],1,idTradeH)).toNumber()	30

idTradeX = idTradeG
idTradeY = idTradeH

-- ERC721 --
tokenIdS = 10
instanceE721.Erc721_Create(tokenIdS,{from:accounts[1]}).then(ret=>result=ret)
tokenIdT = 20
instanceE721.Erc721_Create(tokenIdT,{from:accounts[2]}).then(ret=>result=ret)

instanceE721.Erc721_SendToHolder(Holder721.address,tokenIdS,{from:accounts[1]}).then(ret=>result=ret)
instanceE721.Erc721_SendToHolder(Holder721.address,tokenIdT,{from:accounts[2]}).then(ret=>result=ret)
instanceHoloders.ShowIdTradeListLen(accounts[1]).then(ret=>result=ret)
indexS = result.logs[0].args.target
instanceHoloders.ShowIdTradeListLen(accounts[2]).then(ret=>result=ret)
indexT = result.logs[0].args.target
instanceHoloders.ShowIdTradeList(accounts[1],indexS).then(ret=>result=ret)
idTradeS = result.logs[2].args.target
instanceHoloders.ShowIdTradeList(accounts[2],indexT).then(ret=>result=ret)
idTradeT = result.logs[2].args.target
instanceHoloders.ShowIdTradeInfo(idTradeS).then(ret=>result=ret)
instanceHoloders.ShowIdTradeInfo(idTradeT).then(ret=>result=ret)
result.logs

(await instanceE721.Erc721_IsOwner(accounts[1],tokenIdS))
(await instanceE721.Erc721_IsOwner(accounts[2],tokenIdS))
(await instanceE721.Erc721_IsOwner(Holder721.address,tokenIdS))

(await instanceE721.Erc721_IsOwner(accounts[1],tokenIdT))
(await instanceE721.Erc721_IsOwner(accounts[2],tokenIdT))
(await instanceE721.Erc721_IsOwner(Holder721.address,tokenIdT))

instanceHoloders.Withdraw(idTradeS,1,{from:accounts[1]}).then(ret=>result=ret)
instanceHoloders.Withdraw(idTradeT,1,{from:accounts[2]}).then(ret=>result=ret)

(await instanceHoloder721.ShowBalance(accounts[1],0,idTradeS)).toNumber()	1
(await instanceHoloder721.ShowBalance(accounts[1],1,idTradeS)).toNumber()
(await instanceHoloder721.ShowBalance(accounts[1],0,idTradeT)).toNumber()
(await instanceHoloder721.ShowBalance(accounts[1],1,idTradeT)).toNumber()

(await instanceHoloder721.ShowBalance(accounts[2],0,idTradeS)).toNumber()
(await instanceHoloder721.ShowBalance(accounts[2],1,idTradeS)).toNumber()
(await instanceHoloder721.ShowBalance(accounts[2],0,idTradeT)).toNumber()	1
(await instanceHoloder721.ShowBalance(accounts[2],1,idTradeT)).toNumber()

idTradeX = idTradeS
idTradeY = idTradeT
rate = 1

-- ERC1155 --
tokenIdA = 11
instanceE1155.Erc1155_Create(tokenIdA,100,{from:accounts[1]}).then(ret=>result=ret)
tokenIdB = 22
instanceE1155.Erc1155_Create(tokenIdB,100,{from:accounts[2]}).then(ret=>result=ret)

instanceE1155.Erc1155_SendToHolder(Holder1155.address,tokenIdA,100,{from:accounts[1]}).then(ret=>result=ret)
instanceE1155.Erc1155_SendToHolder(Holder1155.address,tokenIdB,100,{from:accounts[2]}).then(ret=>result=ret)
instanceHoloders.ShowIdTradeListLen(accounts[1]).then(ret=>result=ret)
indexA = result.logs[0].args.target
instanceHoloders.ShowIdTradeListLen(accounts[2]).then(ret=>result=ret)
indexB = result.logs[0].args.target
instanceHoloders.ShowIdTradeList(accounts[1],indexA).then(ret=>result=ret)
idTradeA = result.logs[2].args.target
instanceHoloders.ShowIdTradeList(accounts[2],indexB).then(ret=>result=ret)
idTradeB = result.logs[2].args.target
instanceHoloders.ShowIdTradeInfo(idTradeA).then(ret=>result=ret)
instanceHoloders.ShowIdTradeInfo(idTradeB).then(ret=>result=ret)
result.logs

(await instanceE1155.Erc1155_GetBalance(accounts[1],tokenIdA)).toNumber()
(await instanceE1155.Erc1155_GetBalance(accounts[2],tokenIdA)).toNumber()
(await instanceE1155.Erc1155_GetBalance(Holder1155.address,tokenIdA)).toNumber()

(await instanceE1155.Erc1155_GetBalance(accounts[1],tokenIdB)).toNumber()
(await instanceE1155.Erc1155_GetBalance(accounts[2],tokenIdB)).toNumber()
(await instanceE1155.Erc1155_GetBalance(Holder1155.address,tokenIdB)).toNumber()

instanceHoloders.Withdraw(idTradeA,10,{from:accounts[1]}).then(ret=>result=ret)
instanceHoloders.Withdraw(idTradeB,10,{from:accounts[2]}).then(ret=>result=ret)

(await instanceHoloder1155.ShowBalance(accounts[1],0,idTradeA)).toNumber()	70
(await instanceHoloder1155.ShowBalance(accounts[1],1,idTradeA)).toNumber()	20
(await instanceHoloder1155.ShowBalance(accounts[1],0,idTradeB)).toNumber()
(await instanceHoloder1155.ShowBalance(accounts[1],1,idTradeB)).toNumber()

(await instanceHoloder1155.ShowBalance(accounts[2],0,idTradeA)).toNumber()
(await instanceHoloder1155.ShowBalance(accounts[2],1,idTradeA)).toNumber()
(await instanceHoloder1155.ShowBalance(accounts[2],0,idTradeB)).toNumber()	60
(await instanceHoloder1155.ShowBalance(accounts[2],1,idTradeB)).toNumber()	30

idTradeX = idTradeA
idTradeY = idTradeB

-- Trade --
rate = 2
SELL = 0
BUY = 1

instanceHoloders.AddOrderSell(idTradeX,idTradeY,rate,10,{from:accounts[1]}).then(ret=>result=ret)
instanceHoloders.AddOrderSell(idTradeX,idTradeY,rate,10,{from:accounts[1]}).then(ret=>result=ret)
instanceHoloders.AddOrderBuy(idTradeX,idTradeY,rate,5,{from:accounts[2]}).then(ret=>result=ret)
instanceHoloders.AddOrderBuy(idTradeX,idTradeY,rate,5,{from:accounts[2]}).then(ret=>result=ret)
instanceHoloders.AddOrderBuy(idTradeX,idTradeY,rate,5,{from:accounts[2]}).then(ret=>result=ret)

result.logs
instanceTrade.GetOrderInfo(idTradeX,idTradeY,rate,SELL).then(ret=>result=ret)
instanceTrade.GetOrderInfo(idTradeX,idTradeY,rate,BUY).then(ret=>result=ret)
//index is 1 origin
instanceTrade.GetOrder(idTradeX,idTradeY,rate,SELL,1).then(ret=>result=ret)
instanceTrade.GetOrder(idTradeX,idTradeY,rate,SELL,2).then(ret=>result=ret)
instanceTrade.GetOrder(idTradeX,idTradeY,rate,BUY,1).then(ret=>result=ret)
instanceTrade.GetOrder(idTradeX,idTradeY,rate,BUY,2).then(ret=>result=ret)
instanceTrade.GetOrder(idTradeX,idTradeY,rate,BUY,3).then(ret=>result=ret)

instanceTrade.CancelOrder(idTradeX,idTradeY,rate,SELL,2,{from:accounts[1]}).then(ret=>result=ret)
instanceTrade.CancelOrder(idTradeX,idTradeY,rate,BUY,3,{from:accounts[2]}).then(ret=>result=ret)

instanceTrade.MatchOrders(idTradeX,idTradeY,rate,SELL,1,10).then(ret=>result=ret)
instanceTrade.MatchOrders(idTradeX,idTradeY,rate,SELL,2,10).then(ret=>result=ret)
instanceTrade.MatchOrders(idTradeX,idTradeY,rate,BUY,1,5).then(ret=>result=ret)
instanceTrade.MatchOrders(idTradeX,idTradeY,rate,BUY,2,5).then(ret=>result=ret)
instanceTrade.MatchOrders(idTradeX,idTradeY,rate,BUY,3,5).then(ret=>result=ret)

----
instanceHoloders.AddOrderSell(idTradeX,idTradeY,rate,1,{from:accounts[1]}).then(ret=>result=ret)
instanceHoloders.AddOrderBuy(idTradeX,idTradeY,rate,1,{from:accounts[2]}).then(ret=>result=ret)
instanceTrade.MatchOrders(idTradeX,idTradeY,rate,SELL,1,1).then(ret=>result=ret)




====
