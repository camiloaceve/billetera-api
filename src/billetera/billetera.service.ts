import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Billetera } from './schemas/billetera.schema';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from 'src/auth/email/email.service';
import { AuditService, AuditAction } from '../audit/audit.service';
import { Request } from 'express';

@Injectable()
export class BilleteraService {
  constructor(
    @InjectModel(Billetera.name) private billeteraModel: Model<Billetera>,
    private authService: AuthService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async iniciarDePago(
    email: string,
    documento: string,
    monto: number,
    request?: Request,
  ) {
    try {
      const sessionId = uuidv4();

      // Log de inicio de pago
      await this.auditService.logPending(
        AuditAction.INICIO_PAGO,
        documento,
        { sessionId, monto, email },
        request,
      );

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

      // Log de éxito
      await this.auditService.logSuccess(
        AuditAction.INICIO_PAGO,
        documento,
        { sessionId, monto, email },
        request,
      );

      return {
        mensaje: 'Se ha enviado un correo con el código de confirmación.',
        sessionId,
      };
    } catch (error) {
      // Log de error
      await this.auditService.logError(
        AuditAction.INICIO_PAGO,
        documento,
        error.message,
        { monto, email },
        request,
      );
      return error.message;
    }
  }

  async consultarSaldo(documento: string, request?: Request) {
    try {
      const saldo = await this.billeteraModel.findOne({ documento });

      // Log de consulta de saldo
      await this.auditService.logSuccess(
        AuditAction.CONSULTA_SALDO,
        documento,
        { saldo: saldo?.saldo || 0 },
        request,
      );

      return saldo;
    } catch (error) {
      // Log de error
      await this.auditService.logError(
        AuditAction.CONSULTA_SALDO,
        documento,
        error.message,
        {},
        request,
      );
      return error.message;
    }
  }

  async recargarSaldo(documento: string, valor: number, request?: Request) {
    const session = await this.billeteraModel.startSession();

    try {
      const result = await session.withTransaction(async () => {
        const billetera = await this.billeteraModel.findOneAndUpdate(
          { documento },
          { $inc: { saldo: valor } },
          { new: true, upsert: true, session },
        );

        return billetera;
      });

      // Log de recarga exitosa
      await this.auditService.logSuccess(
        AuditAction.RECARGA,
        documento,
        { valor, nuevoSaldo: result.saldo },
        request,
      );

      return result;
    } catch (error) {
      // Log de error
      await this.auditService.logError(
        AuditAction.RECARGA,
        documento,
        error.message,
        { valor },
        request,
      );
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async realizarPago(origen: string, destino: string, monto: number) {
    const session = await this.billeteraModel.startSession();

    try {
      await session.withTransaction(async () => {
        // Verificar billeteras dentro de la transacción
        const [billeteraOrigen, billeteraDestino] = await Promise.all([
          this.billeteraModel.findOne({ documento: origen }).session(session),
          this.billeteraModel.findOne({ documento: destino }).session(session),
        ]);

        if (!billeteraOrigen || !billeteraDestino) {
          throw new Error('Una de las billeteras no existe');
        }

        if (billeteraOrigen.saldo < monto) {
          throw new Error('Saldo insuficiente');
        }

        // Actualizar saldos atómicamente
        await Promise.all([
          this.billeteraModel
            .updateOne({ documento: origen }, { $inc: { saldo: -monto } })
            .session(session),
          this.billeteraModel
            .updateOne({ documento: destino }, { $inc: { saldo: monto } })
            .session(session),
        ]);

        return { mensaje: 'Pago realizado con éxito', monto };
      });

      return { mensaje: 'Pago realizado con éxito', monto };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
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
