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
import {
  UpdateAvailabilitySchema,
  type UpdateAvailabilitySchemaType,
  UpdateDonorSchema,
  type UpdateDonorSchemaType,
} from "./donor.schema";
import { DonorService } from "./donor.service";

@Controller("donor")
@ApiTags("Donor")
@UseGuards(
  AuthGuard,
  VerificationGuard,
  StatusGuard("active"),
  RoleGuard("donor"),
)
export class DonorController {
  constructor(private readonly donorService: DonorService) {}

  @Get("overview")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        pendingSubmissionsCount: 0,
        acceptedSubmissionsCount: 2,
        paidSubmissionsCount: 0,
      },
      message: "Request made",
    },
  })
  async getOverview(@Req() req: any) {
    return await this.donorService.getOverview(req.user);
  }

  @Get("profile")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        _id: "6abf49669ce610e06ce30e54",
        firstName: "Firstname",
        lastName: "Lastname",
        email: "newuser@localhost.com",
        phone: "00000000000",
        address: "123 Main Street",
        role: "donor",
        status: "active",
        donorDetails: {
          _id: "6abf49669ce610e06ce30e55",
          bloodGroup: "A+",
          donationStatus: "available",
        },
      },
      message: "Request made",
    },
  })
  async getProfile(@Req() req: any) {
    return await this.donorService.getDonorDetails(req.user);
  }

  @Put("profile")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        firstName: { type: "string", example: "John" },
        lastName: { type: "string", example: "Doe" },
        otherNames: { type: "string", example: "Smith" },
        email: { type: "string", example: "newuser@localhost.com" },
        phone: { type: "string", example: "00000000000" },
        address: { type: "string", example: "123 Main Street" },
        location: {
          type: "object",
          properties: {
            lat: { type: "number", example: 40.7128 },
            lng: { type: "number", example: -74.006 },
          },
        },
        bloodGroup: { type: "string", example: "A+" },
        status: {
          type: "string",
          example: "available",
          enum: ["available", "unavailable"],
        },
      },
    },
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        _id: "6abf49669ce610e06ce30e54",
        firstName: "Firstname",
        lastName: "Lastname",
        email: "newuser@localhost.com",
        phone: "00000000000",
        address: "123 Main Street",
        role: "donor",
        status: "active",
        donorDetails: {
          _id: "6abf49669ce610e06ce30e55",
          bloodGroup: "A+",
          donationStatus: "available",
        },
      },
      message: "Request made",
    },
  })
  async updateProfile(
    @Req() req: any,
    @Body(new ZodValidationPipe(UpdateDonorSchema)) body: UpdateDonorSchemaType,
  ) {
    return await this.donorService.updateDonorDetails(req.user, body);
  }

  @Patch("availability")
  @ApiTags("Donor Availability - available/unavailable")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          example: "available",
          enum: ["available", "unavailable"],
        },
      },
    },
  })
  async updateAvailability(
    @Req() req: any,
    @Body(new ZodValidationPipe(UpdateAvailabilitySchema))
    body: UpdateAvailabilitySchemaType,
  ) {
    return await this.donorService.updateDonorAvailability(req.user, body);
  }

  @Get("requests/get-closest-facilities")
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
  @ApiQuery({
    name: "lat",
    description: "Latitude of the location to search for facilities",
    example: 10,
  })
  @ApiQuery({
    name: "lng",
    description: "Longitude of the location to search for facilities",
    example: 10,
  })
  @ApiQuery({
    name: "address",
    description: "Address of the location to search for facilities",
    example: "123 Main Street",
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        data: [
          {
            _id: "6ac61236e71c125a07d3b1b7",
            organizationName: "string",
            email: "labane3138@meinvr.com",
            phone: "string",
            address: "string",
            location: {
              lat: 0,
              lng: 0,
            },
            role: "facility",
          },
        ],
        meta: {
          currentPage: "1",
          perPage: 10,
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
  async getFacilitiesClosestToLocation(@Req() req: any) {
    return await this.donorService.getFacilitiesClosestToLocation(req.query);
  }

  @Get("requests")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiQuery({
    name: "page",
    description: "Page number for pagination",
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: "limit",
    description: "Number of results to return per page",
    example: 10,
    required: false,
  })
  @ApiQuery({
    name: "status",
    description: "Status of the requests to filter by",
    example: "open",
    required: false,
    enum: ["open", "closed"],
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        data: [
          {
            _id: "6ac6503a53d954574f151762",
            bloodGroup: "A+",
            status: "closed",
            quantity: 2,
            pricePerPint: 0,
            requiredDonors: 1,
            type: "voluntary",
            facility: {
              _id: "6ac61236e71c125a07d3b1b7",
              organizationName: "string",
              email: "labane3138@meinvr.com",
              phone: "string",
              id: "6ac61236e71c125a07d3b1b7",
            },
            createdAt: "2026-10-07T13:59:22.755Z",
            updatedAt: "2026-10-07T14:02:29.283Z",
            __v: 0,
          },
        ],
        meta: {
          currentPage: "1",
          perPage: 10,
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
  async getRequests(@Req() req: any) {
    return await this.donorService.getRequests(req.query);
  }

  @Post("requests/:requestId/respond")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiParam({
    name: "requestId",
    description: "ID of the request to respond to",
  })
  async respondToRequest(
    @Req() req: any,
    @Param("requestId") requestId: string,
  ) {
    return await this.donorService.respondToRequest(requestId, req.user);
  }

  @Get("donations")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiQuery({
    name: "page",
    description: "Page number for pagination",
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: "limit",
    description: "Number of results to return per page",
    example: 10,
    required: false,
  })
  @ApiQuery({
    name: "status",
    description: "Status of the requests to filter by",
    example: "pending",
    required: false,
    enum: ["pending", "accepted", "paid", "rejected"],
  })
  async getDonations(@Req() req: any) {
    return await this.donorService.getRequestSubmissions(req.user, req.query);
  }
}
