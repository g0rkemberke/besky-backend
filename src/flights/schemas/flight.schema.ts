import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // createdAt ve updatedAt otomatik eklenir
export class Flight extends Document {
  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  fromCode: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  toCode: string;

  @Prop()
  aircraft: string;

  @Prop()
  price: string;

  @Prop()
  date: string;

  @Prop()
  time: string;

  @Prop()
  capacity: string;

  @Prop()
  luggage: string;

  @Prop()
  discount: string;

  @Prop()
  timeLeft: number;

  @Prop([String]) // Çoklu resimler için dizi yapısı
  images: string[];
}

export const FlightSchema = SchemaFactory.createForClass(Flight);