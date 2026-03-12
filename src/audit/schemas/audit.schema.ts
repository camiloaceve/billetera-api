import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum AuditAction {
  RECARGA = 'RECARGA',
  PAGO = 'PAGO',
  CONSULTA_SALDO = 'CONSULTA_SALDO',
  INICIO_PAGO = 'INICIO_PAGO',
  CONFIRMACION_PAGO = 'CONFIRMACION_PAGO',
  ERROR = 'ERROR',
}

export enum AuditStatus {
  EXITOSO = 'EXITOSO',
  FALLIDO = 'FALLIDO',
  PENDIENTE = 'PENDIENTE',
}

@Schema()
export class Audit extends Document {
  @Prop({ required: true, enum: AuditAction })
  action: AuditAction;

  @Prop({ required: true, enum: AuditStatus })
  status: AuditStatus;

  @Prop({ required: true })
  userId: string;

  @Prop()
  documento?: string;

  @Prop()
  documentoDestino?: string;

  @Prop({ type: Number })
  monto?: number;

  @Prop({ type: String })
  sessionId?: string;

  @Prop({ type: String })
  token?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: String })
  errorMessage?: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: String })
  ip?: string;

  @Prop({ type: String })
  userAgent?: string;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);

// Índices para auditoría
AuditSchema.index({ userId: 1, timestamp: -1 });
AuditSchema.index({ action: 1, timestamp: -1 });
AuditSchema.index({ documento: 1, timestamp: -1 });
AuditSchema.index({ timestamp: -1 });
