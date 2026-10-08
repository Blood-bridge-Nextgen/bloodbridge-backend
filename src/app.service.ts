import { Body, Get, Injectable, Post } from "@nestjs/common";
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

  async webhookTest(body: any) {
    console.log("Webhook Test Received:", body);

    return httpResponse({
      message: "Webhook Test Received",
      data: body,
    });
  }
}
