const prompt = require("prompt-sync")({ sigint: true });
const hex = prompt("Input Hex ");

// Function to convert hex to little-endian
const toLittleEndian = (hexStr) => {
  return hexStr.match(/../g).reverse().join('');
};

const version = hex.slice(0, 8);
const prevBlockHash = hex.slice(8, 72);
const merkleRoot = hex.slice(72, 136);
const time = hex.slice(136, 144);
const bits = hex.slice(144, 152);
const nonce = hex.slice(152, 160);
const txCount = hex.slice(160, 162);
const transactions = hex.slice(162);

const decodedBlock = {
  version: toLittleEndian(version),
  prevBlockHash: toLittleEndian(prevBlockHash),
  merkleRoot: toLittleEndian(merkleRoot),
  time: toLittleEndian(time),
  bits: toLittleEndian(bits),
  nonce: toLittleEndian(nonce),
  txCount: parseInt(txCount, 16),
  transactions
};

console.log("\nDecoded Block:");
console.log(JSON.stringify(decodedBlock, null, 2));
