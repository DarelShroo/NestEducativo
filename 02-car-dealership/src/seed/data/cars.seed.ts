import { Car } from "src/cars/interfaces/cars.interface";
import { v4 as uuid } from "uuid";

export const CARS_SEED: Car[] = [
    {
        id: uuid(),
        brand: 'Toyota',
        model: 'Corolla'
    },
    {
        id: uuid(),
        brand: 'BMW',
        model: 'Serie 3'
    },
    {
        id: uuid(),
        brand: 'Tesla',
        model: 'Model 3'
    }
];