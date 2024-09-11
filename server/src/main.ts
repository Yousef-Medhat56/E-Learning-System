import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  const logger = new Logger();

  await app.listen(port, () => {
    logger.log(`Listening on port ${port}`);
  });
}
bootstrap();
