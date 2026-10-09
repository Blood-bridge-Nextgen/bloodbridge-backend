import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as dotenv from "dotenv";
import { join } from "path";
import { AppModule } from "./app.module";
import { initializeMongooseConnection } from "./mongoose/db";

// import { writeFileSync } from "fs";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await initializeMongooseConnection();

  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads/" });
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(",") || [],
    methods: ["*"],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("BloodBridge API")
    .setDescription(
      "BloodBridge helps verified donors, hospitals, and blood banks respond to critical blood needs quickly, safely, and efficiently. Our direct coordination pipeline reduces delays in medical emergencies.",
    )
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        in: "header",
        name: "Authorization",
      },
      "JWT",
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Write the spec to a file
  // writeFileSync(
  //   join(process.cwd(), "openapi.json"),
  //   JSON.stringify(document, null, 2),
  // );
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
