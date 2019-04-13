
const Block = require('./blockchain/block');

//section 2 before mineBlock
const block = new Block("foo","bar","zoo","baz");
console.log(block.toString());
console.log(Block.genesis().toString());

//section 2 mineblock
const fooBlock = Block.mineBlock(Block.genesis(), "foo");
console.log(fooBlock.toString());
//before dynamic difficulty tests

//dynamic difficult tests
const Blockchain = require('./blockchain');

const bc = new Blockchain();

for (let i = 0 ; i < 10 ; i++ ){
    console.log(bc.addBlock(`foo {i}`).toString());
}

//test wallets
const Wallet = require('./wallet');
const wallet = new Wallet();
console.log(wallet.toString());


