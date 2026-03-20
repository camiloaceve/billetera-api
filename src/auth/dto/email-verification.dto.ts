import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email del usuario a verificar',
    example: 'usuario@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Código de verificación de 6 dígitos',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  verificationCode: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'Email para reenviar código de verificación',
    example: 'usuario@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;
}
