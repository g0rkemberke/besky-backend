import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core'; 
import { FlightsModule } from './flights/flights.module';
import { AuthModule } from './auth/auth.module';
import { ConciergeModule } from './concierge/concierge.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // BOT VE SALDIRI KORUMASI: Bir IP adresinden dakikada maksimum 60 istek atılabilir.
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),

    // MongoDB Atlas bağlantısı (Dokunulmadı)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb+srv://besky-admin:besky12345@besky.ayltsdo.mongodb.net/besky_db?retryWrites=true&w=majority',
      }),
    }),

    FlightsModule,
    AuthModule,
    ConciergeModule, 
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, 
    },
  ],
})
export class AppModule {}