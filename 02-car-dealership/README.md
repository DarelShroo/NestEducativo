# 02 - Car Dealership (Conceptos de NestJS)

Este proyecto introduce los conceptos fundamentales de NestJS, su arquitectura modular y el uso básico del CLI. A continuación tienes una guía detallada sobre todos los conceptos a estudiar.

## Comandos del Nest CLI

La CLI de Nest (`@nestjs/cli`) automatiza la creación del esqueleto (scaffolding) y componentes.
- **Instalación global:** `npm i -g @nestjs/cli`
- **Verificar versión instalada:** `nest -v`
- **Ver lista de comandos:** `nest -h`
- **Crear un nuevo proyecto:** `nest new nombre-proyecto` (crea la estructura base y el `package.json`).

### Generadores (`nest g`)
En lugar de crear archivos a mano, la CLI crea el archivo, su especificación (testing) y lo importa automáticamente en el módulo más cercano.
- `nest g mo cars`: Genera el **Módulo** de coches (`cars.module.ts`).
- `nest g co cars`: Genera el **Controlador** de coches (`cars.controller.ts`).
- `nest g s cars --no-spec`: Genera el **Servicio** de coches (`cars.service.ts`) omitiendo la creación del archivo de tests automáticos (`--no-spec`).

#### Generador de Recursos Completos (Resources)

El comando `generate resource` (o `res`) es una de las herramientas más potentes para acelerar el desarrollo en NestJS.

```bash
nest g res brands
```

*   **Qué hace:** Crea automáticamente una estructura completa y estandarizada para un nuevo recurso o dominio de la aplicación (CRUD completo).
*   **Qué genera:** Automáticamente crea el Módulo (`module`), Controlador (`controller`), Servicio (`service`), y de manera opcional te ayuda a generar las entidades y los DTOs para la creación y actualización.
*   **Beneficio:** Acelera drásticamente el desarrollo al generar todo el esqueleto (boilerplate) interconectado, listo para empezar a escribir lógica de negocio en lugar de crear y enlazar los archivos manualmente.

#### Flags importantes del CLI

Al usar los generadores de NestJS, puedes añadir banderas (flags) para modificar su comportamiento:

*   **`--no-spec`**: 
    ```bash
    nest g res brands --no-spec
    ```
    Evita la creación de archivos de pruebas unitarias (`.spec.ts`). Es muy útil en entornos de aprendizaje o durante la creación de prototipos rápidos donde no se requiere escribir tests, manteniendo el directorio limpio.

*   **`--dry-run`**:
    ```bash
    nest g res brands --dry-run
    ```
    Simula la ejecución del comando mostrando en la consola qué archivos se crearían o modificarían, pero **sin crear archivos reales** en el disco. Es invaluable para verificar y asegurar que la estructura generada será la correcta antes de aplicarla.

---

## Estructura de un Proyecto Nest (`nest new`)

Al iniciar un proyecto, la raíz contiene varios archivos vitales para el ecosistema Node/Nest:
- **`package.json`**: Define scripts de ejecución (`yarn start:dev`), dependencias (ej. RxJS, Express) y metadatos.
- **`yarn.lock`**: Fija un árbol exacto de dependencias para asegurar instalaciones reproducibles.
- **`nest-cli.json`**: Archivo de configuración de la CLI de NestJS. Informa de parámetros de compilación y ubicación de la carpeta de código (`src`).
- **`.eslintrc.js`**: Reglas estrictas de calidad de código y linter. Garantiza un código uniforme.
- **`.prettierrc`**: Reglas de formato de código automático (comillas simples, sangrías, etc).

---

## Módulos de Nest

Los **Módulos** (`@Module`) organizan la arquitectura en bloques de dominio altamente cohesivos. Toda aplicación tiene al menos un Root Module (`AppModule`).
Si creamos el recurso "Cars", tendrá su propio `CarsModule`, el cual debe encargarse de envolver sus propios Controladores y Servicios, e inyectarse en el `AppModule`.

### Exportación e Importación de Providers

Por defecto, los providers (como los Servicios) están encapsulados dentro de su propio módulo. Si otro módulo necesita utilizar un servicio ajeno, este debe ser exportado.

```ts
@Module({
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService], // Exponemos el servicio para que otros módulos lo usen
  imports: [], // Aquí importaríamos otros módulos si los necesitáramos
})
export class BrandsModule {}
```

