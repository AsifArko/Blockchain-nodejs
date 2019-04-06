const BlockChain = require('./blockchain');

const bitcoin = new BlockChain();

//  Proof of work test

let previousBlockHash = 'ABOCSABCOSAUCBOASUC'
let currentData = [{
    amount:10,
    sender:"AODHFOAFIHAODFUHUAFDHODUFH",
    recipient:"AOFHOADUFHDOUFH"
}];
let nonce = bitcoin.proofOfWork(previousBlockHash,currentData,0);
let hash = bitcoin.hashBlock(previousBlockHash,currentData,nonce);
bitcoin.createNewBlock(nonce,previousBlockHash,hash);

let prevHash = hash
bitcoin.createNewTransaction(100,"rasel","arko")
let currenData = [{
    amount:10,
    sender:"AODHFO",
    recipient:"AOF"
}];
bitcoin.proofOfWork(prevHash,currenData,0);
hash = bitcoin.hashBlock(prevHash,currenData,nonce);
bitcoin.createNewBlock(nonce,prevHash,hash);


console.log(bitcoin)