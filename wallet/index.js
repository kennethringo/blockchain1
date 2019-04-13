const ChainUtil = require ('../chain-util');
const Transaction = require ('./transaction');
const Blockchain = require("../blockchain");
const {INITIAL_BALANCE } = require('../config'); 

class Wallet {
    constructor(){
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
        this.blockchain = new Blockchain(); 
    }

    toString(){
        return `Wallet - 
          publicKey: ${this.publicKey.toString()}
          balance  : ${this.balance}`
    }

    sign(dataHash){
        return this.keyPair.sign(dataHash);
    }

    createTransaction(recipient, amount, blockchain , transactionPool){
        this.balance = this.calculateBalance(blockchain);

        if (amount > this.balance){
            console.log(`Amount: ${amount} exceeds the current Balance: ${this.balance}`);
            return;
        }

        let transaction = transactionPool.existingTransaction(this.publicKey);

        if (transaction){
            transaction.updateTransaction(this, recipient, amount);
        }else{
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.updateOrAddTransaction(transaction);
        }

        return transaction;
    }

    calculateBalance(blockchain){
        let balance = this.balance;
        let transactions = [];

        blockchain.chain.forEach(block => block.data.forEach(transaction => {
            transactions.push(transaction);
         }));

        const walletInputTransactions = transactions.
            filter(transaction => transaction.input.address === this.publicKey);

        let startTime = 0;
        

        if(walletInputTransactions.length > 0){ //if there are any transactions at all
            //console.log(`found transactions belonging to: ${this.publicKey}`);
            const recentInputTransaction = walletInputTransactions.reduce(
                //get the most recent  transaction
                (previous, current) => previous.input.timeStamp > current.input.timeStamp ? previous : current
            );

            balance = recentInputTransaction.outputs.find( output => output.address === this.publicKey).amount;
            
            //to ensure that we only start from most recent transaction
            startTime = recentInputTransaction.input.timeStamp; 
        }

        
        //if no transactions found then startTime = 0
        transactions.forEach(transaction => {
            if(transaction.input.timeStamp > startTime){
                
                transaction.outputs.find(output => {
                    if(output.address === this.publicKey){
                        balance += output.amount;
                        
                    }
                });
            }
        });
        
        return balance;
    }

    static blockchainWallet(){
        const blockchainWallet = new this();
        blockchainWallet.address = "blockchain-wallet";
        return blockchainWallet;
    }
}

module.exports = Wallet;