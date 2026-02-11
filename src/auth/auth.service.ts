import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './auth.user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService 
  ) {}

  async register(userData: any) {
    const { email, password, fullName } = userData;
    
    // 1. ADIM: Email kontrolü
    const exists = await this.userModel.findOne({ email });
    if (exists) throw new ConflictException('Bu e-posta zaten kullanımda!');

    // 2. ADIM: Şifreleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. ADIM: Kayıt (Konsola yazdırıyoruz ki terminalden takip et)
    console.log('--- MONGODB KAYIT DENENİYOR ---', email);
    
    const newUser = new this.userModel({
      fullName,
      email,
      password: hashedPassword,
      role: 'user' // Varsayılan rol ekledik
    });

    const savedUser = await newUser.save();
    console.log('--- MONGODB KAYIT BAŞARILI! ID: ---', savedUser._id);
    
    return savedUser;
  }

  async login(email: string, pass: string) {
    console.log('--- GİRİŞ DENEMESİ ---', email);
    
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Geçersiz bilgiler!');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Geçersiz bilgiler!');

    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;

    const payload = { 
      email: userObject.email, 
      sub: userObject._id, 
      role: userObject.role 
    };

    console.log('--- GİRİŞ BAŞARILI, TOKEN OLUŞTURULDU ---');
    
    return {
      user: userWithoutPassword,
      access_token: this.jwtService.sign(payload),
    };
  }

  async updateUser(userId: string, data: any) {
    console.log('--- GÜNCELLEME İSTEĞİ --- ID:', userId);
    
    const { password, email, _id, ...updateableData } = data;

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateableData },
      { new: true } 
    ).select('-password'); 

    if (!updatedUser) {
      throw new UnauthorizedException('Kullanıcı bulunamadı!');
    }

    console.log('--- GÜNCELLEME BAŞARILI ---');
    
    return {
      user: updatedUser,
    };
  }
}