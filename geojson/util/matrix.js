function multiplyMatrices(A, B) {
    // Get the number of rows and columns of the matrices
    const rowsA = A.length;
    const colsA = A[0].length;

    const rowsB = B.length;
    const colsB = B[0].length;

    // Check if the matrices can be multiplied
    if (colsA !== rowsB) {
        throw new Error('Matrices cannot be multiplied');
    }

    // Initialize the result matrix with the appropriate dimensions
    const result = new Array(rowsA);
    for (let i = 0; i < rowsA; i++) {
        result[i] = new Array(colsB).fill(0); // Initialize the row with zeros
    }

    // Perform matrix multiplication
    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            for (let k = 0; k < colsA; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }

    return result;
}

export { multiplyMatrices };
