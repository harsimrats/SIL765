/*
    Calculation of inverse of a 8 bit number in GF(2^8)
*/

const mx = "100011011";


//Degree of Polynomial x(binary number)
function degree(x) {
    return x.toString(2).length - 1;
}

// Multiplication of a(Number) ,b(Number) polynomial(binary numbers)
function multiply(x, y) {
    var a = x.toString(2);
    var b = y.toString(2);
    var ans = 0;
    for (var i = 0; i < b.length; i++) {
        if (b[i] === '1')
            ans = ans ^ parseInt(a, 2);
        if (i !== b.length - 1)
            ans = ans << 1;
    }
    return ans;
}

// Polynomial a(Number) / Polynomial b(Number)
// r = remainder q = quotient
function divide(a, b) {
    q = [];
    for (let i = 0; i < 10; i++)
        q.push('0');
    if (degree(a) < degree(b))
        return {
            r: a,
            q: 0
        };
    while (degree(a) >= degree(b)) {
        var count = 0;
        var d = b;
        while (degree(d) < degree(a)) {
            d = d << 1;
            count++;
        }
        r = d ^ a;
        q[count] = '1';
        if (r == 0 || degree(r) < degree(b))
            return {
                "r": r,
                "q": parseInt((q.reverse().join('')), 2)
            };
        a = r;
    }
    return null;
}

// inverse of a polynomial(Number) with irreducible polynomial m(x) = 
function inverse(b) {
    if (b == 0)
        return 0;
    var a = parseInt(mx, 2);
    var r0 = a,
        r1 = b,
        r2, v0 = 1,
        v1 = 0,
        v2, w0 = 0,
        w1 = 1,
        w2;
    while (true) {
        var result = divide(r0, r1);
        r2 = result.r;
        if (r2 === 0)
            return w1;
        q = result.q;
        v2 = v0 ^ multiply(q, v1);
        w2 = w0 ^ multiply(q, w1);
        // console.log( q, r2, v2, w2);
        r0 = r1;
        r1 = r2;
        w0 = w1;
        w1 = w2;
        v0 = v1;
        v1 = v2;
    }
    return null;
}
// console.log(divide(256 ,parseInt(mx ,2)));

module.exports = {
    'inverse': inverse,
    'multiply': multiply,
    'divide': divide,
    'mx':mx
};