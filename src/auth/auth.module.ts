import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  providers: [AuthService, JwtService, MailService],
  controllers: [AuthController],
})
export class AuthModule {}
