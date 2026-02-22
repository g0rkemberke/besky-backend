import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // createdAt ve updatedAt otomatik ekler
export class User extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user' })
  role: string;

  // --- KRİTİK EKSİK BURASIYDI ---
  @Prop({ default: null })
  membershipType: string;

  @Prop({ default: 0 })
  beskyCoin: number;

  @Prop({ type: Object, default: {} })
  history: any[];

  @Prop({ type: Object, default: {} })
  preferences: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);