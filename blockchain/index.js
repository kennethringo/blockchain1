const Block = require('./block');
var validCheck = -1;
class Blockchain{
    
    constructor(){
        this.chain = [Block.genesis()];
        
    }

    addBlock(data){

        const block = Block.mineBlock(this.chain[this.chain.length-1], data); //have to give it last block
        this.chain.push(block);

        return block;
    }

    isValidChain(chain){ //this just checks if the incoming chain is valid against itself
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            validCheck = 0;
            return false;
        }

        for (let i = 1; i < chain.length;i++){
            const block = chain[i];
            const lastBlock = chain[i-1];
                                                    //or if given current block hash does not match our hash
            if (block.lastHash !== lastBlock.hash ){
                validCheck = 2;
                return false;
            }
            
            if (block.hash !== Block.blockHash(block)){ 
                console.log("block in chain has hash: " + block.hash);
                console.log("but calling Block.blockHash gives us: " + Block.blockHash(block));
                validCheck = 1;
                return false;
            }
        }

        return true; 
    }

    replaceChain(newChain){
        if (newChain.length <= this.chain.length){
            console.log("chain is no longer than current chain.");
            return;
        }else if (!this.isValidChain(newChain)){
            console.log ("this is validCheck: " + validCheck);
            console.log("the received chain is not a valid chain.");
            return;
        }

        //if it gets here than it is a valid chain of longer length
        console.log("replacing the old chain with the new chain");
        this.chain = newChain;
        
    }
}

module.exports = Blockchain; 
