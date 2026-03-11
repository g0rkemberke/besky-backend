import { Controller, Get, Post, Body, Headers, UnauthorizedException, UseGuards, Request } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  findAll() {
    return this.flightsService.findAll();
  }

  @Get('booked')
  findBooked(@Headers() headers: Record<string, string>) {
    // Güvenli Okuma: Tüm harf formatlarını kapsar
    const token = headers['x-admin-token'] || headers['X-Admin-Token'];
    const SECRET_TOKEN = process.env.ADMIN_TOKEN || "besky_london_2026_secure";
    
    if (token !== SECRET_TOKEN) {
      throw new UnauthorizedException('Geçersiz erişim anahtarı!');
    }
    return this.flightsService.findBookedFlights(); 
  }

  // userEmail artık dışarıdan girilemez, sadece güvenli JWT Token'dan okunur!
  @UseGuards(JwtAuthGuard)
  @Post('book')
  async book(@Request() req: any, @Body() body: { flightId: string }) {
    const userEmail = req.user.email; 
    return this.flightsService.bookFlight(body.flightId, userEmail);
  }

  @Post('add-flight')
  create(@Body() flightData: any, @Headers() headers: Record<string, string>) {
    // Güvenli Okuma
    const token = headers['x-admin-token'] || headers['X-Admin-Token'];
    const SECRET_TOKEN = process.env.ADMIN_TOKEN || "besky_london_2026_secure";
    
    if (token !== SECRET_TOKEN) {
      // Eğer hala hata olursa, backend terminaline sebebini yazdıracak dedektif logumuz:
      console.error(`[GÜVENLİK] Eşleşmeme Hatası -> Gelen Token: ${token} | Beklenen: ${SECRET_TOKEN}`);
      throw new UnauthorizedException('Geçersiz erişim anahtarı!');
    }
    
    return this.flightsService.create(flightData);
  }
}