import { Controller, Get, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  findAll() {
    return this.flightsService.findAll();
  }

  // --- YENİ EKLENEN: Admin için Satılan Uçuşları Getir ---
  @Get('booked')
  findBooked(@Headers('x-admin-token') token: string) {
    const SECRET_TOKEN = "besky_london_2026_secure";
    if (token !== SECRET_TOKEN) {
      throw new UnauthorizedException('Geçersiz erişim anahtarı!');
    }
    return this.flightsService.findBookedFlights(); 
  }

  @Post('book')
  async book(@Body() body: { flightId: string, userEmail: string }) {
    // Frontend'den gelen flightId ve userEmail ile uçağı mühürle
    return this.flightsService.bookFlight(body.flightId, body.userEmail);
  }

  @Post('add-flight')
  create(@Body() flightData: any, @Headers('x-admin-token') token: string) {
    const SECRET_TOKEN = "besky_london_2026_secure";
    
    if (token !== SECRET_TOKEN) {
      throw new UnauthorizedException('Geçersiz erişim anahtarı!');
    }
    
    return this.flightsService.create(flightData);
  }
}