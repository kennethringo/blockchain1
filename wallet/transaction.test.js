const Transaction = require('./transaction');
const Wallet = require('./index');
const {MINING_REWARD} = require('../config')

describe('Transaction', () =>{
    let transaction, wallet, recipient, amount;

    beforeEach(()=>{
        wallet = new Wallet();
        amount = 50;
        recipient = 'r3c1p13nt';
        transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it('outputs the `amount` subtracted from the wallets balance', ()=>{
        expect(transaction.outputs.find(output => output.address === wallet.publicKey ).amount)
            .toEqual(wallet.balance - amount); 
    });

    it('outputs the `amount` added to the recipients balance', ()=>{
        expect(transaction.outputs.find(output => output.address === recipient ).amount)
            .toEqual(amount); 
    });

    it('inputs the balance of the wallet', () => {
        expect(transaction.input.amount).toEqual(wallet.balance);
    });

    it('validates a valid transaction', () =>{
        expect(Transaction.verifyTransaction(transaction)).toBe(true);
    });

    it('invalidates an invalid transaction', () =>{
        transaction.outputs[0].amount = 50000;
        expect(Transaction.verifyTransaction(transaction)).toBe(false);
    });
    describe('transacting with an amount that exceeds the balance', ()=>{
        beforeEach(()=>{
            amount = 50000;
            transaction = Transaction.newTransaction(wallet, recipient, amount);
        });
        it('does not create the transaction', ()=>{
            expect(transaction).toEqual(undefined);
        });
    });

    describe('and updating a new transaction', ()=>{
        let nextAmount, nextRecipient;

        beforeEach(()=>{
            nextAmount = 20;
            nextRecipient = "n3xt-4ddr355";
            transaction.updateTransaction(wallet, nextRecipient , nextAmount);
        });

        it(`subtracts the next amount from the sender's output`, () => {
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                .toEqual(wallet.balance - amount - nextAmount);
        });

        it(`outputs an amount for the next recipient`, () => {
            expect(transaction.outputs.find(output => output.address === nextRecipient).amount)
                .toEqual(nextAmount);
        });
    });

    describe("updating transaction - error", () => { //additional test
        let secondTxAmount, nextRecipient;
        it("does NOT update transaction - sender tried to send too much on 2nd transfer", () => {
            
        secondTxAmount = 5000; //trying to transfer too much
        nextRecipient  = "n3xt-4ddr355";
    
        expect(() => {
            transaction = transaction.updateTransaction(wallet, nextRecipient, secondTxAmount);
            }).toThrowError(`Amount: ${secondTxAmount} exceeds current balance.`);
        })
    });

    describe("creating a reward transaction", ()=>{
        beforeEach(()=>{
            transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
        });

        it(`rewards the miner's wallet`, ()=>{
            expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                .toEqual(MINING_REWARD); 
        });
    });
});