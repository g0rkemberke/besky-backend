import { Controller, Post, Body, Patch, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  // --- EKLENEN KISIM: Sayfa yenilendiğinde verileri çekmek için (Get Me) ---
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.authService.findById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-profile')
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    // req: any diyerek TypeScript'in 'user' objesini sorgulamasını engelledik
    // req.user.sub senin login fonksiyonundaki payload yapısına uygun olmalı
    const userId = req.user.userId || req.user.sub; 
    return this.authService.updateUser(userId, updateData);
  }
}