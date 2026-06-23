import { Injectable, NotFoundException } from '@nestjs/common';
import { Car } from './interfaces/cars.interface';
import { v4 as uuid } from 'uuid';
import { CreateCarDto } from './dtos/create-car.dto';
import { UpdateCarDto } from './dtos/update-car.dto';

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
  // IMPORTANTE sobre el manejo del ID:
  // - En el método create(): El cliente no envía el id. Debes generarlo dinámicamente (ej. sumar 1 al id máximo actual o usar un UUID si lo implementas).
  // - En update() y delete(): Utiliza el id numérico recibido como argumento para identificar qué coche modificar o eliminar.

  private cars: Car[];

  public findAll() {
    return this.cars;
  }

  public findOneById(id: string) {
    const car = this.cars.find(c => c.id === id);

    if (!car) {
      throw new NotFoundException(`Car with id '${id}' not found`);
    }

    return car;
  }

  public create(createCarDto: CreateCarDto) {
    const newCar: Car = {
      id: uuid(),
      ...createCarDto
    }

    this.cars.push(newCar)

    return this.cars;
  }

  public update(id: string, updateCarDto: UpdateCarDto) {
    let carDB = this.findOneById(id);
    this.cars = this.cars.map(car => {
      if (car.id === id) {
        carDB = {
          ...carDB,
          ...updateCarDto,
          id
        }
        return carDB
      }
      return car
    });
    return this.cars;
  }

  public delete(id: string) {
    const car = this.findOneById(id);
    this.cars = this.cars.filter(c => c.id !== id);
    return this.cars;
  }

  fillBrandsWithSeedData(cars: Car[]){
    this.cars = cars;
  }

}
