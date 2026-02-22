import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { MongooseModule } from '@nestjs/mongoose';
import { FlightsModule } from './flights/flights.module';
import { AuthModule } from './auth/auth.module';

// --- KRİTİK EKLENTİ: CONCIERGE MODÜLÜ İÇERİ ALINDI ---
import { ConciergeModule } from './concierge/concierge.module';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. MongoDB Atlas bağlantısı 
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb+srv://besky-admin:besky12345@besky.ayltsdo.mongodb.net/besky_db?retryWrites=true&w=majority',
      }),
    }),

    FlightsModule,
    AuthModule,
    ConciergeModule, // --- SİSTEME TANITILDI ---
  ],
})
export class AppModule {}