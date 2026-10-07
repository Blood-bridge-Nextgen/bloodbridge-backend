import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { DonorController } from "./donor.controller";
import { DonorService } from "./donor.service";

@Module({
  controllers: [DonorController],
  providers: [DonorService, JwtService],
  imports: [AuthModule],
})
export class DonorModule {}
