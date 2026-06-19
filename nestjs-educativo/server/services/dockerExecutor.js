const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');

const execPromise = util.promisify(exec);

const SCRIPT_TIMEOUT = parseInt(process.env.SCRIPT_TIMEOUT_MS) || 10000;
const SCRIPTS_DIR = path.join(__dirname, '../../temp_scripts');

/**
 * Execute TypeScript script locally using ts-node
 * @param {string} script - TypeScript script content
 * @param {string} exerciseId - Exercise identifier for temp file naming
 * @param {string} testScript - Optional test script to append
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
async function executeScript(script, exerciseId, testScript = '') {
    const timestamp = Date.now();
    const scriptFilename = `user_${exerciseId}_${timestamp}.ts`;
    
    // Ensure dir exists
    await fs.mkdir(SCRIPTS_DIR, { recursive: true });
    
    const scriptPath = path.join(SCRIPTS_DIR, scriptFilename);

    try {
        // Append export {} to make it an ES Module and isolate scope
        const fullScript = script + '\n\nexport {};\n' + (testScript ? `\n// --- VALIDATION SCRIPT ---\n${testScript}\n` : '');
        await fs.writeFile(scriptPath, fullScript);
        console.log(`[Local Executor] Created script: ${scriptFilename}`);

        const command = `npx tsc --noEmit --experimentalDecorators ${scriptPath} && tsx ${scriptPath} 2>&1`;
        console.log(`[Local Executor] Executing: ${command}`);

        const { stdout, stderr } = await execPromise(command, {
            timeout: SCRIPT_TIMEOUT,
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });

        console.log(`[Local Executor] Execution completed for ${scriptFilename}`);
        return { stdout, stderr: '', exitCode: 0 };

    } catch (error) {
        console.error(`[Local Executor] Error executing script:`, error.message);
        
        if (error.killed && error.signal === 'SIGTERM') {
            throw new Error('Script execution timed out');
        }
        
        return {
            stdout: error.stdout || '',
            stderr: error.stderr || error.message,
            exitCode: error.code || 1
        };

    } finally {
        try {
            await fs.unlink(scriptPath);
            console.log(`[Local Executor] Cleaned up: ${scriptFilename}`);
        } catch (cleanupError) {
            console.warn(`[Local Executor] Failed to cleanup ${scriptFilename}:`, cleanupError.message);
        }
    }
}

/**
 * Check if environment is running (mocked to true since it's local)
 */
async function checkDockerContainer() {
    return true; 
}

/**
 * Get container status (mocked)
 */
async function getContainerStatus() {
    return 'Up (local execution)'; 
}

module.exports = {
    executeScript,
    checkDockerContainer,
    getContainerStatus
};
