var rotateLeft = require('./shift_row.js').rotateLeft;
var subst = require('./substitution/substitution_box.js');
var divide = require('./substitution/gf_inverse.js').divide;

const mx = require("./substitution/gf_inverse.js").mx;

function hexToBinaryString(str, n) {
    function hexDigitToString(h) {
        var byteString = "0000" + parseInt(h, 16).toString(2);
        return byteString.substr(byteString.length - 4, 4);
    }

    var prefix = "";
    for (let i = 0; i < n; i++)
        prefix += "0";
    str = prefix + str;
    str = str.substr(str.length - n, n);

    var ans = "";
    for (let i = 0; i < str.length; i++)
        ans = ans + hexDigitToString(str[i]);
    return ans;
}

// 128-bit string to 4 * 4 byte(string) matrix.
function stringToMatrix(x) {
    var ans = [];
    for (let i = 0; i < 4; i++)
        ans.push([]);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++)
            ans[i][j] = x.substr(j * 32 + i * 8, 8);
    }
    return ans;
}

function matrixToString(mat) {
    var ans = "";
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++)
             ans += mat[j][i].toString(16);
    }
    return ans;
}

// byte(string) matrix to w0, w1 ,w2 ,w3 - bytes(string)
function matrixToWs(mat) {
    var w = [];
    for (let i = 0; i < 4; i++) {
        w.push("");
        for (let j = 0; j < 4; j++)
            w[i] = w[i] + (mat[j][i]);
    }
    return w;
}

// w = [w0,w1,w2,w3] wi = 32 bit binary string output = 4 * 4 byte(Number) matrix.
function wsToMatrix(w) {
    var ans = [];
    for (let i = 0; i < 4; i++) {
        ans.push([]);
        for (let j = 0; j < 4; j++) {
            ans[i].push(parseInt(w[j].substr(8 * i, 8), 2));
        }
    }
    return ans;
}

// XOR function w1,w2,output = 32 bit string
function xor(w1, w2) {
    var w = [];
    for (let i = 0; i < 32; i++)
        w[i] = w1[i] ^ w2[i];
    // var w = "00000000000000000000000000000000" + (parseInt(w1, 2) ^ parseInt(w2, 2)).toString(2);
    w = w.join("");
    // console.log("hurray", w);
    return w;
}

function getW(w) {
    for (let i = 4; i <= 40; i += 4) {
        // console.log(i/4, gBox(w[i-1], (i/4)));
        w[i] = xor(gBox(w[i - 1], (i / 4)), w[i - 4]);
        w[i + 1] = xor(w[i], w[i - 3]);
        w[i + 2] = xor(w[i + 1], w[i - 2]);
        w[i + 3] = xor(w[i + 2], w[i - 1]);
    }
    return w;
}

// Key matrix for a given round  Input = 128 bit hex string Output = 4 * 4 byte matrix(Number)
function keyMatrix(key, round) {
    key = hexToBinaryString(key);
    // console.log(key);
    matrix = stringToMatrix(key); // 4 * 4 byte(string) array
    // console.log(matrix);
    w = matrixToWs(matrix); // w is 32 bits string array.
    // console.log(w);
    w = getW(w);
    // console.log("yeah",w);
    w = [w[0 + 4 * round], w[1 + 4 * round], w[2 + 4 * round], w[3 + 4 * round]];
    // console.log(w);
    return (wsToMatrix(w));
}

// Input(w) = String(32 bits) Output = String(32 bits)
function gBox(w, round) {
    function stringToByte(w) {
        var temp = [];
        for (let i = 0; i < 4; i++)
            temp.push(w.substr(i * 8, 8));
        temp = temp.map(x => parseInt(x, 2));
        return temp;
    }
    w = stringToByte(w);
    w = rotateLeft(w, 1);
    for (let i = 0; i < 4; i++)
        w[i] = subst.sbox(w[i].toString(16));
    w = w.map(x => parseInt(x, 16));
    w[0] = w[0] ^ rc(round);
    w = w.map(function (x) {
        x = "00000000" + x.toString(2);
        return x.substr(x.length - 8, 8);
    });
    // console.log(round,"yoo", w);
    return w.join('');
}

function rc(j) {
    return divide(Math.pow(2, j - 1), parseInt(mx, 2)).r;
}

// var k = "10011011101010111000101111111011";
// console.log(gBox(k, 1));
var key = "0abcdef1234567890abcdef123456789";
// console.log(keyMatrix(key, 4));

module.exports = {
    "hexToBinaryString": hexToBinaryString,
    "stringToMatrix": stringToMatrix,
    "keyMatrix": keyMatrix,
    "matrixToString": matrixToString
};