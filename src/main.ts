import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mevcut app.enableCors() yerine bu bloğu yapıştırıyoruz
  app.enableCors({
    origin: true, // Tüm domainlerden (Hostlab dahil) gelen isteklere izin verir
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  
  // Railway'in backend'i dış dünyaya açması için 0.0.0.0 dinlemesi bazen gerekebilir
  await app.listen(port, '0.0.0.0'); 
  
  console.log(`Application is running on port: ${port}`);
}
bootstrap();