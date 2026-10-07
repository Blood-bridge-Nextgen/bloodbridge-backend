import { Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import {
  AuthGuard,
  RoleGuard,
  StatusGuard,
  VerificationGuard,
} from "../auth/auth.guard";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import {
  UpdateFacilitySchema,
  type UpdateFacilitySchemaType,
} from "./facility.schema";
import { FacilityService } from "./facility.service";

@Controller("facility")
@ApiTags("Facility")
@UseGuards(
  AuthGuard,
  VerificationGuard,
  StatusGuard("active"),
  RoleGuard("facility"),
)
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) {}

  @Get("")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        _id: "6ac61236e71c125a07d3b1b7",
        organizationName: "Organization Name",
        email: "labane3138@meinvr.com",
        phone: "00000000000",
        address: "123 Main Street",
        role: "facility",
        status: "active",
        facilityDetails: {
          _id: "6ac61236e71c125a07d3b1b8",
          registrationNumber: "Registration Number",
          user: "6ac61236e71c125a07d3b1b7",
        },
      },
      message: "Request made",
    },
  })
  async getFacilityDetails(@Req() req: any) {
    return this.facilityService.getFacilityDetails(req.user);
  }

  @Put("")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiBody({
    schema: {
      type: "object",
      required: [
        "organizationName",
        "email",
        "phone",
        "address",
        "location",
        "registrationNumber",
      ],
      properties: {
        organizationName: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        address: { type: "string" },
        location: {
          type: "object",
          properties: {
            lat: { type: "number" },
            lng: { type: "number" },
          },
        },
        registrationNumber: { type: "string" },
      },
    },
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
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
        status: "active",
      },
      message: "Facility details updated successfully",
    },
  })
  async updateFacilityDetails(
    @Req() req: any,
    @Body(new ZodValidationPipe(UpdateFacilitySchema))
    body: UpdateFacilitySchemaType,
  ) {
    return await this.facilityService.updateDetails(req.user, body);
  }
}
