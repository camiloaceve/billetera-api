import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Audit, AuditAction, AuditStatus } from './schemas/audit.schema';
import { Model } from 'mongoose';
import { Request } from 'express';

// Re-exportar enums para uso en otros módulos
export { AuditAction, AuditStatus };

export interface AuditLogData {
  action: AuditAction;
  status: AuditStatus;
  userId: string;
  documento?: string;
  documentoDestino?: string;
  monto?: number;
  sessionId?: string;
  token?: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
  request?: Request;
  email?: string;
  valor?: number;
  saldo?: number;
  nuevoSaldo?: number;
}

@Injectable()
export class AuditService {
  constructor(@InjectModel(Audit.name) private auditModel: Model<Audit>) {}

  async log(data: AuditLogData): Promise<Audit> {
    const auditLog = new this.auditModel({
      ...data,
      ip: data.request?.ip,
      userAgent: data.request?.get('User-Agent'),
    });

    return auditLog.save();
  }

  async logSuccess(
    action: AuditAction,
    userId: string,
    details: Partial<AuditLogData> = {},
    request?: Request,
  ): Promise<Audit> {
    return this.log({
      action,
      status: AuditStatus.EXITOSO,
      userId,
      ...details,
      request,
    });
  }

  async logError(
    action: AuditAction,
    userId: string,
    errorMessage: string,
    details: Partial<AuditLogData> = {},
    request?: Request,
  ): Promise<Audit> {
    return this.log({
      action,
      status: AuditStatus.FALLIDO,
      userId,
      errorMessage,
      ...details,
      request,
    });
  }

  async logPending(
    action: AuditAction,
    userId: string,
    details: Partial<AuditLogData> = {},
    request?: Request,
  ): Promise<Audit> {
    return this.log({
      action,
      status: AuditStatus.PENDIENTE,
      userId,
      ...details,
      request,
    });
  }

  async findByUserId(userId: string, limit = 100): Promise<Audit[]> {
    return this.auditModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async findByDocumento(documento: string, limit = 100): Promise<Audit[]> {
    return this.auditModel
      .find({ documento })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async findByAction(action: AuditAction, limit = 100): Promise<Audit[]> {
    return this.auditModel
      .find({ action })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit = 1000,
  ): Promise<Audit[]> {
    return this.auditModel
      .find({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}
