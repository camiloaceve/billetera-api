import { IsString, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecargaDto {
  @ApiProperty({
    description: 'Documento de la billetera a recargar',
    example: '123456789',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  documento: string;

  @ApiProperty({
    description: 'Monto a recargar (mínimo $1,000)',
    example: 50000,
    minimum: 1000,
  })
  @IsNumber()
  @Min(1000)
  valor: number;
}
