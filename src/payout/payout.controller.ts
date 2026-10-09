import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import {
  AuthGuard,
  RoleGuard,
  StatusGuard,
  VerificationGuard,
} from "../auth/auth.guard";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import {
  AccountDetailsSchema,
  type AccountDetailsSchemaType,
  PayoutSchema,
  type PayoutSchemaType,
  ResolveAccountSchema,
  type ResolveAccountSchemaType,
} from "./payout.schema";
import { PayoutService } from "./payout.service";

@Controller("/donor/payouts")
@ApiTags("Donor Payout")
@UseGuards(
  AuthGuard,
  VerificationGuard,
  StatusGuard("active"),
  RoleGuard("donor"),
)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get("/banks")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
    required: true,
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: [
        {
          name: "Access Bank",
          code: "044",
        },
      ],
      message: "Request made",
    },
  })
  async listBanks() {
    return await this.payoutService.listBanks();
  }

  @Post("/resolve-account")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
    required: true,
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        accountNumber: { type: "string" },
        bankCode: { type: "string" },
      },
      required: ["accountNumber", "bankCode"],
    },
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        accountName: "Name",
        accountNumber: "1234567890",
      },
      message: "Request made",
    },
  })
  async resolveAccount(
    @Body(new ZodValidationPipe(ResolveAccountSchema))
    body: ResolveAccountSchemaType,
  ) {
    return await this.payoutService.resolveAccount(body);
  }

  @Post("")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
    required: true,
  })
  @ApiBody({
    description: "Payout request body",
    schema: {
      type: "object",
      properties: {
        amount: { type: "number" },
      },
      required: ["amount"],
    },
  })
  async submitPayout(
    @Body(new ZodValidationPipe(PayoutSchema))
    body: PayoutSchemaType,
    @Req() req: any,
  ) {
    return await this.payoutService.submitPayout(req.user, body);
  }

  @Get("")
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
    description: "Number of items per page for pagination",
    required: false,
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        data: [
          {
            _id: "6ac8809db33a29dfb874e789",
            amount: "₦2,000.00",
            status: "pending",
            createdAt: "09/10/2026, 06:50:21",
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
          to: 1,
        },
      },
      message: "Request made",
    },
  })
  async getPayouts(@Req() req: any) {
    return await this.payoutService.getDonorPayouts(req.user, req.query);
  }

  @Put("/account-details")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
    required: true,
  })
  @ApiBody({
    description: "Account details to update",
    schema: {
      type: "object",
      properties: {
        accountName: { type: "string" },
        accountNumber: { type: "string" },
        bankName: { type: "string" },
      },
      required: ["accountName", "accountNumber", "bankName"],
    },
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        accountName: "string",
        accountNumber: "string",
        bankName: "string",
        bankCode: "string",
      },
      message: "Request made",
    },
  })
  async updateAccountDetails(
    @Body(new ZodValidationPipe(AccountDetailsSchema))
    body: AccountDetailsSchemaType,
    @Req() req: any,
  ) {
    return await this.payoutService.updateAccountDetails(body, req.user);
  }

  @Get("/account-details")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
    required: true,
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        accountName: "string",
        accountNumber: "string",
        bankName: "string",
        bankCode: "string",
      },
      message: "Request made",
    },
  })
  async getAccountDetails(@Req() req: any) {
    return await this.payoutService.getAccountDetails(req.user);
  }

  @Get("/:payoutId")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
    required: true,
  })
  @ApiParam({
    name: "payoutId",
    description: "ID of the payout to retrieve",
    required: true,
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        _id: "6ac8809db33a29dfb874e789",
        user: {
          _id: "6abf49669ce610e06ce30e54",
          firstName: "Firstname",
          lastName: "Lastname",
          email: "yoyefok201@meinvr.com",
          phone: "00000000000",
          id: "6abf49669ce610e06ce30e54",
        },
        amount: 2000,
        status: "pending",
        createdAt: "2026-10-09T05:50:21.526Z",
      },
      message: "Request made",
    },
  })
  async getPayout(@Req() req: any, @Param("payoutId") payoutId: string) {
    return await this.payoutService.getPayout(payoutId, req.user);
  }
}
