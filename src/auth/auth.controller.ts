import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto/auth.dto';
import {
  VerifyEmailDto,
  ResendVerificationDto,
} from './dto/email-verification.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/password-reset.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EmailVerificationService } from './email-verification.service';
import { PasswordResetService } from './password-reset.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description:
      'Usuario registrado exitosamente. Requiere verificación de email.',
  })
  @ApiResponse({ status: 400, description: 'Error en el registro.' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.authService.register(registerDto);
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: {
          id: user._id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          documento: user.documento,
          message:
            'Usuario registrado. Por favor verifica tu email para activar la cuenta.',
        },
      };
    } catch (error) {
      return {
        success: false,
        cod_error: '02',
        message_error: error.message,
      };
    }
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verificar cuenta con código enviado por email' })
  @ApiResponse({ status: 200, description: 'Email verificado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Código inválido o expirado.' })
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmail(@Body() verifyDto: VerifyEmailDto) {
    try {
      const isVerified = await this.emailVerificationService.verifyEmail(
        verifyDto.email,
        verifyDto.verificationCode,
      );

      if (isVerified) {
        return {
          success: true,
          cod_error: '00',
          message_error: '',
          data: {
            message:
              'Cuenta verificada exitosamente. Ya puedes iniciar sesión.',
          },
        };
      } else {
        return {
          success: false,
          cod_error: '01',
          message_error:
            'Código inválido o expirado. Por favor solicita un nuevo código.',
        };
      }
    } catch (error) {
      return {
        success: false,
        cod_error: '02',
        message_error: error.message,
      };
    }
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Reenviar código de verificación por email' })
  @ApiResponse({ status: 200, description: 'Código reenviado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error al reenviar código.' })
  @ApiBody({ type: ResendVerificationDto })
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    try {
      await this.emailVerificationService.resendVerificationCode(
        resendDto.email,
      );
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: {
          message:
            'Código de verificación reenviado. Revisa tu correo electrónico.',
        },
      };
    } catch (error) {
      return {
        success: false,
        cod_error: '02',
        message_error: error.message,
      };
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiResponse({ status: 200, description: 'Login exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        cod_error: '02',
        message_error: error.message,
      };
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getProfile(@Request() req) {
    try {
      const user = await this.authService.getProfile(req.user.id);
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        cod_error: '02',
        message_error: error.message,
      };
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(@Request() req, @Body() updateDto: UpdateProfileDto) {
    try {
      const user = await this.authService.updateProfile(req.user.id, updateDto);
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        cod_error: '02',
        message_error: error.message,
      };
    }
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Email de restablecimiento enviado.',
  })
  @ApiResponse({ status: 400, description: 'Error en la solicitud.' })
  @ApiBody({ type: RequestPasswordResetDto })
  async requestPasswordReset(@Body() requestDto: RequestPasswordResetDto) {
    try {
      await this.passwordResetService.requestPasswordReset(requestDto);
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: {
          message:
            'Si el email está registrado, recibirás un correo con instrucciones.',
        },
      };
    } catch (error) {
      return {
        success: false,
        cod_error: '02',
        message_error: error.message,
      };
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado.' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    try {
      await this.passwordResetService.resetPassword(resetDto);
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: {
          message: 'Contraseña restablecida exitosamente.',
        },
      };
    } catch (error) {
      return {
        success: false,
        cod_error: '02',
        message_error: error.message,
      };
    }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña cambiada exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 400, description: 'Contraseña actual incorrecta.' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@Request() req, @Body() changeDto: ChangePasswordDto) {
    try {
      await this.passwordResetService.changePassword(req.user.id, changeDto);
      return {
        success: true,
        cod_error: '00',
        message_error: '',
        data: {
          message: 'Contraseña cambiada exitosamente.',
        },
      };
    } catch (error) {
      return {
        success: false,
        cod_error: '02',
        message_error: error.message,
      };
    }
  }
}
