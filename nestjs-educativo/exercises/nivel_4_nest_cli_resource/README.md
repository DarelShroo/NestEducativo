# Nivel 4 - Nest CLI Resource y Módulos Avanzados

Bienvenido al Nivel 4. En este módulo dejaremos de crear archivos manualmente y aprovecharemos todo el potencial del CLI de NestJS para la generación de recursos completos. Además, exploraremos cómo comunicar servicios entre sí, exportar e importar proveedores a través de módulos, y manejar de forma profesional la normalización de strings y timestamps (fechas de creación y actualización).

## 1. Introducción del Nivel

Hasta ahora, hemos creado módulos, controladores y servicios paso a paso. Aunque esto es esencial para comprender cómo encaja todo bajo el capó de NestJS, en un entorno profesional necesitamos agilidad.

**¿Qué aprenderás en este nivel?**
* A utilizar el generador de recursos completo de Nest CLI para andamiar rápidamente un módulo CRUD.
* A utilizar opciones avanzadas del CLI (`--no-spec`, `--dry-run`) para prevenir errores.
* A comunicar múltiples módulos entre sí mediante `imports` y `exports`.
* A gestionar correctamente propiedades de auditoría (`createdAt`, `updatedAt`).
* A limpiar y normalizar la entrada del usuario antes de guardarla.

**¿Qué problemas resuelve?**
Este enfoque reduce drásticamente el "boilerplate" (código repetitivo) y los posibles errores de importación al andamiar un nuevo dominio de negocio.

---

## 2. Nest CLI Resource

El CLI de NestJS incluye un comando excepcionalmente potente llamado `resource`.

```bash id="cli1"
nest g res <resource>
```

**¿Qué hace exactamente este comando?**
Al ejecutarlo, NestJS te preguntará qué tipo de transporte vas a usar (REST API, GraphQL, Microservice, etc.). Si eliges REST API y aceptas la generación de endpoints CRUD, el CLI creará instantáneamente:
1. Un Módulo (`<resource>.module.ts`)
2. Un Controlador (`<resource>.controller.ts`) con todos los endpoints (GET, POST, PATCH, DELETE) listos.
3. Un Servicio (`<resource>.service.ts`) inyectado en el controlador.
4. Una carpeta `dto/` con `create-<resource>.dto.ts` y `update-<resource>.dto.ts`.
5. Una carpeta `entities/` con `<resource>.entity.ts`.

Todo esto viene importado, registrado y listo para ejecutarse de forma automática, asegurando una arquitectura impecable basada en los estándares de NestJS.

---

## 3. Flags del CLI

Al generar archivos, podemos acompañar los comandos con modificadores conocidos como *flags*.

```bash id="cli2"
--no-spec
--dry-run
```

### `--dry-run`
El flag de "simulación". Si añades `--dry-run` al final de tu comando (por ejemplo, `nest g res devices --dry-run`), el CLI te mostrará exactamente qué archivos se crearían, dónde se colocarían y qué archivos existentes se modificarían, **pero sin hacer ningún cambio real**. Es la mejor práctica para evitar "ensuciar" tu proyecto si te equivocas de directorio o nombre.

### `--no-spec`
El flag de exclusión de pruebas. Por defecto, el CLI genera archivos de pruebas unitarias (`.spec.ts`) para cada componente. Al usar `--no-spec`, le indicamos al CLI que solo genere el código fuente y omita estos archivos. Durante este curso usamos este flag para mantener la estructura simple.

---

## 4. Modelo de Datos Básico: Timestamps

En bases de datos reales, es esencial saber cuándo se creó y cuándo se modificó un registro. A estos campos se les llama *timestamps*.

```ts id="time1"
updatedAt: new Date().getTime();
```

En nuestro código, manejaremos estas propiedades manualmente por ahora:
* `createdAt`: Se establece únicamente en el momento de la creación (método `create()`).
* `updatedAt`: Se establece en el momento de la creación y se **actualiza** cada vez que el registro sufre una modificación (método `update()`).

*Nota: Usar `new Date().getTime()` nos da el valor de la fecha en milisegundos (timestamp de época), lo cual es ideal para serialización y ordenamiento.*

---

## 5. Manipulación y Normalización de Strings

Nunca debemos confiar ciegamente en cómo escribe el usuario. Alguien puede registrar `" Mi Equipo "` o `"mI EQuipO"`.

```ts id="str1"
.toLocaleLowerCase()
```

La normalización asegura consistencia. Transformar todos los campos de texto a minúsculas usando `toLocaleLowerCase()`, y quitar los espacios extra con `.trim()`, es una práctica estándar que garantiza que las búsquedas funcionen correctamente y que la base de datos se mantenga limpia.

---

## 6. Inyección de Servicios entre Servicios

A veces, la lógica de negocio de un servicio requiere la lógica de otro. Por ejemplo, al asignar un sensor (SensorsService) necesitamos validar a qué laboratorio pertenece (LaboratoriesService).

En NestJS, un servicio (`@Injectable()`) puede inyectar a otro servicio a través de su constructor, de la misma manera que los controladores inyectan servicios. 

Sin embargo, para que esto funcione a nivel inter-módulo, primero debemos exportar e importar correctamente los servicios.

---

## 7. Comunicación entre Módulos

Por defecto, los providers (servicios) están encapsulados dentro de su propio módulo. 

```ts id="mod1"
@Module({
  imports: [],
  exports: [],
})
```

Si el `DevicesModule` quiere usar el `LaboratoriesService` (que pertenece a `LaboratoriesModule`), debemos hacer dos cosas:

1. **Exportar**: En `LaboratoriesModule`, añadir `LaboratoriesService` al array `exports: [LaboratoriesService]`. Esto hace que el servicio sea "público" para otros módulos.
2. **Importar**: En `DevicesModule`, añadir `LaboratoriesModule` al array `imports: [LaboratoriesModule]`. 

¡Y listo! Ya podrás inyectar el `LaboratoriesService` dentro de `DevicesService` o `DevicesController`. Esto es el corazón de la **arquitectura modular y desacoplada** de NestJS.
