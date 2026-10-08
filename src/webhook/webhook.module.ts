import { Module } from "@nestjs/common";
import { MailService } from "../mail/mail.service";
import { WebhookController } from "./webhook.controller";
import { WebhookService } from "./webhook.service";

@Module({
  controllers: [WebhookController],
  providers: [WebhookService, MailService],
})
export class WebhookModule {}
