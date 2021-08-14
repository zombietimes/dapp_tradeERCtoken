// cd /home/zombie/dapps/web/by_local/js/
// node ./toAbiJson_node.js

function lcfirst(inText){
  const outText = inText.charAt(0).toLowerCase() + inText.slice(1);
  return outText;
}
function toAbi(contractName){
  const fs = require('fs');
  const contractNameLower = lcfirst(contractName);
  const pathJson = "/home/zombie/dapps/deploy/by_truffle/build/contracts/" + contractName + ".json";
  const inText = fs.readFileSync(pathJson,{encoding:"utf-8"});
  const outText = "const AbiJson_" + contractName + " = " + inText;
  const apiJson = "/home/zombie/dapps/web/by_local/js/abiJson_node_" + contractName + ".js";
  fs.writeFileSync(apiJson,outText,{encoding:"utf-8"});
  console.log("Output : " + apiJson);
}
toAbi("YourErc20");
toAbi("YourErc721");
toAbi("YourErc1155");
toAbi("Holders");
toAbi("HolderWei");
toAbi("Holder20");
toAbi("Holder721");
toAbi("Holder1155");
toAbi("Trade");
