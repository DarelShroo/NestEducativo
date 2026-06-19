# 📘 TypeScript para NestJS: Guía Definitiva y Apuntes del Curso

Bienvenido a esta guía exhaustiva y material de estudio diseñado para dominar TypeScript desde cero, con un enfoque particular en prepararte para el desarrollo profesional con el framework **NestJS**. Este documento no es un simple resumen; es una referencia profunda estructurada para que puedas volver a ella en el futuro y entender el *porqué* detrás de cada concepto.

---

## 📑 Índice de Contenidos

1. [Creación y ejecución de proyectos con Vite](#1-creación-y-ejecución-de-proyectos-con-vite)
2. [Variables y tipos de datos](#2-variables-y-tipos-de-datos)
3. [Template Strings](#3-template-strings)
4. [Arrays](#4-arrays)
5. [Objetos](#5-objetos)
6. [Interfaces](#6-interfaces)
7. [Clases](#7-clases)
8. [Constructor simplificado](#8-constructor-simplificado)
9. [Instanciación de clases](#9-instanciación-de-clases)
10. [Métodos, this y getters](#10-métodos-this-y-getters)
11. [Métodos estáticos](#11-métodos-estáticos)
12. [Programación asíncrona](#12-programación-asíncrona)
13. [Consumo de APIs con Axios](#13-consumo-de-apis-con-axios)
14. [Tipado de respuestas HTTP](#14-tipado-de-respuestas-http)
15. [Desestructuración](#15-desestructuración)
16. [Inyección de dependencias en TypeScript](#16-inyección-de-dependencias-en-typescript)
17. [Genéricos](#17-genéricos)
18. [Principio de Sustitución de Liskov](#18-principio-de-sustitución-de-liskov)
19. [Decoradores](#19-decoradores)
20. [Resumen de conceptos aprendidos](#20-resumen-de-conceptos-aprendidos)
21. [Cómo se relaciona todo esto con NestJS](#21-cómo-se-relaciona-todo-esto-con-nestjs)

---

## 1. Creación y ejecución de proyectos con Vite

### ¿Qué es Vite?
Vite (palabra en francés para "rápido") es una herramienta de construcción (bundler) y un servidor de desarrollo local de próxima generación creado por Evan You (el creador de Vue.js). A diferencia de herramientas más antiguas como Webpack, Vite aprovecha los módulos ES nativos (ESM) del navegador para ofrecer tiempos de carga casi instantáneos.

### Diferencias con otros bundlers
Mientras que Webpack empaqueta toda tu aplicación antes de servirla (lo que toma tiempo a medida que el proyecto crece), Vite sirve el código fuente sobre ESM nativo y solo compila los archivos bajo demanda cuando el navegador los solicita. 

* **Webpack/CRA:** Construye TODO ➡️ Sirve.
* **Vite:** Inicia el servidor ➡️ Transpila solo lo que pides.

### `yarn create vite`
Este comando inicia un asistente por consola que te permite generar un andamiaje (scaffolding) de un proyecto.

```bash
yarn create vite
```

* **Qué hace:** Descarga la plantilla más reciente de Vite y configura un proyecto base. Te preguntará el nombre del proyecto, el framework (Vanilla, Vue, React, etc.) y la variante (TypeScript o JavaScript).
* **Estructura básica generada:**
  * `index.html`: El punto de entrada de la aplicación.
  * `src/`: Carpeta donde vivirá el código fuente (`main.ts`, etc.).
  * `package.json`: Archivo de configuración de dependencias y scripts de Node.
  * `tsconfig.json`: Archivo de configuración estricta para TypeScript.

### `yarn dev`
Una vez instaladas las dependencias (con `yarn install`), se utiliza este comando para arrancar el entorno.

```bash
yarn dev
```

* **Qué hace:** Ejecuta el script `dev` definido en el `package.json`, levantando el servidor de desarrollo local de Vite.
* **Servidor que levanta:** Un servidor HTTP ultrarrápido con Hot Module Replacement (HMR). El HMR permite que cuando guardes un archivo, solo ese pequeño fragmento se actualice en el navegador sin recargar toda la página.
* **Flujo típico:** Escribes código ➡️ Guardas ➡️ Vite intercepta el cambio ➡️ Actualiza instantáneamente el módulo en el navegador.

> [!TIP]
> **Relación con NestJS:** NestJS no usa Vite por defecto para el backend, utiliza el CLI de Nest que encapsula Webpack o SWC. Sin embargo, entender herramientas modernas de frontend y Node es esencial porque muchas veces servirás aplicaciones Nest junto con clientes Vite.

---

## 2. Variables y tipos de datos

### Tipado Estático vs Inferencia
TypeScript añade "tipos estáticos" a JavaScript. Esto significa que puedes decirle al compilador exactamente qué tipo de dato debe almacenar una variable, y este te alertará si intentas asignarle algo incorrecto antes de ejecutar el código.

```ts
const name: string = 'Darel';
let age: number = 30;
```

Sin embargo, TypeScript es lo suficientemente inteligente como para hacer **inferencia de tipos**. Si omites el tipo pero asignas un valor inicial, TS adivinará el tipo:
```ts
let pokemon = 'Pikachu'; // TS infiere que es de tipo 'string'
// pokemon = 10; // Error: Type 'number' is not assignable to type 'string'
```

### Tipos de datos en TypeScript

| Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `string` | Cadenas de texto. | `'Hola'`, `"Mundo"`, `` `Hola ${name}` `` |
| `number` | Números enteros, flotantes, binarios. | `10`, `3.14`, `0xff` |
| `boolean` | Valores lógicos verdadero/falso. | `true`, `false` |
| `undefined` | Variable declarada pero sin valor asignado. | `let a;` (a es undefined) |
| `null` | Ausencia intencional de cualquier valor. | `let b = null;` |
| `any` | **[EVITAR]** Desactiva el tipado estricto. Acepta todo. | `let c: any = 'test'; c = 1;` |
| `unknown` | Similar a any, pero seguro. Exige validación previa. | `let d: unknown = 4; if(typeof d === 'number') d++;` |
| `void` | Ausencia de tipo de retorno en una función. | `function log(): void { console.log('X') }` |
| `never` | Valores que nunca ocurren (errores, loops infinitos). | `function error(): never { throw new Error() }` |

> [!WARNING]
> **Errores comunes:** El mayor error de un principiante en TS es usar `any` para escapar de los errores del compilador. Usar `any` destruye el propósito de usar TypeScript.

> [!IMPORTANT]
> **Relación con NestJS:** NestJS depende fuertemente de los tipos para la validación de datos a través de DTOs (Data Transfer Objects). Declarar el tipo estricto es obligatorio para que los validadores automáticos de Nest funcionen adecuadamente.

---

## 3. Template Strings

### ¿Qué son y cómo funcionan?
Los Template Strings (plantillas literales) son una característica de ES6 que permite incrustar expresiones y variables dentro de una cadena de texto de manera muy limpia utilizando *backticks* (`` ` ``).

```ts
const name = 'Darel';
const message = `Hola ${name}`;
console.log(`${name} tiene ${30 + 1} años`);
```

### Ventajas frente a la concatenación tradicional
Antes de los template strings, concatenar era tedioso y propenso a errores:
* **Antiguo:** `var msg = "Hola " + name + ", bienvenido a la clase número " + num + ".";`
* **Moderno:** `const msg = \`Hola ${name}, bienvenido a la clase número ${num}.\`;`

### Casos de uso reales
1. **Consultas SQL dinámicas:** `` const query = `SELECT * FROM users WHERE id = ${userId}`; ``
2. **Generación de HTML:** `` const html = `<div><h1>${title}</h1></div>`; ``
3. **Mensajes de log complejos:** Muy utilizados para debuggear mostrando el estado de múltiples variables.

> [!TIP]
> **Relación con NestJS:** En NestJS, los template strings son vitales a la hora de lanzar excepciones con mensajes dinámicos, por ejemplo: `throw new NotFoundException(\`El Pokémon con ID ${id} no fue encontrado\`);`

---

## 4. Arrays

### Declaración y Tipado
Los arrays en TypeScript deben estar tipados para asegurar que todos los elementos internos mantengan consistencia. Se declaran indicando el tipo seguido de corchetes `[]` o usando la clase genérica `Array<T>`.

```ts
const pokemons: string[] = ['Bulbasaur', 'Charmander', 'Squirtle'];
const numbers: number[] = []; // Array vacío esperando números
```

### Métodos comunes
Los arrays vienen con métodos incorporados extremadamente potentes para manipulación de datos (programación funcional).

* **`push(...)`**: Añade uno o más elementos al final del array. (Mutador)
  ```ts
  pokemons.push('Pikachu');
  ```
* **`pop()`**: Extrae y devuelve el último elemento del array. (Mutador)
* **`map()`**: Crea un **nuevo** array aplicando una función a cada elemento. (No mutador)
  ```ts
  const upperPokemons = pokemons.map(p => p.toUpperCase());
  ```
* **`filter()`**: Crea un **nuevo** array con todos los elementos que pasen una condición.
  ```ts
  const filtered = pokemons.filter(p => p.startsWith('C')); // ['Charmander']
  ```
* **`find()`**: Devuelve el **primer** elemento que cumpla una condición.
  ```ts
  const found = pokemons.find(p => p === 'Bulbasaur');
  ```
* **`reduce()`**: Ejecuta una función reductora sobre cada elemento, devolviendo un único valor final.
  ```ts
  const totalLength = pokemons.reduce((acc, curr) => acc + curr.length, 0);
  ```

> [!NOTE]
> **Relación con NestJS:** Cuando consumes base de datos con TypeORM o Prisma en NestJS, el resultado suele ser un Array de objetos. Usarás intensivamente `map` para transformar entidades de base de datos a DTOs de respuesta pública.

---

## 5. Objetos

### Propiedades, Acceso y Modificación
En JavaScript/TypeScript, un objeto literal es una colección de pares clave-valor.

```ts
const pokemon = {
  id: 1,
  name: 'Charmander',
  type: 'Fire'
};
```

* **Acceso:** Se accede mediante punto (`pokemon.name`) o corchetes (`pokemon['name']`).
* **Modificación:** Simplemente reasignando: `pokemon.name = 'Charmeleon';`.

### Copias y el Spread Operator (`...`)
En JavaScript, los objetos se asignan por **referencia**, no por valor. Si haces `const a = b`, ambos apuntan a la misma memoria. Para hacer una copia superficial (shallow copy), se usa el spread operator.

```ts
const pikachu = { id: 25, name: 'Pikachu' };
const raichu = { ...pikachu, name: 'Raichu', id: 26 }; // Copia y sobrescribe
```

### El método `join()` (Sobre Arrays de Objetos)
El usuario pide explicar `join()` aquí. `join()` es un método de los *Arrays* que une todos los elementos en un string, separados por un carácter específico. Es muy útil cuando extraemos valores de objetos.

```ts
const types = ['Fire', 'Flying'];
console.log(types.join(', ')); // Output: "Fire, Flying"

// Aplicado tras procesar objetos:
const team = [{ name: 'Mew' }, { name: 'Celebi' }];
const namesStr = team.map(p => p.name).join(' - '); 
// Output: "Mew - Celebi"
```

---

## 6. Interfaces

### ¿Qué son y para qué sirven?
Una interfaz en TypeScript es un "contrato" que define la forma que debe tener un objeto. Las interfaces no existen en JavaScript puro; desaparecen al compilar. Solo sirven durante el desarrollo para verificar reglas estrictas.

```ts
interface Pokemon {
  id: number;
  name: string;
  age?: number; // El símbolo ? hace que la propiedad sea opcional
}
```

* **Propiedades Opcionales (`?`):** Indican que el objeto puede o no contener esa llave.
* **Arrays tipados con interfaces:** Puedes definir arreglos enteros basándote en interfaces.
  ```ts
  const myTeam: Pokemon[] = [
    { id: 1, name: 'Bulbasaur' },
    // Si olvidamos el 'id', TypeScript lanzará un error.
  ];
  ```

### Diferencias con `type`
* Las `interfaces` están pensadas exclusivamente para modelar objetos. Son extensibles y permiten "Declaration Merging" (si declaras dos interfaces con el mismo nombre, se fusionan).
* Los `types` pueden representar primitivos, uniones, intersecciones y tuplas, además de objetos.
* **Buena práctica:** Usa `interface` para definir la estructura de clases y objetos de dominio. Usa `type` para alias complejos y uniones.

> [!IMPORTANT]
> **Relación con NestJS:** Las interfaces son el pilar fundamental para definir contratos en NestJS. Cuando haces inyección de dependencias o aplicas patrones arquitectónicos, las interfaces garantizan que los servicios cumplan exactamente con los métodos requeridos.

---

## 7. Clases

Las clases son la base de la Programación Orientada a Objetos (POO). Actúan como "fábricas" o moldes para crear instancias de objetos que comparten propiedades y métodos.

```ts
export class Pokemon {
  public eyes: number = 2; // Propiedad con valor por defecto
  public types = ['fire']; // Inferencia de tipo: string[]

  // El constructor se ejecuta AUTOMÁTICAMENTE cuando se hace un 'new Pokemon()'
  constructor(id: number, name: string) {
    console.log('constructor called');
    // Normalmente aquí asignarías this.id = id;
  }
}
```

### Elementos clave:
* **Clases:** El molde de definición (`class Pokemon`).
* **Instancias:** El objeto vivo creado a partir del molde.
* **Constructores:** La función especial que inicializa el objeto en el momento de su creación.
* **Propiedades:** Las variables que pertenecen a la clase (estado).
* **Métodos:** Las funciones que pertenecen a la clase (comportamiento).
* **Encapsulación:** Capacidad de ocultar información usando modificadores de acceso (`public`, `private`).

---

## 8. Constructor simplificado

TypeScript introdujo una forma extremadamente elegante de definir e inicializar propiedades en el constructor de una clase para evitar escribir código repetitivo (boilerplate).

### Forma Tradicional (Tediosa)
```ts
class Pokemon {
  public id: number;
  public name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}
```

### Forma Simplificada (El Estándar en TS)
```ts
class Pokemon {
  constructor(
    public readonly id: number,
    public name: string,
  ) {}
}
```

Añadiendo el modificador de acceso directo en los parámetros del constructor, TypeScript crea las propiedades de clase y les asigna el valor automáticamente bajo el capó.

### Modificadores de Acceso
* `public`: Accesible desde cualquier parte. Es el valor por defecto.
* `private`: Accesible **solo** dentro de la clase donde se definió. Protege los datos.
* `protected`: Accesible en la clase donde se definió y en las clases hijas (herencia).
* `readonly`: Permite leer el valor pero impide que sea reasignado después de su inicialización en el constructor.

> [!TIP]
> **Relación con NestJS:** Verás el "constructor simplificado" en **TODOS** los servicios y controladores de NestJS. NestJS inyecta dependencias a través del constructor, y esta sintaxis permite declarar los servicios de forma ultra limpia: `constructor(private readonly usersService: UsersService) {}`

---

## 9. Instanciación de clases

Instanciar significa crear un objeto real (que ocupará espacio en memoria) basándote en el plano teórico que es la clase.

```ts
const charmander = new Pokemon(4, 'Charmander');
```

* **Operador `new`:** Este operador le dice al motor de JavaScript: "Busca la clase, crea un nuevo objeto vacío en memoria, asocia este objeto a la clase, y ejecuta la función `constructor` pasándole los argumentos".
* **Ciclo de vida:**
  1. Se reserva memoria.
  2. Se asignan propiedades por defecto (ej. `eyes = 2`).
  3. Se ejecuta el bloque del `constructor`.
  4. Retorna el objeto listo para usarse.

---

## 10. Métodos, `this` y Getters

### Métodos
Un método es simplemente una función que pertenece a una clase.

### La palabra clave `this`
Dentro de una clase, `this` hace referencia a la **instancia actual** del objeto. Es el puente para acceder a las propias propiedades del objeto desde dentro de él.

### Getters (`get`)
Un getter es un método especial que simula ser una propiedad. Se invoca sin paréntesis. Su propósito es procesar o calcular información basada en el estado de la clase antes de devolverla.

```ts
class Pokemon {
  constructor(public id: number, public name: string) {}

  // Getter: Parece una propiedad desde afuera
  get imageUrl(): string {
    return `https://pokeapi.com/sprites/${this.id}.png`;
  }

  // Método: Requiere ejecución ()
  speak(): string {
    return `${this.name.toUpperCase()}!!!`;
  }
}

const pika = new Pokemon(25, 'Pikachu');
console.log(pika.imageUrl); // Se accede SIN paréntesis
console.log(pika.speak());  // Se invoca CON paréntesis (Ejemplo con método nativo toUpperCase)
```

**Diferencias:**
* Las propiedades son "datos estáticos" guardados en memoria.
* Los getters son "datos calculados" bajo demanda. Protegen el estado interno y permiten ejecutar lógica.

---

## 11. Métodos estáticos

Un método estático (`static`) pertenece a la **Clase** en sí misma, no a las instancias de la clase. No necesitas (ni puedes) usar `new` para llamar a un método estático.

```ts
export class MathHelper {
  static PI = 3.1415;

  static calculateArea(radius: number): number {
    return this.PI * radius * radius;
  }

  private static doInternalMath(): void {
    // Solo usable dentro de MathHelper
  }
}

// Invocación directa sobre la clase:
console.log(MathHelper.calculateArea(10));
```

* **Diferencias:** Los métodos de instancia (`speak()`) necesitan un objeto vivo porque usan el `this` del objeto. Los estáticos actúan como funciones puras agrupadas bajo un espacio de nombres (la clase).
* **`private static`:** Aplica encapsulación estricta. El método es estático pero solo puede llamarse desde otros métodos estáticos internos de la clase.

---

## 12. Programación asíncrona

JavaScript es "Single Threaded" (un solo hilo). Para no bloquear la aplicación mientras espera operaciones lentas (como leer una base de datos o hacer peticiones HTTP), usa la asincronía.

### Evolución de la Asincronía
1. **Callbacks:** Pasar una función como parámetro para ejecutarse cuando acabe la tarea. Conducía al temido *Callback Hell* (código en forma de pirámide).
2. **Promesas (`Promise`):** Un objeto que representa la terminación o el fracaso eventual de una operación asíncrona.

### Estados de una Promesa
* **`pending` (Pendiente):** La operación ha iniciado pero no ha terminado.
* **`fulfilled` (Cumplida):** La operación terminó con éxito (arroja un resultado).
* **`rejected` (Rechazada):** La operación falló (arroja un error).

### Async / Await
Es "azúcar sintáctico" sobre las Promesas. Permite escribir código asíncrono que se lee como si fuera secuencial (síncrono), haciéndolo muchísimo más comprensible.

```ts
const fetchPokemon = async (): Promise<void> => {
  try {
    const data = await traerDatosDeInternet(); // Pausa la ejecución AQUÍ hasta que la promesa se resuelva
    console.log(data);
  } catch (error) {
    console.error('Error al obtener datos');
  }
}
```

### Diagrama de ejecución Async/Await

```text
  [ Hilo Principal (Síncrono) ]
               |
               v
      await Promise() ---------------------> [ Operación I/O (Background) ]
               |                                            |
    (Pausa el contexto local)                               | (La vida sigue en Node.js...)
               |                                            v
               |<----------------------------- [ Resuelto: fulfilled / rejected ]
               v
  [ Continúa el Hilo Principal ]
```

> [!IMPORTANT]
> **Relación con NestJS:** En backend, casi el 100% de tus interacciones (Base de Datos, Redis, peticiones a otras APIs) serán asíncronas. Entender `async/await` es fundamental para no generar bloqueos de eventos.

---

## 13. Consumo de APIs con Axios

Para comunicarte con otras computadoras, necesitas hacer peticiones HTTP. Aunque los navegadores y Node moderno tienen `fetch` nativo, **Axios** sigue siendo el rey indiscutible.

```bash
yarn add axios
```

### ¿Qué es y Ventajas?
Axios es un cliente HTTP basado en promesas. Ventajas sobre fetch:
1. Parsea automáticamente la respuesta a JSON (no necesitas hacer `res.json()`).
2. Manejo de errores más intuitivo (lanza error si el status es 400 o 500, fetch no lo hace).
3. Permite Interceptores (ejecutar código antes de que salga la petición, útil para inyectar tokens JWT).

### Ejemplo Básico
```ts
import axios from 'axios';

const getPokemonInfo = async () => {
  // Petición GET a la PokeAPI
  const response = await axios.get('https://pokeapi.co/api/v2/pokemon/1');
  
  // La respuesta real viene siempre dentro de la propiedad "data"
  console.log(response.data.name); 
};
```

---

## 14. Tipado de respuestas HTTP

Cuando usas librerías como Axios, por defecto te devuelven un objeto de tipo `any`. Esto es peligroso porque pierdes la ayuda de TypeScript. Aquí entran en juego los genéricos aplicados a Axios.

```ts
// Se define la interfaz basada en la respuesta real de la API
interface PokeApiResponse {
  id: number;
  name: string;
  moves: Move[];
}

// Le decimos a Axios qué tipo de dato ESPECÍFICO esperamos de vuelta
const { data } = await axios.get<PokeApiResponse>('https://pokeapi.co/api/v2/pokemon/1');

// Ahora TypeScript sabe que 'data' tiene 'name', 'id' y 'moves'.
console.log(data.moves[0].move.name); // ¡Autocompletado al rescate!
```

* **Beneficios en proyectos grandes:** Si la API externa cambia y actualizas tu interfaz, TypeScript te marcará en rojo todos los lugares de tu código donde los datos antiguos se estaban usando, evitando fallos catastróficos en producción.

---

## 15. Desestructuración

La desestructuración es una sintaxis de ES6 que permite desempacar valores de arreglos o propiedades de objetos en distintas variables de forma muy concisa.

### En Objetos
```ts
const pokemon = { id: 1, name: 'Bulbasaur', type: 'Grass' };

// En lugar de const id = pokemon.id;
const { id, name } = pokemon;

// Renombrar variables y dar valores por defecto
const { name: pokeName, age = 10 } = pokemon; 
console.log(pokeName); // 'Bulbasaur'
console.log(age); // 10 (porque age no existía en el objeto original)
```

### En Arrays
La desestructuración de arreglos se basa en la posición (índice), no en el nombre.
```ts
const starters = ['Bulbasaur', 'Charmander', 'Squirtle'];

const [first, second] = starters;
console.log(first); // 'Bulbasaur'
console.log(second); // 'Charmander'
```

> [!TIP]
> **Relación con NestJS:** Desestructurarás objetos constantemente en los Controladores para extraer propiedades específicas del cuerpo de la petición: `@Body() { username, password }: LoginDto`.

---

## 16. Inyección de Dependencias en TypeScript

La Inyección de Dependencias (DI) es un patrón de diseño donde una clase no crea sus propias dependencias (instancias de otras clases que necesita para funcionar), sino que alguien más se las suministra ("inyecta"), típicamente a través del constructor.

### Alto Acoplamiento (Mala Práctica)
```ts
import axios from 'axios';

class PokeService {
  async getPokemon() {
    // La clase depende estrictamente de Axios. Está acoplada.
    // Si Axios falla o queremos cambiar a fetch, hay que modificar esta clase.
    return await axios.get('url...');
  }
}
```

### Desacoplamiento mediante Inyección (Buena Práctica)
```ts
class PokeService {
  // Inyectamos la dependencia. La clase no sabe QUÉ es 'http', 
  // solo sabe que puede usarlo.
  constructor(private readonly http: any) {}

  async getPokemon() {
    return await this.http.get('url...');
  }
}

// Al instanciar, nosotros pasamos la dependencia.
const service = new PokeService(axios); 
```

**Ventaja Principal - Testabilidad:** Al aislar el código, puedes crear un "Falso Axios" (Mock) y pasarlo en los tests sin hacer peticiones HTTP reales a internet.

---

## 17. Genéricos (`<T>`)

Los Genéricos permiten crear componentes reutilizables que pueden trabajar con diferentes tipos de datos, manteniendo la seguridad de tipado. Actúan como variables matemáticas estáticas para los tipos.

### ¿Por qué existen?
Imagina una función que devuelve lo mismo que le envías.
Si pones `any`, pierdes el tipado. Si pones `string`, solo sirve para strings.

```ts
// Con Genéricos: 'T' captura el tipo de dato que le pasemos al usarla
function echo<T>(arg: T): T {
  return arg;
}

const num = echo<number>(100); // num es type number
const str = echo<string>('Hola'); // str es type string
```

### Ejemplo real
```ts
// T es un parámetro genérico que representa la estructura esperada
async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = await response.json();
  return data; // TS confía en que esto será del tipo T
}

const pokemon = await fetchApi<Pokemon>('...');
```

---

## 18. Principio de Sustitución de Liskov (L en SOLID)

Este principio dictamina que: *"Si S es un subtipo de T, entonces los objetos de tipo T pueden ser sustituidos por objetos de tipo S sin alterar las propiedades deseables del programa."*

En términos simples: **Las clases derivadas (o implementaciones de una interfaz) deben poder usarse en lugar de sus clases base sin que el código que las usa se rompa.**

### Aplicación práctica (Fetch vs Axios)
Imagina que construyes tu `PokeService`. Para cumplir este principio, el servicio no debe depender de Axios ni de Fetch directamente, sino de un "Adaptador" (una interfaz).

```ts
// 1. Definimos el Contrato (Abstracción)
export interface HttpAdapter {
  get<T>(url: string): Promise<T>;
}

// 2. Implementación A (Axios)
export class AxiosAdapter implements HttpAdapter {
  async get<T>(url: string): Promise<T> {
    const { data } = await axios.get<T>(url);
    return data;
  }
}

// 3. Implementación B (Fetch nativo)
export class FetchAdapter implements HttpAdapter {
  async get<T>(url: string): Promise<T> {
    const resp = await fetch(url);
    return await resp.json();
  }
}

// 4. El Consumidor (Cumple Liskov)
export class PokeService {
  // Inyectamos la Interfaz, no una clase concreta.
  constructor(private readonly http: HttpAdapter) {}

  async getPokemon(id: number) {
    return this.http.get<Pokemon>(`url/${id}`);
  }
}

// ¡Mágia Arquitectónica!
// Puedes pasar CUALQUIERA de las dos implementaciones, y el servicio seguirá 
// funcionando perfectamente sin tocar ni una línea de su lógica interna.
const serviceAxios = new PokeService(new AxiosAdapter());
const serviceFetch = new PokeService(new FetchAdapter());
```

---

## 19. Decoradores

### ¿Qué son?
Un Decorador es una función especial que permite anotar o modificar clases, métodos, propiedades o parámetros en tiempo de definición. Se utilizan con el símbolo `@`.

Son una característica experimental en TS, por lo que en el `tsconfig.json` debe estar habilitado:
```json
"experimentalDecorators": true
```

### ¿Cómo funcionan internamente?
Un decorador no es más que una función que recibe información sobre lo que está decorando (el `target`).

```ts
// Factory Decorator: Una función que devuelve el decorador real
// Permite pasarle parámetros al decorador @MyDecorator('hola')
const MyDecorator = () => {
  return (target: Function) => {
    // target representa la Clase que está siendo decorada
    console.log('Clase decorada:', target.name);
  }
}

@MyDecorator()
class Pokemon {
  constructor() {}
}
```

* **Decoradores de clase:** Modifican o registran la definición de una clase.
* **Decoradores de métodos/propiedades:** Reciben el prototipo de la clase, el nombre de la propiedad, y un descriptor de configuración. Permiten alterar el comportamiento (ej: hacer un método ReadOnly).

> [!IMPORTANT]
> **Relación con NestJS:** NestJS **ES** un framework basado en decoradores. Cada pieza de arquitectura en Nest se define así:
> * `@Controller('users')` le dice a Nest que la clase manejará rutas web.
> * `@Get(':id')` le dice a un método que responda peticiones GET.
> * `@Injectable()` marca un servicio para que el sistema de Inyección de Dependencias de Nest lo administre automáticamente.

---

## 20. Resumen de conceptos aprendidos

A lo largo de este bloque introductorio has asimilado pilares fundamentales de la ingeniería de software moderna con TypeScript:

1. **Entorno de desarrollo ágil:** Comprendiste cómo **Vite** revoluciona el HMR comparado con bundlers heredados.
2. **Tipado Estricto vs Inferencia:** Descubriste que TS te protege de errores en tiempo de ejecución forzando la consistencia (`string`, `number`), pero a la vez es lo suficientemente elegante para inferir tipos sin ser redundante.
3. **Estructuras de Datos:** Dominaste el uso de **Arrays funcionales** (`map`, `filter`) y **Objetos literales**, utilizando el _Spread Operator_ y la _Desestructuración_ para manipular información de forma limpia.
4. **Programación Orientada a Objetos en TS:** Exploraste cómo definir **Interfaces** para contratos, y **Clases** con constructores simplificados, dominando los modificadores (`private`, `readonly`) y la diferencia entre un método estático y de instancia.
5. **Asincronía y Redes:** Aprendiste a manejar la latencia del mundo real usando **Promesas** y **async/await**, además de consumir servicios externos con **Axios**.
6. **Arquitectura y SOLID:** Dimos un paso hacia la arquitectura empresarial aprendiendo **Genéricos**, **Inyección de Dependencias** y el crucial **Principio de Liskov (LSP)** usando el patrón Adapter.
7. **Metaprogramación:** Viste la base de los **Decoradores**, la piedra angular mágica de frameworks modernos.

---

## 21. Cómo se relaciona todo esto con NestJS

Este módulo no fue TypeScript genérico; fue cuidadosamente curado para prepararte para el framework de backend empresarial de Node.js: **NestJS**.

* **Interfaces y DTOs:** En Nest, validarás toda la información que llega a tu API usando clases e interfaces. Si el FrontEnd envía mal un dato, el tipado de TypeScript + Nest lo rechazará automáticamente.
* **Constructor Simplificado e Inyección de Dependencias (DI):** En NestJS no harás `new Service()`. Nest tiene un "Contenedor IoC" que crea e inyecta las instancias por ti a través del constructor simplificado. Tu código será 100% modular y testeable.
* **Genéricos y Respuestas:** Crearás interceptores y respuestas estandarizadas usando `<T>` para envolver respuestas paginadas sin duplicar código.
* **Decoradores:** Escribirás código en NestJS usando `@Module()`, `@Controller()`, `@UseGuards()`. Entender que solo son funciones que añaden metadatos te quitará el "miedo a la magia" y te permitirá crear tus propios decoradores (ej: `@GetUser()`).
* **Patrón Adapter y Liskov:** Tal y como hicimos con Axios/Fetch, en NestJS abstraerás la lógica para poder intercambiar herramientas de fondo (por ejemplo, cambiar la librería de encriptación bcrypt por argon2, o el motor de base de datos) sin tocar tu lógica de negocio.

¡Estás listo para adentrarte en el desarrollo robusto de servidores!
