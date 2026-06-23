# Nivel 1: TypeScript para NestJS - Guía Definitiva y Apuntes del Curso

Bienvenido a esta guía exhaustiva y material de estudio diseñado para dominar TypeScript desde cero, con un enfoque particular en prepararte para el desarrollo profesional con el framework **NestJS**. Este documento no es un simple resumen; es una referencia profunda estructurada para que puedas volver a ella en el futuro y entender el _porqué_ detrás de cada concepto.

Todos los ejercicios de este nivel están estrictamente basados en esta teoría.

---

## 📑 Índice de Contenidos

1. [Variables y tipos de datos](#1-variables-y-tipos-de-datos)
2. [Template Strings](#2-template-strings)
3. [Arrays](#3-arrays)
4. [Objetos](#4-objetos)
5. [Interfaces](#5-interfaces)
6. [Clases](#6-clases)
7. [Constructor simplificado](#7-constructor-simplificado)
8. [Instanciación de clases](#8-instanciación-de-clases)
9. [Métodos, this y getters](#9-métodos-this-y-getters)
10. [Métodos estáticos](#10-métodos-estáticos)
11. [Programación asíncrona](#11-programación-asíncrona)
12. [Consumo de APIs con Axios](#12-consumo-de-apis-con-axios)
13. [Tipado de respuestas HTTP](#13-tipado-de-respuestas-http)
14. [Desestructuración](#14-desestructuración)
15. [Inyección de dependencias en TypeScript](#15-inyección-de-dependencias-en-typescript)
16. [Genéricos](#16-genéricos)
17. [Principio de Sustitución de Liskov](#17-principio-de-sustitución-de-liskov)
18. [Decoradores](#18-decoradores)
19. [Cómo se relaciona todo esto con NestJS](#19-cómo-se-relaciona-todo-esto-con-nestjs)

---

## 1. Variables y tipos de datos

### Tipado Estático vs Inferencia

TypeScript añade "tipos estáticos" a JavaScript. Esto significa que puedes decirle al compilador exactamente qué tipo de dato debe almacenar una variable.

```ts
const name: string = 'Darel';
let age: number = 30;
```

Sin embargo, TypeScript es lo suficientemente inteligente como para hacer **inferencia de tipos**.

```ts
let pokemon = 'Pikachu'; // TS infiere que es de tipo 'string'
// pokemon = 10; // Error
```

| Tipo      | Descripción                                | Ejemplo                |
| :-------- | :----------------------------------------- | :--------------------- |
| `string`  | Cadenas de texto.                          | `'Hola'`               |
| `number`  | Números enteros, flotantes.                | `10`, `3.14`           |
| `boolean` | Valores lógicos.                           | `true`, `false`        |
| `any`     | **[EVITAR]** Desactiva el tipado estricto. | `let c: any = 'test';` |

> **Relación con NestJS:** NestJS depende fuertemente de los tipos para la validación de datos a través de DTOs.

---

## 2. Template Strings

Los Template Strings son una característica que permite incrustar expresiones y variables dentro de una cadena de texto utilizando _backticks_ (\`).

```ts
const name = 'Darel';
const message = `Hola ${name}`;
console.log(`${name} tiene ${30 + 1} años`);
```

> **Relación con NestJS:** Muy útiles al lanzar excepciones con mensajes dinámicos: `throw new NotFoundException(\`El Pokémon con ID ${id} no fue encontrado\`);`

---

## 3. Arrays

Los arrays en TypeScript deben estar tipados para asegurar que todos los elementos internos mantengan consistencia.

```ts
const pokemons: string[] = ['Bulbasaur', 'Charmander'];
```

### Métodos comunes

- **`push(...)`**: Añade elementos al final.
- **`map()`**: Crea un nuevo array aplicando una función.
  ```ts
  const upper = pokemons.map((p) => p.toUpperCase());
  ```
- **`filter()`**: Crea un nuevo array con elementos que pasen la condición.

---

## 4. Objetos

Un objeto literal es una colección de pares clave-valor.

```ts
const pokemon = { id: 1, name: 'Charmander' };
```

El spread operator `...` se usa para copias:

```ts
const pikachu = { id: 25, name: 'Pikachu' };
const raichu = { ...pikachu, name: 'Raichu', id: 26 };
```

---

## 5. Interfaces

Una interfaz en TypeScript es un "contrato" que define la forma que debe tener un objeto.

```ts
interface Pokemon {
  id: number;
  name: string;
  age?: number; // Opcional
}
```

---

## 6. Clases

Las clases son la base de la POO. Actúan como moldes.

```ts
export class Pokemon {
  public types = ['fire'];

  constructor(id: number, name: string) {
    console.log('constructor called');
  }
}
```

---

## 7. Constructor simplificado

TypeScript introdujo una forma extremadamente elegante de definir e inicializar propiedades:

```ts
class Pokemon {
  constructor(
    public readonly id: number,
    public name: string
  ) {}
}
```

---

## 8. Instanciación de clases

Instanciar significa crear un objeto real:

```ts
const charmander = new Pokemon(4, 'Charmander');
```

---

## 9. Métodos, `this` y Getters

### La palabra clave `this`

Dentro de una clase, `this` hace referencia a la instancia actual del objeto.

### Getters (`get`)

Un getter es un método especial que simula ser una propiedad.

```ts
class Pokemon {
  constructor(
    public id: number,
    public name: string
  ) {}

  get imageUrl(): string {
    return `https://pokeapi.com/sprites/${this.id}.png`;
  }

  speak(): string {
    return `${this.name.toUpperCase()}!!!`;
  }
}
```

---

## 10. Métodos estáticos

Un método estático (`static`) pertenece a la **Clase** en sí misma, no a las instancias. No necesitas usar `new`.

```ts
export class MathHelper {
  static PI = 3.1415;
  static calculateArea(radius: number): number {
    return this.PI * radius * radius;
  }
}
```

---

## 11. Programación asíncrona

### Async / Await

Es azúcar sintáctico sobre las Promesas.

```ts
const fetchPokemon = async (): Promise<void> => {
  try {
    const data = await traerDatosDeInternet();
    console.log(data);
  } catch (error) {
    console.error('Error al obtener datos');
  }
};
```

---

## 12. Consumo de APIs con Axios

Axios es un cliente HTTP basado en promesas que parsea automáticamente a JSON.

```ts
import axios from 'axios';

const getPokemonInfo = async () => {
  const response = await axios.get('https://pokeapi.co/api/v2/pokemon/1');
  console.log(response.data.name);
};
```

---

## 13. Tipado de respuestas HTTP

Para evitar recibir `any`, usamos genéricos en Axios.

```ts
interface PokeApiResponse {
  id: number;
  name: string;
}

const { data } = await axios.get<PokeApiResponse>('url');
```

---

## 14. Desestructuración

Permite desempacar valores de arreglos o propiedades de objetos en distintas variables.

```ts
const pokemon = { id: 1, name: 'Bulbasaur' };
const { id, name } = pokemon;

const starters = ['Bulbasaur', 'Charmander'];
const [first, second] = starters;
```

---

## 15. Inyección de Dependencias en TypeScript

Es un patrón donde una clase no crea sus propias dependencias, sino que se las suministra (inyecta) a través del constructor.

```ts
class PokeService {
  constructor(private readonly http: any) {}

  async getPokemon() {
    return await this.http.get('url...');
  }
}
```

---

## 16. Genéricos (`<T>`)

Los Genéricos permiten crear componentes reutilizables con seguridad de tipado.

```ts
function echo<T>(arg: T): T {
  return arg;
}
```

---

## 17. Principio de Sustitución de Liskov (L en SOLID)

Las clases derivadas o implementaciones de una interfaz deben poder usarse en lugar de sus clases base sin que el programa se rompa.

```ts
export interface HttpAdapter {
  get<T>(url: string): Promise<T>;
}

export class AxiosAdapter implements HttpAdapter {
  async get<T>(url: string): Promise<T> {
    const { data } = await axios.get<T>(url);
    return data;
  }
}

export class PokeService {
  constructor(private readonly http: HttpAdapter) {}
}
```

---

## 18. Decoradores

Un Decorador es una función que permite anotar o modificar clases, métodos, etc. En TS se usa `@`.

```ts
function MyDecorator(target: Function) {
  console.log('Clase decorada:', target.name);
}

@MyDecorator
class UserController {}
```

---

## 19. Cómo se relaciona todo esto con NestJS

NestJS usa fuertemente:

- **Interfaces y DTOs** para validación.
- **Constructor Simplificado e Inyección de Dependencias (DI)** para estructurar los servicios.
- **Decoradores** como `@Controller()`, `@Get()`, `@Injectable()`.
- **Patrón Adapter** para intercambiar herramientas sin tocar la lógica de negocio.

¡Estás listo para resolver los ejercicios!
