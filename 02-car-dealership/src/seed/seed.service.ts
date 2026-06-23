import { Injectable } from '@nestjs/common';
import { BrandsService } from 'src/brands/brands.service';
import { CarsService } from 'src/cars/cars.service';
import { CARS_SEED, BRAND_SEED } from './data'
@Injectable()
export class SeedService {

  constructor(
    private readonly carsService: CarsService,
    private readonly brandsService: BrandsService
  ){}

  public runSeed(){
    this.carsService.fillBrandsWithSeedData(CARS_SEED)
    this.brandsService.fillBrandsWithSeedData(BRAND_SEED)
  }
}
