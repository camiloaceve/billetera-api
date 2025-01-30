import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentService } from 'src/common/enviroment.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly environmentsService: EnvironmentService,
  ) {}

  generarToken(documento: string, monto: number) {
    const payload = { documento, monto };
    return this.jwtService.sign(payload, {
      secret: this.environmentsService.secret,
      expiresIn: this.environmentsService.expireToken,
    });
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
