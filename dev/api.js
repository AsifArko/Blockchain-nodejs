const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');

const nodeAddress = uuid().split('-').join("");

const bitcoin = new Blockchain();

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Routes 

app.get('/blockchain', function (req, res) {
    res.send(bitcoin);
});

app.post('/transaction', function (req, res) {
    // First create new transaction 
    const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({
        note: `Transaction will be added in block ${blockIndex} .`
    });
});

app.get('/mine', function (req, res) {
    // Get the last block in the blockchain and extract the hash of this block
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];

    // Generate current block data object
    const currentBlockData = {
        transaction: bitcoin.pendingTransactions,
        index: lastBlock['index'] + 1,
    };

    // Get the appropiate nonce by doing a proof of work
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);

    // Generate the current block hash
    const hash = bitcoin.hashBlock(previousBlockHash,currentBlockData,nonce);

    // Create new transaction as a reward for the miner
    bitcoin.createNewTransaction(12.5,"00",nodeAddress);

    // Finally creates the new block
    const newBlock = bitcoin.createNewBlock(nonce,previousBlockHash,hash);

    res.json({
        note:"New block mined successfully",
        block:newBlock,
    })
});

app.listen(3000, function () {
    console.log("Listenning on port 3000");
});