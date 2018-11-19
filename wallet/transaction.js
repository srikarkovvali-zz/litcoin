const ChainUtil = require('../chain.util');
const { MINING_REWARD } = require('../config');

class Transaction {
    constructor(){
        this.id = ChainUtil.id();
        this.input = null;              //skeleton of transaction class
        this.outputs = [];
    }

    //delivers more of the senders currency
    update(senderWallet, recipient, amount){
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);

        if (amount > senderOutput){
            console.log(`Amount: ${amount} exceeds balance`); //back ticks signify it's a variable
            return;
        }

        senderOutput.amount = senderOutput.amount - amount; //senders new amount is the amount minus what they sent out
        this.outputs.push({amount, address: recipient});
        Transaction.signTransaction(this, senderWallet); //this refers to the current transaction instance

        return this;
    }

    static transactionWithOutputs(senderWallet, outputs){
        const transaction = new this();
        transaction.outputs.push(...outputs);
        Transaction.signTransaction(transaction, senderWallet);
        return transaction;
    }

    //return a new instance of this class
    static newTransaction(senderWallet, recipient, amount ) {

        if (amount > senderWallet.balance) {
            console.log(`Amount: ${amount} exceeds balance.`); //preliminary checks
            return; //return and escape
        }
        ///...is the spread operator
        return Transaction.transactionWithOutputs(senderWallet,[
            {amount: senderWallet.balance - amount, address: senderWallet.publicKey},
            {amount, address: recipient}
        ] );
    }

    static signTransaction(transaction, senderWallet){
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
        }
    }

    static rewardTransaction(minerWallet, blockchainWallet){
        return Transaction.transactionWithOutputs(blockchainWallet, [(
            amount: MINING_REWARD,address: minerWallet.publicKey
        )]);
    }

    //pass the transaction we want to verify into the method and return
    static verifyTransaction(transaction){
        return ChainUtil.verifySignature(
            transaction.input.address,
            transaction.input.signature,
            ChainUtil.hash(transaction.outputs)
        );
    }
}
module.exports = Transaction;