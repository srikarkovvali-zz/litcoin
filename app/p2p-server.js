const Websocket = require('ws');
const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transaction: 'CLEAR_TRANSACTIONS'
    };

class P2pServer{
    constructor(blockchain, transactionPool){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
}
    listen(){
        const server = new Websocket.Server({port: P2P_PORT });
        server.on('connection', socket => this.connectSocket(socket));

        this.connectToPeers();
        console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
    }

    connectSocket(socket){
        this.sockets.push(socket);
        console.log('Socket Connected')

        this.messageHandler(socket);
        this.sendChain(socket);

    }
    connectToPeers(){
        peers.forEach(peer => {
           //ws://localhost:5001
           const socket = new Websocket(peer);

           socket.on('open', () => this.connectSocket(socket));
        });
    }
    messageHandler(socket){
        socket.on('message', message => {
           const data = JSON.parse(message);
           switch(data.type){
               case MESSAGE_TYPES.chain:
                   this.blockchain.replaceChain(data.chain);                    //Handle the types of data coming in
                   break;
               case MESSAGE_TYPES.transaction:
                   this.transactionPool.updateOrAddTransaction(data.transaction);
                   break;
               case MESSAGE_TYPES.clear_transaction:
                   this.transactionPool.clear();
                   break;
           }
           this.blockchain.replaceChain(data); //represents chain from another peer.
        });
    }
    //sends JSON stringify object to the blockchain.
    sendChain(socket){
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        })); //sends the chain object of the blockchain
    }

    //two parameters socket and transaction
    sendTransaction(socket, transaction){
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction
        }));
    }
    //whenever new block is added to chain, we need to keep chain up to date.
    //send the updated chain of this current instance to all of the socket peers.
    syncChains(){
        this.sockets.forEach(socket => this.sendChain(socket));
    }

    broadcastTransaction(transaction){
        this.sockets.forEach(socket => this.sendTransaction(socket,transaction));
    }

    broadcastClearTransactions(){
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transaction
        })));
    }
}
module.exports = P2pServer;