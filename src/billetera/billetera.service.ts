import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Billetera } from './schemas/billetera.schema';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from 'src/auth/email/email.service';

@Injectable()
export class BilleteraService {
  constructor(
    @InjectModel(Billetera.name) private billeteraModel: Model<Billetera>,
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  async iniciarDePago(email: string, documento: string, monto: number) {
    try {
      const sessionId = uuidv4();
      const dataToken = this.authService.generarToken(
        sessionId,
        documento,
        monto,
      );

      await this.emailService.transactionMail(
        email,
        sessionId,
        dataToken.token,
      );

      return {
        mensaje: 'Se ha enviado un correo con el código de confirmación.',
        sessionId,
      };
    } catch (error) {
      return error.message;
    }
  }

  async consultarSaldo(documento: string) {
    try {
      return await this.billeteraModel.findOne({ documento });
    } catch (error) {
      return error.message;
    }
  }

  async recargarSaldo(documento: string, valor: number) {
    try {
      const billetera = await this.billeteraModel.findOneAndUpdate(
        { documento },
        { $inc: { saldo: valor } },
        { new: true, upsert: true },
      );
      return billetera;
    } catch (error) {
      return error.message;
    }
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

  async realizarPagoConToken(
    origen: string,
    destino: string,
    monto: number,
    token: string,
  ) {
    try {
      const data = this.authService.verificarToken(token);
      if (data.documento !== origen || data.monto !== monto) {
        throw new Error('El token no coincide con la transacción');
      }
      return this.realizarPago(origen, destino, monto);
    } catch (error) {
      return error.message;
    }
  }

  async confirmarPago(sessionId: string, token: string) {
    let data;
    try {
      data = this.authService.verificarToken(token);
      if (data.sessionId !== sessionId) {
        throw new Error('ID de sesión incorrecto');
      }

      // Buscar billeteras
      const billeteraOrigen = await this.billeteraModel.findOne({
        documento: data.documento,
      });

      if (!billeteraOrigen) {
        throw new Error('La billetera no existe');
      }

      if (billeteraOrigen.saldo < data.monto) {
        throw new Error('Saldo insuficiente');
      }

      return {
        mensaje: 'Pago confirmado y realizado con éxito',
        monto: data.monto,
      };
    } catch (error) {
      return error.message;
    }
  }
}
