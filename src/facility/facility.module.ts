import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { FacilityController } from "./facility.controller";
import { FacilityService } from "./facility.service";

@Module({
  controllers: [FacilityController],
  providers: [FacilityService, JwtService],
  imports: [AuthModule],
})
export class FacilityModule {}
