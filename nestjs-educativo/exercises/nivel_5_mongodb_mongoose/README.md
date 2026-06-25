# Nivel 5 - Bases de Datos con MongoDB, Mongoose y Configuraciones Globales

Bienvenido al Nivel 5. En esta unidad daremos un salto fundamental: la persistencia de datos real. Dejaremos atrás los arrays en memoria y conectaremos nuestra aplicación a una base de datos NoSQL profesional (MongoDB). Además, aprenderemos a configurar globalmente nuestra API y a servir contenido estático.

## 1. Servir Contenido Estático

En muchas ocasiones, tu backend no solo servirá JSON, sino que también deberá alojar y servir archivos estáticos (imágenes, documentos, o incluso el build de un frontend como React o Angular).

En NestJS, esto se logra mediante el paquete `@nestjs/serve-static`.

```ts id="static1"
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'public'),
})
```

**¿Cómo funciona?**
* **`ServeStaticModule`**: Se importa en el `AppModule`.
* **`rootPath`**: Indica la ruta absoluta donde se encuentran los archivos.
* **`join()`**: Una función nativa de Node.js (módulo `path`) que asegura que la ruta se construya correctamente sin importar el sistema operativo.

👉 Esto convierte una carpeta como `public/` en accesible directamente vía HTTP, ideal para assets públicos sin necesidad de un servidor Nginx adicional en arquitecturas sencillas.

---

## 2. Configuración Global de la Aplicación

A medida que tu API crece, necesitarás aplicar configuraciones que afecten a todas las rutas. Una de las más comunes es el prefijo global.

```ts id="prefix1"
app.setGlobalPrefix('api/v1');
```

**Beneficios:**
* **Versionado**: Permite crear `/api/v1/usuarios` y prepararse para una futura `/api/v2/usuarios`.
* **Organización**: Separa claramente las rutas de la API de otras rutas (como el contenido estático servido en el punto anterior).
* Se configura directamente en el archivo `main.ts` antes de hacer `app.listen()`.

---

## 3. Bases de Datos con MongoDB y Docker

Para persistir datos utilizaremos **MongoDB**, una base de datos NoSQL orientada a documentos, que encaja perfectamente con el ecosistema de JavaScript y TypeScript.

Para evitar instalaciones complejas y dependencias del sistema operativo, usaremos **Docker**. Docker permite levantar una instancia de MongoDB aislada en un "contenedor".

**Ventajas de Docker:**
* Entornos consistentes y reproducibles (funciona igual en Mac, Linux y Windows).
* Se levanta y se destruye con un solo comando (`docker-compose up -d`).
* Evita ensuciar tu sistema operativo con servicios en segundo plano innecesarios.

---

## 4. Integración de NestJS con MongoDB

Para conectar NestJS con MongoDB, no usamos el driver nativo directamente, sino un ODM (Object Data Modeling) llamado **Mongoose**, a través de su módulo oficial `@nestjs/mongoose`.

```ts id="mongo1"
MongooseModule.forRoot('mongodb://localhost:27017/nest-db')
```

**Configuración Básica:**
* Se importa `MongooseModule.forRoot()` en el `AppModule`.
* Se le proporciona una **URI de conexión**.
* A partir de este momento, la aplicación mantiene un pool de conexiones abierto hacia la base de datos de forma automática.

---

## 5. Esquemas, Modelos y Documentos

En bases de datos NoSQL puras, no hay una estructura rígida. Sin embargo, para mantener una aplicación predecible y segura, usamos Mongoose para definir reglas a través de **Esquemas**.

* **Schema (Esquema)**: Define la forma que tendrá la información (qué propiedades existen, si son requeridas, únicas, etc.).
* **Model (Modelo)**: Es el objeto compilado a partir del esquema. Sirve como interfaz para interactuar con la colección en la base de datos (hacer búsquedas, inserciones).
* **Document (Documento)**: Es la instancia real, un único registro dentro de la base de datos.

En NestJS, esto se define mediante clases y decoradores:

