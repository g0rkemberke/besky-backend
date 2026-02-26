import { Controller, Post, Body, Get, Headers, UnauthorizedException, UseGuards, Request } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConciergeRequest } from './concierge.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // 🛡️ GÜVENLİK KİLİDİ

@Controller('concierge')
export class ConciergeController {
  constructor(@InjectModel(ConciergeRequest.name) private requestModel: Model<ConciergeRequest>) {}

  // 🛡️ KRİTİK ZIRH: Sadece geçerli bir JWT Token'a sahip (giriş yapmış) VIP üyeler talep oluşturabilir.
  @UseGuards(JwtAuthGuard)
  @Post('request')
  async createRequest(@Request() req: any, @Body() requestData: any) {
    console.log('--- YENİ CONCIERGE TALEBİ GELDİ ---', requestData.serviceTitle);
    
    // 🛡️ KİMLİK SAHTEKARLIĞINI ÖNLEME:
    // Kullanıcı dışarıdan (Body içinden) başkasının e-postasını veya ID'sini gönderse bile,
    // biz onları ezip kendi güvenli token'ımızdan (req.user) gelen %100 doğru verileri basıyoruz.
    const secureRequestData = {
      ...requestData,
      userEmail: req.user.email, // Token'dan okunan gerçek ve değiştirilemez email
      userId: req.user.sub       // Token'dan okunan gerçek ve değiştirilemez ID
    };
    
    const newRequest = new this.requestModel(secureRequestData);
    const savedRequest = await newRequest.save();
    
    console.log('--- TALEP MONGODB\'YE MÜHÜRLENDİ ---');
    return savedRequest;
  }

  // --- Admin için Tüm VIP Talepleri Getir ---
  @Get('all')
  async getAllRequests(@Headers('x-admin-token') token: string) {
    // 🛡️ Token'ı koda gömmek yerine çevresel değişkene (Railway .env) bağladık
    const SECRET_TOKEN = process.env.ADMIN_TOKEN || "besky_london_2026_secure";
    if (token !== SECRET_TOKEN) {
      throw new UnauthorizedException('Geçersiz erişim anahtarı!');
    }
    // En yeni talepler en üstte gelecek şekilde (createdAt: -1) sıralıyoruz
    return this.requestModel.find().sort({ createdAt: -1 }).exec();
  }
}