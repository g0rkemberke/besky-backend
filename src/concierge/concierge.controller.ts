import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConciergeRequest } from './concierge.schema';

@Controller('concierge')
export class ConciergeController {
  constructor(@InjectModel(ConciergeRequest.name) private requestModel: Model<ConciergeRequest>) {}

  @Post('request')
  async createRequest(@Body() requestData: any) {
    console.log('--- YENİ CONCIERGE TALEBİ GELDİ ---', requestData.serviceTitle);
    
    const newRequest = new this.requestModel(requestData);
    const savedRequest = await newRequest.save();
    
    console.log('--- TALEP MONGODB\'YE MÜHÜRLENDİ ---');
    return savedRequest;
  }

  // --- YENİ EKLENEN: Admin için Tüm VIP Talepleri Getir ---
  @Get('all')
  async getAllRequests(@Headers('x-admin-token') token: string) {
    const SECRET_TOKEN = "besky_london_2026_secure";
    if (token !== SECRET_TOKEN) {
      throw new UnauthorizedException('Geçersiz erişim anahtarı!');
    }
    // En yeni talepler en üstte gelecek şekilde (createdAt: -1) sıralıyoruz
    return this.requestModel.find().sort({ createdAt: -1 }).exec();
  }
}