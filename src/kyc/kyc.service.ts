import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { httpResponse } from "../lib/utils";
import { MailService } from "../mail/mail.service";
import { KycVerification } from "../mongoose/mongoose.schema";

@Injectable()
export class KycService {
  constructor(private readonly mail: MailService) {}

  async submitKyc(user: any, documentFile: any) {
    if (user.profile?.kyc?.status === "verified") {
      throw new BadRequestException("User is already verified");
    }

    if (!documentFile) {
      throw new BadRequestException("Document file is required");
    }

    const documentPath = this.saveKycFile(
      "documents",
      user._id,
      documentFile,
      "document",
    );

    if (!documentPath) {
      throw new InternalServerErrorException("Failed to save document file");
    }

    await KycVerification.create({
      user: user._id,
      document: documentPath,
    });

    return httpResponse({
      message: "KYC submitted successfully. Awaiting verification.",
    });
  }

  private saveKycFile(
    subdir: string,
    userId: string,
    file: any,
    suffix: string,
  ): string | null {
    if (!file?.buffer) return null;
    const ext = path.extname(file.originalname) || ".jpg";
    const dir = path.join(process.cwd(), "uploads", "kyc", subdir);
    fs.mkdirSync(dir, { recursive: true });
    const filename = `${userId}-${suffix}-${Date.now()}${ext}`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, file.buffer);
    return `/uploads/kyc/${subdir}/${filename}`;
  }
}