*   **`exports`**: Un arreglo de providers que este módulo pone a disposición de cualquier otro módulo que lo importe. Sin declararlo aquí, el servicio es completamente privado para el resto de la aplicación.
*   **`imports`**: Un arreglo con los módulos requeridos, de los cuales este módulo necesita consumir sus providers exportados.
*   **Relación con Inyección de Dependencias**: Para que el contenedor de Inyección de Dependencias de NestJS pueda suministrar un servicio de otro dominio en tu módulo actual, es obligatorio establecer esta conexión entre `imports` y `exports`.

---

## Servicios e Inyección de Dependencias

Los **Servicios** son clases decoradas con `@Injectable()`. En ellos recae toda la **Lógica de Negocio** y el acceso a base de datos o arreglos en memoria.

La **Inyección de Dependencias (DI)** es el núcleo de Nest. Permite que un Controlador reciba automáticamente una instancia de un Servicio sin instanciarla (sin usar `new`).
Esto se hace en el constructor, utilizando TypeScript shorthand:

// NestJS inicializará CarsService y lo pasará automáticamente
constructor(private readonly carsService: CarsService) {}
```

### Inyección de Servicios en otros Servicios

NestJS permite inyectar servicios dentro de otros servicios. Esto es una pieza clave en la arquitectura modular, ya que permite reutilizar lógica sin duplicar código y delegar responsabilidades específicas a cada dominio.

**Ejemplo práctico:**
Si necesitas un servicio global para generar información de prueba (`SeedService`), este necesitará interactuar con los datos de coches y de marcas. Para ello, inyectamos los servicios correspondientes:

```ts
@Injectable()
export class SeedService {
  constructor(
    private readonly carsService: CarsService,
    private readonly brandsService: BrandsService,
  ) {}

  populateDB() {
    // Reutilizamos la lógica y el acceso a datos de los otros servicios
    this.carsService.fillCarsWithSeedData(SEED_CARS);
    this.brandsService.fillBrandsWithSeedData(SEED_BRANDS);
    return 'Seed executed successfully';
  }
}
```
*(Nota importante: Para que esto sea posible, `CarsModule` y `BrandsModule` deben exportar sus servicios, y el módulo donde reside `SeedService` debe importarlos).*

---

## Controladores y Endpoints

Los **Controladores** (`@Controller('cars')`) escuchan peticiones HTTP y despachan las respuestas. Nest mapea métodos HTTP a funciones mediante decoradores:

- **`@Get()`**: Retorna todos los recursos (ej. `getAllCars()` o `findAllCars()`).
- **`@Get(':id')`**: Busca un único recurso (`/cars/1`). **Importante: todo lo que llega por segmento de URL es un string**.
- **`@Post()`**: Crea un recurso nuevo. Su método asociado (ej. `createCar`) extrae los datos del cliente mediante el decorador `@Body()`.
- **`@Patch(':id')`**: Actualiza parcialmente un recurso. Se usa `@Param('id')` para identificar cuál coche actualizar y `@Body()` para saber qué campos modificar.
- **`@Delete(':id')`**: Elimina un recurso extrayendo su ID (`deleteCar(@Param('id') id)`).

---

## Pipes Integrados por Defecto

Los **Pipes** en NestJS se sitúan entre la petición HTTP y el Controlador. Sirven para dos cosas:
1. **Transformación:** Cambiar el tipo de dato.
2. **Validación:** Comprobar si un dato es válido.

Nest tiene pipes nativos integrados como `ParseUUIDPipe`, `ParseBoolPipe` y el más utilizado para IDs numéricos: **`ParseIntPipe`**.

Ejemplo: Convertir el string de la URL a un número automáticamente. Si el usuario envía texto en lugar de números (`/cars/abc`), el Pipe lanzará un error 400 antes de ejecutar la función.
```typescript
@Get(':id')
findOneById( @Param('id', ParseIntPipe) id: number ) { ... }
```

---

## Exception Filters

Los **Filtros de Excepciones** (Exception Filters) manejan de forma global y elegante los errores que lanzamos en el código.
Por defecto, Nest cuenta con un Global Exception Filter. Si lanzas un error predeterminado (como `NotFoundException`), Nest intercepta el error y lo moldea en un JSON estandarizado:
```json
{
  "statusCode": 404,
  "message": "Car with id '1' not found",
  "error": "Not Found"
}
```

---

## Arranque de Servidor
Para iniciar el entorno local con "hot-reload" (recarga ante cualquier cambio de archivo), se ejecuta:
```bash
yarn start:dev
```

---

## Interfaces en TypeScript

Las **Interfaces** son una de las características más potentes de TypeScript. Actúan como contratos estrictos que definen la "forma" o estructura geométrica que debe tener un objeto (sus propiedades, tipos y métodos requeridos), sin proveer ninguna implementación lógica real.

### Diferencias entre Interfaces y Clases

Es vital comprender esta distinción, ya que determina qué herramienta usar en la arquitectura de NestJS:

*   **Interfaces**: Únicamente existen en tiempo de desarrollo (compilación). TypeScript las utiliza para garantizar el tipado estático, pero **desaparecen por completo** en el código JavaScript final emitido. Debido a esto, **no pueden** usarse con librerías que requieran la información de los tipos en tiempo de ejecución (como `class-validator` y `ValidationPipe`).
*   **Clases**: Se conservan en el código JavaScript final (ECMAScript 6 en adelante). Pueden ser instanciadas y utilizadas en tiempo de ejecución, permitiendo a librerías y utilidades (como los decoradores) examinar sus metadatos para validar la información.

### Cuándo utilizar Interfaces en un proyecto NestJS

Dentro de un proyecto NestJS, las interfaces se emplean habitualmente para:
1.  **Definir Entidades de Dominio**: Como el modelo base de datos en arreglos en memoria (por ejemplo, la forma de `Car` antes de incorporar un ORM).
2.  **Tipar Respuestas HTTP o Servicios**: Para asegurar que el servicio y el controlador están trabajando y devolviendo la estructura de datos prometida. No deben usarse para validar datos entrantes del cliente en DTOs.

**Ejemplo práctico:**

// cars.interface.ts
export interface Car {
  id: string;
  brand: string;
  model: string;
}
```

