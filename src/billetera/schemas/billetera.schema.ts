import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Billetera extends Document {
  @Prop({ required: true, unique: true })
  documento: string;

  @Prop({ required: true, default: 0 })
  saldo: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const BilleteraSchema = SchemaFactory.createForClass(Billetera);
