import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Email del usuario que solicitó el restablecimiento',
    example: 'usuario@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Token de restablecimiento enviado por email',
    example: 'abc123def456',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  resetToken: string;

  @ApiProperty({
    description: 'Nueva contraseña (mínimo 8 caracteres)',
    example: 'NewPassword123',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual del usuario',
    example: 'CurrentPassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @ApiProperty({
    description: 'Nueva contraseña (mínimo 8 caracteres)',
    example: 'NewPassword123',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  newPassword: string;

  @ApiProperty({
    description: 'Confirmación de la nueva contraseña',
    example: 'NewPassword123',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  confirmPassword: string;
}
