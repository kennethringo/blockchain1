const Websocket = require("ws");

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(','): [] ; //if peers env variable exists, split it then put into array
//on command line this is how we list ALL peers $ PEERS=ws: //localhost:5001,ws://localhost:5002 npm run dev (eg for 3rd instance)
// $ HTTP_PORT = 3002 P2P_PORT = 5002
const MESSAGE_TYPES  = {
    chain: "CHAIN",
    transaction: "TRANSACTION",
    clear_transactions: "CLEAR_TRASACTIONS"
};


class P2PServer{
    constructor(blockchain, transactionPool){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = []; //list of websocket servers that connect to this one
    }
    //start up server and get to listen for connections
    listen(){ 
        const server = new Websocket.Server({port: P2P_PORT}); //create new websocket server at port P2P_PORT
        server.on("connection" , socket => this.connectSocket(socket));  //listen for connection event

        this.connectToPeers();
        console.log(`listening for peer-to-peer connections on port: ${P2P_PORT}`); 
    }

    connectToPeers(){
        peers.forEach(peer =>{
            //ws: //localhost:5001 (address of peer)
            const socket = new Websocket(peer);
            socket.on("open", ()=> this.connectSocket(socket));
            
        });
    }

    connectSocket(socket){
        this.sockets.push(socket);
        console.log("Socket connected");
        this.messageHandler(socket);
        this.sendChain(socket);
    }

    messageHandler(socket){
        socket.on("message", message =>{
            const data = JSON.parse(message); //converts string message into JSON object
            
            switch(data.type){
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction);
                    break;

                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clear();
                    break;

                default:
                    throw new Error("Undefined or improper message type.");
            }
            //console.log("data", data);
            
        });
    }

    sendChain(socket){
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        }));
    }

    syncChains(){
        this.sockets.forEach(socket => this.sendChain(socket));
    }

    sendTransaction(socket, transaction){
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction: transaction
        })); 
    }

    broadcastTransaction(transaction){
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
    }

    broadcastClearTransactions(){
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        })));
    }
    
}

module.exports = P2PServer;