# Instrucciones y Requisitos de Arquitectura para IA (AGENTS.md)

Este documento resume las directrices fundamentales, convenciones de arquitectura y reglas de negocio establecidas para el desarrollo y mantenimiento de la plataforma **NestJS Educativo**. Cualquier agente o desarrollador que trabaje en el proyecto debe adherirse estrictamente a estas normas.

---

## 1. Visión General del Proyecto

**NestJS Educativo** es una plataforma web interactiva de aprendizaje que enseña TypeScript y NestJS a través de ejercicios prácticos con validación automatizada en tiempo real.

### Stack Tecnológico

| Capa                         | Tecnología                                                          |
| ---------------------------- | ------------------------------------------------------------------- |
| **Frontend**                 | HTML + Vanilla JS + CSS (SPA monolítica en `public/`)               |
| **Backend**                  | Node.js + Express (`server/`)                                       |
| **Ejecución de código**      | TypeScript compilado + `ts-node` en directorio temporal del sistema |
| **Contenedorización**        | Docker + Docker Compose                                             |
| **Tests**                    | Vitest (`tests/validation.test.js`)                                 |
| **Generación de ejercicios** | Script Node.js (`generate-exercises.js`)                            |

### Estructura del Proyecto

```text
nestjs-educativo/
├── Dockerfile                              # Imagen Docker del servicio
├── docker-compose.yml                      # Orquestación del contenedor
├── package.json                            # Dependencias del proyecto
├── generate-exercises.js                   # Generador maestro de ejercicios
├── exercises/
│   ├── nivel_1_typescript_intro/
│   │   ├── exercises.json                  # Ejercicios Nivel 1 (generado)
│   │   └── README.md                       # Teoría Nivel 1
│   └── nivel_2_conceptos_nestjs/
│       ├── exercises.json                  # Ejercicios Nivel 2 (generado)
│       └── README.md                       # Teoría Nivel 2
├── server/
│   ├── server.js                           # Punto de entrada Express
│   ├── routes/
│   │   └── exercises.js                    # Rutas API REST
│   ├── services/
│   │   ├── dockerExecutor.js               # Ejecutor de código TypeScript
│   │   └── validator.js                    # Comparador de salidas
│   └── utils/
│       ├── logger.js                       # Logger con niveles
│       └── sanitizer.js                    # Sanitización de entrada
├── public/
│   ├── index.html                          # SPA principal
│   ├── css/
│   │   └── styles.css                      # Estilos globales
│   └── js/
│       ├── app.js                          # Lógica principal de la aplicación
│       ├── editor.js                       # Editor de código (Monaco-like)
│       ├── file-tree.js                    # Explorador de archivos
│       ├── nest-cli.js                     # Simulador de NestJS CLI
│       ├── vfs.js                          # Sistema de archivos virtual (VFS)
│       ├── api.js                          # Cliente API
│       └── ls.js                           # Autocompletado/Language Server
├── tests/
│   └── validation.test.js                  # Suite de validación automatizada
└── AGENTS.md                               # Este documento
```

---

## 2. Regla Fundamental: Fidelidad Absoluta a NestJS CLI

> **No simplifiques ni modifiques el comportamiento de los comandos oficiales de NestJS.**

Todo lo que se muestre al alumno debe ser exactamente lo que ocurriría en un proyecto real creado y gestionado mediante NestJS CLI.

### Estructura Real de un Proyecto NestJS

Todos los ejercicios de Nivel 2 deben utilizar una estructura real:

```text
src/
├── main.ts
├── app.module.ts
└── courses/
    ├── courses.module.ts
    ├── courses.controller.ts
    ├── courses.service.ts
    ├── dto/
    │   ├── create-course.dto.ts
    │   └── update-course.dto.ts
    └── entities/
        └── course.entity.ts
```

**No se debe colocar lógica de negocio en `main.ts`.**

### Comportamiento de la CLI Simulada

Los comandos generadores del simulador (`public/js/nest-cli.js`) deben replicar fielmente:

