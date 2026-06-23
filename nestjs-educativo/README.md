# NestJS Educativo

Bienvenido al módulo educativo de NestJS. Esta carpeta contiene todo el sistema de aprendizaje, la teoría y los ejercicios, totalmente separados del código de los proyectos (como `01-typescript-intro`).

## Tests

La plataforma utiliza **Vitest** para garantizar que los scripts y el sistema de evaluación automatizada funcionan correctamente.

> **Nota:** Para ejecutar las pruebas de integración, asegúrate de que el servidor esté corriendo previamente (por ejemplo, con `docker compose up -d` o `npm run dev`).

Para ejecutar los tests de validación:

```bash
# Ejecutar pruebas una sola vez
npm test

# Ejecutar pruebas en modo watch (observador)
npm run test:watch
```

## 📖 Estructura de Estudio

Todo el contenido pedagógico se encuentra estructurado por niveles dentro del directorio `exercises/`:

- **`nivel_1_typescript_intro`**: Fundamentos de TypeScript aplicados a NestJS (Tipos, Interfaces, Clases, Async, Decoradores).
- _(Próximos niveles se añadirán a medida que progrese el curso)_

## 🚀 Cómo estudiar cada nivel

1. **Lee la Teoría**: Dentro de la carpeta de cada nivel (ej. `exercises/nivel_1_typescript_intro/`) encontrarás un archivo `README.md`. Contiene **absolutamente toda la teoría** necesaria para resolver los ejercicios.
2. **Resuelve los Ejercicios**: Los ejercicios, retos y soluciones están definidos en el archivo `exercises.json` de cada nivel.
3. **Tu Espacio de Trabajo**: Programa tus soluciones en el proyecto correspondiente (por ejemplo, en la carpeta `/01-typescript-intro` de la raíz del repositorio), utilizando los archivos listos para ti en `src/bases/`.

> **IMPORTANTE**: La filosofía de esta plataforma es el estudio progresivo. Asegúrate de comprender la teoría del nivel actual antes de pasar a la práctica. ¡No necesitas buscar información externa!
