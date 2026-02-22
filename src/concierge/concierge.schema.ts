import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ConciergeRequest extends Document {
  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  serviceId: string;

  @Prop({ required: true })
  serviceTitle: string;

  @Prop()
  date: string;

  @Prop()
  location: string;

  @Prop()
  notes: string;

  @Prop({ default: 'Beklemede' }) // Operasyon ekibi daha sonra "Onaylandı" yapabilir
  status: string;
}

export const ConciergeRequestSchema = SchemaFactory.createForClass(ConciergeRequest);