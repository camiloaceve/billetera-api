import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { EmailService } from '../auth/email/email.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly emailService: EmailService,
  ) {}

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationEmail(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.isEmailVerified) {
      throw new Error('El email ya está verificado');
    }

    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await this.userModel.findByIdAndUpdate(user._id, {
      emailVerificationCode: verificationCode,
      emailVerificationExpires: expiresAt,
    });

    await this.emailService.sendVerificationEmail(email, verificationCode);
  }

  async verifyEmail(email: string, code: string): Promise<boolean> {
    const user = await this.userModel.findOne({
      email,
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return false;
    }

    await this.userModel.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpires: null,
      isActive: true,
    });

    return true;
  }

  async resendVerificationCode(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.isEmailVerified) {
      throw new Error('El email ya está verificado');
    }

    // Verificar si han pasado al menos 2 minutos desde el último envío
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires > twoMinutesAgo
    ) {
      throw new Error('Debe esperar 2 minutos para solicitar un nuevo código');
    }

    await this.sendVerificationEmail(email);
  }
}