| Comando                        | Genera                                          | Registra en                   |
| ------------------------------ | ----------------------------------------------- | ----------------------------- |
| `nest g mo courses`            | `src/courses/courses.module.ts`                 | `AppModule.imports[]`         |
| `nest g co courses --no-spec`  | `src/courses/courses.controller.ts`             | `CoursesModule.controllers[]` |
| `nest g s courses --no-spec`   | `src/courses/courses.service.ts`                | `CoursesModule.providers[]`   |
| `nest g res courses --no-spec` | Módulo + Controlador + Servicio + DTOs + Entity | Todo registrado correctamente |

**Regla de `--no-spec`:** No se generan archivos `.spec.ts` cuando se usa este flag.

**Regla de Fallback de Módulo:** Si no existe un módulo específico para el recurso (ej. `courses.module.ts`), se hace fallback inteligente a `app.module.ts`.

---

## 3. Generador de Ejercicios (`generate-exercises.js`)

Este es el **fichero maestro** que define todos los ejercicios del Nivel 2. Los ejercicios del Nivel 1 se gestionan en su propio JSON directamente.

### Flujo de Generación

```text
generate-exercises.js  →  exercises/nivel_2_conceptos_nestjs/exercises.json
```

**Después de cada cambio en `generate-exercises.js`, SIEMPRE ejecutar:**

```bash
node generate-exercises.js
```

### Anatomía de un Ejercicio

Cada ejercicio tiene la siguiente estructura:

```javascript
{
  "id": 1,                          // ID numérico secuencial
  "title_es": "...",                 // Título en español
  "title_en": "...",                 // Título en inglés
  "difficulty": "facil",             // facil | medium | hard | muy_dificil
  "concepts": ["..."],              // Conceptos cubiertos
  "description_es": "...",           // Enunciado completo en español (Markdown)
  "description_en": "...",           // Enunciado en inglés
  "files": [                         // Archivos iniciales del workspace
    { "path": "src/main.ts", "content": "..." }
  ],
  "solution_files": [                // Archivos que el alumno debe crear/modificar
    { "path": "src/app.module.ts", "content": "..." }
  ],
  "hints_es": ["..."],              // Pistas en español
  "hints_en": ["..."],              // Pistas en inglés
  "test_script": "..."              // Script de validación TypeScript
}
```

### Reglas Críticas para los Ejercicios

1. **`files`** = estado inicial del workspace que se muestra al alumno.
2. **`solution_files`** = archivos de la solución correcta. Sobreescriben los de `files` durante la validación automática.
3. **`test_script`** = código TypeScript que se ejecuta para validar. Debe hacer `console.log('Test pasado correctamente')` en caso de éxito o lanzar un `Error` descriptivo.
4. **Los `solution_files` deben compilar** correctamente con `tsc` y pasar el `test_script`.
5. **`main.ts` SIEMPRE** debe contener el bootstrap estándar de NestJS:
   ```typescript
   import { NestFactory } from '@nestjs/core';
   import { AppModule } from './app.module';
   async function bootstrap() {
     const app = await NestFactory.create(AppModule);
     await app.listen(3000);
   }
   bootstrap();
   ```

### Niveles de Dificultad y Colores

| Dificultad  | Valor en JSON | Color en UI       |
| ----------- | ------------- | ----------------- |
| Fácil       | `facil`       | Verde             |
| Medio       | `medium`      | Amarillo          |
| Difícil     | `hard`        | Rojo              |
| Muy Difícil | `muy_dificil` | Morado (con glow) |

---

## 4. Pipeline de Validación de Código (Backend)

### Flujo de Ejecución

```
[Frontend] POST /api/nivel/:nivel/ejercicio/:id/validar
    │
    ▼
[server/routes/exercises.js] → Sanitiza entrada
    │
    ▼
[server/services/dockerExecutor.js] → Crea proyecto temporal
    │
    ├── Escribe archivos del alumno en /tmp/
    ├── Genera tsconfig.json con decoradores habilitados
    ├── Symlink a node_modules (resolución dinámica)
    ├── Inyecta `import 'reflect-metadata'` en main.ts/test.ts
    └── Ejecuta: tsc --noEmit && ts-node test.ts
    │
    ▼
[server/services/validator.js] → Analiza resultado
    │
    ▼
[Frontend] ← { correcto: true/false, errores: "...", sugerencias: [...] }
```

### Aislamiento de la Ejecución

