import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true })
  documento: string;

  @Prop({ required: true })
  telefono: string;

  @Prop({ default: UserRole.USER })
  role: UserRole;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: String })
  emailVerificationCode?: string;

  @Prop({ type: Date })
  emailVerificationExpires?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  loginCount: number;

  @Prop({ default: Date.now })
  lastLogin: Date;

  @Prop({ default: 0 })
  totalTransactions: number;

  @Prop({ default: 0 })
  totalAmount: number;

  @Prop({ type: Object, default: {} })
  profile: {
    preferencias?: Record<string, any>;
    notificaciones?: boolean;
    twoFactorEnabled?: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ documento: 1 });
UserSchema.index({ createdAt: -1 });
