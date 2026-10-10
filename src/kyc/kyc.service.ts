import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import { httpResponse } from "../lib/utils";
import { MailService } from "../mail/mail.service";
import { KycVerification } from "../mongoose/mongoose.schema";

@Injectable()
export class KycService {
  constructor(private readonly mail: MailService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async submitKyc(user: any, documentFile: any) {
    try {
      if (user.profile?.kyc?.status === "verified") {
        throw new BadRequestException("User is already verified");
      }

      if (!documentFile) {
        throw new BadRequestException("Document file is required");
      }

      const documentPath = await this.saveKycFile(
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
    } catch (err: any) {
      throw new InternalServerErrorException(
        err.message || "Failed to submit KYC",
      );
    }
  }

  private async saveKycFile(
    subdir: string,
    userId: string,
    file: any,
    suffix: string,
  ) {
    if (!file?.buffer) return null;

    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `kyc/${subdir}`,
            public_id: `${userId}-${suffix}-${Date.now()}`,
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
              return;
            }

            if (!uploadResult?.secure_url) {
              reject(new Error("Cloudinary upload returned no secure URL"));
              return;
            }

            resolve({ secure_url: uploadResult.secure_url });
          },
        );

        uploadStream.end(file.buffer);
      },
    );

    return result.secure_url;
  }
}
