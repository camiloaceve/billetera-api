import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Billetera } from './schemas/billetera.schema';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class BilleteraService {
  constructor(
    @InjectModel(Billetera.name) private billeteraModel: Model<Billetera>,
    private authService: AuthService,
  ) {}

  async generarTokenDePago(documento: string, monto: number) {
    return this.authService.generarToken(documento, monto);
  }

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

  async realizarPago(origen: string, destino: string, monto: number) {
    const billeteraOrigen = await this.billeteraModel.findOne({
      documento: origen,
    });
    const billeteraDestino = await this.billeteraModel.findOne({
      documento: destino,
    });

    if (!billeteraOrigen || !billeteraDestino) {
      throw new Error('Una de las billeteras no existe');
    }

    if (billeteraOrigen.saldo < monto) {
      throw new Error('Saldo insuficiente');
    }

    await this.billeteraModel.updateOne(
      { documento: origen },
      { $inc: { saldo: -monto } },
    );
    await this.billeteraModel.updateOne(
      { documento: destino },
      { $inc: { saldo: monto } },
    );

    return { mensaje: 'Pago realizado con éxito', monto };
  }
}
