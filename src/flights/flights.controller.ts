import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Headers, 
  Param, 
  UnauthorizedException, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  // Ana sayfada ve yönetimde uçuşları listeler
  @Get()
  findAll() {
    return this.flightsService.findAll();
  }

  // Satılan uçuşları listeler (Admin Güvenlik Kontrollü)
  @Get('booked')
  findBooked(@Headers() headers: Record<string, string>) {
    const token = headers['x-admin-token'] || headers['X-Admin-Token'];
    const SECRET_TOKEN = process.env.ADMIN_TOKEN || "gorkem_vip_admin_2026";
    
    if (token !== SECRET_TOKEN) {
      throw new UnauthorizedException('Geçersiz erişim anahtarı!');
    }
    return this.flightsService.findBookedFlights(); 
  }

  // Kullanıcının uçuş satın alması (JWT Korumalı)
  @UseGuards(JwtAuthGuard)
  @Post('book')
  async book(@Request() req: any, @Body() body: { flightId: string }) {
    // req.user, login olduğunda token'dan gelen doğrulanmış veridir
    const userEmail = req.user.email; 
    return this.flightsService.bookFlight(body.flightId, userEmail);
  }

  // Yeni Uçuş Ekleme (Admin Güvenlik Kontrollü)
  @Post('add-flight')
  create(@Body() flightData: any, @Headers() headers: Record<string, string>) {
    const token = headers['x-admin-token'] || headers['X-Admin-Token'];
    const SECRET_TOKEN = process.env.ADMIN_TOKEN || "gorkem_vip_admin_2026";
    
    if (token !== SECRET_TOKEN) {
      console.error(`[GÜVENLİK] Ekleme Reddedildi -> Gelen Token: ${token}`);
      throw new UnauthorizedException('Geçersiz erişim anahtarı!');
    }
    
    return this.flightsService.create(flightData);
  }

  // Uçuşu Tamamen Silme (Admin Güvenlik Kontrollü)
  // Bu kapı (Route) uçuşun hem admin panelinden hem ana sayfadan silinmesini sağlar
  @Delete(':id')
  async remove(@Param('id') id: string, @Headers() headers: Record<string, string>) {
    const token = headers['x-admin-token'] || headers['X-Admin-Token'];
    const SECRET_TOKEN = process.env.ADMIN_TOKEN || "gorkem_vip_admin_2026";

    if (token !== SECRET_TOKEN) {
      console.error(`[GÜVENLİK] Silme Reddedildi -> Gelen Token: ${token}`);
      throw new UnauthorizedException('Geçersiz erişim anahtarı!');
    }

    return this.flightsService.remove(id);
  }
}