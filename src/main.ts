import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🛡️ 1. GÜVENLİK KALKANI (HELMET): 
  // HTTP başlıklarını gizleyerek siteni XSS ve Clickjacking gibi tarayıcı tabanlı saldırılardan korur.
  app.use(helmet());

  // Mevcut app.enableCors() ayarın (Frontend'in sorunsuz bağlanması için korundu)
  app.enableCors({
    origin: true, // Canlıya çıkarken burayı sadece "https://seninsiten.com" olarak kısıtlayacağız. Şimdilik açık.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 🛡️ 2. VERİ SÜZGECİ (VALIDATION PIPE): 
  // Sisteme giren tüm verileri kapıda arar. DTO sınıflarında izin vermediğimiz hiçbir veriyi içeri almaz.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // İzin verilmeyen (DTO'da olmayan) gizli verileri (örn: beskyCoin: 999999) otomatik çöpe atar.
      forbidNonWhitelisted: true, // Zararlı veri yollamaya çalışanları anında 400 Bad Request ile kapı dışarı eder.
      transform: true, // Gelen string verilerini otomatik olarak doğru tiplere (number, boolean) çevirir.
    }),
  );

  const port = process.env.PORT || 3000;
  
  // Railway'in backend'i dış dünyaya açması için 0.0.0.0 dinlemesi
  await app.listen(port, '0.0.0.0'); 
  
  console.log(`Zırhlı Besky Backend Port ${port} üzerinde aktif.`);
}
bootstrap();