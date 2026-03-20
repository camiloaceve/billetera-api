import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { EmailService } from './email/email.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
} from './dto/password-reset.dto';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private emailService: EmailService,
  ) {}

  async requestPasswordReset(
    requestDto: RequestPasswordResetDto,
  ): Promise<void> {
    const { email } = requestDto;

    // Buscar usuario por email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      // No revelar si el email existe o no por seguridad
      return;
    }

    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en el usuario
    await this.userModel.updateOne(
      { _id: user._id },
      {
        resetToken,
        resetTokenExpiry,
      },
    );

    // Enviar email con el token
    await this.emailService.sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(resetDto: ResetPasswordDto): Promise<void> {
    const { email, resetToken, newPassword } = resetDto;

    // Buscar usuario con token válido
    const user = await this.userModel.findOne({
      email,
      resetToken,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Token inválido o expirado');
    }

    // Actualizar contraseña y limpiar token
    const hashedPassword = await this.hashPassword(newPassword);
    await this.userModel.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        $unset: { resetToken: 1, resetTokenExpiry: 1 },
      },
    );
  }

  async changePassword(userId: string, changeDto: any): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = changeDto;

    // Validar que las nuevas contraseñas coincidan
    if (newPassword !== confirmPassword) {
      throw new Error('Las nuevas contraseñas no coinciden');
    }

    // Buscar usuario
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await this.comparePassword(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Actualizar contraseña
    const hashedPassword = await this.hashPassword(newPassword);
    await this.userModel.updateOne(
      { _id: userId },
      { password: hashedPassword },
    );
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
