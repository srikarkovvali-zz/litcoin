const SHA256 = require('crypto-js/sha256');
const ChainUtil = require('../chain.util');
const { DIFFICULTY, MINE_RATE } = require('../config');

class Block {
    constructor(timestamp, lastHash, hash, data, nonce, difficulty){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }
    toString(){
        return `Block -
            Timestamp  : ${this.timestamp}
            Last Hash  : ${this.lastHash.substring(0,10)}
            Hash       : ${this.hash.substring(0,10)}
            Nonce      : ${this.nonce}
            Difficulty : ${this.difficulty};
            Data:      : ${this.data}`;
    }
    //As long as we have the block module, we will be able to use this directly without creating a new block instance.
    //With this block, we have the first block which we can use to start our blockchain.
    static genesis(){
        return new this('Genesis Time', '00000', 'f1r57-h45h', [], 0, DIFFICULTY);
    }

    static mineBlock(lastBlock, data){
        const lastHash = lastBlock.hash;
        let nonce =0;
        let hash, timestamp;
        let {difficulty} = lastBlock; //assigned to difficulty key of the last block
        do{
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = Block.hash(timestamp,lastHash,data,nonce, difficulty);
        } while(hash.substring(0, difficulty) !== '0'.repeat(difficulty)); //locally defined difficulty

        return new this(timestamp,lastHash,hash, data, nonce, difficulty); //return block
    }
    //256 bits = 32 bytes which is generated for hash
    static hash(timestamp,lastHash,data,nonce,difficulty){
        return SHA256(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
    }

    //Now we also want a static block hash function
    static blockHash(block) {
        const {timestamp, lastHash, data, nonce, difficulty} = block;
        return Block.hash(timestamp, lastHash, data,nonce, difficulty);
    }

    //static because accessed within mineblock
    static adjustDifficulty(lastBlock,currentTime){
        let {difficulty} = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty -1; //raising/lowering if block mined quickly/slowly
        return difficulty;
    }
}
module.exports = Block;

//each block can have it's own difficulty level
//as well as a mine rate
//we'll check the timestamp of the newly mined block with the previous. If the time between
//the two was bigger than minerate so it was mined too slowly so we can adjust difficulty by one.
