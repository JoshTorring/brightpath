import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.WEB_ORIGIN?.split(',') || ['http://localhost:3000'];
  app.enableCors({ origin: allowedOrigins, credentials: true });
  await app.listen(process.env.PORT || 4000);
  console.log(`API listening on http://localhost:${process.env.PORT || 4000}`);
}
bootstrap();
