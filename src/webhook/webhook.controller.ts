import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { WebhookService } from "./webhook.service";

@Controller("webhook")
@ApiTags("Webhook")
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post("")
  async handleWebhook(@Body() body: any, @Req() req: any) {
    return this.webhookService.handleWebhook(body, req);
  }
}
