import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateCarDto {
    @IsString()
    @IsOptional()
    readonly brand?: string;

    @IsString()
    @MinLength(3)
    @IsOptional()
    readonly model?: string;
}