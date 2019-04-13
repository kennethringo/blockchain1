const ChainUtil = require("../chain-util");
const {DIFFICULTY, MINE_RATE } = require("../config.js")//grab DIFFICULTY from the config.js object


class Block{
    constructor(timeStamp, lastHash, hash, data, nonce, difficulty){
        this.timeStamp = timeStamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY; // DIFFICULTY is default in config if nothing specified
    }

    toString(){
        return `
        Block -
        Time Stamp: ${this.timeStamp}
        Last Hash : ${this.lastHash.substring(0,10)}
        Hash      : ${this.hash.substring(0,10)}
        Nonce     : ${this.nonce}
        Difficulty: ${this.difficulty}
        Data      : ${this.data}`;
    }

    static genesis(){
        return new this("genesis time","-----","f1r57-h45h",[], 0 , DIFFICULTY);
    }

    static mineBlock(lastBlock, data){
        let hash;
        let timeStamp
        
        const lastHash = lastBlock.hash;
        
        let {difficulty} = lastBlock; //assign difficulty to the difficulty key of lastBlock's difficulty
        
        let nonce = 0;
        do{
            nonce++;
            timeStamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timeStamp);
            hash = Block.hash(timeStamp, lastHash, data, nonce, difficulty);
        }while(hash.substring(0, difficulty) !== '0'.repeat(difficulty)); //make sure leading 0s of hash matches 0s up until the difficulty (0000 in this case)


        return new this(timeStamp, lastHash, hash, data , nonce, difficulty);
    }

    static hash(timeStamp, lastHash, data, nonce, difficulty){
        return ChainUtil.hash(`${timeStamp}${lastHash}${data}${nonce}${difficulty}`).toString();
    }

    static blockHash(block){
        const { timeStamp , lastHash , data , nonce, difficulty} = block; //declaring variables and setting them to the variables in block
        return Block.hash(timeStamp , lastHash , data , nonce, difficulty);
    }

    static adjustDifficulty(lastBlock, currentTime){
        let{difficulty} = lastBlock;
        difficulty = lastBlock.timeStamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1; //look in my notes for explanation (dynamic block difficulty)
        if(difficulty < 1) difficulty = 1;
        return difficulty;
    }


}

module.exports = Block;