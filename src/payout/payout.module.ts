import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { BachsService } from "../bachs/bachs.service";
import { MailService } from "../mail/mail.service";
import { PayoutController } from "./payout.controller";
import { PayoutService } from "./payout.service";

@Module({
  controllers: [PayoutController],
  providers: [PayoutService, JwtService, MailService, BachsService],
  imports: [AuthModule],
})
export class PayoutModule {}
