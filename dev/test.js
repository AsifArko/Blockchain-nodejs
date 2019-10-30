const BlockChain = require('./blockchain');

const bitcoin = new BlockChain();

const bc1 = {
    "chain": [
    {
    "index": 1,
    "timestamp": 1555138988129,
    "transactions": [],
    "nonce": 100,
    "hash": "0",
    "previousBlockHash": "0"
    }
    ],
    "pendingTransactions": [],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
    }
    

console.log(bitcoin.chainIsValid(bc1.chain));