```ts id="schema1"
@Schema()
export class User {
  @Prop({ unique: true, index: true })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

* `@Schema()`: Marca la clase como un esquema de MongoDB.
* `@Prop()`: Define una propiedad. Podemos pasar opciones como `unique: true` para evitar duplicados o `index: true` para optimizar búsquedas.
* `SchemaFactory.createForClass()`: Convierte la clase de TypeScript en un esquema real de Mongoose.

---

## 6. Operaciones CRUD (Create, Read, Update, Delete)

Una vez inyectado el modelo en un servicio, podemos realizar todas las operaciones de persistencia.

* **Creación**: `this.model.create(createDto)` – Inserta un nuevo documento a partir de un DTO validado.
* **Lectura**: `this.model.find()`, `this.model.findById()`, `this.model.findOne()` – Métodos para extraer información.
* **Actualización**: `this.model.updateOne()` o `this.model.findByIdAndUpdate(id, updateDto, { new: true })`. La opción `new: true` hace que la base de datos devuelva el documento ya modificado, en lugar de su versión antigua.
* **Eliminación**:
  * `this.model.deleteOne()` – Elimina un documento que cumpla cierta condición.
  * `this.model.deleteMany()` – Elimina múltiples documentos.
  * Devuelven un objeto con información, como `deletedCount`, que nos permite saber cuántos documentos fueron eliminados realmente.

---

## 7. Manejo de Errores Profesional

Al interactuar con bases de datos, ocurrirán errores (servidor caído, datos duplicados, etc.). Un backend robusto debe controlarlos.

**El famoso Error 11000:**
Es el código que MongoDB devuelve cuando se viola una restricción `unique` (por ejemplo, intentar registrar un email que ya existe).

En NestJS, interceptamos estos errores con un bloque `try-catch` y lanzamos excepciones HTTP controladas:

```ts id="err1"
try {
  // Operación de base de datos
} catch (error) {
  if (error.code === 11000) {
    throw new BadRequestException('El registro ya existe en la base de datos');
  }
  throw new InternalServerErrorException('Error inesperado. Revisa los logs.');
}
```

Esto garantiza que el cliente reciba un código de estado correcto (400, 500) y no la caída del servidor.

---

## 8. Control de Respuestas HTTP

Por defecto, NestJS devuelve `200 OK` (para GET, PATCH) o `201 Created` (para POST). Sin embargo, a veces necesitamos forzar un código de respuesta específico que cumpla con nuestra arquitectura REST.

```ts id="http1"
@HttpCode(HttpStatus.OK)
@Post('login')
```

El decorador `@HttpCode()` nos permite anular el comportamiento por defecto, dando control total sobre la semántica HTTP.

---

## 9. Validación de Mongo IDs

En MongoDB, los IDs primarios (llamados `_id` o `ObjectId`) tienen un formato hexadecimal específico de 24 caracteres.

Si un usuario envía un ID malformado a un endpoint que busca en la base de datos (como `/users/123`), Mongoose lanzará un error interno que puede romper la aplicación. Para evitarlo, Mongoose expone la utilidad:

```ts id="validid1"
isValidObjectId(id)
```

Debemos validar SIEMPRE los IDs antes de usarlos en consultas a la base de datos.

---

## 10. Pipes Personalizados

Hemos visto el `ValidationPipe` global. Pero a veces necesitamos validaciones y transformaciones específicas que son demasiado complejas o que no aplican a un DTO, sino a un parámetro de la URL (`@Param()`).

Los **Pipes** en NestJS se pueden generar con el CLI (`nest g pi mi-pipe`).

Sirven para dos cosas:
1. **Transformación**: Convertir datos (ej. un string a un booleano).
2. **Validación**: Comprobar datos (ej. verificar si un string es un `ObjectId` válido de MongoDB usando `isValidObjectId`).

Al crear un Pipe personalizado para validar IDs, podemos limpiar nuestros controladores y servicios de lógica repetitiva.

---

## 11. Operaciones Avanzadas en MongoDB

El poder de una base de datos real radica en sus capacidades de consulta. Mongoose permite realizar operaciones avanzadas:

* **Eliminación y Actualización con condiciones complejas**: Podemos actualizar todos los usuarios cuyo estado sea inactivo.
* **Paginación y Ordenamiento**: Usando `.skip()`, `.limit()`, y `.sort()`.
* **Proyección**: Elegir qué campos específicos devolver de la base de datos (por ejemplo, excluir la contraseña).

Dominar estas consultas permite que el trabajo duro lo haga el motor de la base de datos y no el hilo principal de Node.js.

---

## 🧾 Conclusión

En esta unidad has aprendido a construir una API lista para producción integrando un servidor de base de datos aislado con Docker, conectándolo mediante Mongoose, diseñando esquemas robustos, implementando un CRUD completo y securizando el flujo mediante control de errores y pipes de validación personalizados. Todo esto, envuelto en una configuración global y sirviendo contenido estático de forma unificada.
