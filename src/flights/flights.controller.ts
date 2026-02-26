import { Controller, Get, Post, Body, Headers, UnauthorizedException, UseGuards, Request } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Güvenlik 

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  findAll() {
    return this.flightsService.findAll();
  }

  @Get('booked')
  findBooked(@Headers('x-admin-token') token: string) {
    const SECRET_TOKEN = process.env.ADMIN_TOKEN || "besky_london_2026_secure";
    if (token !== SECRET_TOKEN) {
      throw new UnauthorizedException('Geçersiz erişim anahtarı!');
    }
    return this.flightsService.findBookedFlights(); 
  }

  //  userEmail artık dışarıdan girilemez, sadece güvenli JWT Token'dan okunur!
  @UseGuards(JwtAuthGuard)
  @Post('book')
  async book(@Request() req: any, @Body() body: { flightId: string }) {
    // req.user, login olduğunda token'a koyduğumuz doğrulanmış veridir. Başkası adına işlem yapılamaz.
    const userEmail = req.user.email; 
    return this.flightsService.bookFlight(body.flightId, userEmail);
  }

  @Post('add-flight')
  create(@Body() flightData: any, @Headers('x-admin-token') token: string) {
    const SECRET_TOKEN = process.env.ADMIN_TOKEN || "besky_london_2026_secure";
    
    if (token !== SECRET_TOKEN) {
      throw new UnauthorizedException('Geçersiz erişim anahtarı!');
    }
    
    return this.flightsService.create(flightData);
  }
}