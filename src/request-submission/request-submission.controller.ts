import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuthGuard, StatusGuard, VerificationGuard } from "../auth/auth.guard";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import {
  UpdateSubmissionStatusSchema,
  type UpdateSubmissionStatusSchemaType,
} from "./request-submission.schema";
import { RequestSubmissionService } from "./request-submission.service";

@Controller("request-submission")
@ApiTags("Request Submissions / Donations")
@UseGuards(AuthGuard, VerificationGuard, StatusGuard("active"))
export class RequestSubmissionController {
  constructor(private readonly submissionService: RequestSubmissionService) {}

  @Get("/:requestId")
  @ApiQuery({
    name: "token",
    required: true,
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of items per page",
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Status of the request",
    enum: ["pending", "accepted", "paid", "rejected"],
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        data: [
          {
            _id: "6ac736676a9a609dcd9c1ccc",
            request: {
              _id: "6ac6503a53d954574f151762",
              bloodGroup: "A+",
              status: "closed",
              quantity: 2,
              pricePerPint: 0,
              requiredDonors: 1,
              type: "voluntary",
              facility: "6ac61236e71c125a07d3b1b7",
            },
            user: {
              _id: "6abf49669ce610e06ce30e54",
              firstName: "Firstname",
              lastName: "Lastname",
              email: "newuser@localhost.com",
              otherNames: null,
              id: "6abf49669ce610e06ce30e54",
            },
            status: "pending",
            createdAt: "2026-10-08T06:21:27.230Z",
            updatedAt: "2026-10-08T06:21:27.230Z",
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
  getSubmissions(@Param("requestId") requestId: string, @Req() req: any) {
    return this.submissionService.getSubmissions(
      requestId,
      req.user,
      req.query,
    );
  }

  @Get("/submission/:submissionId")
  @ApiQuery({
    name: "token",
    required: true,
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        _id: "6ac736676a9a609dcd9c1ccc",
        request: {
          _id: "6ac6503a53d954574f151762",
          bloodGroup: "A+",
          status: "closed",
          quantity: 2,
          pricePerPint: 0,
          requiredDonors: 1,
          type: "voluntary",
          facility: "6ac61236e71c125a07d3b1b7",
        },
        user: {
          _id: "6abf49669ce610e06ce30e54",
          firstName: "Firstname",
          lastName: "Lastname",
          email: "newuser@localhost.com",
        },
      },
      message: "Request made",
    },
  })
  getSubmissionById(
    @Param("submissionId") submissionId: string,
    @Req() req: any,
  ) {
    return this.submissionService.getSubmissionById(submissionId, req.user);
  }

  @Patch("submission/:submissionId/status")
  @ApiQuery({
    name: "token",
    required: true,
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["pending", "accepted", "rejected"],
        },
      },
    },
  })
  async updateSubmissionStatus(
    @Param("submissionId") submissionId: string,
    @Req() req: any,
    @Body(new ZodValidationPipe(UpdateSubmissionStatusSchema))
    body: UpdateSubmissionStatusSchemaType,
  ) {
    return this.submissionService.updateSubmissionStatus(
      submissionId,
      req.user,
      body,
    );
  }

  @Post("submission/:submissionId/payment")
  @ApiQuery({
    name: "token",
    required: true,
  })
  async makePayment(
    @Param("submissionId") submissionId: string,
    @Req() req: any,
  ) {
    return this.submissionService.makePayment(submissionId, req.user);
  }
}
