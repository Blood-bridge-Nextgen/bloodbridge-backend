import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { MailService } from "../mail/mail.service";
import { KycController } from "./kyc.controller";
import { KycService } from "./kyc.service";

@Module({
  controllers: [KycController],
  providers: [KycService, JwtService, MailService],
  imports: [AuthModule],
})
export class KycModule {}