### Campos de Entidades: Timestamps

Al definir entidades (interfaces o clases), es una práctica común y recomendada en APIs REST incluir campos para el seguimiento temporal de la información (timestamps):

```ts
export interface Brand {
  id: string;
  name: string;
  createdAt: number; // Marca temporal de creación
  updatedAt?: number; // Marca temporal de última actualización
}
```

*   **Qué representan:** `createdAt` marca el momento exacto en el que el registro se introduce en el sistema por primera vez. `updatedAt` se utiliza para registrar la última vez que el registro sufrió alguna alteración.
*   **Cuándo se asignan:**
    *   `createdAt`: Se asigna exclusivamente al momento de la creación del dato.
    *   `updatedAt`: Se asigna o se actualiza (ej. `updatedAt: new Date().getTime();`) cada vez que ocurre una mutación en los campos (como una actualización total o parcial).
*   **Diferencia y Buenas prácticas:** Mientras que la creación es un evento único en el ciclo de vida del dato, la actualización es recurrente. Conservar estos metadatos es fundamental para el ordenamiento cronológico, auditoría, y sincronización de estado en clientes frontend.

---

## DTOs (Data Transfer Objects)

Los **DTOs (Objetos de Transferencia de Datos)** son un patrón de diseño fundamental en arquitecturas empresariales y NestJS hace un fuerte énfasis en ellos para el manejo de la capa de red.

### Qué son y por qué son importantes

Un DTO es un objeto utilizado exclusivamente para encapsular datos y enviarlos de un subsistema a otro (por ejemplo, desde el cliente (Frontend) hacia el Controlador (Backend) a través del protocolo HTTP). 
A diferencia de una entidad o un modelo de base de datos, un DTO no contiene comportamiento o lógica de negocio compleja, se enfoca estrictamente en **definir y restringir qué datos esperamos recibir o enviar**.

### Beneficios

1.  **Contratos Robustos y Tipado:** Proveen un contrato claro y predecible de los datos en tránsito, mejorando la legibilidad.
2.  **Desacoplamiento:** Separan la representación de los datos de entrada/salida de la estructura interna del modelo de base de datos, facilitando el mantenimiento a largo plazo.
3.  **Seguridad y Validación:** Previenen ataques de inyección excesiva de datos (Over-Posting) al filtrar propiedades no deseadas, y habilitan la validación a nivel de capa mediante decoradores.

### Estructura de carpetas recomendada

Lo ideal es mantener todos los DTOs que pertenecen a un mismo recurso agrupados dentro de un subdirectorio dedicado llamado `dto` en la raíz de dicho módulo:
- `src/cars/dto/create-car.dto.ts`
- `src/cars/dto/update-car.dto.ts`

