import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { type RequestWithUser } from "../lib/types";
import {
  DonationListingSchema,
  type DonationListingSchemaType,
} from "./donation-request.schema";
import { DonationRequestService } from "./donation-request.service";

@ApiTags("Requests")
@UseGuards(AuthGuard, VerificationGuard, StatusGuard("active"))
@Controller("requests")
export class FacilityRequestController {
  constructor(private readonly requestService: DonationRequestService) {}

  @Post("/")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        bloodGroup: {
          type: "string",
          enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        pricePerPint: {
          type: "number",
          example: 1000,
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
        status: {
          type: "string",
          enum: ["open", "closed"],
          example: "open",
        },
      },
    },
  })
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @UseGuards(RoleGuard("facility"))
  async createDonation(
    @Body(new ZodValidationPipe(DonationListingSchema))
    body: DonationListingSchemaType,
    @Req() req: RequestWithUser<{}>,
  ) {
    return await this.requestService.createDonation(body, req.user._id);
  }

  @Get("/")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiQuery({
    name: "page",
    description: "Page number for pagination",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    description: "Number of results to return per page",
    example: 10,
  })
  @ApiOkResponse({
    example: {
      data: [
        {
          _id: "64b8f1e2c9a1f2b3d4e5f6a7",
          bloodGroup: "A+",
          quantity: 2,
          requiredDonors: 5,
          type: "voluntary",
        },
      ],
      meta: {
        currentPage: 1,
        perPage: 10,
        skip: 10,
        lastPage: 4,
        nextPage: 2,
        prevPage: null,
        from: 11,
        to: 20,
      },
    },
  })
  async getRequests(@Req() req: any) {
    return await this.requestService.getFacilityRequests(
      req.user._id,
      req.query,
    );
  }

  @Get("/:requestId")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiParam({
    name: "requestId",
    description: "ID of the donation request",
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        _id: "6ac6128be71c125a07d3b1ba",
        bloodGroup: "A+",
        quantity: 4,
        pricePerPint: 0,
        requiredDonors: 2,
        type: "voluntary",
        facility: "6ac61236e71c125a07d3b1b7",
        createdAt: "2026-10-07T09:36:11.568Z",
        updatedAt: "2026-10-07T09:36:11.568Z",
        __v: 0,
      },
      message: "Request made",
    },
  })
  async getRequestById(@Req() req: any, @Param("requestId") requestId: string) {
    return await this.requestService.getFacilityRequestById(
      requestId,
      req.user._id,
    );
  }

  // @Get("/get-closest-facilities")
  // @ApiQuery({
  //   name: "token",
  //   description: "JWT token for authentication",
  // })
  // @ApiQuery({
  //   name: "page",
  //   description: "Page number for pagination",
  //   example: 1,
  // })
  // @ApiQuery({
  //   name: "limit",
  //   description: "Number of results to return per page",
  //   example: 10,
  // })
  // @ApiOkResponse({})
  // async getFacilitiesClosestToLocation(@Req() req: any) {
  //   return await this.requestService.getFacilitiesClosestToLocation(req.query);
  // }

  @Put("/:requestId")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiParam({
    name: "requestId",
    description: "ID of the donation request",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        bloodGroup: {
          type: "string",
          enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        pricePerPint: {
          type: "number",
          example: 1000,
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
        status: {
          type: "string",
          enum: ["open", "closed"],
          example: "open",
        },
      },
    },
  })
  async updateRequest(
    @Param("requestId") requestId: string,
    @Body(new ZodValidationPipe(DonationListingSchema))
    body: DonationListingSchemaType,
    @Req() req: RequestWithUser<{}>,
  ) {
    return await this.requestService.updateRequest(
      requestId,
      req.user._id,
      body,
    );
  }

  @Patch("/:requestId/close")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  async closeRequest(
    @Param("requestId") requestId: string,
    @Req() req: RequestWithUser<{}>,
  ) {
    return await this.requestService.closeRequest(requestId, req.user._id);
  }
}
