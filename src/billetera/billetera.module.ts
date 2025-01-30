import { Module } from '@nestjs/common';
import { BilleteraController } from './billetera.controller';
import { BilleteraService } from './billetera.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Billetera, BilleteraSchema } from './schemas/billetera.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Billetera.name, schema: BilleteraSchema },
    ]),
  ],
  controllers: [BilleteraController],
  providers: [BilleteraService],
})
export class BilleteraModule {}
