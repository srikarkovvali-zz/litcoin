const Transaction = require('../wallet/transaction');

class TransactionPool{
    constructor(){
        this.transactions = []; //collection of transactions
    }

    updateOrAddTransaction(transaction){
        let transactionWithId = this.transactions.find(t => t.id === transaction.id);

        if (transactionWithId){
            this.transactions[this.transactions.indexOf(transactionWithId)] = transaction; //change element in array
        }

        else {
            this.transactions.push(transaction); //add to the transaction pool
        }
    }
    existingTransaction(address){
        return this.transactions.find(t => t.input.address === address);
    }
    validTransaction(){
        return this.transactions.filter(transaction => {
           const outputTotal = transaction.outputs.reduce((total,output) =>{
               return total +output.amount;
            });
        }, 0);

        if(transaction.input.amount !== outputTotal){
            console.log(`Invalid transaction from ${transaction.input.address}.`);
            return;
        }
        if (!Transaction.verifyTransaction(transaction)) {
            console.log(`Invalid signature from ${transaction.input.address}.`);
            return;
        }
    }
    validTransactions(){
        return this.transactions.filter(transaction => {
            const outputTotal = transaction.outputs.reduce((total,output) => {
               return total+output.amount;
            }, 0);

            if(transaction.input.amount!== outputTotal){
                console.log(`Invalid transaction from ${transaction.input.address}.`);
                return;
            }
            if(!Transaction.verifyTransaction(transaction)){
                console.log(`Invalid signature from ${transaction.input.address}.`);
                return;
            }
            return transaction;
        });
    }
}
module.exports = TransactionPool;