### Ejemplos Completos de DTOs

**Creación (CreateCarDto):**
```ts
export class CreateCarDto {
  readonly brand: string;
  readonly model: string;
}
```
*Nota: Se recomienda usar propiedades `readonly` para garantizar la inmutabilidad de los datos en tránsito, previniendo modificaciones accidentales a lo largo de las capas (Pipes, Guards, Controladores).*

**Actualización (UpdateCarDto):**
En las actualizaciones los campos suelen ser opcionales, permitiendo actualizaciones parciales (PATCH).

```ts
export class UpdateCarDto {
  readonly brand?: string;
  readonly model?: string;
}
```

---

## Validaciones y Transformaciones Automáticas

En NestJS evitamos validar los datos de forma imperativa manual. En su lugar, utilizamos un ecosistema poderoso basado en decoradores y el `ValidationPipe`.

### Instalación de dependencias para validación

Para activar el uso de decoradores de validación necesitamos instalar estas librerías:

```bash
npm install class-validator class-transformer
```

*   **`class-validator`**: Una librería que proporciona decoradores especializados (`@IsString()`, `@IsEmail()`, etc.) para definir de forma declarativa las reglas de validación directamente sobre las clases.
*   **`class-transformer`**: Una librería que permite transformar objetos literales o JSON planos recibidos del cliente a instancias reales de clases (DTOs), y viceversa, o mutar/castear tipos automáticos.
*   **Por qué NestJS los utiliza conjuntamente**: NestJS integra ambas para dar seguridad en la capa de transporte. `ValidationPipe` utiliza internamente `class-transformer` para convertir y transformar el JSON genérico en tu clase DTO; inmediatamente después, usa `class-validator` para ejecutar todas las reglas definidas en los decoradores y arrojar las correspondientes Excepciones HTTP en caso de existir un fallo en los datos.

### Decoradores de class-validator

Los decoradores se aplican directamente sobre las propiedades declaradas dentro del DTO. Aquí tenemos algunos de los más habituales:

*   **`@IsString()`**: Verifica que el valor enviado en la petición sea estrictamente una cadena de texto.
*   **`@MinLength(n)`**: Garantiza que el string posea una longitud mínima de `n` caracteres.
*   **`@IsUUID()`**: Valida que la cadena sea un Identificador Único Universal con el formato estándar correcto.
*   **`@IsOptional()`**: Permite que el campo no sea requerido. Si el campo no es enviado en la petición, lo ignora. Si sí se envía, se ejecutarán las validaciones subsecuentes que el campo tenga decoradas.

**Casos de uso reales y personalización:**

Puedes personalizar profundamente el mensaje de error de respuesta que verá el consumidor del API usando la propiedad `message`. Esto resulta muy valioso para la retroalimentación en aplicaciones Frontend o en respuestas para clientes externos.

```ts
import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateCarDto {
  @IsString({
    message: 'Debe ser un string',
  })
  readonly brand: string;

  @IsString()
  @MinLength(3)
  readonly model: string;
  
  @IsOptional()
  @IsString()
  readonly notes?: string;
}
```

### ValidationPipe

El `ValidationPipe` es la pieza central que orquesta este proceso de validación. Es un Pipe incorporado en NestJS que actúa como barrera de protección. Intercepta automáticamente la entrada HTTP, transforma los datos al tipo DTO, y aplica las validaciones.

#### Configuración Óptima del ValidationPipe (Global)

En tu archivo principal `main.ts`, este Pipe suele activarse de forma global para toda la aplicación:

