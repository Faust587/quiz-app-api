import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    //httpsOptions,
  });
  app.use(cookieParser(process.env.JWT_SECRET_KEY));
  app.enableCors({
    origin: ["http://141.145.214.106:80", "https://faust587.github.io", "https://github.com"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  });
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });
  await app.listen(4000);
}

bootstrap();
