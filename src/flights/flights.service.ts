import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Flight } from './schemas/flight.schema';
import { CreateFlightDto } from './dto/create-flight.dto';

// --- HAVALİMANI KOORDİNAT VE SAAT DİLİMİ SÖZLÜĞÜ ---
const AIRPORT_DATA = {
  "ISL/LTBA": { lat: 40.9769, lon: 28.8146, tz: "Europe/Istanbul" },
  "FAB/EGLF": { lat: 51.2758, lon: -0.7763, tz: "Europe/London" },
  "NCE/LFMN": { lat: 43.6584, lon: 7.2158, tz: "Europe/Paris" },
  "LBG/LFPB": { lat: 48.9694, lon: 2.4413, tz: "Europe/Paris" },
  "DWC/OMDW": { lat: 24.8966, lon: 55.1613, tz: "Asia/Dubai" },
};

@Injectable()
export class FlightsService {
  constructor(@InjectModel(Flight.name) private flightModel: Model<Flight>) {}
  
  // Haversine Formülü: Dereceyi Radyana Çevirir
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Küre üzerinde iki nokta arası Deniz Mili (NM) hesabı
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3440.065; 
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }

  async create(createFlightDto: CreateFlightDto): Promise<Flight> {
    let distanceNM = 0;
    let flightDuration = "Hesaplanamadı";
    let arrivalTimeLocal = "Bilinmiyor";

    try {
      // 1. Havalimanı verilerini çek
      const fromData = AIRPORT_DATA[createFlightDto.fromCode];
      const toData = AIRPORT_DATA[createFlightDto.toCode];

      // Eğer seçilen havalimanları sözlüğümüzde varsa hesapla (PVT değilse)
      if (fromData && toData) {
        // 2. Mesafeyi bul
        distanceNM = this.calculateDistance(fromData.lat, fromData.lon, toData.lat, toData.lon);

        // 3. Süreyi bul (450 Knot Hız + 30dk İniş/Kalkış)
        const flightHoursTotal = (distanceNM / 450) + 0.5; 
        const hours = Math.floor(flightHoursTotal);
        const mins = Math.round((flightHoursTotal - hours) * 60);
        flightDuration = `${hours}s ${mins}dk`;

        // 4. Varış yerel saatini bul
        if (createFlightDto.date && createFlightDto.time) {
          const departureString = `${createFlightDto.date}T${createFlightDto.time}:00Z`;
          const departureDate = new Date(departureString);
          
          if (!isNaN(departureDate.getTime())) { 
            const arrivalDateUTC = new Date(departureDate.getTime() + (flightHoursTotal * 60 * 60 * 1000));
            arrivalTimeLocal = new Intl.DateTimeFormat('tr-TR', {
              timeZone: toData.tz,
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit'
            }).format(arrivalDateUTC);
          }
        }
      }
    } catch (error) {
      console.error("Hesaplama motoru hatası:", error);
      // Hata olsa bile sunucu çökmez, uçuşu kaydeder
    }

    // Nihai uçuş verisini oluştur ve veritabanına kaydet
    const createdFlight = new this.flightModel({
      ...createFlightDto,
      isBooked: false,
      distanceNM,
      flightDuration,
      arrivalTimeLocal
    });
    
    return createdFlight.save();
  }

  async findAll(): Promise<Flight[]> {
    return this.flightModel.find({ isBooked: { $ne: true } }).exec();
  }

  async findBookedFlights(): Promise<Flight[]> {
    return this.flightModel.find({ isBooked: true }).exec();
  }

  async bookFlight(flightId: string, userEmail: string): Promise<Flight> {
    const query = Types.ObjectId.isValid(flightId) ? { _id: flightId } : { id: flightId };
    const updatedFlight = await this.flightModel.findOneAndUpdate(
      query,
      { $set: { isBooked: true, bookedBy: userEmail } },
      { returnDocument: 'after' } 
    ).exec();

    if (!updatedFlight) throw new NotFoundException('Uçuş mühürlenemedi.');
    return updatedFlight;
  }

  async unbookFlight(flightId: string): Promise<Flight> {
    const query = Types.ObjectId.isValid(flightId) ? { _id: flightId } : { id: flightId };
    const resetFlight = await this.flightModel.findOneAndUpdate(
      query,
      { $set: { isBooked: false, bookedBy: null } },
      { returnDocument: 'after' }
    ).exec();

    if (!resetFlight) throw new NotFoundException('Uçuş bulunamadı.');
    return resetFlight;
  }
}