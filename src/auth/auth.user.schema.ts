import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true }) 
  email: string;

  @Prop({ required: true })
  password: string; 

  @Prop({ default: 'user' }) 
  role: string;
  
  @Prop({ default: '' })
  phoneNumber: string;

  @Prop({ default: '' })
  passportNumber: string;

  @Prop({ default: '' })
  birthDate: string;

  @Prop({ default: '' })
  preferences: string; 
}

export const UserSchema = SchemaFactory.createForClass(User);