# [dapp_tradeERCtoken](https://github.com/zombietimes/dapp_tradeERCtoken)
This is a sample application of DApps.  

## Overview
[dapp_tradeERCtoken](https://github.com/zombietimes/dapp_tradeERCtoken) allows trading Wei and ERC20-tokens and ERC721-tokens and ERC1155-tokens on the blockchain.  
This is based ERC20 and ERC721 and ERC1155 in [openzeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts).  

## Description
Let's run and analyze the sample DApps.  
You can understand deeply by editing the sample code.  
I think that it is worth learning the smart contract development.  
I focus on Ethereum and Loom Network as the DApps.  
- [Truffle : Official](https://truffleframework.com/)  
- [Ganache : Official](https://truffleframework.com/docs/ganache/overview)  
- [Loom Network SDK : Official](https://loomx.io/developers/)  

### Setting up the development environment.
The script file [setup0000_all](https://github.com/zombietimes/setup0000_all) is useful to set up the development environment.  
It consists of the external script files below.  
- [setup0000_all](https://github.com/zombietimes/setup0000_all)  
  
This script file is for Ubuntu(Linux).  
I recommend that you use VirtualBox + Ubuntu.  
  
## Usage
### Ganache
[dapp_tradeERCtoken](https://github.com/zombietimes/dapp_tradeERCtoken) requires Ganache.  
Run ganache-xxxx.AppImage.  
![dapp_tradeERCtoken_0000](https://user-images.githubusercontent.com/50263232/129438918-13c4a86f-c931-4abb-872a-dc458d61d5d7.png)  
  
![dapp_tradeERCtoken_0001](https://user-images.githubusercontent.com/50263232/129438938-dbcb2b9b-ab0b-4ea8-8f2a-c40280d43749.png)  
  
### Truffle
[dapp_tradeERCtoken](https://github.com/zombietimes/dapp_tradeERCtoken) requires Truffle.  
Run the command on Ubuntu console window.  
```sh
# Ubuntu commands.
cd ~/dapps/deploy/by_truffle
truffle compile --all
truffle migrate --reset --network ganache
```
![dapp_tradeERCtoken_0002](https://user-images.githubusercontent.com/50263232/129438964-d1ae9129-fff9-4b52-89cb-e64720615007.png)  
![dapp_tradeERCtoken_0003](https://user-images.githubusercontent.com/50263232/129438980-dcff2aeb-aa45-42ce-9a01-246e558235ef.png)  
  
### ABI json for index.html
index.html in [dapp_tradeERCtoken](https://github.com/zombietimes/dapp_tradeERCtoken) requires ABI json files.  
Run the command on Ubuntu console window.  
```sh
# Ubuntu commands.
cd ~/dapps/web/by_local/js
node ./toAbiJson_node.js
```
![dapp_tradeERCtoken_0004](https://user-images.githubusercontent.com/50263232/129438996-a5185f24-0f47-4d60-beae-94caf5c7c246.png)  
  
### Local webserver
[dapp_tradeERCtoken](https://github.com/zombietimes/dapp_tradeERCtoken) requires a local webserver.  
Google local server is very convenient.  
Goto http://127.0.0.1:8887/  
![dapp_tradeERCtoken_0005](https://user-images.githubusercontent.com/50263232/129439023-77bb154c-9301-4a67-b4ac-b7efb6ab3d61.png)  
  
![dapp_tradeERCtoken_0006](https://user-images.githubusercontent.com/50263232/129439034-8b0eec89-74f6-486c-a94a-ea852dbb1abe.png)  
  
### Preparation
[dapp_tradeERCtoken](https://github.com/zombietimes/dapp_tradeERCtoken) generates two accounts via web3.js and 
allows sending Ether from a Ganache account.  
It is useful for development.  
  
At first, press the Ready button.  
![dapp_tradeERCtoken_0007](https://user-images.githubusercontent.com/50263232/129439046-f198a9d2-9b1c-4b1e-96e0-25c7f90b714a.png)  
  
And then, import a Ganache account to the client.  
Copy and paste the address and private key of the Ganache account, press the Import button.  
![dapp_tradeERCtoken_0008](https://user-images.githubusercontent.com/50263232/129439056-7fac1088-9aeb-47cb-8b1b-d4ee2adc58a4.png)  
  
![dapp_tradeERCtoken_0009](https://user-images.githubusercontent.com/50263232/129439065-e71e06f4-c772-47f2-8fe3-8a814bb62491.png)  
  
Press the Send button.  
The balance of PlayerP and PlayerQ is updated.  
![dapp_tradeERCtoken_0010](https://user-images.githubusercontent.com/50263232/129439081-455d23b6-fa05-4691-84e7-3067c4cc5b5d.png)  
  
### If you want to reset and start at first,
At first, clear Local Storage in Google Chrome.  
![dapp_tradeERCtoken_0011](https://user-images.githubusercontent.com/50263232/129439094-26c224f7-b3e6-4f91-a39a-29d72fb1568e.png)  
  
![dapp_tradeERCtoken_0012](https://user-images.githubusercontent.com/50263232/129439105-d729199c-5ffb-4af2-95bb-8b1e7d211e53.png)  
  
And then, retry the above steps.  
  
### Wei and ERC20-tokens and ERC721-tokens and ERC1155-tokens
For example, let's trade between ERC20 of PlayerP and ERC1155-ItemF of PlayerQ.  
  
At first, select PlayerP.  
![dapp_tradeERCtoken_0013](https://user-images.githubusercontent.com/50263232/129439120-7af6fc1d-e799-45c5-aa7b-acf376af6ca4.png)  
  
Press the Create Initial assets button.  
![dapp_tradeERCtoken_0014](https://user-images.githubusercontent.com/50263232/129439130-46fa95ff-c7c2-4417-911f-4c3d5175132c.png)  
  
Assets of PlayerP.  
![dapp_tradeERCtoken_0015](https://user-images.githubusercontent.com/50263232/129439143-d81897b0-e60c-4182-8ece-84e0957c9e62.png)  
  
Assets of PlayerQ.  
![dapp_tradeERCtoken_0016](https://user-images.githubusercontent.com/50263232/129439154-b447af9f-5606-4b61-9136-9825b6351933.png)  
  
And then, select PlayerP and Deposit 100 ERC20 to the Holder contract.  
![dapp_tradeERCtoken_0017](https://user-images.githubusercontent.com/50263232/129439161-8411d138-240a-496a-bbab-1e22ca3ba65f.png)  
  
![dapp_tradeERCtoken_0018](https://user-images.githubusercontent.com/50263232/129439167-fd6a5416-37d2-4c57-8bf6-1f04cf7572e9.png)  
  
![dapp_tradeERCtoken_0019](https://user-images.githubusercontent.com/50263232/129439178-9d8180d2-1fce-4c41-9b09-27120e4cf88f.png)  
  
And then, select PlayerQ and Deposit 100 ERC1155-ItemF to the Holder contract.  
![dapp_tradeERCtoken_0020](https://user-images.githubusercontent.com/50263232/129439185-ca81d57c-a309-45b2-b501-5dc1d684d039.png)  
  
![dapp_tradeERCtoken_0021](https://user-images.githubusercontent.com/50263232/129439195-2d10e905-87a5-44f3-8041-ea232bffbaad.png)  
  
![dapp_tradeERCtoken_0022](https://user-images.githubusercontent.com/50263232/129439200-50504c35-a460-4f55-a21c-db4ab7b6b21a.png)  
  
Select trade order pairs.  
![dapp_tradeERCtoken_0023](https://user-images.githubusercontent.com/50263232/129439209-bd7ff69a-5f72-4d3a-ac94-78c0fe9e8604.png)  
  
And then, select PlayerP and issue a Sell order of 10 ERC20.  
![dapp_tradeERCtoken_0024](https://user-images.githubusercontent.com/50263232/129439216-5fd23452-e698-4664-b58d-4a14b700aa03.png)  
  
![dapp_tradeERCtoken_0025](https://user-images.githubusercontent.com/50263232/129439235-48f1f963-998d-4c1e-b48a-4a3acf84757a.png)  
  
![dapp_tradeERCtoken_0026](https://user-images.githubusercontent.com/50263232/129439242-95107d68-e618-4a1e-8163-a17b677ac304.png)  
  
And then, select PlayerQ and issue a Buy order of 10 ERC1155-ItemF.  
![dapp_tradeERCtoken_0027](https://user-images.githubusercontent.com/50263232/129439247-52c8f04a-2376-4997-b951-708a8b5a6a6b.png)  
  
![dapp_tradeERCtoken_0028](https://user-images.githubusercontent.com/50263232/129439257-f3edc9bd-e67b-4c99-a1eb-3b6f84235113.png)  
  
![dapp_tradeERCtoken_0029](https://user-images.githubusercontent.com/50263232/129439267-136de542-c4d7-4d4f-9587-462c84e282d9.png)  
  
Let's trade them by pressing the Sell button.  
![dapp_tradeERCtoken_0030](https://user-images.githubusercontent.com/50263232/129439275-126fcab7-eb84-4780-9fa7-ccb089e552d2.png)  
  
![dapp_tradeERCtoken_0031](https://user-images.githubusercontent.com/50263232/129439283-3727abeb-e4fd-441a-b396-07c697470fed.png)  
  
PlayerP got 10 ERC1155-ItemF.  
![dapp_tradeERCtoken_0032](https://user-images.githubusercontent.com/50263232/129439294-be471119-920a-40cd-b05e-d577825ee2c3.png)  
  
PlayerQ got 10 ERC20.  
![dapp_tradeERCtoken_0033](https://user-images.githubusercontent.com/50263232/129439302-6a19ccb3-25c8-4f6e-aff1-dee1f7883478.png)  
  
## Relative link
### Overview
- [Ethereum : Official](https://www.ethereum.org/)
- [Ethereum : Wikipedia](https://en.wikipedia.org/wiki/Ethereum)
- [Loom Network : Official](https://loomx.io/)
- [Loom Network : Binance wiki](https://info.binance.com/en/currencies/loom-network)

### Development
- [Online editor : EthFiddle](https://ethfiddle.com/)
- [Online editor : Remix](https://remix.ethereum.org/)

### Learning
- [Online learning : CryptoZombies](https://cryptozombies.io/)
- [Grammar : Solidity](https://solidity.readthedocs.io/)
- [Grammar : Best Practices](https://github.com/ConsenSys/smart-contract-best-practices)

### DApps
- [DApps : CryptoKitties](https://www.cryptokitties.co/)
- [DApps : Zombie Battle ground](https://loom.games/en/)

## Messages
Is it worth learning about a decentralized world?  

## License
BSD 3-Clause, see `LICENSE` file for details.  

