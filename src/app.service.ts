import { Injectable } from "@nestjs/common";
import { httpResponse } from "./lib/utils";
import { initializeMongooseConnection } from "./mongoose/db";

@Injectable()
export class AppService {
  async healthCheck() {
    await initializeMongooseConnection();

    return httpResponse({
      message: "BloodBridge API is healthy and running.",
    });
  }
}
