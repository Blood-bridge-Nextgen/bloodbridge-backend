import { NestFactory } from "@nestjs/core";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { AppModule } from "./app.module";

dotenv.config();

async function initializeMongooseConnection() {
  const uri = process.env.MONGO_DB_URI;

  if (!uri) {
    throw new Error("Cannot connect to MongoDB");
  }

  await mongoose.connect(uri);

  console.log(`Connected to MongoDB database`);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await initializeMongooseConnection();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