- **NUNCA ejecutar código del alumno en el directorio del proyecto.** El código se copia a un directorio temporal (`os.tmpdir()`) para evitar que `nodemon` detecte cambios y reinicie el servidor.
- El directorio temporal se limpia automáticamente tras cada ejecución (`finally` block).

### Resolución de Módulos (node_modules)

El ejecutor crea un symlink dinámico a `node_modules`:

```javascript
const nodeModulesPath = path.resolve(__dirname, '../../node_modules');
await execPromise(`ln -s ${nodeModulesPath} node_modules`, { cwd: projectPath });
```

> **IMPORTANTE:** No usar rutas hardcodeadas como `/app/node_modules`. Usar siempre `path.resolve(__dirname, '../../node_modules')` para compatibilidad entre Docker y local.

### Dependencias Disponibles para los Ejercicios

Los paquetes instalados que los ejercicios pueden importar:

- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
- `@nestjs/testing` (para compilar módulos en test_scripts)
- `@nestjs/mapped-types` (para `PartialType` en DTOs)
- `reflect-metadata`, `rxjs`

Si un ejercicio necesita un paquete que no está en `package.json`, **DEBE añadirse** allí y reconstruir el contenedor Docker.

### Inyección Automática de `reflect-metadata`

El ejecutor inyecta automáticamente `import 'reflect-metadata'` al inicio de:

- `src/main.ts` (para ejercicios de Nivel 2)
- `test.ts` (para scripts de validación)

**No añadir `import 'reflect-metadata'` manualmente en los ejercicios ni en los test_scripts.**

### Diferencias entre Nivel 1 y Nivel 2

| Aspecto               | Nivel 1                               | Nivel 2                                                 |
| --------------------- | ------------------------------------- | ------------------------------------------------------- |
| Payload de validación | `{ script: "..." }` (un solo archivo) | `{ files: { "path": "content" } }` (múltiples archivos) |
| Prefijo de exerciseId | `1_<id>`                              | `2_<id>`                                                |
| Test script           | Concatenado al final de `main.ts`     | Archivo independiente `test.ts`                         |
| reflect-metadata      | No se inyecta                         | Se inyecta automáticamente                              |

---

## 5. Escritura de Test Scripts

### Patrón Estándar para Test Scripts de Nivel 2

```typescript
import { Test } from '@nestjs/testing';
import { AppModule } from './src/app.module';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';

async function test() {
  try {
    // 1. Verificar existencia de archivos
    if (!fs.existsSync('./src/resource/resource.controller.ts'))
      throw new Error('No se encontró el controlador.');

    // 2. Importar dinámicamente los módulos del alumno
    const { ResourceController } = await import('./src/resource/resource.controller');

    // 3. Compilar módulo con @nestjs/testing
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    // 4. Obtener instancias vía DI (SIEMPRE con { strict: false })
    const controller: any = moduleRef.get(ResourceController, { strict: false });

    // 5. Verificar comportamiento
    const result = controller.findAll();
    if (!Array.isArray(result)) throw new Error('findAll() debe retornar un arreglo.');

    console.log('Test pasado correctamente');
  } catch (e: any) {
    throw e;
  }
}
test();
```

### Reglas de los Test Scripts

1. **Siempre usar `moduleRef.get(Class, { strict: false })`** para resolver providers. Nunca usar tokens string.
2. **Los errores lógicos deben prefijarse con `[VALIDATION_ERROR]`** para que el frontend los muestre como mensajes pedagógicos limpios.
3. **Las comparaciones de listas deben almacenar la longitud en una variable primitiva** antes de mutar:

   ```typescript
   const initialLength = initialCourses.length;  // ✅ Correcto
   // ... crear nuevo curso ...
   if (updatedCourses.length <= initialLength)    // ✅ Correcto

   // ❌ INCORRECTO: initialCourses.length muta si es referencia al mismo array
   if (updatedCourses.length <= initialCourses.length)
   ```

4. **Verificar NotFoundException con `instanceof`**, no comparando strings de mensaje:
   ```typescript
   if (e instanceof NotFoundException) {
     findOneThrew = true;
   }
   ```
