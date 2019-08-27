function rotateRight(arr , i){
    ans = [];
    for(var j = 0;j < arr.length; j++){
        ans[(j+i) % arr.length] = arr[j];
    }
    return ans;
}

function rotateLeft(arr , i){
    ans = [];
    for(var j = 0;j < arr.length; j++){
        ans[(j - i +arr.length) % arr.length] = arr[j];
    }
    return ans;
}

function shiftRow(matrix){
    for(var i = 0;i < matrix.length; i++){
        matrix[i] = rotateLeft(matrix[i] , i);
    }
    return matrix;
}

function inverseShiftRow(matrix){
    for(var i = 0;i < matrix.length; i++){
        matrix[i] = rotateRight(matrix[i] , i);
    }
    return matrix;
}

module.exports = {
    'shiftRow'  : shiftRow,
    'inverseShiftRow' : inverseShiftRow,
    'rotateLeft' : rotateLeft
};