import { IsString, IsInt, IsPositive, Min, MinLength } from "class-validator";

export class CreatePokemonDto {

    // IsInt, IsPositive, min 1
    @IsInt()
    @IsPositive()
    @Min(1)
    no: number;

    // isIstring, Minleng 1
    @IsString()
    @MinLength(1)
    name:string;
}
