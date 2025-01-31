import { Module } from '@nestjs/common';
import { BilleteraController } from './billetera.controller';
import { BilleteraService } from './billetera.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Billetera, BilleteraSchema } from './schemas/billetera.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Billetera.name, schema: BilleteraSchema },
    ]),
    AuthModule,
  ],
  controllers: [BilleteraController],
  providers: [BilleteraService],
})
export class BilleteraModule {}
