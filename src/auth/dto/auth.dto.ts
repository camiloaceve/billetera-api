import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  apellido: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  documento: string;

  @IsString()
  @MinLength(7)
  @MaxLength(15)
  telefono: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  apellido?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(15)
  telefono?: string;
}
