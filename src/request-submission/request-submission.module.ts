import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { BachsService } from "../bachs/bachs.service";
import { MailService } from "../mail/mail.service";
import { RequestSubmissionController } from "./request-submission.controller";
import { RequestSubmissionService } from "./request-submission.service";

@Module({
  controllers: [RequestSubmissionController],
  providers: [RequestSubmissionService, JwtService, MailService, BachsService],
  imports: [AuthModule],
})
export class RequestSubmissionModule {}
