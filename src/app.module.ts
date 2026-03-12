import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ClientesModule } from './clientes/clientes.module';
import { BilleteraModule } from './billetera/billetera.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from './common/cache/cache.module';
import { ThrottlingModule } from './common/throttling/throttling.module';
import { LoggerService } from './common/logger/logger.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { HealthController } from './common/health/health.controller';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    CacheModule,
    ThrottlingModule,
    AuditModule,
    ClientesModule,
    BilleteraModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
