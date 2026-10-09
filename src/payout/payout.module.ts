import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { MailService } from "../mail/mail.service";
import { PayoutController } from "./payout.controller";
import { PayoutService } from "./payout.service";

@Module({
  controllers: [PayoutController],
  providers: [PayoutService, JwtService, MailService],
  imports: [AuthModule],
})
export class PayoutModule {}
