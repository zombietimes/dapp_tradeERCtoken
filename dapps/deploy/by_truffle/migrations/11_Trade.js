
const cYourErc20 = artifacts.require("./Existed/YourErc20.sol");
const cYourErc721 = artifacts.require("./Existed/YourErc721.sol");
const cYourErc1155 = artifacts.require("./Existed/YourErc1155.sol");

const lLibDataList = artifacts.require("./Common/LibDataList.sol");
const cHolders = artifacts.require("./Trade/Holders.sol");
const cTrade = artifacts.require("./Trade/Trade.sol");
const cHolderWei = artifacts.require("./Trade/HolderWei.sol");
const cHolder20 = artifacts.require("./Trade/Holder20.sol");
const cHolder721 = artifacts.require("./Trade/Holder721.sol");
const cHolder1155 = artifacts.require("./Trade/Holder1155.sol");

module.exports = async function(deployer) {
  await deployer.deploy(cYourErc20);
  await deployer.deploy(cYourErc721);
  await deployer.deploy(cYourErc1155);

  await deployer.deploy(lLibDataList);
  await deployer.link(lLibDataList,cHolders);
  await deployer.deploy(cHolders);
  await deployer.link(lLibDataList,cTrade);
  await deployer.deploy(cTrade,cHolders.address);
  await deployer.deploy(cHolderWei,cHolders.address);
  await deployer.deploy(cHolder20,cHolders.address);
  await deployer.deploy(cHolder721,cHolders.address);
  await deployer.deploy(cHolder1155,cHolders.address);
  
  const iHolders = await cHolders.deployed();
  iHolders.RegistTrade(cTrade.address);
  iHolders.RegistHolderWei(cHolderWei.address);
  iHolders.RegistHolder20(cHolder20.address);
  iHolders.RegistHolder721(cHolder721.address);
  iHolders.RegistHolder1155(cHolder1155.address);

};


