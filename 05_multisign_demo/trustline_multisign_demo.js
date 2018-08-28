const RippleAPI = require('ripple-lib').RippleAPI
const api       = new RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' }) // Public rippled test server

var _fee = 30000;
var sender='rPQyy4ANGomHRc85KtkcoHeA4kBTpFPP4t';
var signer1='rByr6P6LuQL9vvDBxXUmbeS33aHVvR5w62';
var signer2='rQrBB24u89fy4MHet4P6xBkBqxoZLZ2Rdn';
var signer3='rBQ8Ph1SfPtL9zxADTMC5yhphz8nr3XgtS';
var receiver='rGznxdNXBcLc1Z1EWaQaodKP2YgEdfwufD';

var senderSecret = 'shx2YEap3nq4CwWzMJB64L83WHoRE';
var signer1Secret = 'sn3k5Gsbf2m9hMCYA52ucxXWyhdoY';
var signer2Secret = 'spvapSmNLxoBosGdLcAjbbKAwQGtL';

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


var performTrustlineTransaction=function (currentSequence){
    console.log('=== START OF performTrustlineTransaction() FUNCTION ===');
    var trustSetTx={
        "TransactionType": "TrustSet",
        "Account": sender,
        "Flags": 262144,
        "LimitAmount": {
            "currency": "USD",
            "issuer": receiver,
            "value": "100"
        },
        "Sequence": currentSequence,
        "SigningPubKey": "",
        "Fee": "30000"
    }
    
    var trustsetTxJSON=JSON.stringify(trustSetTx)
    options = { signAs: signer1 }
    signed_tx2=api.sign(trustsetTxJSON,signer1Secret,options)
    options = { signAs: signer2 }
    signed_tx3=api.sign(trustsetTxJSON,signer2Secret,options)
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
          console.log('-- ERROR SUBMITTING performTrustlineTransaction TRANSACTION: ', e)
          process.exit(1)
        })
    
        console.log('=== END OF performTrustlineTransaction() FUNCTION ===');

        api.disconnect().then(() =>{
            console.log('=== DISCONNECTED FROM RIPPLE NETWORK ===');
          })
    
    }

 api.connect().then(() => {
   api.getAccountInfo(sender).then(function(accountInfo){
    currentSequence=accountInfo.sequence;
    setSignerList(currentSequence);
    currentSequence=currentSequence+1
    performTrustlineTransaction(currentSequence)
   })

   
    
  }).then(() => {
  }).catch(console.error)

  
  