/**
 * Ejercicio: Interfaces y Tipado de Respuestas HTTP
 * 
 * 1. Define y exporta una interfaz llamada 'PokeApiResponse'.
 * 2. Observa la respuesta típica de https://pokeapi.co/api/v2/pokemon/1 e incluye 
 *    las propiedades más importantes en tu interfaz, como:
 *    - id (number)
 *    - name (string)
 *    - weight (number)
 *    - moves (un arreglo de un tipo más complejo)
 * 3. Define la interfaz para los 'moves' si quieres profundizar en interfaces anidadas.
 * 
 * Nota: Esta interfaz te servirá luego en tus peticiones Axios para decirle a TypeScript
 * exactamente qué estructura esperar de la API: axios.get<PokeApiResponse>('...')
 */
