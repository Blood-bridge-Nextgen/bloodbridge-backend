import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import {
  AuthGuard,
  RoleGuard,
  StatusGuard,
  VerificationGuard,
} from "../auth/auth.guard";
import { WalletService } from "./wallet.service";

@Controller("/donor/wallet")
@ApiTags("Donor Wallet")
@UseGuards(
  AuthGuard,
  VerificationGuard,
  StatusGuard("active"),
  RoleGuard("donor"),
)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get("/balance")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
    required: true,
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        balance: 4000,
      },
      message: "Request made",
    },
  })
  async getWalletBalance(@Req() req: any) {
    return await this.walletService.getWalletBalance(req.user);
  }
}
