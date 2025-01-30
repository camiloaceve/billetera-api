import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Billetera } from './schemas/billetera.schema';
import { Model } from 'mongoose';

@Injectable()
export class BilleteraService {
  constructor(
    @InjectModel(Billetera.name) private billeteraModel: Model<Billetera>,
  ) {}

  async consultarSaldo(documento: string) {
    return await this.billeteraModel.findOne({ documento });
  }

  async recargarSaldo(documento: string, valor: number) {
    const billetera = await this.billeteraModel.findOneAndUpdate(
      { documento },
      { $inc: { saldo: valor } },
      { new: true, upsert: true },
    );
    return billetera;
  }
}
