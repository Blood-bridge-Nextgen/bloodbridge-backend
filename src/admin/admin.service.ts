import { Injectable, NotFoundException } from "@nestjs/common";
import { httpResponse, paginatedData } from "../lib/utils";
import { MailService } from "../mail/mail.service";
import { KycVerification } from "../mongoose/mongoose.schema";
import { UpdateKycVerificationSchemaType } from "./admin.schema";

@Injectable()
export class AdminService {
  constructor(private readonly mail: MailService) {}

  async getKycVerification(kycId: string) {
    const item = await KycVerification.findById(kycId).populate({
      path: "user",
      select: {
        organizationName: 1,
        email: 1,
        address: 1,
        phone: 1,
      },
      populate: {
        path: "facilityDetails",
        select: {
          _id: 1,
          registrationNumber: 1,
        },
      },
    });

    if (!item) {
      throw new NotFoundException("KYC verification not found");
    }
    return httpResponse({
      data: item,
    });
  }

  async getKycVerifications(query: any) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const status = query.status;

    const items = await KycVerification.find(status ? { status } : {})
      .populate({
        path: "user",
        select: {
          organizationName: 1,
          email: 1,
          address: 1,
          phone: 1,
        },
        populate: {
          path: "facilityDetails",
          select: {
            _id: 1,
            registrationNumber: 1,
          },
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await KycVerification.countDocuments(
      status ? { status } : {},
    );
    const pagination = paginatedData(query, totalItems);

    return httpResponse({
      data: {
        data: items,
        meta: pagination,
      },
    });
  }

  async updateKycVerificationStatus(
    kycId: string,
    body: UpdateKycVerificationSchemaType,
  ) {
    const item = await KycVerification.findByIdAndUpdate(
      kycId,
      {
        status: body.status,
        ...(body.status === "verified"
          ? {}
          : {
              document: null,
            }),
      },
      { new: true },
    ).populate({
      path: "user",
      select: {
        organizationName: 1,
        email: 1,
        address: 1,
        phone: 1,
      },
      populate: {
        path: "facilityDetails",
        select: {
          _id: 1,
          registrationNumber: 1,
        },
      },
    });

    if (!item) {
      throw new NotFoundException("KYC verification not found");
    }

    await this.mail.sendKycUpdateEmail(item, body.rejectionReason);

    return httpResponse({
      data: item,
    });
  }
}
