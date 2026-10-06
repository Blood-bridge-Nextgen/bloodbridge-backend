import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { AuthGuard } from "./auth.guard";
import {
  DonorSignUpSchema,
  type DonorSignUpSchemaType,
  FacilitySignUpSchema,
  type FacilitySignUpSchemaType,
  ResetPasswordSchema,
  type ResetPasswordSchemaType,
  SendPasswordResetSchema,
  type SendPasswordResetSchemaType,
  SignInSchema,
  type SignInSchemaType,
  VerifyEmailSchema,
  type VerifyEmailSchemaType,
} from "./auth.schema";
import { AuthService } from "./auth.service";

// 1 minute
const THROTTLE_IN_SECONDS = 60000;

@Controller("auth")
@ApiTags("Authentication")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("donor/sign-up")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        firstName: { type: "string", example: "Firstname" },
        lastName: { type: "string", example: "Lastname" },
        otherNames: { type: "string", example: "Other names" },
        email: {
          type: "string",
          format: "email",
          example: "newuser@localhost.com",
        },
        phone: { type: "string", example: "00000000000" },
        address: { type: "string", example: "123 Main Street" },
        dob: { type: "string", format: "date" },
        password: { type: "string", format: "password", example: "password" },
        confirmPassword: {
          type: "string",
          format: "password",
          example: "password",
        },
        bloodGroup: {
          type: "string",
          enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        status: {
          type: "string",
          enum: ["available", "unavailable"],
        },
      },
    },
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWJlODk4MjA3NTU5YzM4MzI5MjQ3NmUiLCJyb2xlIjoiZG9ub3IiLCJpYXQiOjE3OTA4NzE5MzgsImV4cCI6MTc5MTQ3NjczOH0.Ncua8HEfLrkeFeqFFQFLBD5UQrZk-7LROCi0S6RjEcY",
        profile: {
          _id: "6abe898207559c383292476e",
          email: "newuser@localhost.com",
          phone: "00000000000",
          firstName: "Firstname",
          lastName: "Lastname",
          dob: "2026-10-01T00:00:00.000Z",
          address: "123 Main Street",
          role: "donor",
          displayName: "Firstname Lastname ",
          status: "active",
          kyc: [],
        },
      },
      message: "User created successfully",
    },
  })
  async donorSignUp(
    @Body(new ZodValidationPipe(DonorSignUpSchema))
    body: DonorSignUpSchemaType,
  ) {
    return await this.authService.donorSignUp(body);
  }

  @Post("facility/sign-up")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        organizationName: { type: "string", example: "Organization Name" },
        registrationNumber: { type: "string", example: "Registration Number" },
        email: {
          type: "string",
          format: "email",
          example: "newuser@localhost.com",
        },
        phone: { type: "string", example: "00000000000" },
        address: { type: "string", example: "123 Main Street" },
        password: { type: "string", format: "password", example: "password" },
        confirmPassword: {
          type: "string",
          format: "password",
          example: "password",
        },
      },
    },
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWJlODk4MjA3NTU5YzM4MzI5MjQ3NmUiLCJyb2xlIjoiZG9ub3IiLCJpYXQiOjE3OTA4NzE5MzgsImV4cCI6MTc5MTQ3NjczOH0.Ncua8HEfLrkeFeqFFQFLBD5UQrZk-7LROCi0S6RjEcY",
        profile: {
          _id: "6abe898207559c383292476e",
          email: "newuser@localhost.com",
          organizationName: "Organization Name",
          address: "123 Main Street",
          role: "facility",
          displayName: "Organization Name",
          status: "active",
          kyc: [],
        },
      },
      message: "User created successfully",
    },
  })
  async facilitySignUp(
    @Body(new ZodValidationPipe(FacilitySignUpSchema))
    body: FacilitySignUpSchemaType,
  ) {
    return await this.authService.facilitySignUp(body);
  }

  @Post("sign-in")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          format: "email",
          example: "newuser@localhost.com",
        },
        password: { type: "string", format: "password", example: "password" },
      },
    },
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWJlODk4MjA3NTU5YzM4MzI5MjQ3NmUiLCJyb2xlIjoiZG9ub3IiLCJpYXQiOjE3OTA4NzE5MzgsImV4cCI6MTc5MTQ3NjczOH0.Ncua8HEfLrkeFeqFFQFLBD5UQrZk-7LROCi0S6RjEcY",
        profile: {
          _id: "6abe898207559c383292476e",
          email: "newuser@localhost.com",
          phone: "00000000000",
          firstName: "Firstname",
          lastName: "Lastname",
          dob: "2026-10-01T00:00:00.000Z",
          address: "123 Main Street",
          role: "donor",
          displayName: "Firstname Lastname ",
          status: "active",
          kyc: [],
        },
      },
      message: "User created successfully",
    },
  })
  async signIn(
    @Body(new ZodValidationPipe(SignInSchema))
    body: SignInSchemaType,
  ) {
    return await this.authService.signIn(body);
  }

  @Post("send-password-reset")
  @ApiBody({
    schema: {
      type: "object",
      required: ["email"],
      properties: {
        email: {
          type: "string",
          format: "email",
          example: "newuser@localhost.com",
        },
      },
    },
  })
  async sendPasswordReset(
    @Body(new ZodValidationPipe(SendPasswordResetSchema))
    body: SendPasswordResetSchemaType,
  ) {
    return await this.authService.sendPasswordReset(body);
  }

  @Post("reset-password")
  @ApiBody({
    schema: {
      type: "object",
      required: ["email", "code", "password", "confirmPassword"],
      properties: {
        email: {
          type: "string",
          format: "email",
          example: "newuser@localhost.com",
        },
        code: {
          type: "string",
          example: "00000",
        },
        password: {
          type: "string",
          format: "password",
          example: "password",
        },
        confirmPassword: {
          type: "string",
          format: "password",
          example: "password",
        },
      },
    },
  })
  async resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordSchema))
    body: ResetPasswordSchemaType,
  ) {
    return await this.authService.resetPassword(body);
  }

  @UseGuards(AuthGuard)
  @Get("user")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiOkResponse({
    example: {
      code: 200,
      data: {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWJlODk4MjA3NTU5YzM4MzI5MjQ3NmUiLCJyb2xlIjoiZG9ub3IiLCJpYXQiOjE3OTA4NzE5MzgsImV4cCI6MTc5MTQ3NjczOH0.Ncua8HEfLrkeFeqFFQFLBD5UQrZk-7LROCi0S6RjEcY",
        profile: {
          _id: "6abe898207559c383292476e",
          email: "newuser@localhost.com",
          phone: "00000000000",
          firstName: "Firstname",
          lastName: "Lastname",
          dob: "2026-10-01T00:00:00.000Z",
          address: "123 Main Street",
          role: "donor",
          displayName: "Firstname Lastname ",
          status: "active",
          kyc: [],
        },
      },
      message: "User created successfully",
    },
  })
  async getUser(@Req() req: any) {
    return await this.authService.getUser(req.user);
  }

  @UseGuards(AuthGuard)
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @Throttle({ default: { limit: 1, ttl: THROTTLE_IN_SECONDS } })
  @Post("resend-email-verification")
  async resendEmailVerification(@Req() req: any) {
    return await this.authService.resendEmailVerification(req.user._id);
  }

  @UseGuards(AuthGuard)
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
  })
  @ApiBody({
    schema: {
      type: "object",
      required: ["code"],
      properties: {
        code: { type: "string" },
      },
    },
  })
  @Post("verify-email")
  async verifyEmail(
    @Req() req: any,
    @Body(new ZodValidationPipe(VerifyEmailSchema)) body: VerifyEmailSchemaType,
  ) {
    return await this.authService.verifyEmail(req.user._id, body);
  }
}
