import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    example: 'Password123',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  apellido: string;

  @ApiProperty({
    description: 'Número de documento de identidad',
    example: '123456789',
    minLength: 5,
    maxLength: 20,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  documento: string;

  @ApiProperty({
    description: 'Número de teléfono',
    example: '3001234567',
    minLength: 7,
    maxLength: 15,
  })
  @IsString()
  @MinLength(7)
  @MaxLength(15)
  telefono: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Juan',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Apellido del usuario',
    example: 'Pérez',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  apellido?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono',
    example: '3001234567',
    minLength: 7,
    maxLength: 15,
  })
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(15)
  telefono?: string;
}
