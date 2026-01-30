import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as yaml from 'js-yaml';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const apiPrefix = process.env.API_PREFIX ?? 'api/v1';
  app.setGlobalPrefix(apiPrefix);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Claims Management API')
    .setDescription('API for managing insurance claims and damages')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/api-docs', app, document);

  if (process.env.NODE_ENV !== 'production') {
    const yamlString = yaml.dump(document, {
      indent: 2,
      noRefs: true,
    });
    const outputPath = path.join(process.cwd(), 'openapi.yaml');
    fs.writeFileSync(outputPath, yamlString, 'utf8');
  }

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
