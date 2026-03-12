import { IsString, IsNumber, Min, MaxLength } from 'class-validator';

export class RecargaDto {
  @IsString()
  @MaxLength(20)
  documento: string;

  @IsNumber()
  @Min(1000)
  valor: number;
}
