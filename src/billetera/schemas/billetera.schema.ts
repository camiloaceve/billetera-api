import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Billetera extends Document {
  @Prop({ required: true, unique: true })
  documento: string;

  @Prop({ required: true, default: 0, min: 0 })
  saldo: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const BilleteraSchema = SchemaFactory.createForClass(Billetera);

// Agregar índices manualmente
BilleteraSchema.index({ documento: 1 }); // Índice único para búsquedas por documento
BilleteraSchema.index({ createdAt: -1 }); // Índice para ordenamiento por fecha
