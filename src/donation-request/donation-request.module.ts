import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { MailService } from "../mail/mail.service";
import { DonationRequestService } from "./donation-request.service";
import { FacilityRequestController } from "./facility-request.controller";

@Module({
  controllers: [FacilityRequestController],
  providers: [DonationRequestService, MailService, JwtService],
  imports: [AuthModule],
})
export class DonationRequestModule {}
