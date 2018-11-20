const TransactionPool = require ('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe ('TransactionPool', () => {
   let tp, wallet, transaction, bc;

   beforeEach(() => {
       tp = new TransactionPool(); //new transaction pool
       wallet = new Wallet(); //new wallet
       bc = new Blockchain();
       transaction = wallet.createTransaction('r4nd-4d355',30, bc, tp);
   });

   it('adds a transaction to the pool', () => {
       expect (tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
   });

   //goal is to check whether a pool updates when it receives an identical id.
   it('updates a transaction in the pool', () => {
        const oldTransaction = JSON.stringify(transaction);
        const newTransaction = transaction.update(wallet, 'foo-4ddr55', 40);
        tp.updateOrAddTransaction(newTransaction);

        expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id))).not.toEqual(oldTransaction);
   });

   it('clears transactions', ()=>{
        tp.clear();
        expect(tp.transactions).toEqual([]);
   });

   describe('mixing valid and corrupt transactions', ()=> {
      let validTransactions;

      beforeEach(() =>{
          validTransactions = [...tp.transactions]; //adds one element at a time to array
          for (let i =0 ; i<6 ; i++){
              wallet = new Wallet();
              transaction = wallet.createTransaction('r4nd-4dr355', 30, bc, tp);
              if (i%2 ==0){
                  transaction.input.amount= 99999; //corrupt
              }
              else{
                  validTransactions.push(transaction); //push the valid ones to the array
              }
          }
      });

      it ('shows a difference between valid and corrupt transactions', ()=>{
         expect (JSON.stringify(tp.transaction)).not.toEqual(JSON.stringify(validTransactions));
      });

      it('grabs valid transactions', ()=>{
          expect(tp.validTransactions()).toEqual(validTransactions);
      })
   });
});