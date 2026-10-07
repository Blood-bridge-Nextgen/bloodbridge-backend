import {
  Body,
  Controller,
  Get,
  Patch,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
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
}
