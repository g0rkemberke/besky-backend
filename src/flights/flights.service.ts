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
    let fuelBurnKg = 0;
    let fuelCostEuro = 0;

    try {
      const fromData = AIRPORT_DATA[createFlightDto.fromCode];
      const toData = AIRPORT_DATA[createFlightDto.toCode];

      if (fromData && toData) {
        // 1. Mesafe Hesabı
        distanceNM = this.calculateDistance(fromData.lat, fromData.lon, toData.lat, toData.lon);
        
        // 2. Süre Hesabı (450 Knot Hız + 30dk Pay)
        const flightHoursTotal = (distanceNM / 450) + 0.5; 
        
        // 3. Yakıt Algoritması (Ortalama 800kg/saat tüketim, 1.2€/kg fiyat)
        fuelBurnKg = Math.round(flightHoursTotal * 800);
        fuelCostEuro = Math.round(fuelBurnKg * 1.2);

        const hours = Math.floor(flightHoursTotal);
        const mins = Math.round((flightHoursTotal - hours) * 60);
        flightDuration = `${hours}s ${mins}dk`;

        // 4. Varış Yerel Saati Hesabı
        if (createFlightDto.date && createFlightDto.time) {
          const departureDate = new Date(`${createFlightDto.date}T${createFlightDto.time}:00Z`);
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
    }

    const createdFlight = new this.flightModel({
      ...createFlightDto,
      isBooked: false,
      distanceNM,
      flightDuration,
      arrivalTimeLocal,
      fuelBurnKg,
      fuelCostEuro
    });
    
    return createdFlight.save();
  }

  async findAll(): Promise<Flight[]> {
    // Aktif uçuşları en yeni en üstte olacak şekilde getirir
    return this.flightModel.find({ isBooked: { $ne: true } }).sort({ createdAt: -1 }).exec();
  }

  async findBookedFlights(): Promise<Flight[]> {
    // Satılan uçuşları son satılana göre getirir
    return this.flightModel.find({ isBooked: true }).sort({ updatedAt: -1 }).exec();
  }

  async remove(id: string): Promise<any> {
    const result = await this.flightModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Uçuş bulunamadı.');
    return { success: true, message: 'Uçuş kalıcı olarak silindi.' };
  }

  async bookFlight(flightId: string, userEmail: string): Promise<Flight> {
    const query = Types.ObjectId.isValid(flightId) ? { _id: new Types.ObjectId(flightId) } : { id: flightId };
    
    // 'async' düzeltildi ve 'new: true' eklendi
    const updatedFlight = await this.flightModel.findOneAndUpdate(
      query, 
      { $set: { isBooked: true, bookedBy: userEmail } }, 
      { new: true } 
    ).exec();

    if (!updatedFlight) throw new NotFoundException('Uçuş mühürlenemedi.');
    return updatedFlight;
  }

  async unbookFlight(flightId: string): Promise<Flight> {
    const query = Types.ObjectId.isValid(flightId) ? { _id: new Types.ObjectId(flightId) } : { id: flightId };
    const resetFlight = await this.flightModel.findOneAndUpdate(
      query,
      { $set: { isBooked: false, bookedBy: null } },
      { new: true }
    ).exec();

    if (!resetFlight) throw new NotFoundException('Uçuş bulunamadı.');
    return resetFlight;
  }
}