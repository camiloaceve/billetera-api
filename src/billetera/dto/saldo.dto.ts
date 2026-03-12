import { IsString, MaxLength } from 'class-validator';

export class ConsultaSaldoDto {
  @IsString()
  @MaxLength(20)
  documento: string;
}
