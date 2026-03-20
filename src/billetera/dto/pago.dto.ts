import { IsString, IsNumber, IsEmail, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IniciarPagoDto {
  @ApiProperty({
    description: 'Email del destinatario para enviar código',
    example: 'destinatario@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Documento de la billetera de origen',
    example: '123456789',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  documento: string;

  @ApiProperty({
    description: 'Monto a pagar (mínimo $1,000)',
    example: 10000,
    minimum: 1000,
  })
  @IsNumber()
  @Min(1000)
  monto: number;
}

export class PagoTokenDto {
  @ApiProperty({
    description: 'Documento de la billetera de origen',
    example: '123456789',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  origen: string;

  @ApiProperty({
    description: 'Documento de la billetera de destino',
    example: '987654321',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  destino: string;

  @ApiProperty({
    description: 'Monto a transferir (mínimo $1,000)',
    example: 5000,
    minimum: 1000,
  })
  @IsNumber()
  @Min(1000)
  monto: number;

  @ApiProperty({
    description: 'Token JWT de autorización',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;
}

export class ConfirmarPagoDto {
  @ApiProperty({
    description: 'ID de la sesión de pago',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'Token JWT de confirmación',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;
}
