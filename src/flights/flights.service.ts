import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // Types eklendi
import { Flight } from './schemas/flight.schema';
import { CreateFlightDto } from './dto/create-flight.dto';

@Injectable()
export class FlightsService {
  constructor(@InjectModel(Flight.name) private flightModel: Model<Flight>) {}
  
  async create(createFlightDto: CreateFlightDto): Promise<Flight> {
    // Yeni eklenen uçuşlar her zaman isBooked: false olarak başlasın
    const createdFlight = new this.flightModel({
      ...createFlightDto,
      isBooked: false 
    });
    return createdFlight.save();
  }

  async findAll(): Promise<Flight[]> {
    // Sadece isBooked değeri TRUE OLMAYAN uçuşları getirir.
    // Böylece satılan uçaklar listeden düşer, diğerleri (false veya undefined) kalır.
    return this.flightModel.find({ 
      isBooked: { $ne: true } 
    }).exec();
  }

  // --- YENİ EKLENEN: SADECE SATILAN UÇUŞLARI GETİR (Admin İçin) ---
  async findBookedFlights(): Promise<Flight[]> {
    // Sadece isBooked değeri TRUE olan (satılmış/mühürlenmiş) uçuşları getirir.
    return this.flightModel.find({ 
      isBooked: true 
    }).exec();
  }

  // --- REZERVASYON YAPMA ---
  async bookFlight(flightId: string, userEmail: string): Promise<Flight> {
    // SENTINEL KORUMASI: Eğer gelen ID standart formatta değilse (1, 5 gibi), 
    // findById yerine genel findOne kullanarak hatayı engelliyoruz.
    const query = Types.ObjectId.isValid(flightId) 
      ? { _id: flightId } 
      : { id: flightId }; // Eğer şemanda 'id' diye ayrı bir alan varsa ona bakar

    const updatedFlight = await this.flightModel.findOneAndUpdate(
      query,
      { $set: { isBooked: true, bookedBy: userEmail } },
      { returnDocument: 'after' } // 'new: true' uyarısı burada düzeltildi
    ).exec();

    if (!updatedFlight) {
      throw new NotFoundException('Uçuş mühürlenemedi. ID formatını veya uçuşun varlığını kontrol edin.');
    }

    return updatedFlight;
  }

  // --- YENİ: UÇAĞI GERİ GETİRME (SATIŞA AÇMA) ---
  async unbookFlight(flightId: string): Promise<Flight> {
    const query = Types.ObjectId.isValid(flightId) 
      ? { _id: flightId } 
      : { id: flightId };

    const resetFlight = await this.flightModel.findOneAndUpdate(
      query,
      { $set: { isBooked: false, bookedBy: null } },
      { returnDocument: 'after' }
    ).exec();

    if (!resetFlight) {
      throw new NotFoundException('Uçuş bulunamadı.');
    }

    return resetFlight;
  }
}