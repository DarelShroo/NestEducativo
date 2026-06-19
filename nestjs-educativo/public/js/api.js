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
     * Validate user script
     */
    async validateExercise(nivel, id, script) {
        try {
            const response = await fetch(`${API_BASE}/nivel/${nivel}/ejercicio/${id}/validar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ script })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Validation failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error validating exercise:', error);
            throw error;
        }
    }
};

// Export for use in other modules
window.api = api;
