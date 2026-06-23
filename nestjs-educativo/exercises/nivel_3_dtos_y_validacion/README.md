# Nivel 3: DTOs y Validación de Información

Bienvenido al **Nivel 3** del ecosistema educativo de NestJS. En esta unidad, aprenderás a validar la información que entra a tu aplicación para hacerla robusta y segura.

---

## 📑 Índice de Contenidos

1. [DTOs (Data Transfer Objects) e Interfaces](#1-dtos-data-transfer-objects-e-interfaces)
2. [Validación Avanzada: class-validator y class-transformer](#2-validación-avanzada-class-validator-y-class-transformer)
3. [ValidationPipe a Fondo](#3-validationpipe-a-fondo)
4. [UUID y ParseUUIDPipe](#4-uuid-y-parseuuidpipe)
5. [Organización de Código: Alias de Importación y Barrel Files](#5-organización-de-código-alias-de-importación-y-barrel-files)
6. [Proyecto Final de Unidad](#6-proyecto-final-de-unidad)

---

## 1. DTOs (Data Transfer Objects) e Interfaces

### Interfaces en TypeScript

#### ¿Qué son?

Las interfaces son un mecanismo fundamental de TypeScript que nos permite definir "contratos" o formas estructurales para los objetos. No existen en JavaScript (se eliminan durante la transpilación), sino que viven exclusivamente en el mundo del tipado estático de TypeScript.

#### Diferencias entre interfaces y clases

- **Interfaces:** Solo definen el "molde" o la estructura de los datos. No pueden contener lógica, valores inicializados, ni métodos implementados. Desaparecen por completo al compilar a JavaScript.
- **Clases:** Pueden contener tanto la estructura como la lógica (métodos funcionales, valores por defecto). Además, se mantienen en el código JavaScript compilado, lo que permite instanciarlas y utilizarlas en tiempo de ejecución.

#### Casos de uso en NestJS

Las interfaces son ideales para definir entidades estáticas, respuestas de una API o contratos internos dentro de los servicios.

- **Entidades:** Representación de cómo luce un registro en la base de datos (o memoria).
- **Respuestas:** Tipar el objeto que va a devolver el controlador.

#### Ventajas y limitaciones

- **Ventajas:** Son muy ligeras y no añaden peso al código transpilado. Aseguran consistencia a nivel de desarrollo.
- **Limitaciones:** Al desaparecer en tiempo de ejecución, no pueden utilizarse para procesos dinámicos en ejecución, como la validación de un objeto JSON que llega por una petición HTTP.

#### Ejemplo práctico

```typescript
// car.interface.ts
export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
}
```

### DTOs (Data Transfer Objects)

#### ¿Qué son?

Un DTO es un objeto que define estrictamente cómo deben enviarse los datos a través de la red entre el cliente y el servidor. Se implementan generalmente como clases en TypeScript.

#### ¿Qué problema resuelven y por qué NestJS los utiliza?

Cuando un cliente hace un POST o PATCH, el cuerpo de la petición (`@Body()`) en crudo es un objeto sin forma garantizada. El cliente podría enviar un objeto vacío, enviar campos adicionales peligrosos o enviar tipos incorrectos (ej. un string en lugar de un número).
Al usar DTOs basados en **clases**, no solo definimos la estructura esperada, sino que retenemos esta estructura en tiempo de ejecución. NestJS usa esta característica para poder interceptar la petición y validar los datos reales comparándolos con la clase DTO antes de que lleguen a nuestra lógica.

#### Diferencia entre recibir un objeto sin validar y un DTO validado

- **Sin validar:** Confías ciegamente en el cliente. Si un campo requerido falta, la aplicación podría crashear más adelante o guardar datos corruptos.
- **DTO validado:** Si el payload no cumple con las reglas del DTO, la petición es rechazada automáticamente con un error 400 (Bad Request) en la capa de entrada.

#### Beneficios para escalabilidad y mantenimiento

- **Documentación como código:** Cualquier desarrollador puede abrir el DTO y saber exactamente qué datos requiere ese endpoint.
- **Desacoplamiento:** Separas la forma en que entran los datos de cómo se guardan internamente.
- **Reutilización:** Se pueden construir DTOs para creación, y reutilizarlos para actualización (ej. con `PartialType`).

#### Organización recomendada de carpetas

Se recomienda agrupar los DTOs en una carpeta `dto` dentro de cada módulo.

```text
src/
└── cars/
    ├── dto/
    │   ├── create-car.dto.ts
    │   └── update-car.dto.ts
    ├── interfaces/
    │   └── car.interface.ts
    ├── cars.controller.ts
    └── cars.service.ts
```

#### Ejemplos de DTOs de Creación y Actualización

```typescript
// create-car.dto.ts
export class CreateCarDto {
  readonly brand: string;
  readonly model: string;
  readonly year: number;
}
```

---

## 2. Validación Avanzada: class-validator y class-transformer

Para que los DTOs no sean simplemente tipados estáticos, necesitamos decorarlos con reglas de validación. Aquí es donde entran las bibliotecas estándar de validación en NestJS.

### Instalación de dependencias

```bash
npm install class-validator class-transformer
```

#### ¿Qué son y por qué NestJS las utiliza?

- **`class-validator`:** Es una biblioteca que permite declarar reglas de validación utilizando decoradores de TypeScript (`@IsString()`, `@IsInt()`, etc.) directamente sobre las propiedades de una clase.
- **`class-transformer`:** Permite transformar objetos planos (literales JSON recibidos en la red) en instancias reales de las clases (nuestros DTOs) o transformar tipos de datos en tiempo de ejecución.

NestJS las adopta como estándar porque encajan a la perfección con la arquitectura de decoradores del framework. Al utilizarlas junto con un `ValidationPipe`, NestJS automatiza el flujo completo de validación.

### Flujo completo de validación HTTP

1. El cliente envía un JSON en una petición (ej. `POST`).
2. El enrutador de NestJS recibe la petición.
3. El `ValidationPipe` (ayudado por `class-transformer`) convierte ese JSON plano en una instancia de la clase DTO especificada en el controlador.
4. Se ejecutan las reglas de `class-validator` sobre esta nueva instancia.
5. Si hay errores, se interrumpe el ciclo y se responde al cliente con un 400 Bad Request y el detalle de los errores.
6. Si es válido, los datos limpios y transformados llegan al método del controlador.

### Decoradores de class-validator

Veamos los decoradores más utilizados en profundidad:

#### `@IsString()`

- **Objetivo:** Garantizar que el valor sea exclusivamente una cadena de texto.
- **Casos de uso:** Nombres, descripciones, identificadores, marcas.
- **Ejemplos válidos:** `"Toyota"`, `""` (es string, aunque vacío).
- **Ejemplos inválidos:** `123`, `true`, `null`.

#### `@MinLength(min)`

- **Objetivo:** Exigir una longitud mínima en un string.
- **Casos de uso:** Contraseñas (ej. mín 8 caracteres), nombres válidos.
- **Ejemplo válido:** `"Honda"` (longitud 5) si `@MinLength(3)`.
- **Ejemplo inválido:** `"Ho"` si `@MinLength(3)`.

#### `@IsUUID(version?)`

- **Objetivo:** Validar que el string tenga formato estándar de Identificador Único Universal (UUID).
- **Casos de uso:** IDs primarios en arquitecturas modernas.
- **Ejemplo válido:** `"123e4567-e89b-12d3-a456-426614174000"`.
- **Ejemplo inválido:** `"1234"`, `"abc"`.

#### `@IsOptional()`

- **Objetivo:** Indicar que la propiedad no es obligatoria. Si el cliente no la envía, la validación se ignora. Si la envía, entonces sí se aplican el resto de validadores.
- **Casos de uso:** DTOs de actualización (PATCH) donde el usuario solo modifica un campo y el resto no se envían.

#### Personalización de mensajes de error

Por defecto, NestJS genera mensajes legibles en inglés (ej. _"brand must be a string"_). Sin embargo, puedes personalizarlos:

```typescript
@IsString({ message: 'La marca debe ser una cadena de texto válida' })
@MinLength(3, { message: 'La marca debe contener al menos 3 caracteres' })
readonly brand: string;
```

NestJS toma estos mensajes de error y construye automáticamente un arreglo de strings dentro de la respuesta HTTP de error.

---

## 3. ValidationPipe a Fondo

### ¿Qué es el ValidationPipe?

Es el pipe integrado de NestJS diseñado para conectarse con `class-validator` y `class-transformer`. Es, probablemente, el pipe más crítico e importante del framework, ya que asegura que ningún dato malicioso o incorrecto alcance la lógica de negocio.

### Uso y Niveles de Aplicación

#### A nivel global

Configura la validación para toda la aplicación (normalmente en `main.ts`).

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  })
);
```

- **Ventajas:** Lo configuras una vez y te olvidas. Todos los endpoints quedan protegidos automáticamente. Es la práctica más recomendada.
- **Desventajas:** Puede ser inflexible si hay algún endpoint particular que requiera recibir datos "sucios" intencionalmente.

#### A nivel de controlador

Se aplica a todas las rutas de un controlador específico.

```typescript
@UsePipes(ValidationPipe)
@Controller('cars')
export class CarsController {}
```

- **Cuándo utilizarlo:** Cuando estás migrando una aplicación endpoint por endpoint y solo quieres activar la validación estricta en controladores nuevos o específicos.

#### A nivel de método

Se aplica solo a un endpoint particular.

```typescript
@Post()
@UsePipes(ValidationPipe)
create(@Body() createCarDto: CreateCarDto) {}
```

- **Cuándo utilizarlo:** Cuando tienes configuraciones globales u otro comportamiento por defecto, pero necesitas un nivel de validación diferente únicamente para una petición en concreto.

### Configuraciones clave: whitelist y forbidNonWhitelisted

El ValidationPipe es sumamente potente cuando se combina con estas opciones de seguridad de limpieza de datos.

#### `whitelist: true`

- **Qué hace exactamente:** "Corta" o elimina del objeto recibido todas aquellas propiedades que **no** estén decoradas en tu DTO.
- **Modificación:** Si el cliente envía `{ brand: "Toyota", color: "Rojo", injection: true }` y tu DTO solo tiene definido `brand`, el ValidationPipe purgará la propiedad `color` e `injection`, entregando al controlador solo `{ brand: "Toyota" }`.
- **Beneficio:** Evita inyecciones de datos no permitidos en la base de datos.

#### `forbidNonWhitelisted: true`

- **Qué hace:** Trabaja en conjunto con `whitelist`. En lugar de simplemente recortar y eliminar silenciosamente los campos no deseados, **rechaza** la petición y lanza un error indicando que se enviaron propiedades no permitidas.
- **Diferencia respecto a whitelist:** Mientras `whitelist` perdona y limpia el objeto, `forbidNonWhitelisted` es estricto y bloquea la petición por completo.
- **Casos de uso:** En aplicaciones financieras o de alta seguridad, donde recibir un campo no esperado es considerado un comportamiento malicioso que debe ser reportado.

---

## 4. UUID y ParseUUIDPipe

### El concepto de UUID

#### Instalación

```bash
npm install uuid
npm install --save-dev @types/uuid
```

#### ¿Qué es un UUID?

UUID significa **Universally Unique Identifier** (Identificador Único Universal). Es una cadena de texto de 36 caracteres.

#### ¿Qué significa UUID v4?

La versión 4 (v4) indica que el UUID se genera de manera completamente **aleatoria** basándose en criptografía (a diferencia de otras versiones que usan la dirección MAC o fecha).

#### Diferencias respecto a IDs numéricos (Autoincrementales)

- **IDs Numéricos:** Fáciles de leer, secuenciales y rápidos en bases de datos tradicionales.
- **UUIDs:** Cadenas de texto complejas, largas y no secuenciales.

#### Ventajas y Desventajas

- **Ventajas:**
  - **Seguridad:** Los IDs numéricos permiten adivinar cuántos registros tiene tu aplicación y realizar ataques de enumeración (probar `/cars/1`, `/cars/2`). Con UUID es matemáticamente imposible adivinar el identificador de otro registro.
  - **Sistemas Distribuidos:** Puedes generar un UUID en el frontend antes de enviarlo al servidor garantizando que nunca colisionará con otro ID en la base de datos.
- **Desventajas:** Son menos eficientes como índices de bases de datos relacionales debido a su tamaño.

#### Generar UUIDs

```typescript
import { v4 as uuid } from 'uuid';

const id = uuid(); // '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
```

### ParseUUIDPipe en NestJS

#### ¿Qué es y cómo funciona?

Así como existe un pipe para validar el cuerpo de la petición, `ParseUUIDPipe` analiza y valida un ID recibido a través de los parámetros de la URL (`@Param()`). Valida internamente que el string cumpla con el estándar UUID y rechaza la petición si el formato no es el correcto.

#### Integración con el ciclo de vida de la petición

```typescript
@Get(':id')
findOne(
  @Param(
    'id',
    new ParseUUIDPipe({ version: '4' }),
  )
  id: string,
) {
  return this.carsService.findOne(id);
}
```

#### ¿Qué ocurre si el UUID es inválido?

Si el cliente envía una petición a `/cars/hola-mundo`, el ciclo se detiene **antes de llegar a tu controlador o servicio**.
NestJS lanza automáticamente la excepción correspondiente y responde con un **400 Bad Request** y el mensaje _"Validation failed (uuid is expected)"_. Esto mejora enormemente la seguridad, robustez y el rendimiento (al evitar ir a buscar a base de datos identificadores con mal formato).

---

## 5. Organización de Código: Alias de Importación y Barrel Files

En proyectos que crecen rápido, mantener el código limpio es tan importante como la lógica de negocio.

### Alias de Importación

#### El problema de las rutas relativas largas

En arquitecturas profundas es común terminar con el "infierno de los puntos", lo que vuelve las importaciones ilegibles y frágiles ante reestructuraciones de carpetas:

```typescript
// Rutas frágiles:
import { User } from '../../../../users/entities/user.entity';
```

#### ¿Qué son y cuáles son los beneficios?

Los alias permiten configurar un atajo absoluto dentro del compilador para ciertos directorios. Facilitan las refactorizaciones y hacen el código mucho más declarativo y seguro.

#### Configuración típica en TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@users/*": ["src/users/*"],
      "@common/*": ["src/common/*"]
    }
  }
}
```

#### Ejemplo antes y después

- **Antes:** `import { JwtGuard } from '../../../common/guards/jwt.guard';`
- **Después:** `import { JwtGuard } from '@common/guards/jwt.guard';`

### Barrel Files (index.ts)

#### ¿Qué es un Barrel File?

Un archivo "barril" (`index.ts`) es un intermediario que consolida y re-exporta múltiples archivos de una misma carpeta.

#### ¿Qué problema resuelve?

Imagina que tienes múltiples DTOs para un recurso. Tendrías que realizar muchas importaciones en tu controlador:

```typescript
// Importaciones tradicionales (sin Barrel File)
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
```

#### Beneficios en proyectos medianos y grandes

Al usar un barrel file, la organización modular de NestJS brilla, ya que encapsula las carpetas, exponiendo al exterior únicamente lo que defines en el `index.ts`. Reduce líneas de código y tiene un impacto masivo en la mantenibilidad.

#### Ejemplo

Creas el archivo `index.ts` dentro de la carpeta `dto`:

```typescript
// dto/index.ts
export * from './create-car.dto';
export * from './update-car.dto';
```

Y ahora, el uso se simplifica drásticamente:

```typescript
import { CreateCarDto, UpdateCarDto } from './dto';
```

---

## 6. Proyecto Final de Unidad

Para asentar todos los conocimientos teóricos sobre validación, construirás desde cero una **API de Adopción de Mascotas (Pet Adoption API)** completamente validada.

### Enunciado del Proyecto: Pet Adoption API

Deberás construir una nueva API NestJS (`nest new pet-adoption-api`) aplicando rigurosamente los conceptos de este nivel.

### Requisitos Técnicos

1. **Scaffolding:** Utilizar el CLI para generar el recurso (`nest g res pets --no-spec`).
2. **UUIDs:** El ID de las mascotas debe ser un **UUID v4**. La entidad (`Pet`) usará `id: string`. Todos los controladores que reciban un ID deben validarlo usando `ParseUUIDPipe`.
3. **DTOs:** Crear `CreatePetDto` y `UpdatePetDto` (usando `PartialType`).
4. **class-validator:** Añadir validaciones a los DTOs:
   - `name`: Obligatorio, string, mínimo 2 caracteres.
   - `species`: Opcional, string.
   - `age`: Obligatorio, número. Usa `@IsNumber()` y `@IsPositive()`.
5. **ValidationPipe:** Implementar el `ValidationPipe` de forma global en `main.ts` con `whitelist: true` y `forbidNonWhitelisted: true`.
6. **Barrel Files:** Organizar y exportar los DTOs utilizando un `index.ts` dentro del directorio `dto`.

Este proyecto medirá tu capacidad de diseñar y proteger tu aplicación aplicando una capa robusta de validación para construir APIs a nivel de producción.
