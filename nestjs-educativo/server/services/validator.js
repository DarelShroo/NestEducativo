/**
 * Output validator - compares user script output with expected output
 */

/**
 * Normalizes output by removing extra whitespace and standardizing format
 * @param {string} output 
 * @returns {string}
 */
function normalizeOutput(output) {
    if (!output) return '';

    return output
        .trim()
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .replace(/\( /g, '(') // Remove space after (
        .replace(/ \)/g, ')') // Remove space before )
        .replace(/ ,/g, ',') // Remove space before comma
        .toLowerCase(); // Case insensitive comparison
}

/**
 * Extracts actual data output from TS's verbose output
 * @param {string} tsOutput 
 * @returns {string}
 */
function extractDataOutput(tsOutput) {
    if (!tsOutput) return '';

    const lines = tsOutput.split('\n');
    const dataLines = [];

    let inDataSection = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip metadata lines
        if (trimmed.startsWith('grunt>') ||
            trimmed.startsWith('INFO') ||
            trimmed.startsWith('WARN') ||
            trimmed.startsWith('DEBUG') ||
            trimmed.match(/^\d{4}-\d{2}-\d{2}/) || // Timestamp lines
            trimmed.includes('mapreduce') ||
            trimmed.includes('node') ||
            trimmed.includes('Input(s):') ||
            trimmed.includes('Output(s):') ||
            trimmed.includes('Counters:') ||
            trimmed.length === 0) {
            continue;
        }

        // Capture data lines (tuples)
        if (trimmed.startsWith('(') || inDataSection) {
            dataLines.push(trimmed);
            inDataSection = true;
        }
    }

    return dataLines.join('\n');
}

/**
 * Compares user output with expected output
 * @param {string} userOutput - Raw output from user's TS script
 * @param {string} expectedOutput - Expected output content
 * @param {string} comparisonType - 'exact', 'set', or 'fuzzy'
 * @returns {{match: boolean, similarity: number}}
 */
function compareOutputs(userOutput, expectedOutput, comparisonType = 'fuzzy') {
    // Extract actual data from TS's verbose output
    const userData = extractDataOutput(userOutput);
    const expectedData = expectedOutput.trim();

    // Normalize both outputs
    const normalizedUser = normalizeOutput(userData);
    const normalizedExpected = normalizeOutput(expectedData);

    if (comparisonType === 'exact') {
        return {
            match: normalizedUser === normalizedExpected,
            similarity: normalizedUser === normalizedExpected ? 100 : 0
        };
    }

    if (comparisonType === 'set') {
        // Compare as unordered sets (for queries where order doesn't matter)
        const userSet = new Set(userData.split('\n').map(l => normalizeOutput(l)));
        const expectedSet = new Set(expectedData.split('\n').map(l => normalizeOutput(l)));

        if (userSet.size !== expectedSet.size) {
            return { match: false, similarity: 0 };
        }

        for (const item of expectedSet) {
            if (!userSet.has(item)) {
                return { match: false, similarity: 0 };
            }
        }

        return { match: true, similarity: 100 };
    }

    // Fuzzy comparison (default): allow minor differences
    const similarity = calculateSimilarity(normalizedUser, normalizedExpected);

    // Consider match if >= 95% similar
    return {
        match: similarity >= 95,
        similarity: Math.round(similarity)
    };
}

/**
 * Calculates similarity percentage between two strings
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number} Similarity percentage (0-100)
 */
function calculateSimilarity(str1, str2) {
    if (str1 === str2) return 100;
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 100;

    const editDistance = levenshteinDistance(str1, str2);
    return ((longer.length - editDistance) / longer.length) * 100;
}

/**
 * Calculates Levenshtein distance between two strings
 * @param {string} str1 
 * @param {string} str2 
 * @returns {number}
 */
function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

/**
 * Analyzes error messages and provides helpful suggestions
 * @param {string} stderr - Error output
 * @returns {string[]} Array of suggestions
 */
function analyzeTSErrors(stderr) {
    const suggestions = [];

    if (!stderr) return suggestions;

    const lowerError = stderr.toLowerCase();

    // Common error patterns
    if (lowerError.includes('syntax error') || lowerError.includes('mismatched input')) {
        suggestions.push('Revisa la sintaxis de tu script. Asegúrate de que todas las declaraciones terminen con punto y coma.');
    }

    if (lowerError.includes('cannot resolve')) {
        suggestions.push('Verifica que los nombres de campos sean correctos y coincidan con el esquema definido en LOAD.');
    }

    if (lowerError.includes('incompatible types')) {
        suggestions.push('Hay un problema de tipos de datos. Verifica que estés usando operadorescompatibles con los tipos de datos.');
    }

    if (lowerError.includes('file does not exist') || lowerError.includes('input path does not exist')) {
        suggestions.push('El archivo de datos no se encuentra. Verifica la ruta en la declaración LOAD.');
    }

    if (lowerError.includes('unable to open iterator')) {
        suggestions.push('Puede haber un problema con la estructura de datos. Verifica que estés usando GROUP o JOIN correctamente.');
    }

    if (lowerError.includes('scalar has more than one row')) {
        suggestions.push('Estás intentando usar un resultado que devuelve múltiples filas como si fuera un solo valor.');
    }

    if (suggestions.length === 0 && stderr.length > 0) {
        suggestions.push('Revisa el mensaje de error completo. Los errores suelen indicar la línea problemática.');
    }

    return suggestions;
}

module.exports = {
    compareOutputs,
    extractDataOutput,
    normalizeOutput,
    analyzeTSErrors
};
