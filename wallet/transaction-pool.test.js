const TransactionPool = require ('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');

describe ('TransactionPool', () => {
   let tp, wallet, transaction;
   beforeEach(() => {
       tp = new TransactionPool(); //new transaction pool
       wallet = new Wallet(); //new wallet
       transaction = wallet.createTransaction('r4nd-4d355',30,tp);
   });

   it('adds a transaction to the pool', () => {
       expect (tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
   });

   //goal is to check whether a pool updates when it receives an identical id.
   it('updates a transaction in the pool', () => {
        const oldTransaction = JSON.stringify(transaction);
        const newTransaction = transaction.update(wallet, 'foo-4ddr55, 40');
        tp.updateOrAddTransaction(newTransaction);

        expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id))).not.toEqual(oldTransaction);
   });

   describe('mixing valid and corrupt transactions', ()=> {
      let validTransations;

      beforeEach(() =>{
          validTransations = [...tp.transactions]; //adds one element at a time to array
          for (let i =0 ; i<6 ; i++){
              wallet = new Wallet();
              transaction = wallet.createTransaction('r4nd-4dr355', 30, tp);
              if (i%2==0){
                  transaction.input.amount= 99999; //corrupt
              }
              else{
                  validTransations.push(transaction); //push the valid ones to the array
              }
          }
      });

      it ('shows a difference between valid and corrupt transactions', ()=>{
         expect (JSON.stringify(tp.transaction)).not.toEqual(JSON.stringify(validTransations));
      });

      it('grabs valid transactions', ()=>{
          expect(tp.validTransactions()).toEqual(validTransations);
      })
   });
});