import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { EnvironmentService } from 'src/common/enviroment.config';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto/auth.dto';
import { EmailVerificationService } from './email-verification.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly environmentsService: EnvironmentService,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, ...userData } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    const existingDocument = await this.userModel.findOne({
      documento: registerDto.documento,
    });
    if (existingDocument) {
      throw new Error('El documento ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      ...userData,
      email,
      password: hashedPassword,
      isActive: false, // Requiere verificación de email
    });

    await user.save();

    // Enviar email de verificación
    await this.emailVerificationService.sendVerificationEmail(email);

    return user;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Usuario inactivo. Por favor verifica tu email.',
      );
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email no verificado. Por favor revisa tu correo electrónico.',
      );
    }

    user.loginCount += 1;
    user.lastLogin = new Date();
    await user.save();

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.environmentsService.secret,
      expiresIn: this.environmentsService.expireToken,
    });

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        role: user.role,
        loginCount: user.loginCount,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { ...updateDto }, { new: true })
      .select('-password');

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  generarToken(sessionId: string, documento: string, monto: number) {
    const payload = { sessionId, documento, monto };
    const token = this.jwtService.sign(payload, {
      secret: this.environmentsService.secret,
      expiresIn: this.environmentsService.expireToken,
    });
    return {
      token,
      sessionId,
    };
  }

  verificarToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.environmentsService.secret,
      });
    } catch (error) {
      return {
        message: 'Token inválido o expirado',
        error: error,
      };
    }
  }
}
