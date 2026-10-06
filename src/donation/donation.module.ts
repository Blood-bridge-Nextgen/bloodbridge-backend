import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { MailService } from "../mail/mail.service";
import { DonationController } from "./donation.controller";
import { DonationService } from "./donation.service";

@Module({
  controllers: [DonationController],
  providers: [DonationService, MailService, JwtService],
  imports: [AuthModule],
})
export class DonationModule {}
