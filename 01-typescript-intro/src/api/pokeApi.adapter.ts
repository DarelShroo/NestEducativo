import axios from 'axios';

/**
 * Ejercicio: Consumo de APIs, Genéricos y Patrón Adapter
 * 
 * 1. Define una interfaz 'HttpAdapter' que declare un método: 
 *    get<T>(url: string): Promise<T>
 * 
 * 2. Modifica la clase 'PokeApiAdapter' (o crea 'PokeApiAxiosAdapter') para que implemente 'HttpAdapter'.
 * 
 * 3. Dentro de la clase, haz uso de Axios para realizar peticiones HTTP.
 * 4. Implementa el método 'get<T>(url: string): Promise<T>' haciendo uso de Axios.
 *    - Recuerda extraer la propiedad '.data' de la respuesta de Axios y retornarla.
 * 
 * Opcional: Crea otra clase 'PokeApiFetchAdapter' en este mismo archivo que también implemente 'HttpAdapter'
 * pero usando la API nativa 'fetch', preparándolo todo para inyección de dependencias (Principio de Liskov).
 */
export class PokeApiAdapter {}