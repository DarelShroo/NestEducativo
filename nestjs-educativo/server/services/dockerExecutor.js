const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');

const execPromise = util.promisify(exec);

const EXECUTOR_IMAGE = 'nestjs-executor';
const SCRIPT_TIMEOUT = 10000;
const SCRIPTS_DIR = path.join(require('os').tmpdir(), 'nestjs-educativo-temp');

/**
 * Execute TypeScript project locally
 * @param {Object} files - Map of file paths to content (e.g. {'src/main.ts': '...'})
 * @param {string} exerciseId - Exercise identifier for temp directory naming
 * @param {string} testScript - Optional test script to evaluate
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
async function executeProject(files, exerciseId, testScript = '') {
    const timestamp = Date.now();
    const projectDirName = `project_${exerciseId}_${timestamp}`;
    const projectPath = path.join(SCRIPTS_DIR, projectDirName);

    try {
        await fs.mkdir(projectPath, { recursive: true });
        
        // Write all user files
        for (const [filePath, content] of Object.entries(files)) {
            const fullPath = path.join(projectPath, filePath);
            await fs.mkdir(path.dirname(fullPath), { recursive: true });
            
            // Auto inject reflect-metadata if this is main.ts
            let fileContent = content;
            if (filePath === 'src/main.ts') {
                fileContent = `import 'reflect-metadata';\n` + fileContent;
            }
            await fs.writeFile(fullPath, fileContent);
        }

        // Add test script if provided (it will import from user files)
        let entryFile = 'src/main.ts';
        if (testScript) {
            entryFile = 'test.ts';
            const fullTestScript = `import 'reflect-metadata';\n` + testScript;
            await fs.writeFile(path.join(projectPath, 'test.ts'), fullTestScript);
        }

        // Create a tsconfig.json to ensure decorators and path resolution works
        const tsconfig = {
            "compilerOptions": {
                "module": "commonjs",
                "declaration": false,
                "removeComments": true,
                "emitDecoratorMetadata": true,
                "experimentalDecorators": true,
                "allowSyntheticDefaultImports": true,
                "target": "es2017",
                "sourceMap": true,
                "outDir": "./dist",
                "moduleResolution": "node",
                "types": ["node"],
                "baseUrl": ".",
                "paths": {
                    "*": ["node_modules/*"]
                },
                "incremental": true,
                "skipLibCheck": true,
                "strictNullChecks": false,
                "noImplicitAny": false,
                "strictBindCallApply": false,
                "forceConsistentCasingInFileNames": false,
                "noFallthroughCasesInSwitch": false,
                "ignoreDeprecations": "6.0"
            }
        };
        await fs.writeFile(path.join(projectPath, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

        // Symlink node_modules to ensure resolution
        try {
            await execPromise(`ln -s /app/node_modules node_modules`, { cwd: projectPath });
        } catch(e) {
            console.error('Failed to symlink node_modules', e);
        }

        console.log(`[Local Executor] Created project: ${projectDirName}`);

        // Typecheck and execute
        const command = `/app/node_modules/.bin/tsc --noEmit -p tsconfig.json && ts-node ${entryFile} 2>&1`;
        console.log(`[Local Executor] Executing: ${command}`);

        const { stdout, stderr } = await execPromise(command, {
            cwd: projectPath, // Run in project root
            timeout: SCRIPT_TIMEOUT,
            maxBuffer: 1024 * 1024 * 10
        });

        console.log(`[Local Executor] Execution completed for ${projectDirName}`);
        return { stdout, stderr: '', exitCode: 0 };

    } catch (error) {
        console.error(`[Local Executor] Error executing project:`, error.message);
        
        if (error.killed && error.signal === 'SIGTERM') {
            throw new Error('Project execution timed out');
        }
        
        return {
            stdout: error.stdout || '',
            stderr: error.stderr || error.message,
            exitCode: error.code || 1
        };

    } finally {
        try {
            // Clean up project dir
            await fs.rm(projectPath, { recursive: true, force: true });
            console.log(`[Local Executor] Cleaned up: ${projectDirName}`);
        } catch (cleanupError) {
            console.warn(`[Local Executor] Failed to cleanup ${projectDirName}:`, cleanupError.message);
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
    executeProject,
    checkDockerContainer,
    getContainerStatus
};
