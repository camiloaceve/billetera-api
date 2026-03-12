import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
      {
        name: 'auth',
        ttl: 900000, // 15 minutos
        limit: 5, // 5 intentos de auth por 15 minutos
      },
      {
        name: 'payments',
        ttl: 300000, // 5 minutos
        limit: 20, // 20 pagos por 5 minutos
      },
    ]),
  ],
  exports: [ThrottlerModule],
})
export class ThrottlingModule {}
