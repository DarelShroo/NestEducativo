# Instrucciones y Requisitos de Arquitectura para IA (AGENTS.md)

Este documento resume las directrices fundamentales, convenciones de arquitectura y reglas de negocio establecidas para el desarrollo y mantenimiento de la plataforma **NestJS Educativo**. Cualquier agente o desarrollador que trabaje en el proyecto debe adherirse estrictamente a estas normas.

## 1. Fidelidad Absoluta a NestJS
La plataforma está orientada exclusivamente al aprendizaje avanzado de NestJS.
- **Estructura Realista:** Todo ejercicio debe ejecutarse sobre una estructura de proyecto NestJS funcional (`src/main.ts`, `app.module.ts`, `package.json`, etc.). No se permiten simulaciones simplificadas de 1 solo archivo si el concepto requiere múltiples capas.
- **Arquitectura Completa:** Si un ejercicio requiere un recurso, deben usarse los patrones profesionales (Module, Controller, Service, DTOs, Pipes, ExceptionFilters).
- **Inyección de Dependencias:** Los tests automatizados y el código generado deben respetar el uso de clases y decoradores (`@Injectable()`). En las pruebas automatizadas, los providers deben recuperarse por clase (`moduleRef.get(Class)`), nunca usando tokens de texto plano.

## 2. Simulador CLI Orientado al Aprendizaje
El entorno web provee una terminal interactiva que simula `@nestjs/cli`.
- **Comportamiento Replicado:** Los comandos generadores (`nest g mo`, `nest g co`, `nest g s`, `nest g res`) deben generar los archivos correspondientes Y registrar dinámicamente las dependencias en el módulo superior más cercano (haciendo "fallback" inteligente a `app.module.ts` si no existe un módulo específico).
- **Aislamiento:** La terminal y las modificaciones de archivos operan de manera aislada por cada ejercicio y no deben alterar el estado global de la aplicación web de forma perjudicial.

## 3. Interfaz de Usuario (IDE) y UX
- **Explorador de Archivos:** La zona izquierda debe contener un árbol de archivos funcional similar a VS Code, descartando el formato de textarea único.
- **Sistema de Pestañas (Tabs):** El editor de código debe manejar pestañas para que los alumnos naveguen entre Controladores, Servicios y Módulos de forma natural.
- **Chips de Dificultad:** Se debe mantener coherencia visual estricta.
  - `Fácil`: Verde
  - `Medio`: Amarillo
  - `Difícil`: Rojo
  - `Muy Difícil`: Morado (con estilo visual destacado / glow).

## 4. Pipeline de Validación de Código (Backend)
- **Aislamiento de la Ejecución:** La validación contra el contenedor de Docker se debe realizar copiando los archivos a un directorio temporal (`os.tmpdir()`) para que el compilador y Nodemon no provoquen el reinicio infinito del servidor Node.js host.
- **Resolución de Módulos (TS2307):** El pipeline temporal debe vincularse dinámicamente (vía symlink u options de TS) a `/app/node_modules` para que `tsc` encuentre `@nestjs/common` y demás dependencias base sin latencia.
- **Cobertura Total:** Los scripts de ejercicios (generados por `generate-exercises.js`) deben abarcar el 100% de los `README.md` de teoría correspondientes, enseñando uso de CLI, código manual y configuraciones.

## 5. Manejo Amigable de Errores (Feedback al Usuario)
Los mensajes mostrados al alumno tras presionar "Validar" deben ser pedagógicos:
- **Errores de Sintaxis / Compilación (TS/SyntaxError):** Se muestra la traza de error completa de TypeScript o V8 para que el usuario identifique el problema de escritura.
- **Errores Lógicos (de validación del ejercicio):** Si el error es arrojado por nuestras aserciones de prueba (ej. "Falta registrar el controlador" o "El método no retorna lo esperado"), la plataforma debe **limpiar y extraer únicamente el mensaje amigable**, ocultando la ruta interna (`/tmp/project/.../test.ts`) para no confundir al alumno.
