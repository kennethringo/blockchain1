const Transaction = require("../wallet/transaction");

class TransactionPool{
    constructor(){
        this.transactions = [];
    }

    updateOrAddTransaction(transaction){
        
        let transactionWithID = this.transactions.find(t => t.id === transaction.id);

        if(transactionWithID){ //if there exists a transaction just to update
            this.transactions[this.transactions.indexOf(transactionWithID)] = transaction;
        } else{
            this.transactions.push(transaction);
        }
    }

    existingTransaction(address){
        return this.transactions.find(t => t.input.address === address);
    }

    validTransactions(){

        //1st transactions inputs must = total of outputs
        return this.transactions.filter(transaction => { //filter out any transaction that passes certain conditions
            const outputTotal = transaction.outputs.reduce((total, output) => { //output is the object that you're looking at one at a time (it is a var name for transaction)
                return total + output.amount;
            }, 0);  //start at 0

            if (transaction.input.amount !== outputTotal){
                console.log(`Invalid transaction from ${transaction.input.address}.`);
                return;
            }

            //2nd check valid signature on every transaction
            if (!Transaction.verifyTransaction(transaction)){
                console.log(`Invalid signature from ${transaction.input.address}.`);
                return;
            }

            return transaction;
        }); 
    }

    clear(){
        this.transactions = [];
    }
    
}

module.exports = TransactionPool;