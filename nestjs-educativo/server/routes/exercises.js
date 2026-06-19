const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const dockerExecutor = require('../services/dockerExecutor');
const validator = require('../services/validator');
const sanitizer = require('../utils/sanitizer');
const logger = require('../utils/logger');

// Base path for exercises
const EXERCISES_BASE = path.join(__dirname, '../../exercises');

/**
 * Helper to load exercise data for a level
 */
async function loadExercises(nivel) {
    const nivelMap = {
        1: 'nivel_1_typescript_intro'
    };

    const nivelDir = nivelMap[nivel];
    if (!nivelDir) {
        throw new Error('Invalid nivel');
    }

    const exercisesPath = path.join(EXERCISES_BASE, nivelDir, 'exercises.json');
    const content = await fs.readFile(exercisesPath, 'utf-8');
    return JSON.parse(content);
}

/**
 * Helper to load README for a level
 */
async function loadReadme(nivel) {
    const nivelMap = {
        1: 'nivel_1_typescript_intro'
    };

    const nivelDir = nivelMap[nivel];
    const readmePath = path.join(EXERCISES_BASE, nivelDir, 'README.md');
    return await fs.readFile(readmePath, 'utf-8');
}

/**
 * GET /api/status
 * Check server and Docker container status
 */
router.get('/status', async (req, res) => {
    try {
        const containerStatus = await dockerExecutor.getContainerStatus();

        res.json({
            server: 'running',
            docker: containerStatus
        });
    } catch (error) {
        logger.error('Error checking status:', error);
        res.status(500).json({ error: 'Failed to check status' });
    }
});

/**
 * GET /api/nivel/:nivel
 * Get level information (README content)
 */
router.get('/nivel/:nivel', async (req, res) => {
    try {
        const nivel = parseInt(req.params.nivel);

        if (!nivel || nivel < 1 || nivel > 3) {
            return res.status(400).json({ error: 'Invalid level. Must be 1, 2, or 3.' });
        }

        const readme = await loadReadme(nivel);

        res.json({
            nivel,
            readme
        });

    } catch (error) {
        logger.error(`Error loading level ${req.params.nivel}:`, error);
        res.status(500).json({ error: 'Failed to load level information' });
    }
});

/**
 * GET /api/nivel/:nivel/ejercicios
 * Get list of exercises for a level
 */
router.get('/nivel/:nivel/ejercicios', async (req, res) => {
    try {
        const nivel = parseInt(req.params.nivel);

        if (!nivel || nivel < 1 || nivel > 3) {
            return res.status(400).json({ error: 'Invalid level. Must be 1, 2, or 3.' });
        }

        const exercises = await loadExercises(nivel);

        // Return summary (without full script content)
        const summary = exercises.map(ex => ({
            id: ex.id,
            title_es: ex.title_es,
            title_en: ex.title_en,
            difficulty: ex.difficulty,
            concepts: ex.concepts
        }));

        res.json({
            nivel,
            total: summary.length,
            exercises: summary
        });

    } catch (error) {
        logger.error(`Error loading exercises for level ${req.params.nivel}:`, error);
        res.status(500).json({ error: 'Failed to load exercises' });
    }
});

/**
 * GET /api/nivel/:nivel/ejercicio/:id
 * Get details for a specific exercise
 */
router.get('/nivel/:nivel/ejercicio/:id', async (req, res) => {
    try {
        const nivel = parseInt(req.params.nivel);
        const id = parseInt(req.params.id);

        if (!sanitizer.validateExerciseId(nivel, id)) {
            return res.status(400).json({ error: 'Invalid exercise ID' });
        }

        const exercises = await loadExercises(nivel);
        const exercise = exercises.find(ex => ex.id === id);

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        // Return full exercise details (excluding expected output file path)
        const { expected_output_file, ...exerciseData } = exercise;

        res.json({
            nivel,
            ...exerciseData
        });

    } catch (error) {
        logger.error(`Error loading exercise ${req.params.nivel}/${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to load exercise' });
    }
});

/**
 * POST /api/nivel/:nivel/ejercicio/:id/validar
 * Validate user's TypeScript script
 */
router.post('/nivel/:nivel/ejercicio/:id/validar', async (req, res) => {
    try {
        const nivel = parseInt(req.params.nivel);
        const id = parseInt(req.params.id);
        const { script } = req.body;

        // Validate inputs
        if (!sanitizer.validateExerciseId(nivel, id)) {
            return res.status(400).json({ error: 'Invalid exercise ID' });
        }

        if (!script || typeof script !== 'string') {
            return res.status(400).json({ error: 'Script is required' });
        }

        // Check Docker container
        const isRunning = await dockerExecutor.checkDockerContainer();
        if (!isRunning) {
            return res.status(503).json({
                error: 'Docker container is not running. Please start it with: docker-compose up -d',
                correcto: false
            });
        }

        // Sanitize script
        let sanitizedScript;
        try {
            sanitizedScript = sanitizer.sanitizeTypeScript(script);
        } catch (sanitizeError) {
            return res.status(400).json({
                error: sanitizeError.message,
                correcto: false
            });
        }

        logger.info(`Validating exercise ${nivel}/${id}`);

        // Load expected output and tests
        const exercises = await loadExercises(nivel);
        const exercise = exercises.find(ex => ex.id === id);

        // Execute script in Docker
        const { stdout, stderr, exitCode } = await dockerExecutor.executeScript(
            sanitizedScript,
            `${nivel}_${id}`,
            exercise?.test_script
        );

        logger.debug(`Execution output length: ${stdout.length}, stderr length: ${stderr.length}`);



        let expectedOutput = '';
        let comparisonResult = null;

        if (exercise && exercise.expected_output_file) {
            const nivelMap = {
                1: 'nivel_1_typescript_intro'
            };

            const outputPath = path.join(
                EXERCISES_BASE,
                nivelMap[nivel],
                'expected_outputs',
                exercise.expected_output_file
            );

            try {
                expectedOutput = await fs.readFile(outputPath, 'utf-8');
                comparisonResult = validator.compareOutputs(stdout, expectedOutput, 'fuzzy');
            } catch (readError) {
                logger.warn(`Expected output file not found for ${nivel}/${id}, skipping output comparison`);
                // If no expected output, check if script executed successfully
                // TS writes actual errors with specific patterns
                const combinedOutput = stdout + '\n' + stderr;
                comparisonResult = {
                    match: exitCode === 0,
                    similarity: -1 // Indicates no comparison available
                };
            }
        } else {
            // No expected output defined - check for execution success
            const combinedOutput = stdout + '\n' + stderr;

            comparisonResult = {
                match: exitCode === 0,
                similarity: -1
            };
        }

        // Analyze errors if any (check both stdout and stderr since output is combined)
        const combinedOutput = stdout + '\n' + stderr;
        const suggestions = validator.analyzeTSErrors(combinedOutput);

        // Extract clean output
        const cleanOutput = validator.extractDataOutput(stdout);

        // Return result
        res.json({
            correcto: comparisonResult.match,
            similarity: comparisonResult.similarity,
            output: cleanOutput || stdout.substring(0, 5000), // Limit output size
            errores: comparisonResult.match ? '' : combinedOutput.substring(0, 2000), // Only show logs if validation failed
            sugerencias: comparisonResult.match ? [] : suggestions, // Only show suggestions if validation failed
            execution_time: 'N/A' // Could track this if needed
        });

    } catch (error) {
        logger.error(`Error validating exercise ${req.params.nivel}/${req.params.id}:`, error);

        res.status(500).json({
            error: 'Failed to validate script',
            errores: error.message,
            correcto: false
        });
    }
});

module.exports = router;
