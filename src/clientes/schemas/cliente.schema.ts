import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Cliente extends Document {
  @Prop({ required: true, unique: true })
  documento: string;

  @Prop({ required: true })
  nombres: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  celular: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);
