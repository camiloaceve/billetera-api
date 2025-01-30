import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientesModule } from './clientes/clientes.module';
import { BilleteraModule } from './billetera/billetera.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    ClientesModule,
    BilleteraModule,
    AuthModule,
  ],
  controllers: [],
})
export class AppModule {}
