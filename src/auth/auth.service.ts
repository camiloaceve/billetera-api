import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EnvironmentService } from 'src/common/enviroment.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly environmentsService: EnvironmentService,
  ) {}

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
