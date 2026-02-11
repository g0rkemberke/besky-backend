import { Controller, Get, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  findAll() {
    return this.flightsService.findAll();
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