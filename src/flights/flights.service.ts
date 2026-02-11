import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flight } from './schemas/flight.schema';
import { CreateFlightDto } from './dto/create-flight.dto';

@Injectable()
export class FlightsService {
  constructor(@InjectModel(Flight.name) private flightModel: Model<Flight>) {}
  
  async create(createFlightDto: CreateFlightDto): Promise<Flight> {
    const createdFlight = new this.flightModel(createFlightDto);
    return createdFlight.save();
  }

  // Veritabanından tüm verileri çekme testi
  async findAll(): Promise<Flight[]> {
    return this.flightModel.find().exec();
  }
}