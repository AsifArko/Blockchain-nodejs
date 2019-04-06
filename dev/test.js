const BlockChain = require('./blockchain');

const bitcoin = new BlockChain();

bitcoin.createNewBlock(1111,'SYGDISHOSHFOUHSODSHFOUSH','IODJOFUHDUHFDFDFUHDH')
bitcoin.createNewTransaction(100,"AUDHFOAUFHODUHFOUSDH","DOFHSODFHOSUDGHOSUGH")

const previousBlockHash = 'ONDAOFUAODFUHEJFNWEOU876'
const currentBlockData = [
{
    amount:10,
    sender:'FOSHOFSJNFOSUF34573ADADAD',
    receipient:'DUFSIUSDFGSDIUGHDSIFUHSD'
},
{
    amount:100,
    sender:'AVADVSFOSHOFSJNFOSUF34573ADADAD',
    receipient:'ADFADUFSIUSDFGSDIUGHDSIFUHSD'
},
{
    amount:10,
    sender:'FOSHOFADFAJNFOSUF34573ADADAD',
    receipient:'AFDUFSIUSDFGSDIUGHDSIFUHSD'
}
]

bitcoin.createNewBlock(1111,'OHFOUHAODUFHOSUFHD','ADOFHOAUDFHOUDHFOUDH')

console.log(bitcoin); 