/**
 * API Client for NestJS Educational Platform
 */

const API_BASE = window.location.origin + '/api';

const api = {
    /**
     * Check server status
     */
    async checkStatus() {
        try {
            const response = await fetch(`${API_BASE}/status`);
            if (!response.ok) throw new Error('Status check failed');
            return await response.json();
        } catch (error) {
            console.error('Error checking status:', error);
            return { server: 'error', docker: { running: false } };
        }
    },

    /**
     * Get level information (README)
     */
    async getLevelInfo(nivel) {
        try {
            const response = await fetch(`${API_BASE}/nivel/${nivel}`);
            if (!response.ok) throw new Error(`Failed to load level ${nivel}`);
            return await response.json();
        } catch (error) {
            console.error('Error loading level info:', error);
            throw error;
        }
    },

    /**
     * Get exercises for a level
     */
    async getExercises(nivel) {
        try {
            const response = await fetch(`${API_BASE}/nivel/${nivel}/ejercicios`);
            if (!response.ok) throw new Error(`Failed to load exercises for level ${nivel}`);
            const data = await response.json();
            return data.exercises;
        } catch (error) {
            console.error('Error loading exercises:', error);
            throw error;
        }
    },

    /**
     * Get exercise detail
     */
    async getExerciseDetail(nivel, id) {
        try {
            const response = await fetch(`${API_BASE}/nivel/${nivel}/ejercicio/${id}`);
            if (!response.ok) throw new Error(`Failed to load exercise ${nivel}/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error loading exercise detail:', error);
            throw error;
        }
    },

    /**
     * Validate user script and project files
     */
    async validateExercise(nivel, id, script, files = null) {
        try {
            const payload = { script };
            if (files) {
                payload.files = files;
            }

            const response = await fetch(`${API_BASE}/nivel/${nivel}/ejercicio/${id}/validar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.errores || errData.error || 'Validation failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error validating exercise:', error);
            throw error;
        }
    },

    /**
     * Simulate HTTP Request
     */
    async simulateHttp(request, files = null) {
        try {
            const payload = { request, files };
            const response = await fetch(`${API_BASE}/simulator/http`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'HTTP simulation failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error simulating HTTP:', error);
            throw error;
        }
    }
};

// Export for use in other modules
window.api = api;
