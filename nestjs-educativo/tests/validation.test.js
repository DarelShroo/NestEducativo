import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3001/api';

describe('API de Validación de Ejercicios', () => {
  let exercises = [];

  beforeAll(() => {
    // Cargamos los ejercicios directamente del JSON
    const exercisesPath = path.resolve(__dirname, '../exercises/nivel_1_typescript_intro/exercises.json');
    exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));
  });

  describe('Soluciones Correctas', () => {
    it('debería validar exitosamente todas las soluciones correctas del nivel 1', async () => {
      // Nota: Requiere que el servidor esté levantado en el puerto 3001
      for (const ex of exercises) {
        const response = await fetch(`${API_URL}/nivel/1/ejercicio/${ex.id}/validar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ script: ex.solution_script })
        });
        const result = await response.json();
        
        if (!result.correcto) {
          console.error(`Failed at exercise ${ex.id} with errors: ${result.errores}`);
        }
        expect(result.correcto).toBe(true);
      }
    }, 30000); // Timeout extendido porque validar varios scripts toma tiempo
  });

  describe('Comportamiento de Error', () => {
    it('debería rechazar código con errores de tipado de TypeScript', async () => {
      const response = await fetch(`${API_URL}/nivel/1/ejercicio/1/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: "let a: number = 'hello';" })
      });
      const result = await response.json();
      
      expect(result.correcto).toBe(false);
      expect(result.errores).toContain("Type 'string' is not assignable to type 'number'");
    });

    it('debería rechazar código con errores de sintaxis', async () => {
      const response = await fetch(`${API_URL}/nivel/1/ejercicio/1/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: "let a: number = " })
      });
      const result = await response.json();
      
      expect(result.correcto).toBe(false);
      expect(result.errores.length).toBeGreaterThan(0);
    });
  });
});
