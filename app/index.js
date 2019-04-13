const express = require("express");
const bodyParser = require("body-parser");
const Blockchain = require("../blockchain");
const P2PServer = require("./p2p-server");
const Wallet = require("../wallet");
const TransactionPool = require("../wallet/transaction-pool" );
const Miner = require("./miner");

const HTTP_PORT = process.env.HTTP_PORT || 3001; //so that we can run with different port
//eg on command line $ HTTP_PORT = 3002 npm run dev
//HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev
const app = express(); //creates express application
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2PServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

app.use(bodyParser.json()); //allows us to receive json in post requests

app.get("/blocks", (req ,res) => {
    res.json(bc.chain);
});

app.post("/mine", (req,res) =>{
    const block = bc.addBlock(req.body.data);
    console.log(`new block added: ${block.toString()}`);

    p2pServer.syncChains();

    res.redirect("/blocks"); //redirect to blocks end point
});

app.get("/mine-transactions", (req, res) => {
    const block = miner.mine();
    console.log(`new block added ${block.toString()}`);
    res.redirect("/blocks");
}); 

app.get("/transactions", (req ,res) => {
    res.json(tp.transactions);
});

app.post("/transact", (req, res) => {
    const {recipient , amount } = req.body;
    const transaction = wallet.createTransaction( recipient, amount, bc, tp);
    p2pServer.broadcastTransaction(transaction);
    res.redirect("/transactions");
});

app.get("/public-key", (req, res) => {
    res.json({ publicKey: wallet.publicKey});
});

app.get("/balance", (req, res) => {
    res.json({balance: wallet.calculateBalance(bc)});
});

app.listen(HTTP_PORT, () => console.log(`Listening on PORT ${HTTP_PORT}`) );
p2pServer.listen();