import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Agent Dex API')
    .setDescription('API to interact with the Agent Dex protocol backend')
    .setVersion('1.0')
    .addTag('pools')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 5001;

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port}`);
  console.log(`http://localhost:${port}`);
  console.log(
    `Swagger documentation available at http://localhost:${port}/api`,
  );
}
bootstrap();