```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

**Explicación detallada de configuraciones de limpieza de datos:**

##### whitelist (Lista Blanca)

Elimina automáticamente propiedades que se reciban en el cuerpo de la petición (`Body`) y que no estén expresamente definidas dentro de tu clase DTO.

*   **Ejemplo Práctico de entrada y salida:**
    *   **Esperamos (DTO):** `{ brand: string, model: string }`
    *   **Cliente envía:** `{ "brand": "Toyota", "model": "Corolla", "isAdmin": true, "hackId": 123 }`
    *   **Controlador recibe:** `{ "brand": "Toyota", "model": "Corolla" }` *(El ValidationPipe limpia silenciosamente la basura).*

##### forbidNonWhitelisted (Prohibir no listados en lista blanca)

Al combinarlo con `whitelist: true`, esta regla es más severa: Lanza una excepción inmediata y detiene el flujo si la petición contiene campos basura o maliciosos no definidos en el DTO.

*   **Ejemplo Práctico:**
    Usando la misma petición maliciosa de arriba que incluye `isAdmin`, el cliente obtendría este error bloqueante:
    ```json
    {
      "statusCode": 400,
      "message": [
        "property isAdmin should not exist",
        "property hackId should not exist"
      ],
      "error": "Bad Request"
    }
    ```

#### Uso de ValidationPipe: Global vs Controladores vs Métodos

Dependiendo del nivel de protección o del caso de uso de tu arquitectura, NestJS te permite inyectar el ValidationPipe a distintos alcances.

**1. Uso Global (`app.useGlobalPipes`)**
Es el enfoque más recomendado (mostrado en el ejemplo anterior).
*   **Ventajas:** Toda la aplicación cuenta con validación por defecto. Alta consistencia y seguridad al no depender de poner decoradores por cada archivo nuevo que se cree.
*   **Desventajas:** Puede resultar rígido si manejas APIs de terceros muy flexibles sin estructura donde requieras obviar la validación en casos concretos.

**2. A nivel de Controlador**
Se aplica usando el decorador `@UsePipes` justo encima del controlador. Automáticamente cubrirá todos los métodos y verbos HTTP de esa clase.

```ts
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';

@UsePipes(ValidationPipe)
@Controller('cars')
export class CarsController {
    // Todo método aquí estará protegido y validado
}
```
*   **Cuándo utilizarlo:** Ideal en arquitecturas donde por algún motivo tienes Controladores especiales (por ejemplo para Webhooks entrantes muy libres) que no deben usar validaciones, reservando el uso de `ValidationPipe` en bloques definidos o endpoints puntuales que lo ameriten explícitamente.

**3. A nivel de Método**
El Pipe se aplica exclusivamente en el método asociado a un endpoint.

```ts
import { Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('cars')
export class CarsController {
  
  @Post()
  @UsePipes(ValidationPipe)
  create() {
    // Solo en este endpoint se requerirán y validarán los DTOs
  }
}
```
*   **Cuándo utilizarlo:** Uso infrecuente. Sirve si tienes un controlador mayormente desprotegido, pero donde una acción crítica y particular requiere forzosamente de su propia validación.
*   **Desventajas:** Fomenta duplicación, y al generar mucho código repetitivo de forma constante es muy propenso a errores humanos y olvidos, abriendo posibles brechas en endpoints recién desarrollados.

---

## UUID (Universally Unique Identifier)

El UUID (Identificador Único Universal) es un estándar en computación para la creación e identificación de recursos de forma segura a través de 128 bits, asegurando que su resultado es mundialmente único.

### Diferencias frente a IDs numéricos y casos de uso

*   **Evita ataques de enumeración**: Los IDs numéricos clásicos (1, 2, 3...) hacen que la arquitectura interna y la cantidad total de datos insertados sea deducible. Los UUID evitan por completo que alguien prediga el ID de otro recurso, dando gran seguridad.
*   **Sistemas Distribuidos**: Especialmente útil en bases de datos NoSQL o microservicios donde diferentes nodos pueden generar un ID único sin consultar una tabla central ni riesgo de colisiones.
*   **Identificadores Públicos**: Ideales como ID principal visible y rastreable en aplicaciones de front-end y APIs expuestas.

### Instalación de UUID

```bash
npm install uuid
npm install --save-dev @types/uuid
```
*Se instalan los tipos (`@types/uuid`) como dependencia de desarrollo para disfrutar del autocompletado en TypeScript.*

### Implementación (UUID v4)

La versión 4 (v4) es una de las más extendidas, genera identificadores fundamentados enteramente en números seudoaleatorios.

**Ejemplo de generación:**
```ts
import { v4 as uuid } from 'uuid';

const id = uuid(); // ej. '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
```

### ParseUUIDPipe

Como aprendimos anteriormente, un Pipe en NestJS funciona como middleware para inspeccionar y/o transformar datos entrantes.

**Funcionamiento de `ParseUUIDPipe`:**
Es un Pipe nativo de validación que inspecciona y analiza si un parámetro de ruta o cadena entrante es un UUID con formato estándar y semántico de manera estricta.

**Validación automática de parámetros (Ejemplos):**

```ts
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';

@Controller('cars')
export class CarsController {

  @Get(':id')
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
  ) {
    return this.carsService.findOne(id);
  }

}
```

Por seguridad, podemos especificar una versión restrictiva particular que queremos que nuestro ParseUUIDPipe acepte instanciándolo con un objeto de opciones:

```ts
new ParseUUIDPipe({
  version: '4',
})
```

**Errores devueltos:**
Si el cliente suministra algo que carece de estructura UUID (como `/cars/abc` o `/cars/123`), el pipe aborta la consulta e impide que llegue al servicio, devolviendo en su lugar:

```json
{
  "statusCode": 400,
  "message": "Validation failed (uuid is expected)",
  "error": "Bad Request"
}
```

---

## Patrones de Organización y Clean Code

Al aumentar el número de archivos (servicios, interfaces, DTOs), el código puede volverse caótico en importaciones. NestJS facilita algunas prácticas para escalar cleanly.

### Archivo index.ts dentro de módulos (Barrel Files)

Un Archivo de Barril (Barrel File) es la estrategia de emplear un archivo `index.ts` al nivel de un directorio o subdirectorio para encapsular, centralizar y re-exportar a través de él las dependencias de los distintos archivos del nivel.

**Ventajas y Organización:**
*   **Organización del proyecto:** Oculta la complejidad de múltiples subdirectorios o archivos pequeños de un componente, exportando una API simplificada.
*   **Simplificación de importaciones:** Permite traer muchos recursos procedentes del mismo contexto desde una única ubicación sin tener varias líneas redundantes.

**Implementación de Ejemplo:**

*En `dto/index.ts`:*
```ts
export * from './create-car.dto';
export * from './update-car.dto';
```

**Uso:**

*En tu controlador, en lugar de importar línea por línea:*
```ts
// Mal
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
```

*Importamos ambos limpiamente apuntando a la carpeta (Node resolverá el `index.ts` en automático):*
```ts
// Excelente
import {
  CreateCarDto,
  UpdateCarDto,
} from './dto';
```

### Alias de importación

**Problema que resuelven:**
Previenen las ilegibles rutas de importación relativas largas llenas de retrocesos (`../../../../`). Ayudan drásticamente en la movilidad del código: si mueves un fichero que tiene un Alias de importación interno o de utilidades, no vas a romper sus vínculos de dependencias.

**Ventajas frente a rutas relativas largas:**
Logran un código visualmente limpio y fácil de inspeccionar de un vistazo.

**Configuración típica en TypeScript:**
El archivo base de configuración del entorno de TypeScript (`tsconfig.json`) provee la llave `paths` dentro de `compilerOptions`, que nos sirve para referenciar estos atajos desde la ubicación raíz o base elegida.

*Ejemplo en `tsconfig.json`:*
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@cars/*": ["src/cars/*"],
      "@common/*": ["src/common/*"]
    }
  }
}
```

