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

    // 2. ADIM: Şifreleme (Bcrypt Zırhı)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. ADIM: Kayıt
    console.log('--- MONGODB KAYIT DENENİYOR ---', email);
    
    const newUser = new this.userModel({
      fullName,
      email,
      password: hashedPassword,
      role: 'user',
      preferences: {} // Kayıt anında boş bir tercih objesi oluşturuyoruz
    });

    const savedUser = await newUser.save();
    console.log('--- MONGODB KAYIT BAŞARILI! ID: ---', savedUser._id);
    
    // Şifreyi MongoDB'ye kaydettik ama Frontend'e geri GÖNDERMİYORUZ (Güvenlik)
    const userObject = savedUser.toObject();
    // TypeScript hatasını çözen Destructuring yöntemi:
    const { password: _, ...userWithoutPassword } = userObject;
    
    return userWithoutPassword;
  }

  async login(email: string, pass: string) {
    console.log('--- GİRİŞ DENEMESİ ---', email);
    
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Geçersiz bilgiler!');

    // Bcrypt ile şifre eşleştirme
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Geçersiz bilgiler!');

    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;

    // JWT Token İçeriği (Payload)
    const payload = { 
      email: userObject.email, 
      sub: userObject._id, 
      role: userObject.role 
    };

    console.log('--- GİRİŞ BAŞARILI, VIP TOKEN OLUŞTURULDU ---');
    
    return {
      user: userWithoutPassword,
      access_token: this.jwtService.sign(payload), // Güvenli Token
    };
  }

  // --- Profil yenileme için kullanıcıyı bulma ---
  async findById(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı!');
    return user;
  }

  //  Profil Bilgilerini Güncelleme 
  async updateUser(userId: string, data: any) {
    console.log('--- GÜNCELLEME İSTEĞİ GELİYOR --- ID:', userId);
    
    //  ÇELİK KASA : Sistemsel ve Finansal alanlar
    const { 
      password, 
      email, 
      _id, 
      role, 
      beskyCoin,         
      membershipType,    
      createdAt,         
      updatedAt,         
      __v,
      ...updateableData 
    } = data;

    if (updateableData.preferences) {
      console.log('--- KAYDEDİLECEK TERCİHLER ---', updateableData.preferences);
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateableData },
      { new: true, runValidators: true } 
    ).select('-password'); 

    if (!updatedUser) {
      throw new UnauthorizedException('Kullanıcı bulunamadı!');
    }

    console.log('--- ELITE TERCİHLER MONGODB\'YE MÜHÜRLENDİ ---');
    
    return {
      user: updatedUser,
    };
  }
}