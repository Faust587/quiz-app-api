import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./cert/CA/localhost/localhost.decrypted.key'),
    cert: fs.readFileSync('./cert/CA/localhost/localhost.crt'),
    ca: fs.readFileSync('./cert/CA/CA.pem'),
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    //httpsOptions,
  });
  app.use(cookieParser(process.env.JWT_SECRET_KEY));
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });
  await app.listen(4000);
}

bootstrap();
