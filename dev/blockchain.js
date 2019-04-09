const sha256 = require('sha256');
const uuid = require('uuid/v1');
const currentNodeUrl = process.argv[3];

// BlockChain object
function BlockChain() {
    // Main Chain
    this.chain = [];
    // Unvalidated pending transaction which will be validated on the creation of the new block
    this.pendingTransactions = [];
    // Current Node URL 
    this.currentNodeUrl = currentNodeUrl;
    // List of all the nodes of this distributed network
    this.networkNodes = [];

    // Creates Genesis Block trying with arbritary data
    this.createNewBlock(100,'0','0');
}

// Creates a new block add pending transactions into its transaction property
BlockChain.prototype.createNewBlock = function (nonce, previousBlockHash, hash) {
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash
    };

    // Set new transaction field to an empty array for the newly created block and push it to blockchain array
    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
}

// Returns the last Block in the BlockChain
BlockChain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length - 1]
}

// Creates a new transaction and append it into the pending transaction in the blockchain
// When in future a new block is created then this transactions will push into the pending transaction in the BlockChain
BlockChain.prototype.createNewTransaction = function(amount , sender , recipient){
    // Creates the new transaction object
    const newTransaction= {
        amount:amount,
        sender:sender,
        recipient:recipient,
        transactionId:uuid().split('-').join("")
    };
    
    // Push to new transaction array
    // When one transaction is created it does not get a new block instantly . so its in the pending transaction property of the blockchain
    // this.pendingTransactions.push(newTransaction);
    
    // It has to wait untill the next block is created so it returns the ID of the next block
    // When this block is created the transaction 
    return newTransaction;
}

//  Hashes a block . Hashing the previousBlockHash+CurrentBlockData+nonces
BlockChain.prototype.hashBlock = function(previousBlockHash , currentBlockData , nonce){
    const data = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(data);
    return hash;
}

BlockChain.prototype.AddTransactionsToPendingTransactions = function(transaction){
    this.pendingTransactions.push(transaction)
    return this.getLastBlock()["index"]+1;
};

// For creating a new block has to proof that the block is a valid block if not one can temper with the data
// Proof of work validates a block 
//  Hash should be starting with 0000
//  => Repeatedly hash block until it finds correct hash => '0000AFSUHAUSFHAOUFHOADUHF'
//  => Hash[CurrentBlockData+previousBlockHash+nonce]
//  => Continously changes nonce
//  => returns to us the nonce value that creates the correct hash
BlockChain.prototype.proofOfWork = function(previousBlockHash,currentBlockData){
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);

    while(hash.substring(0,4)!=='0000'){
        nonce++
        hash = this.hashBlock(previousBlockHash,currentBlockData,nonce); 
        // console.log(hash)
    }
    return nonce
}

module.exports = BlockChain;