var inv = require('./gf_inverse.js').inverse;

function rotateRight(str) {
    var ans = [];
    for (let i = 0; i < str.length - 1; i++) {
        ans[i + 1] = str[i];
    }
    ans[0] = str[str.length - 1];
    return ans.join('');
}

function reverseString(str) {
    var ans = [];
    for (let i = 0; i < str.length; i++) {
        ans[i] = str[str.length - i - 1];
    }
    return ans.join('');
}

// sbox substitution Input = byte(hex string) Output = byte(hex string) 
function sbox(hex) {
    var c1 = "10001111";
    const c2 = "11000110";
    var col = inv(parseInt(hex, 16)).toString(2);
    col = ("00000000" + col);
    col = reverseString(col.substr(col.length - 8, 8));
    var ans = [];

    for (let i = 0; i < 8; i++) {
        var sum = 0;
        for (let j = 0; j < 8; j++)
            sum = (col[j] * c1[j]) ^ sum;
        ans[i] = sum ^ c2[i];
        c1 = rotateRight(c1);
    }
    ans = reverseString(ans.join(''));
    return parseInt(ans, 2).toString(16);
}

// matrix substitution input,output = 4 * 4 byte matrix(numbers) 
function substitution(matrix){
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++){
            matrix[i][j] = sbox(matrix[i][j].toString(16));
            matrix[i][j] = parseInt(matrix[i][j],16);
        }
    }
    return matrix;
}

function inverseSubstitution(matrix){
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++){
            matrix[i][j] = inverseSbox(matrix[i][j].toString(16));
            matrix[i][j] = parseInt(matrix[i][j],16);
        }
    }
    return matrix;
}

// inverse sbox substitution of hex(string)
function inverseSbox(hex) {
    var c1 = "00100101";
    const c2 = "10100000";
    col = reverseString(parseInt(hex, 16).toString(2));
    // console.log(col);
    var ans = [];

    for (let i = 0; i < 8; i++) {
        var sum = 0;
        for (let j = 0; j < 8; j++)
            sum = (col[j] * c1[j]) ^ sum;
        ans[i] = sum ^ c2[i];
        c1 = rotateRight(c1);
    }

    ans = reverseString(ans.join(''));
    ans = inv(parseInt(ans, 2));
    return ans.toString(16);
}

// console.log(sbox('00'));
// console.log(inverseSbox('63'));

module.exports = {
    'sbox': sbox,
    'inverseSbox': inverseSbox,
    'substitution': substitution,
    'inverseSubstitution' : inverseSubstitution
};