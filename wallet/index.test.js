const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Blockchain = require("../blockchain");
const {INITIAL_BALANCE} = require("../config");

describe("Wallet", ()=>{
    let wallet, tp, bc;

    beforeEach(()=>{
        wallet = new Wallet();
        tp = new TransactionPool();
        bc = new Blockchain();
    });

    describe("creating a transaction", ()=>{
        let transaction, sendAmount, recipient;

        beforeEach(()=>{
            sendAmount = 50;
            recipient = "r4nd0m-4ddr355";
            transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
        });

        describe("and doing the same transaction", ()=>{
            beforeEach(()=>{
                wallet.createTransaction(recipient, sendAmount, bc, tp);
            });

            it("doubles the `sendAmount` subtracted from the wallet balance", ()=>{
                expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                    .toEqual(wallet.balance - sendAmount * 2);
            });

            it ("clones the `sendAmount` for the recipient", ()=>{
                expect(transaction.outputs.filter(output => output.address === recipient).map(output => output.amount)) 
                    .toEqual([sendAmount, sendAmount]);
                    //filter out only the ouputs that match recipient
                    //and map them to a separate array just containing amounts
            });
        });
    });

    describe("calculating a balance", ()=>{
        let addBalance, repeatAdd, senderWallet;

        beforeEach(()=>{
            senderWallet = new Wallet();
            addBalance = 100;
            repeatAdd = 3;
            for (let i = 0 ; i < repeatAdd ; i++){
                senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
            }
            bc.addBlock(tp.transactions);
            // console.log(`repeat add * addBalance, ${addBalance * repeatAdd}`);
        });

        it("calculates the balance for blockchain transactions matching a recipient", () =>{
            expect(wallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE + (addBalance * repeatAdd));
        });

        it("calculates the balance for blockchain transactions matching the sender", () =>{
            expect(senderWallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE - (addBalance * repeatAdd));
        });

        describe("and recipient conducts a transaction", ()=> {
            let subtractBalance, recipientBalance;
            beforeEach(()=>{
                tp.clear();
                subtractBalance = 60;
                recipientBalance = wallet.calculateBalance(bc);
                wallet.createTransaction(senderWallet.publicKey, subtractBalance, bc, tp);
                bc.addBlock(tp.transactions);
            });
    
            describe("and the sender sends another transaction", ()=>{
                beforeEach(()=>{
                    tp.clear();
                    senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
                    bc.addBlock(tp.transactions);
                });
    
                it("calculates the recipient balance but only from its most recent transaction", ()=>{
                    expect(wallet.calculateBalance(bc)).toEqual(recipientBalance - subtractBalance + addBalance);
                });
            });
        });
    });
});
