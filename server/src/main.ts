import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3000;
  const logger = new Logger();

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  // SWAGGER
  const config = new DocumentBuilder()
    .setTitle('E-Learning API')
    .addBearerAuth({
      in: 'header',
      type: 'http',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));

  await app.listen(port, () => {
    logger.log(`Listening on port ${port}`);
  });
}
bootstrap();
