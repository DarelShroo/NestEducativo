# 🏗️ Reglas de Estado Base del Proyecto (Fresh Install)

Este documento define las reglas obligatorias sobre el estado inicial de cada ejercicio del curso de NestJS. Es un complemento directo de `EXERCISE_GUIDELINES.md` y debe leerse conjuntamente.

---

## 🚨 REGLA FUNDAMENTAL

Cada ejercicio debe partir **SIEMPRE** de un proyecto NestJS recién creado (`nest new project`).

El estado inicial del proyecto **SOLO** contiene:

```
src/
  main.ts
  app.module.ts
test/
package.json
tsconfig.json
nest-cli.json
```

**NO existe** ningún módulo personalizado, servicio, controlador, DTO, pipe ni estructura adicional fuera de lo que genera `nest new`.

---

## ❌ PROHIBIDO ABSOLUTO

Nunca generar ejercicios que asuman arquitectura previa. Está estrictamente prohibido redactar instrucciones como:

- "modifica el service existente"
- "añade lógica al módulo ya creado"
- "extiende el controlador anterior"
- "usa la estructura del ejercicio previo"
- "en el servicio que ya tienes..."

Estas frases implican que el alumno arrastra código de ejercicios anteriores, lo cual viola el principio de aislamiento.

---

## ✅ OBLIGATORIO EN CADA EJERCICIO

Cada ejercicio debe especificar **explícitamente** todo lo que se debe crear desde cero:

| Elemento | Ejemplo |
| :--- | :--- |
| Módulos | "Crea `CarsModule`" |
| Controllers | "Crea `CarsController` con el endpoint `GET /cars`" |
| Services | "Crea `CarsService` con el método `findAll()`" |
| Schemas | "Crea `car.schema.ts` con la clase `Car`" |
| Pipes | "Crea `MongoIdPipe` en `src/common/pipes/`" |

Nada puede quedar implícito. Si el ejercicio necesita una pieza, debe indicar su creación o proveerla en los archivos iniciales (`files`).

---

## 🧠 REGLA DE AISLAMIENTO ENTRE EJERCICIOS

Cada ejercicio es un entorno **completamente independiente**:

- **NO** reutiliza código de ejercicios anteriores.
- **NO** asume estado previo del proyecto.
- **NO** continúa un proyecto existente.
- **NO** hereda módulos, servicios ni controladores de otros ejercicios.

Cada ejercicio debe poder resolverse como si el alumno acabara de ejecutar `nest new project`.

---

## 📦 ARCHIVOS INICIALES OBLIGATORIOS

Todo ejercicio debe incluir en su campo `files` del JSON al menos:

1. `package.json` — con las dependencias necesarias para el ejercicio.
2. `src/main.ts` — bootstrap estándar de NestJS.
3. `src/app.module.ts` — módulo raíz vacío o con imports mínimos.

Si el ejercicio requiere que el alumno **modifique** un archivo existente (no crearlo desde cero), ese archivo debe estar provisto en `files` con su contenido inicial incompleto o con el bug a corregir.

---

## ⚫ EXCEPCIÓN: EJERCICIO FINAL (`muy_dificil`)

El ejercicio final del nivel es el **único** que puede partir con una base parcial previa. Sin embargo:

- Debe indicar **claramente** en sus archivos iniciales (`files`) qué es lo que ya existe.
- Debe indicar en la descripción **qué falta por construir**.
- El alumno debe diseñar la arquitectura restante de forma autónoma.

---

## 🎯 OBJETIVO EDUCATIVO

Garantizar que cada ejercicio simula un inicio real de proyecto NestJS, como si el alumno ejecutara:

```bash
nest new project
```

antes de empezar. Esto asegura:

- **Independencia total** entre ejercicios.
- **Cero dependencias ocultas** de código previo.
- **Reproducibilidad** (cualquier ejercicio se puede hacer en cualquier orden dentro del nivel).
- **Claridad pedagógica** (el alumno sabe exactamente qué debe construir).
