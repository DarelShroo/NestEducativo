/**
 * Ejercicio: Inyección de Dependencias y Principio de Liskov
 * 
 * 1. Importa la interfaz HttpAdapter (puedes imaginar que existe o declararla aquí mismo) que 
 *    tenga un método genérico 'get<T>(url: string): Promise<T>'.
 * 2. Crea una clase 'PokeApiAxiosAdapter' que implemente HttpAdapter usando Axios.
 * 3. Crea una clase 'PokeApiFetchAdapter' que implemente HttpAdapter usando fetch nativo.
 * 4. Crea una clase 'PokemonService' cuyo constructor reciba una dependencia de tipo HttpAdapter.
 * 5. Instancia 'PokemonService' pasándole el 'PokeApiFetchAdapter', comprobando así 
 *    el Principio de Sustitución de Liskov.
 */
