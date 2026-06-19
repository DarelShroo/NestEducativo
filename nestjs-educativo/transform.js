const fs = require('fs');
const file = 'exercises/nivel_1_typescript_intro/exercises.json';
const exercises = JSON.parse(fs.readFileSync(file, 'utf8'));

exercises[0].test_script = "if (typeof username !== 'string') throw new Error('Falta username o no es string');\nif (typeof age !== 'number') throw new Error('Falta age o no es number');\nif (typeof isActive !== 'boolean') throw new Error('Falta isActive o no es boolean');";

exercises[1].test_script = "const p: Pokemon = pikachu;\nif (typeof p.id !== 'number' || typeof p.name !== 'string') throw new Error('La interfaz o el objeto no cumplen la estructura solicitada');";

exercises[2].test_script = "const c: Pokemon = charmander;\nif (typeof c.id !== 'number' || typeof c.name !== 'string') throw new Error('El objeto charmander no es correcto');";

exercises[3].test_script = "const h = new SuperHero('Bat', 'Bruce');\nif (h.name !== 'Bat') throw new Error('La clase SuperHero no asigna las propiedades correctamente');";

exercises[4].test_script = "if (typeof greet !== 'function' || greet('Mundo') !== 'Hello Mundo') throw new Error('La función greet no retorna el valor esperado');";

exercises[5].test_script = "(async () => {\n  const res = await getUserData();\n  if (res !== 'Data cargada') throw new Error('La promesa no retorna \\'Data cargada\\'');\n})().catch(e => { console.error(e); process.exit(1); });";

exercises[6].test_script = "const a = wrapInArray('test');\nif (!Array.isArray(a) || a[0] !== 'test') throw new Error('wrapInArray no retorna un array con el elemento');";

exercises[7].test_script = "const d = new DummyClass();\nif (!d) throw new Error('DummyClass no se inicializó correctamente');";

fs.writeFileSync(file, JSON.stringify(exercises, null, 2));
console.log('Done!');
