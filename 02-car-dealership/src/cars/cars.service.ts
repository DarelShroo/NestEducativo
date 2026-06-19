import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CarsService {

  // ==========================================
  // EJERCICIO GUIADO: COMPLETAR ESTE ARCHIVO
  // ==========================================

  // TODO 1: Datos en memoria
  // Define un arreglo privado llamado 'cars' que contenga objetos de coches.
  // Cada coche debe tener al menos: id (number), brand (string) y model (string).
  // Ejemplo: private cars = [{ id: 1, brand: 'Toyota', model: 'Corolla' }];

  // TODO 2: Método para buscar todos
  // Crea un método público findAll() que devuelva el arreglo completo de coches.

  // TODO 3: Método para buscar por ID y Exception Filters
  // Crea un método público findOneById(id: number) que busque un coche en el arreglo.
  // Si el coche NO existe, debes lanzar una excepción controlada (Exception Filter de Nest):
  // Ejemplo: throw new NotFoundException(`Car with id '${id}' not found`);
  // Si existe, retorna el coche.

  // TODO 4 (Opcional): Manipulación de datos
  // Crea los métodos create(), update() y delete() para manipular el arreglo 'cars'.

}
