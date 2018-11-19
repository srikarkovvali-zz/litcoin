const Block = require('./block');

class Blockchain{
    constructor(){
        this.chain =  [Block.genesis()];
    }

    addBlock(data){
        const block = Block.mineBlock(this.chain[this.chain.length-1], data);
        this.chain.push(block);

        return block;
    }
    //will check that the incoming chain will start with the proper genesis block
    isValidChain(chain){
        //what we can do is stringify the objects and compare them
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

        for(let i=1; i<chain.length; i++){
            const block = chain [i];
            const lastBlock = chain[i-1];

            //the current blocks last hash must match the hash of the last block
            //we also need to check that the current block's hash must match the generated
            //hash of the current block: will check for hash tampering
            if (block.lastHash !== lastBlock.hash || block.hash !== Block.blockHash(block)){
                return false;
            }
        }
        return true;
    }

    //Now let's the actual function that replaces the chain with the block if it's valid
    replaceChain(newChain){
        //we first need to check that length of the new chain to be larger than the current chain
        //if the chains are the same length, it is likely that it is the same chain.

        if (newChain.length <= this.chain.length){
            console.log('Received chain is not longer than the current chain');
            return;
        }
        else if(!this.isValidChain(newChain)){
            console.log('The received chain is not valid');
            return;
        }

        console.log('Replacing the blockchain with the new chain');
        this.chain = newChain;
    }
}

module.exports = Blockchain;