import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CarsService } from './cars.service';

@Controller('cars')
export class CarsController {
  
  // ==========================================
  // EJERCICIO GUIADO: COMPLETAR ESTE ARCHIVO
  // ==========================================

  // TODO 1: Inyección de Dependencias
  // Inyecta el CarsService usando el constructor shorthand de TypeScript.
  // Ejemplo: constructor(private readonly carsService: CarsService) {}

  // TODO 2: Endpoint GET /cars
  // Usa el decorador @Get() para crear un método getAllCars() o findAllCars().
  // Este método debe retornar lo que devuelva this.carsService.findAll().

  // TODO 3: Endpoint GET /cars/:id
  // Usa el decorador @Get(':id') para crear un método findOneById().
  // Importante: Extrae el parámetro con @Param('id', ParseIntPipe) id: number
  // ParseIntPipe transformará el string de la URL a número. Retorna el coche.

  // TODO 4: Endpoint POST /cars
  // Usa el decorador @Post() para crear el método createCar().
  // Extrae el cuerpo de la petición (JSON) usando @Body() body: any

  // TODO 5: Endpoint PATCH /cars/:id
  // Usa el decorador @Patch(':id') para el método updateCars().
  // Necesitas extraer tanto el ID de la URL como el cuerpo de la petición.
  // Es decir: @Param('id', ParseIntPipe) id: number, y @Body() body: any

  // TODO 6: Endpoint DELETE /cars/:id
  // Usa el decorador @Delete(':id') para el método deleteCar().
  // Extrae el ID usando @Param('id', ParseIntPipe).

}
