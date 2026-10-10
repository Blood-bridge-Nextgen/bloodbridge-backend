import {
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuthGuard, StatusGuard, VerificationGuard } from "../auth/auth.guard";
import { KycService } from "./kyc.service";

@Controller("kyc")
@ApiTags("KYC")
@UseGuards(AuthGuard, VerificationGuard, StatusGuard("active"))
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post("submit")
  @ApiQuery({
    name: "token",
    description: "JWT token for authentication",
    required: true,
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["document"],
      properties: {
        document: {
          type: "string",
          format: "binary",
          description:
            "Identity document image (NIN slip or passport page, max 10MB)",
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "document", maxCount: 1 }], {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async submitKyc(
    @Req() req: any,
    @UploadedFiles()
    files: { document?: any },
  ) {
    const user = req.user;
    const documentFile = files.document?.[0];
    return await this.kycService.submitKyc(user, documentFile);
  }
}