5. **Verificar ParseIntPipe por análisis estático** del código fuente del controlador:
   ```typescript
   const code = fs.readFileSync('./src/resource/resource.controller.ts', 'utf8');
   if (!code.includes('ParseIntPipe')) throw new Error('...');
   ```

---

## 6. Frontend (public/)

### Arquitectura de la SPA

La aplicación es una SPA monolítica sin framework, organizada en módulos JS:

| Archivo        | Responsabilidad                                  |
| -------------- | ------------------------------------------------ |
| `app.js`       | Controlador principal, navegación, estado global |
| `editor.js`    | Editor de código con resaltado de sintaxis       |
| `file-tree.js` | Explorador de archivos (árbol tipo VS Code)      |
| `nest-cli.js`  | Simulador de la CLI de NestJS                    |
| `vfs.js`       | Virtual File System (almacén en memoria)         |
| `api.js`       | Cliente para las llamadas al backend             |
| `ls.js`        | Language Server ligero (autocompletado)          |

### Reglas del Frontend

1. **Explorador de Archivos:** La zona izquierda debe contener un árbol de archivos funcional similar a VS Code. No usar textarea único.
2. **Sistema de Pestañas:** El editor debe manejar tabs para que los alumnos naveguen entre Controladores, Servicios y Módulos.
3. **El VFS es por ejercicio:** Cada ejercicio tiene su propio estado de archivos aislado.
4. **El simulador CLI modifica el VFS:** Cuando el alumno ejecuta `nest g mo courses`, el simulador crea los archivos en el VFS y actualiza el árbol de archivos.

---

## 7. API REST del Backend

### Endpoints

| Método | Ruta                                      | Descripción                                    |
| ------ | ----------------------------------------- | ---------------------------------------------- |
| `GET`  | `/api/status`                             | Estado del servidor y contenedor               |
| `GET`  | `/api/nivel/:nivel`                       | Contenido README del nivel                     |
| `GET`  | `/api/nivel/:nivel/ejercicios`            | Lista resumida de ejercicios                   |
| `GET`  | `/api/nivel/:nivel/ejercicio/:id`         | Detalle completo de un ejercicio               |
| `POST` | `/api/nivel/:nivel/ejercicio/:id/validar` | Validar solución del alumno                    |
| `POST` | `/api/simulator/http`                     | Simular petición HTTP contra código del alumno |
| `GET`  | `/health`                                 | Health check                                   |

### Formato de Respuesta de Validación

```json
{
  "correcto": true,
  "similarity": -1,
  "output": "Test pasado correctamente",
  "errores": "",
  "sugerencias": [],
  "execution_time": "N/A"
}
```

---

## 8. Manejo de Errores (Feedback al Usuario)

Los mensajes mostrados al alumno tras presionar "Validar" deben ser **pedagógicos**:

### Errores de Compilación (TS/SyntaxError)

Se muestra la traza completa de TypeScript para que el alumno identifique el problema:

```
src/courses/courses.service.ts(5,3): error TS2339: Property 'x' does not exist on type 'Y'.
```

### Errores Lógicos (de validación del ejercicio)

Si el error proviene de nuestras aserciones (`[VALIDATION_ERROR]`), la plataforma **limpia y extrae el mensaje amigable**, ocultando rutas internas como `/tmp/nestjs-educativo-temp/...`:

```
El CoursesService no está registrado en el módulo.
```

### Implementación en `server/routes/exercises.js`

```javascript
if (combinedOutput.includes('error TS') || combinedOutput.includes('SyntaxError')) {
  errorFinal = combinedOutput.substring(0, 2000); // Traza completa
} else {
  const errorMatch = combinedOutput.match(/(?:Error|Exception)[^:]*:\s*([^\n]+)/);
  errorFinal = errorMatch ? errorMatch[1].trim() : combinedOutput.substring(0, 2000);
}
```

---

## 9. Docker y Despliegue

### Docker Compose

```yaml
services:
  web:
    build: .
    container_name: nestjs-educativo
    ports: ['3001:3001']
    volumes:
      - ./server:/app/server:rw # Código del servidor (hot reload)
      - ./public:/app/public:rw # Frontend (hot reload)
      - ./exercises:/app/exercises:ro # Ejercicios (solo lectura)
    environment:
      - PORT=3001
```

