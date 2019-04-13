const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require("../blockchain");

describe('TransactionPool', ()=>{
    let tp, wallet, transaction, bc;
    
    beforeEach(()=>{
        tp = new TransactionPool();
        wallet = new Wallet();
        bc = new Blockchain();
        transaction = wallet.createTransaction('r4nd-4ddr355', 30, bc, tp);
    });

    it ('adds a transaction to the pool of transactions', () =>{
        expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
    });

    it('updates a transaction in the pool of transactions' , ()=>{
        const oldTransaction = JSON.stringify(transaction);
        const updatedTransaction = transaction.updateTransaction(wallet, 'foo-4dr355', 40);
        tp.updateOrAddTransaction(updatedTransaction);

        expect(JSON.stringify(tp.transactions.find(t => t.id === updatedTransaction.id)))   //just tests that new and old are not equal
            .not.toEqual(oldTransaction);
    });

    it("clears the transaction pool", ()=>{
        tp.clear();
        expect(tp.transactions).toEqual([]);
    });

    describe('mixing valid and invalid transactions', ()=>{
        let validTransactions;

        beforeEach(()=>{
            validTransactions = [...tp.transactions]; //takes all transactions from tp and adds them one at a time to validTransactions array
            for (let i = 0 ; i < 6; i++){
                wallet = new Wallet();
                transaction = wallet.createTransaction("r4nd-4dr355", 30, bc, tp); 

                if (i % 2 == 0){ //for even numbers 
                    transaction.input.amount = 99999;
                }else{
                    validTransactions.push(transaction);
                }
            }
        
        });

        it ("shows a difference between valid and corrupt transactions" , ()=>{
            expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
        });

        it("grabs valid transactions", ()=>{
            expect(tp.validTransactions()).toEqual(validTransactions);
        });
    });
});