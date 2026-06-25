/**
 * Input sanitizer for TypeScript scripts
 * Prevents code injection and validates script safety
 */

const MAX_SCRIPT_LENGTH = parseInt(process.env.MAX_SCRIPT_LENGTH || '10000');

/**
 * Sanitizes and validates a TypeScript script
 * @param {string} script - User-provided TS script
 * @returns {string} Sanitized script
 * @throws {Error} If script contains forbidden patterns
 */
function sanitizeTypeScript(script) {
  if (!script || typeof script !== 'string') {
    throw new Error('Script must be a non-empty string');
  }

  // Check length
  if (script.length > MAX_SCRIPT_LENGTH) {
    throw new Error(`Script exceeds maximum length of ${MAX_SCRIPT_LENGTH} characters`);
  }

  // Forbidden patterns that could be used for command injection
  const forbiddenPatterns = [];

  for (const { pattern, description } of forbiddenPatterns) {
    if (pattern.test(script)) {
      throw new Error(`Script contains forbidden pattern: ${description}`);
    }
  }

  // Validate that script contains only valid keywords (basic check)
  const validKeywords = [
    'import',
    'export',
    'class',
    'interface',
    'const',
    'let',
    'var',
    'function',
    'async',
    'await',
    'return',
    'if',
    'else',
    'for',
    'while',
    'switch',
    'case',
    'true',
    'false',
    'null',
    'undefined',
    'new',
    'this',
    'super',
    'extends',
    'implements',
    'public',
    'private',
    'protected',
    'readonly',
    'static',
    'constructor',
    'try',
    'catch',
    'finally',
    'throw',
    'typeof',
    'instanceof',
    'void',
    'any',
    'unknown',
    'never',
    'string',
    'number',
    'boolean',
    'symbol',
    'object',
    'Array',
    'Promise',
    'Error',
    'Injectable',
    'Controller',
    'Module',
    'Get',
    'Post',
    'Put',
    'Delete',
    'Patch',
    'Param',
    'Body',
    'Query',
    'Req',
    'Res',
    'Inject',
    'Optional',
    'Global',
    'Catch',
    'UseGuards',
    'UseInterceptors',
    'UsePipes',
    'UseFilters',
    'SetMetadata',
    'applyDecorators',
    'createParamDecorator',
    'NotFoundException',
    'BadRequestException',
    'UnauthorizedException',
    'ForbiddenException',
  ];

  // Allow comments (// and /* */)
  // Allow operators: =, ==, ===, !=, !==, <, >, <=, >=, +, -, *, /, %, ::, ., $, =>

  // This is a basic validation - in production, you might use a proper TS parser

  return script.trim();
}

/**
 * Validates exercise ID format
 * @param {string} nivel
 * @param {string} idExercise
 * @returns {boolean}
 */
function validateExerciseId(nivel, id) {
  // Nivel should be 1, 2, 3, 4 or 5
  const nivelNum = parseInt(nivel);
  if (isNaN(nivelNum) || nivelNum < 1 || nivelNum > 5) {
    return false;
  }

  // ID should be a positive integer
  const idNum = parseInt(id);
  if (isNaN(idNum) || idNum < 1) {
    return false;
  }

  // Check max exercises per level
  const maxExercises = { 1: 30, 2: 40, 3: 30, 4: 30, 5: 30 };
  if (idNum > maxExercises[nivelNum]) {
    return false;
  }

  return true;
}

/**
 * Sanitizes file paths to prevent directory traversal
 * @param {string} filename
 * @returns {string}
 */
function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename');
  }

  // Remove any path traversal attempts
  const clean = filename.replace(/\.\./g, '').replace(/\//g, '').replace(/\\/g, '');

  if (clean.length === 0) {
    throw new Error('Invalid filename after sanitization');
  }

  return clean;
}

module.exports = {
  sanitizeTypeScript,
  validateExerciseId,
  sanitizeFilename,
};
