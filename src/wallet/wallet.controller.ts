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

  @Get("/transactions")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
    required: true,
  })
  @ApiQuery({
    name: "page",
    description: "Page number for pagination",
    required: false,
  })
  @ApiQuery({
    name: "limit",
    description: "Number of transactions per page for pagination",
    required: false,
  })
  @ApiQuery({
    name: "status",
    description: "Filter transactions by status (pending, completed, failed)",
    required: false,
    enum: ["pending", "completed", "failed"],
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        data: [
          {
            _id: "6ac8d1a58d50f1cec7ee75d0",
            user: "6abf49669ce610e06ce30e54",
            requestSubmission: {
              _id: "6ac8d1848d50f1cec7ee75cf",
              request: {
                _id: "6ac8d1468d50f1cec7ee75ce",
                quantity: 1,
                pricePerPint: 2000,
              },
            },
            reference: "mv0w3bs9-gxqsa8",
            amount: 2000,
            currency: "NGN",
            type: "credit",
            status: "pending",
            description:
              "Payment for request submission for facility Organization Name",
            createdAt: "2026-10-09T11:36:05.482Z",
            updatedAt: "2026-10-09T11:36:05.482Z",
            __v: 0,
          },
          {
            _id: "6ac7c7a50d474ad1e7137655",
            user: "6abf49669ce610e06ce30e54",
            requestSubmission: {
              _id: "6ac736676a9a609dcd9c1ccc",
              request: {
                _id: "6ac6503a53d954574f151762",
                quantity: 2,
                pricePerPint: 1000,
              },
            },
            reference: "muzrjsyv-twau9h",
            amount: 2000,
            currency: "NGN",
            type: "credit",
            status: "completed",
            description: "Payment for request submission for facility string",
            createdAt: "2026-10-08T16:41:10.003Z",
            updatedAt: "2026-10-08T16:41:50.830Z",
            __v: 0,
          },
        ],
        meta: {
          currentPage: 1,
          perPage: 12,
          skip: 0,
          lastPage: 1,
          nextPage: null,
          prevPage: null,
          from: 1,
          to: 2,
        },
      },
      message: "Request made",
    },
  })
  async getTransactions(@Req() req: any) {
    return await this.walletService.getTransactions(req.user, req.query);
  }
}
