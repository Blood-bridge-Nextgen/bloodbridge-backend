import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { DonationRequestModule } from "./donation-request/donation-request.module";
import { THROTTLE_LIMIT, THROTTLE_TTL } from "./lib/constants";
import { MailService } from "./mail/mail.service";
import { FacilityModule } from './facility/facility.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          // Rate limit 15 requests per minute
          ttl: THROTTLE_TTL,
          limit: THROTTLE_LIMIT,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    AuthModule,
    DonationRequestModule,
    FacilityModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}
