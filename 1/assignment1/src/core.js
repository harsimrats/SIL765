var subst = require('./substitution/substitution_box.js');
var shiftRow = require('./shift_row.js');
var mixColumn = require('./mix_column.js');
var keyGenerator = require('./key_expansion.js');

function xorMatrix(a, b) {
    var n = a.length;
    var m = a[0].length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++)
            a[i][j] = a[i][j] ^ b[i][j];
    }
    return a;
}

function nonceGenerator(length) {
    var text = "";
    var possible = "abcdef0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// input = 128  bit hex string output = 128 bit hex string
function aesEncryption(input, key) {
    input = keyGenerator.hexToBinaryString(input);
    input = keyGenerator.stringToMatrix(input);
    
    input = temp(input);
    //console.log(input);
    var keyMatrix = keyGenerator.keyMatrix(key, 0);
    input = xorMatrix(input, keyMatrix);
    // console.log(input);
    for (let round = 1; round <= 10; round++) {
        input = subst.substitution(input);
        // console.log("After Substitution",input,"\n");
        input = shiftRow.shiftRow(input);
        // console.log("After Shift Row",input,"\n");
        if (round != 10)
            input = mixColumn.mixColumn(input);
        //console.log("After mix column", input, "\n");
        keyMatrix = keyGenerator.keyMatrix(key, round);
        // console.log(keyMatrix);
        input = xorMatrix(input, keyMatrix);
        // console.log("After xor", input);
        //console.log();
    }
    return input;
}

function aesDecryption(input, key) {
    // input = keyGenerator.hexToBinaryString(input);
    // input = keyGenerator.stringToMatrix(input);
    // input = input.map(function (x) {
    //     x = x.map(x => parseInt(x, 2));
    // });
    var keyMatrix = keyGenerator.keyMatrix(key, 10);
    input = xorMatrix(input, keyMatrix);
    console.log(input);
    for (let round = 1; round <= 10; round++) {
        input = shiftRow.inverseShiftRow(input);
        console.log("After inverse shift row", input, "\n");
        input = subst.inverseSubstitution(input);
        console.log("After inverse substitution", input, "\n");
        keyMatrix = keyGenerator.keyMatrix(key, 10 - round);
        input = xorMatrix(input, keyMatrix);
        console.log("After xor", input, "\n");
        if (round != 10)
            input = mixColumn.inverseMixColumn(input);
        console.log("after mix column", input, "\n");
        console.log();
    }
    return input;
}

// function encryption(plaintext, key){
// 	let ciphertext = plaintext xor aesEncryption(ctrlblck,key)
// 	ctrlblck = ctrlblck + 1;
// 	return ciphertext;
// }

// function decryption(ciphertext, key){
// 	let ciphertext = plaintext xor aesEncryption(ctrlblck)
// 	ctrlblck = ctrlblck + 1
// }

function temp(input){
return input.map(function (x) {
        x = x.map(x => parseInt(x, 2));
        return x;
    });
}

var key = "0abcdef1234567890abcdef123456789";
var plaintext = "0abc12f1a34567890abcdef123422789";
var nounce = nonceGenerator(8);
var iv = nonceGenerator(16);
var ctrlblck = nounce.concat(iv, "11111111");
console.log(ctrlblck);
var en = (aesEncryption(ctrlblck, key));
var temp1 = keyGenerator.stringToMatrix(keyGenerator.hexToBinaryString(plaintext));
var cipher = xorMatrix(en, temp(temp1));
cipher = keyGenerator.matrixToString(cipher);
console.log(cipher);
console.log("---------------------------------");
en = (aesEncryption(ctrlblck, key));
pt = xorMatrix(en, cipher);
pt = keyGenerator.matrixToString(pt);
console.log(pt);