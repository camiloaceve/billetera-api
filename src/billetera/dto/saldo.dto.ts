import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConsultaSaldoDto {
  @ApiProperty({
    description: 'Documento de la billetera a consultar',
    example: '123456789',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  documento: string;
}
