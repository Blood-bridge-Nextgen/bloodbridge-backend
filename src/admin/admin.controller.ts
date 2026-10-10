import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
  UpdateKycVerificationSchema,
  type UpdateKycVerificationSchemaType,
} from "./admin.schema";
import { AdminService } from "./admin.service";

@Controller("admin")
@ApiTags("Admin")
@UseGuards(
  AuthGuard,
  VerificationGuard,
  StatusGuard("active"),
  RoleGuard("admin"),
)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("kyc")
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
    description: "Number of items per page",
    required: false,
  })
  @ApiQuery({
    name: "status",
    description: "Status of the KYC verification",
    enum: ["pending", "verified", "rejected"],
    required: false,
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        data: [
          {
            _id: "6ac9c40b9bcc91e187fdee03",
            status: "pending",
            document:
              "/uploads/kyc/documents/6ac929e8fb4244c84bdacd93-document-1791607819761.jpg",
            user: {
              _id: "6ac929e8fb4244c84bdacd93",
              organizationName: "New facility",
              email: "mfnischris@gmail.com",
              phone: "0000000000",
              address: "Address",
              facilityDetails: {
                _id: "6ac929e8fb4244c84bdacd95",
                registrationNumber: "29372321321",
                user: "6ac929e8fb4244c84bdacd93",
              },
              id: "6ac929e8fb4244c84bdacd93",
            },
            createdAt: "2026-10-10T04:50:19.765Z",
            updatedAt: "2026-10-10T04:50:19.765Z",
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
          to: 1,
        },
      },
      message: "Request made",
    },
  })
  async getKycVerifications(@Req() req: any) {
    return this.adminService.getKycVerifications(req.query);
  }

  @Get("kyc/:id")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
    required: true,
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        _id: "6ac9c40b9bcc91e187fdee03",
        status: "pending",
        document:
          "/uploads/kyc/documents/6ac929e8fb4244c84bdacd93-document-1791607819761.jpg",
        user: {
          _id: "6ac929e8fb4244c84bdacd93",
          organizationName: "New facility",
          email: "mfnischris@gmail.com",
          phone: "0000000000",
          address: "Address",
          facilityDetails: {
            _id: "6ac929e8fb4244c84bdacd95",
            registrationNumber: "29372321321",
            user: "6ac929e8fb4244c84bdacd93",
          },
          id: "6ac929e8fb4244c84bdacd93",
        },
        createdAt: "2026-10-10T04:50:19.765Z",
        updatedAt: "2026-10-10T04:50:19.765Z",
        __v: 0,
      },
      message: "Request made",
    },
  })
  async getKycVerification(@Param("id") kycId: string) {
    return this.adminService.getKycVerification(kycId);
  }

  @Patch("kyc/:id")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
    required: true,
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["pending", "verified", "rejected"],
          description: "The new status of the KYC verification",
        },
        rejectionReason: {
          type: "string",
          description: "The reason for rejection (if status is rejected)",
        },
      },
      required: ["status"],
    },
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        _id: "6ac9c40b9bcc91e187fdee03",
        status: "pending",
        document:
          "/uploads/kyc/documents/6ac929e8fb4244c84bdacd93-document-1791607819761.jpg",
        user: {
          _id: "6ac929e8fb4244c84bdacd93",
          organizationName: "New facility",
          email: "mfnischris@gmail.com",
          phone: "0000000000",
          address: "Address",
          facilityDetails: {
            _id: "6ac929e8fb4244c84bdacd95",
            registrationNumber: "29372321321",
            user: "6ac929e8fb4244c84bdacd93",
          },
          id: "6ac929e8fb4244c84bdacd93",
        },
        createdAt: "2026-10-10T04:50:19.765Z",
        updatedAt: "2026-10-10T04:50:19.765Z",
        __v: 0,
      },
      message: "Request made",
    },
  })
  async updateKycVerificationStatus(
    @Param("id") kycId: string,
    @Body(new ZodValidationPipe(UpdateKycVerificationSchema))
    body: UpdateKycVerificationSchemaType,
  ) {
    return this.adminService.updateKycVerificationStatus(kycId, body);
  }
}