**Ejemplos prácticos:**

```ts
// En lugar de esta ruta frágil e ilegible...
import { ParseUUIDPipe } from '../../../common/pipes/parse-uuid.pipe';

// Usamos el alias absoluto y semántico
import { ParseUUIDPipe } from '@common/pipes/parse-uuid.pipe';
```

---

## Normalización y Manipulación de Strings

Cuando trabajamos con información proveniente del usuario a través de peticiones HTTP, es crítico aplicar normalizaciones a nivel de código para mantener la base de datos consistente.

### `.toLocaleLowerCase()`

El método `.toLocaleLowerCase()` nativo de JavaScript/TypeScript transforma una cadena de texto a minúsculas, tomando en consideración las convenciones locales del sistema.

**Casos de uso y Buenas prácticas:**
*   **Normalización de inputs del usuario:** Los usuarios pueden introducir datos con diferentes formatos ("HONDA", "Honda", "honda"). Es una excelente práctica estandarizarlo antes del guardado.
*   **Validación e integridad de datos:** Si necesitas verificar si un nombre ya existe en la base de datos (para no crear un registro duplicado), debes comparar ambas entidades en minúsculas, asegurando así una búsqueda agnóstica de formato.

**Ejemplo práctico de uso en un servicio:**

```ts
create(createBrandDto: CreateBrandDto) {
  const brand: Brand = {
    id: uuid(),
    // Normalizamos forzosamente el string a minúsculas
    name: createBrandDto.name.toLocaleLowerCase(),
    createdAt: new Date().getTime(),
  }
  // ...
}
```
De esta forma garantizamos que la representación del dato sea internamente predecible sin importar cómo lo haya escrito el cliente.
