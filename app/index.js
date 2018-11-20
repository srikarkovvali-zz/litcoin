const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain'); //This will get the index.js which is our blockchain file
const P2pServer = require(('./p2p-server'));
const Wallet = require ('../wallet');
const TransactionPool = require('../wallet/transaction-pool'); //every wallet wil have a fresh instance
const Miner = require('./miner');

//the process will allow us to switch ports if the user has 3001 in use and will incrementally test for the next available port
const HTTP_PORT = process.env.HTTP_PORT || 3001; //This will allow us to run on port 3001, so we can access it through the localhost domain.

const app = express();
const bc = new Blockchain ();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
const wallet = new Wallet();
const miner = new Miner(bc, tp, wallet, p2pServer);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
    res.json(bc.chain); //sending the chain to the json
});

app.get('/transactions', (req,res) => {
   res.json(tp.transactions);
});

//consists of recipient and amount => as a post request
app.post('/transact', (req,res) =>{
    const { recipient, amount} = req.body;
    const transaction = wallet.createTransaction(recipient,amount,bc,tp);
    p2pServer.broadcastTransaction(transaction);
    res.redirect('/transactions');
});

app.post('/mine', (req,res) => {
   const block = bc.addBlock(req.body.data);
   console.log(`New Block Added: ${block.toString()}`);

   p2pServer.syncChains();

   res.redirect('/blocks');
});

app.get('/public-key',(req,res) => {   //address used to conduct transactions to this wallet
    res.json({publicKey: wallet.publicKey});
});

app.get('/mine-transactions', (req,res)=>{
    const block = miner.mine();
    console.log(`New Block added: ${block.toString()}`);
    res.redirect('/blocks');
})

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`)); //listens to the HTTP_PORT
p2pServer.listen(); //starts the web socket server

