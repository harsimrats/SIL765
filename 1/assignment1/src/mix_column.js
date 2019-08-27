var subst = require("./substitution/gf_inverse.js");
var mult = subst.multiply;
var div = subst.divide;
const mx = subst.mx;

const MIX_COLUMN_MATRIX = [
    ['02', '03', '01', '01'],
    ['01', '02', '03', '01'],
    ['01', '01', '02', '03'],
    ['03', '01', '01', '02']
];

const INVERSE_MIX_COLUMN_MATRIX = [
    ['0E', '0B', '0D', '09'],
    ['09', '0E', '0B', '0D'],
    ['0D', '09', '0E', '0B'],
    ['0B', '0D', '09', '0E']
];

function transform(x) {
    var ans = [];
    for (let i = 0; i < x.length; i++) {
        ans.push([]);
        for (let j = 0; j < x[0].length; j++) {
            ans[i][j] = parseInt(x[i][j], 16);
        }
    }
    return ans;
}

//  a * b modulo mx
function multiply(a, b) {
    let p = mult(a, b);
    return div(p, parseInt(mx, 2)).r;
}


// x and y are 2d - number matrix of order m * n and n * p respectively.
function matrix_mult(x, y) {

    let m = x.length,
        n = x[0].length,
        p = y[0].length,
        q = y.length;

    if (m === 0 || q === 0)
        throw {
            name: 'Type Error',
            message: 'Input matrix should not be empty'
        };

    for (let i = 0; i < m - 1; i++) {
        if (x[i].length !== x[i + 1].length) {
            throw {
                name: 'TypeError',
                message: 'x is an invalid 2D matrix'
            };
        }
    }

    for (let i = 0; i < q - 1; i++) {
        if (y[i].length !== y[i + 1].length) {
            throw {
                name: 'TypeError',
                message: 'y is an invalid 2D matrix'
            };
        }
    }

    if (n !== q) {
        throw {
            name: "TypeError",
            message: "Invalid matrix dimensions for matrix multiplication."
        };
    }
    var ans = [];
    for (let i = 0; i < m; i++)
        ans.push([]);

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < p; j++) {
            sum = 0;
            for (let k = 0; k < n; k++)
                sum = sum ^ multiply(x[i][k], y[k][j]);
            ans[i][j] = sum;
        }
    }
    return ans;
}

// input, output  = number matrix 
function mixColumn(matrix) {
    var column_matrix = transform(MIX_COLUMN_MATRIX);
    return matrix_mult(column_matrix, matrix);
}

function inverseMixColumn(matrix) {
    var column_matrix = transform(INVERSE_MIX_COLUMN_MATRIX);
    return matrix_mult(column_matrix, matrix);
}

module.exports = {
    'mixColumn': mixColumn,
    'inverseMixColumn': inverseMixColumn
};