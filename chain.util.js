const EC = require('elliptic').ec; //elliptic const for elliptic curve
const SHA256 = require('crypto-js/sha256');
const ec = new EC('secp256k1'); //same one bitcoin uses (Standards of efficient cryptography) k for koblids - 1st implementation of curve
const uuidV1 = require('uuid/v1');
class ChainUtil {

    static genKeyPair(){
        return ec.genKeyPair();
    }

    static id(){
        return uuidV1();
    }

    //takes data stringifys it and passes it into sha256 and returns the result -- used within block.js
    static hash(data){
       return  SHA256(JSON.stringify(data)).toString(); //generates a hash of whatever type of data that comes in
    }

    static verifySignature(publicKey, signature, dataHash){
        return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature); //decoded with the hex verification

    }
}
module.exports = ChainUtil;
