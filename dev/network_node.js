const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.argv[2];
const rp = require('request-promise');

const nodeAddress = uuid().split('-').join("");

const bitcoin = new Blockchain();

// Creating node app
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Routes 
// Get the BlockChain
app.get('/blockchain', function (req, res) {
    res.send(bitcoin);
});

// Create a Transaction
app.post('/transaction', function (req, res) {
    // First create new transaction 
    const newTransaction = req.body;

    // add this to pending transaction
    const blockIndex = bitcoin.AddTransactionsToPendingTransactions(newTransaction);

    // send a response
    res.json({
        note:`Transaction will be added on block ${blockIndex} .`
    })
});

// Mine block . Create block with proof of work
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

    // Finally creates the new block
    const newBlock = bitcoin.createNewBlock(nonce,previousBlockHash,hash);
    
    // Broadcast the newly created Block
    const requestPromises = []
    bitcoin.networkNodes.forEach( networkNode => {
        const requestOptions = {
            uri:networkNode + '/receive-new-block',
            method:'POST',
            body:{newBlock:newBlock},
            json:true
        };
         
        requestPromises.push(rp(requestOptions));
        // console.log(requestPromises)
    })
    
    Promise.all(requestPromises)
    .then(data =>{
        // Create new mining reward transaction as a reward for the miner
        // Generate request
        const requestOptions = {
            uri : bitcoin.currentNodeUrl + '/transaction/broadcast',
            method:'POST',
            body:{
                amount:12.5,
                sender:"00",
                recipient:nodeAddress
            },
            json:true
        }
        //  send the request 
        return rp(requestOptions)
    })
    .then(data => {
        res.json({
            note:"New block mined successfully",
            block:newBlock,
        });
    });
});

// Broadcasting newly created blocks
app.post('/receive-new-block',function(req,res){
    // Get the block from the client
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

    // If new block is valid then add it to block chain
    if (correctHash && correctIndex){
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions = [];

        res.json({
            note:"New block received and accepted .",
            newBlock:newBlock
        });
    }else{
        res.json({
            note:"Block is invalid so rejected .",
            newBlock:newBlock
        });
    }
});

// Register a node and broadcast that node to the entire network
app.post('/register-and-broadcast-node',function(req,res){
    const newNodeUrl = req.body.newNodeUrl;

    // adding the new node url to the Blockchain's NetworkNodes list
    if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl);

    // Broadcast new node
    const registerNodesPromises = []
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        // Register Node Endpoint '/register-node'
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method:'POST',
            body:{ newNodeUrl:newNodeUrl },
            json:true,
        };

        // Create requests of request.Promise type and push it to an array .
        // Then all the requests will be sent asynchronously and handle further
        registerNodesPromises.push(rp(requestOptions));
    });
    
    Promise.all(registerNodesPromises)
    .then(data =>{
         const bulkRegisterOptions ={
             uri:newNodeUrl + '/register-nodes-bulk',
             method:'POST',
             body:{allNetworkNodes:[ ...bitcoin.networkNodes , bitcoin.currentNodeUrl ]},
             json:true
         };
         return rp(bulkRegisterOptions)
    })
    .then(data => {
        res.json({note:"New node registered with network successfully"})
    })

});

// Register a node in the network
app.post('/register-node',function(req,res){
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1
    const notCurrentNodeUrl = bitcoin.currentNodeUrl !== newNodeUrl;
    
    // If the new node url doesn't exists in the NetworkNodes array and current node url is not equal to the new node url
    if(nodeNotAlreadyPresent && notCurrentNodeUrl) bitcoin.networkNodes.push(newNodeUrl);
     
    // Generate response and send
    res.json({
        note:"New node registered successfully ."
    });
});

// Register multiple nodes at once
app.post('/register-nodes-bulk',function(req,res){
    // Register nodes bulk is only called after all the nodes are present for broadcasting purpose
    const allNetworkNodes = req.body.allNetworkNodes;
    
    // Just push it to Blockchain's NetworkNodes array
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1
        const notCurrentNodeUrl = bitcoin.currentNodeUrl !== networkNodeUrl;
        if (nodeNotAlreadyPresent && notCurrentNodeUrl) bitcoin.networkNodes.push(networkNodeUrl);
    });

    // Generate appropiate response and send it
    res.json({
        note:"Bulk registration successful"
    });
});

// Transaction Broadcast => Create transaction and then broadcast it with other networks
app.post('/transaction/broadcast', function(req,res){
    // Creates a transaction first
    const newTransaction = bitcoin.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient,req.body.transactionId)

    // add the newly created transaction to pending transaction
    bitcoin.AddTransactionsToPendingTransactions(newTransaction);

    // ... and then Broadcast it to other networks
    const requestPromises = []
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        console.log(networkNodeUrl)
        const requestOptions = {
            uri:networkNodeUrl+"/transaction",
            method:'POST',
            body:newTransaction,
            json:true
        }
        // create all the request and push
        requestPromises.push(rp(requestOptions));
        });
        // execute all the request
        Promise.all(requestPromises)
        .then (data => {
            res.json({
                note:"Transaction create and broadcast is successful",
            })
        });
    });
    
app.listen(port, function () {
    console.log(`Listenning on port  ${port}`);
});