### Comandos Esenciales

```bash
# Levantar el contenedor
docker compose up -d

# Reconstruir tras cambios en package.json o Dockerfile
docker compose up -d --build

# Ver logs del contenedor
docker logs nestjs-educativo -f

# Ejecutar tests (requiere contenedor levantado)
npm test
```

### Cuándo Reconstruir el Contenedor

**OBLIGATORIO reconstruir** (`--build`) cuando:

- Se añade/modifica una dependencia en `package.json`
- Se modifica el `Dockerfile`
- Se cambian ejercicios que usan paquetes nuevos

**NO es necesario reconstruir** cuando:

- Se modifica código en `server/` (montado como volumen rw)
- Se modifica código en `public/` (montado como volumen rw)
- Se regeneran `exercises.json` (montado como volumen ro, pero necesita restart)

---

## 10. Suite de Tests

### Ubicación y Ejecución

```bash
npm test                    # Ejecuta todos los tests
npm run test:watch          # Modo watch para desarrollo
```

### Estructura de los Tests (`tests/validation.test.js`)

```
API de Validación de Ejercicios
├── Soluciones Correctas
│   └── ✓ debería validar exitosamente todas las soluciones correctas del nivel 1
├── Soluciones Correctas del Nivel 2
│   └── ✓ debería validar exitosamente todas las soluciones correctas del nivel 2
└── Comportamiento de Error
    ├── ✓ debería rechazar código con errores de tipado de TypeScript
    └── ✓ debería rechazar código con errores de sintaxis
```

### Regla Crítica de los Tests de Nivel 2

La validación de soluciones del Nivel 2 debe enviar **TANTO los archivos iniciales como los de solución**, fusionándolos (los de solución sobreescriben):

```javascript
const filesPayload = {};
for (const file of ex.files || []) {
  filesPayload[file.path] = file.content; // Archivos base primero
}
for (const file of ex.solution_files || []) {
  filesPayload[file.path] = file.content; // Soluciones sobreescriben
}
```

Esto replica el comportamiento real: el alumno empieza con `files` y modifica/crea los que están en `solution_files`.

### Timeout

Los tests de validación tienen un timeout de **90 segundos** cada uno debido al tiempo de compilación TypeScript acumulado. Si se añaden más ejercicios, puede ser necesario incrementarlo.

---

## 11. Flujo de Trabajo para Añadir un Ejercicio Nuevo

1. **Editar `generate-exercises.js`**: Añadir el nuevo objeto al array `exercises`.
2. **Respetar la estructura NestJS real**: `files` debe contener el workspace inicial válido; `solution_files` la solución completa.
3. **Escribir el `test_script`**: Debe validar que la solución funciona correctamente usando `@nestjs/testing`.
4. **Regenerar el JSON**:
   ```bash
   node generate-exercises.js
   ```
5. **Reconstruir el contenedor** (si se añadieron dependencias):
   ```bash
   docker compose up -d --build
   ```
6. **Ejecutar los tests**:
   ```bash
   npm test
   ```
7. **Verificar que TODOS los tests pasen** (4/4) antes de hacer commit.

---

## 11.2 Flujo de Trabajo para Añadir un Nivel Nuevo

Para integrar un nuevo nivel completo en la plataforma educativa, se deben tocar tanto archivos estáticos como lógicos en el backend y frontend. Sigue estos pasos meticulosamente:

1. **Crear el directorio y README del Nivel**:
   - Crea un directorio en `exercises/nivel_X_nombre_nivel/`.
   - Añade un archivo `README.md` detallado dentro de esa carpeta con la teoría que fundamenta el nivel. Este contenido será renderizado en la UI.
2. **Definir los Ejercicios (`generate-exercises.js`)**:
   - Abre `generate-exercises.js` en la raíz de `nestjs-educativo`.
   - Crea una constante conteniendo el array de ejercicios (ej. `const exercisesNX = [...]`).
   - Usa la estructura estándar (id, title_es, difficulty, concepts, description_es, files, solution_files, test_script).
   - Llama al generador (si requiere dependencias previas `makeCumulative`) y añade `fs.writeFileSync(pathNX, JSON.stringify(exercisesNX...))` al final.
   - Ejecuta `node generate-exercises.js` para compilar el JSON de metadatos.
