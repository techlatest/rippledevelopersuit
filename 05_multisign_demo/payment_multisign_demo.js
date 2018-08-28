const RippleAPI = require('ripple-lib').RippleAPI
const api       = new RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' }) // Public rippled test server

var _fee = 30000;
var sender='r4Be8or2UwHk7rR7UtXTSN33vAgUQkwyrG';
var signer1='rEyWnugwXCLuBda8hsR8GjWbyCACT7kaB7';
var signer2='rLjU8YFhxgyrFrw9iUVzfDxBqQ6CpspFoy';
var signer3='r4gWgUjX57qKBSHCvTNSaXRL4VAWoG5DFi';
var receiver='ryrwZttansnmUiQYPHFFiZ9JjPm2aA5m2';

var senderSecret = 'sn7q8jTvqBbD5h5LgKvQRM2DY9pVx';
var signer1Secret = 'sskYezHev6BRQDapkMY1xVit4NVcE';
var signer2Secret = 'sh6rgpp9BUjGDdPkPaPWwhARBhKQa';

var xrpAmount = 99;

var setSignerList=function (currentSequence){
console.log('=== START OF setSignerList() FUNCTION ===');
var signerListSetTransaction = {
     "Flags": 0,
     "TransactionType": "SignerListSet",
     "Account": sender,
     "SignerQuorum": 3,
     "Fee" : "10000",
     "Sequence" : currentSequence,
     "SignerEntries": [
         {
             "SignerEntry": {
                 "Account": signer1,
                 "SignerWeight": 2
             }
         },
         {
             "SignerEntry": {
                 "Account": signer2,
                 "SignerWeight": 1
             }
         },
         {
             "SignerEntry": {
                 "Account": signer3,
                 "SignerWeight": 1
             }
         }
     ]
 };

    var signerListSetTxJSON = JSON.stringify(signerListSetTransaction)
    signed_tx = api.sign(signerListSetTxJSON, senderSecret)
    console.log('-------- Signed TX ID : --------', signed_tx.id)
    console.log('-------- SUBMITTING signerListSet TRANSACTION --------')
    api.submit(signed_tx.signedTransaction).then(function(tx_data){
      console.log(tx_data)

      console.log('   >>  Result: ', tx_data.resultCode)
      console.log('   >>  Message: ', tx_data.resultMessage)
    }).catch(function(e){
      console.log('-- ERROR SUBMITTING SignerListSet TRANSACTION: ', e)
      process.exit(1)
    })

    console.log('=== END OF setSignerList() FUNCTION ===');

}


var performPaymentTransaction=function (currentSequence){
    console.log('=== START OF performPaymentTransaction() FUNCTION ===');
    var paymentTransaction = {
        "TransactionType" : "Payment",
        "Account" : sender,
        "Fee" : _fee+"",
        "Destination" : receiver,
        "DestinationTag" : "111",
        "Amount" : (xrpAmount*1000*1000)+"",
        "Sequence" : currentSequence
     }
    
    var paymentTxJSON=JSON.stringify(paymentTransaction)
    options = { signAs: signer1 }
    signed_tx2=api.sign(paymentTxJSON,signer1Secret,options)
    options = { signAs: signer2 }
    signed_tx3=api.sign(paymentTxJSON,signer2Secret,options)
    signedTxns=[]
    signedTxns.push(signed_tx2.signedTransaction)
    signedTxns.push(signed_tx3.signedTransaction)
    combineTxns=api.combine(signedTxns)   
     
     
    console.log('-------- COMBINED SIGNED TX : --------', combineTxns)
    console.log('-------- SUBMITTING Multisigned TRANSACTION --------')
    api.submit(combineTxns.signedTransaction).then(function(tx_data){
        console.log(tx_data)
        console.log('   >>  Result: ', tx_data.resultCode)
        console.log('   >>  Message: ', tx_data.resultMessage)
        }).catch(function(e){
          console.log('-- ERROR SUBMITTING performPaymentTransaction TRANSACTION: ', e)
          process.exit(1)
        })
    
        console.log('=== END OF performPaymentTransaction() FUNCTION ===');

        api.disconnect().then(() =>{
            console.log('=== DISCONNECTED FROM RIPPLE NETWORK ===');
          })
    
    }

 api.connect().then(() => {
   api.getAccountInfo(sender).then(function(accountInfo){
    currentSequence=accountInfo.sequence;
    setSignerList(currentSequence);
    currentSequence=currentSequence+1
    performPaymentTransaction(currentSequence)
   })

   
    
  }).then(() => {
  }).catch(console.error)

  
  