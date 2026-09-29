import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Dominios permitidos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP permitidos
    credentials: true, // Permitir cookies/tokens en las peticiones
    allowedHeaders: 'Content-Type, Accept, Authorization', // Cabeceras permitidas
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
