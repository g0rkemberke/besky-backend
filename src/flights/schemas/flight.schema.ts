import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) 
export class Flight extends Document {
  @Prop({ required: true }) from: string;
  @Prop({ required: true }) fromCode: string;
  @Prop({ required: true }) to: string;
  @Prop({ required: true }) toCode: string;
  @Prop() aircraft: string;
  @Prop() price: string;
  @Prop() date: string;
  @Prop() time: string;
  @Prop() capacity: string;
  @Prop() luggage: string;
  @Prop() discount: string;
  @Prop() timeLeft: number;
  @Prop([String]) images: string[];

  // --- REZERVASYON KONTROL ALANLARI ---
  @Prop({ default: false }) isBooked: boolean;
  @Prop() bookedBy: string; 

  // --- FAZ 1: UÇUŞ MÜHENDİSLİĞİ ALANLARI (YENİ EKLENENLER) ---
  @Prop() distanceNM: number;       // Deniz Mili (Nautical Miles) cinsinden mesafe
  @Prop() flightDuration: string;   // Örn: "2s 45dk"
  @Prop() arrivalTimeLocal: string; // İndiği ülkenin yerel saatine göre varış vakti
}

export const FlightSchema = SchemaFactory.createForClass(Flight);