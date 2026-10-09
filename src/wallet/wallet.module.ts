import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";

@Module({
  controllers: [WalletController],
  providers: [WalletService, JwtService],
  imports: [AuthModule],
})
export class WalletModule {}
