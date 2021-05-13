const crypto = require("crypto");

//Selection of the encrypting/decrypting algorithm
const algorithm = 'aes256';
//Secret Key for the algorith
const secretKey = process.env.secretKey;
//Initialization Vector for the Cipher
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
    //create a cipher
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    //Encrypt the text with the created cypher
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    //return content and initialization vector
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = (hash, iv) => {
    //create a decipher
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
    //decrypt the given hash with the IV
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
    //return the deciphered text
    return decrpyted.toString();
};

//export both functions
module.exports = {
    encrypt,
    decrypt
};