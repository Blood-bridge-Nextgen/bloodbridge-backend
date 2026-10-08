import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("Health")

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  healthCheck() {
    return this.appService.healthCheck();
  }
}
