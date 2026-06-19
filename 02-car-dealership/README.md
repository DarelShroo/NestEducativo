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

---

## Servicios e Inyección de Dependencias

Los **Servicios** son clases decoradas con `@Injectable()`. En ellos recae toda la **Lógica de Negocio** y el acceso a base de datos o arreglos en memoria.

La **Inyección de Dependencias (DI)** es el núcleo de Nest. Permite que un Controlador reciba automáticamente una instancia de un Servicio sin instanciarla (sin usar `new`).
Esto se hace en el constructor, utilizando TypeScript shorthand:

```typescript
// NestJS inicializará CarsService y lo pasará automáticamente
constructor(private readonly carsService: CarsService) {}
```

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
