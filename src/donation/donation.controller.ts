import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import {
  AuthGuard,
  RoleGuard,
  StatusGuard,
  VerificationGuard,
} from "../auth/auth.guard";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { type RequestWithUser } from "../lib/types";
import {
  DonationListingSchema,
  type DonationListingSchemaType,
} from "./donation.schema";
import { DonationService } from "./donation.service";

@ApiTags("Donation")
@UseGuards(AuthGuard, VerificationGuard, StatusGuard("active"))
@Controller("donation")
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  @Post("/")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        bloodGroup: {
          type: "string",
          enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        quantity: {
          type: "number",
        },
        requiredDonors: {
          type: "number",
        },
        type: {
          type: "string",
          enum: ["voluntary", "paid"],
        },
      },
    },
  })
  @UseGuards(RoleGuard("facility"))
  async createDonation(
    @Body(new ZodValidationPipe(DonationListingSchema))
    body: DonationListingSchemaType,
    @Req() req: RequestWithUser<{}>,
  ) {
    return await this.donationService.createDonation(body, req.user._id);
  }
}