3. **Actualizar el Mapa de Rutas del Backend (`server/routes/exercises.js`)**:
   - Localiza la variable `nivelMap` en todas las rutas del controlador (por ejemplo `loadExercises`, `loadReadme`, simulación de HTTP, etc.).
   - Añade el mapeo del nuevo nivel: `X: 'nivel_X_nombre_nivel'`.
   - Actualiza la comprobación de límites: cambia `nivel < 1 || nivel > Y` a `nivel > X` para evitar lanzar errores HTTP 400.
4. **Actualizar el Sanitizador de Ejercicios (`server/utils/sanitizer.js`)**:
   - En la función `validateExerciseId(nivel, id)`, amplía el límite numérico `nivelNum > X`.
   - Añade el límite de capacidad de ejercicios de dicho nivel en el diccionario `maxExercises = { 1: 30, ..., X: 30 }`.
5. **Añadir el Nivel a la Interfaz (`public/index.html` y `public/js/app.js`)**:
   - En `public/index.html`, copia e inserta una tarjeta gráfica `<div class="level-card" data-level="X">` en `<div class="levels-grid">`.
   - En `public/js/app.js`, actualiza los objetos `nivelNames` que se encuentran en `displayLevelInfo()` y `displayExerciseList()` para incluir la clave `X` y su título.
6. **Reiniciar y Reconstruir el Entorno**:
   - Ejecuta `docker compose restart web` para que Nodemon asimile los cambios en Express y en los utilitarios de sanitización.

---

## 12. Errores Frecuentes y Soluciones

### `Cannot find module '@nestjs/mapped-types'`

**Causa:** El paquete no está instalado en `node_modules` del contenedor.
**Solución:** Verificar que está en `package.json` y reconstruir: `docker compose up -d --build`.

### `Cannot find module './src/app.module'`

**Causa:** Los tests de Nivel 2 no envían los archivos base (`ex.files`) junto con las soluciones.
**Solución:** Fusionar `ex.files` + `ex.solution_files` en el payload de validación.

### `initialCourses.length` siempre igual tras crear un curso

**Causa:** JavaScript arrays son referencias. Si `findAll()` retorna la referencia interna, ambas variables apuntan al mismo array mutado.
**Solución:** Almacenar la longitud como primitivo numérico antes de mutar: `const initialLength = initialCourses.length`.

### Reinicio infinito de Nodemon

**Causa:** El código del alumno se escribió dentro del directorio del proyecto en vez de `/tmp`.
**Solución:** Asegurar que `dockerExecutor.js` usa `os.tmpdir()` para el directorio del proyecto temporal.

### `error TS2307: Cannot find module '...'` en decoradores

**Causa:** `tsconfig.json` no tiene `emitDecoratorMetadata` o `experimentalDecorators` habilitados.
**Solución:** El `dockerExecutor.js` genera automáticamente el `tsconfig.json` correcto. No modificarlo.

---

## 13. Convenciones de Código

### Servidor (Node.js/Express)

- CommonJS (`require`/`module.exports`).
- Logging siempre a través de `server/utils/logger.js`.
- Sanitización de entrada obligatoria via `server/utils/sanitizer.js`.

### Ejercicios (TypeScript)

- Siempre respetar la estructura que generaría `nest g res <nombre>`.
- DTOs en carpeta `dto/`, Entities en carpeta `entities/`.
- `UpdateDto` siempre hereda de `CreateDto` via `PartialType`.
- Siempre usar `@Injectable()` en servicios y registrarlos como providers.
- Siempre usar `ParseIntPipe` para parámetros `:id` numéricos.
- Siempre lanzar `NotFoundException` cuando no se encuentra un recurso.

### Frontend (Vanilla JS)

- No usar frameworks (React, Vue, etc.).
- Modularización via archivos JS separados cargados con `<script>`.
- Estado del VFS aislado por ejercicio.

### Git

- Commits en inglés con prefijos convencionales: `feat:`, `fix:`, `refactor:`, `docs:`.
- No commitear `node_modules/`, `exercises.json` generado se commitea.
- Antes de cada push: verificar que `npm test` pasa con exit code 0.
