import { Module } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { ClientesFrecuentesService } from './clientes-frecuentes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Cliente, ClienteSchema } from './schemas/cliente.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  Billetera,
  BilleteraSchema,
} from '../billetera/schemas/billetera.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cliente.name, schema: ClienteSchema },
      { name: User.name, schema: UserSchema },
      { name: Billetera.name, schema: BilleteraSchema },
    ]),
  ],
  controllers: [ClientesController],
  providers: [ClientesService, ClientesFrecuentesService],
  exports: [ClientesService, ClientesFrecuentesService],
})
export class ClientesModule {}
