const EthereumTx = require('ethereumjs-tx').Transaction;
const util = require("ethereumjs-util");

const test = (prefix, rawTxHex) => {
    const rawTx = Buffer.from(rawTxHex.slice(2), "hex");
    const tx = new EthereumTx(rawTx);
    const decodedTx = {
        nonce: parseInt(tx.nonce.toString("hex") || "0", 16),
        gasPrice: parseInt(tx.gasPrice.toString("hex"), 16),
        gasLimit: parseInt(tx.gasLimit.toString("hex"), 16),
        to: "0x" + tx.to.toString("hex"),
        value: parseInt(tx.value.toString("hex") || "0", 16),
        data: tx.data.toString("hex"),
        v: tx.v.toString("hex"),
        r: util.bufferToHex(tx.r),
        s: util.bufferToHex(tx.s),
    };
    console.log(`JSON DATA: ${JSON.stringify(decodedTx)} \n\n\n`);

    let signerAddress = tx.getSenderAddress().toString('hex');
    let chainID = tx.getChainId();
    let getDataFee = tx.getDataFee();
    let getBaseFee = tx.getBaseFee();
    let getUpfrontCost = tx.getUpfrontCost();

    console.log(`
    ${prefix} Decoded: Address = ${signerAddress}
              ChainId = ${chainID} 
              DataFee = ${getDataFee}
              getBaseFee = ${getBaseFee}
              getUpfrontCost = ${getUpfrontCost}
             \n\n\n
    `)
}


const raw_working = '0xf9036a7884b2d05e008303d09094104098ebe294fa1db89f1c8fef4e8c8eb8ba7b8580b90304884dad2e000000000000000000000000e96a37edde26a456a0c6f90a5f1b81a40a0f10320000000000000000000000000000000000000000000000007ce66c50e284000000000000000000000000000000000000000000000000000063eb89da4ed00000000000000000000000000000000000000000000000000000063eb89da4ed0000020000120b3931e000000000000021c078dd089635fc000000000000000000001b00000000000000000000000000000000000000000000000000000000000000812bbe7566c1a6914adc8af97e92f1442002440a797a078f3f1c8c1c509b4b2f2dae461b93ebc223326172453c3e118528b9aceadc15ea62c94596b937f0098e00000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000005a0212daacbbdf2baabec3fe6932911bd49e1d770000000000000000000000008f8e04fca018877f488fc0503bc6134d680fd6c000000000000000000000000032133c92983d78ed7193ee4d0f719c578ff5993b0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000d38d26954c4a8087358b8d698fe5e3255c5aecea0000000000000000000000000000000000000000000000008ac7230489e800000000000000000000000000000000000000000000000000006f05b59d3b200000000000000000000000000000000000000000000000000000063eb89da4ed0000020100120b3917a00000000000006ee132a3dfa54f81000000000000000000001c00000000000000000000000000000000000000000000000000000000000000d7bfac0957647fa49e4f69d6ed7b8a738c4a2e201ef65dc405e589ff22fe8df20e1fe169875716c76fc04f56b233ec5b9054368afa4cd5894d3fef202e57135e00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000007ce66c50e28400001ba08aa9f115f10a33d498b7ddf52e3ad3319d78ea5a2a29215de427a08cb406d7fda008ecb81171a258f93bce27e3b02ca8d29f24c901fee74d62fc77a518ade849fa';
const raw_failed  = '0xf9036a7884b2d05e008303d09094104098ebe294fa1db89f1c8fef4e8c8eb8ba7b8580b90304884dad2e000000000000000000000000e96a37edde26a456a0c6f90a5f1b81a40a0f10320000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000b1a2bc2ec500000000000000000000000000000000000000000000000000000063eb89da4ed0000020000120b3927e00000000000004a6160694b6241af000000000000000000001b000000000000000000000000000000000000000000000000000000000000004a6862982579dc58b573a5d23304808115ccb352fedfa4bf92742536135661835743d8117fec1cd5fbb3528bf3e2f292ac22cb94e4eaf3554debe2785ffa985800000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000005a0212daacbbdf2baabec3fe6932911bd49e1d770000000000000000000000008f8e04fca018877f488fc0503bc6134d680fd6c000000000000000000000000032133c92983d78ed7193ee4d0f719c578ff5993b0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000d38d26954c4a8087358b8d698fe5e3255c5aecea0000000000000000000000000000000000000000000000008ac7230489e800000000000000000000000000000000000000000000000000006f05b59d3b200000000000000000000000000000000000000000000000000000063eb89da4ed0000020100120b3917a00000000000006ee132a3dfa54f81000000000000000000001c00000000000000000000000000000000000000000000000000000000000000d7bfac0957647fa49e4f69d6ed7b8a738c4a2e201ef65dc405e589ff22fe8df20e1fe169875716c76fc04f56b233ec5b9054368afa4cd5894d3fef202e57135e00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a76400001ca0083c978b0d562355aa391d32fe80b744e1eca2779be88c2f932b1a34f424d7e8a0000c9a9547282a43f8d1029b5ce6d12353da7e1d3989a319096b285569c47fde';


//                        method         ?                                to                    ?                 v  ?                                      r                            ?                                   s                                                                                
const raw_working_1 = '0xf9036a78|84b2d05e008303d09094|104098ebe294fa1db89f1c8fef4e8c8eb8ba7b85|80b90304|--DATA--|1b|a0|8aa9f115f10a33d498b7ddf52e3ad3319d78ea5a2a29215de427a08cb406d7fd|a0|08ecb81171a258f93bce27e3b02ca8d29f24c901fee74d62fc77a518ade849fa|';
const  raw_failed_1 = '0xf9036a78|84b2d05e008303d09094|104098ebe294fa1db89f1c8fef4e8c8eb8ba7b85|80b90304|--DATA--|1c|a0|083c978b0d562355aa391d32fe80b744e1eca2779be88c2f932b1a34f424d7e8|a000|0c9a9547282a43f8d1029b5ce6d12353da7e1d3989a319096b285569c47fde|';


test("Working", raw_working)
test("Faild", raw_failed)