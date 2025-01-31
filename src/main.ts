import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

class CustomLogger extends Logger {
  log(message: string, colorCode: string = '\x1b[0m') {
    super.log(`${colorCode}${message}\x1b[0m`); // Mensaje en el color especificado
  }
}

async function bootstrap() {
  console.clear();
  const log = new CustomLogger('Billetera API');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const options = new DocumentBuilder()
    .setTitle('Billetera API')
    .setDescription('API Simulación billetera virtual.')
    .setVersion('1.0')
    .addTag('Billetera', 'Operaciones relacionadas con billetera virtual')
    .addServer('http://localhost:3001/', 'Local')
    .addServer('https://billetera-api.onrender.com', 'Productivo')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: {
      filter: true,
    },
  });

  await app.listen(process.env.PORT);
  log.log(
    `🔥 Servidor escuchando en el puerto: ${process.env.PORT} 🚀`,
    '\x1b[95m',
  );
  log.log(`📗Swagger📗`, '\x1b[34m');
  log.log(`✔ Documentacion API:${process.env.PORT}/docs`, '\x1b[34m');
}
bootstrap();
