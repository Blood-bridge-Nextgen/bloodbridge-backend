import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BachsService } from "../bachs/bachs.service";
import { httpResponse, paginatedData } from "../lib/utils";
import { MailService } from "../mail/mail.service";
import {
  DonationRequest,
  RequestSubmission,
  Transaction,
} from "../mongoose/mongoose.schema";
import { type UpdateSubmissionStatusSchemaType } from "./request-submission.schema";

@Injectable()
export class RequestSubmissionService {
  constructor(
    private readonly mail: MailService,
    private readonly bachs: BachsService,
  ) {}

  async getSubmissions(requestId: string, user: any, query: any) {
    const request = await DonationRequest.findOne({
      _id: requestId,
      facility: user._id,
    });

    if (!request) {
      throw new ForbiddenException(
        "Request not found or you are not authorized to view submissions for this request",
      );
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = query.status || null;

    const submissions = await RequestSubmission.find({
      request: requestId,
      ...(status && { status }),
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select: {
          firstName: 1,
          lastName: 1,
          email: 1,
          otherNames: 1,
        },
      })
      .populate({
        path: "request",
        select: {
          bloodGroup: 1,
          status: 1,
          quantity: 1,
          pricePerPint: 1,
          requiredDonors: 1,
          type: 1,
          facility: 1,
        },
      });
    const totalSubmissions = await RequestSubmission.countDocuments({
      request: requestId,
      ...(status && { status }),
    });
    const pagination = paginatedData(query, totalSubmissions);

    return httpResponse({
      data: {
        data: submissions,
        meta: pagination,
      },
    });
  }

  async getSubmissionById(submissionId: string, user: any) {
    const submission = (await RequestSubmission.findOne({
      _id: submissionId,
    })
      .populate({
        path: "user",
        select: {
          firstName: 1,
          lastName: 1,
          email: 1,
          otherNames: 1,
        },
      })
      .populate({
        path: "request",
        select: {
          bloodGroup: 1,
          status: 1,
          quantity: 1,
          pricePerPint: 1,
          requiredDonors: 1,
          type: 1,
          facility: 1,
        },
      })) as any;
    if (
      !submission ||
      submission.request?.facility?.toString() !== user._id.toString()
    ) {
      throw new NotFoundException("Submission not found");
    }
    return submission;
  }

  async updateSubmissionStatus(
    submissionId: string,
    user: any,
    body: UpdateSubmissionStatusSchemaType,
  ) {
    const submission = (await RequestSubmission.findOne({
      _id: submissionId,
    })
      .populate({
        path: "request",
        select: {
          status: 1,
          bloodGroup: 1,
          quantity: 1,
          pricePerPint: 1,
          facility: 1,
        },
        populate: {
          path: "facility",
          select: {
            organizationName: 1,
          },
        },
      })
      .populate({
        path: "user",
        select: {
          firstName: 1,
          email: 1,
        },
      })) as any;

    if (
      !submission ||
      submission.request?.facility.id !== user._id.toString()
    ) {
      throw new NotFoundException("Submission not found");
    }

    if (submission.status === "paid") {
      return httpResponse({
        message: "Cannot update status of a paid submission",
      });
    }

    if (body.status === "accepted" && submission.request.status !== "open") {
      throw new ForbiddenException(
        "Cannot accept submission for a closed request",
      );
    }

    submission.status = body.status;
    await submission.save();

    await this.mail.sendSubmissionAcceptedEmail({
      firstName: submission.user.firstName,
      status: submission.status,
      email: submission.user.email,
      createdAt: submission.createdAt,
      request: {
        bloodGroup: submission.request.bloodGroup,
        quantity: submission.request.quantity,
        pricePerPint: submission.request.pricePerPint,
        facility: {
          organizationName: submission.request.facility.organizationName,
        },
      },
    });

    return httpResponse({
      data: submission,
      message: "Submission status updated",
    });
  }

  async makePayment(submissionId: string, user: any) {
    const submission = (await RequestSubmission.findOne({
      _id: submissionId,
    })
      .populate({
        path: "request",
        select: {
          facility: 1,
          status: 1,
          quantity: 1,
          pricePerPint: 1,
        },
        populate: {
          path: "facility",
          select: {
            organizationName: 1,
          },
        },
      })
      .populate({
        path: "user",
        select: {
          firstName: 1,
          email: 1,
        },
      })) as any;

    if (
      !submission ||
      submission.request?.facility.id !== user._id.toString()
    ) {
      throw new NotFoundException("Submission not found");
    }

    if (submission.status !== "accepted") {
      throw new ForbiddenException(
        "Cannot pay for a submission that is not accepted",
      );
    }
    const totalAmount =
      submission.request.quantity * submission.request.pricePerPint;
    const transaction = await Transaction.create({
      user: submission.user._id,
      amount: totalAmount,
      currency: "NGN",
      type: "credit",
      description: `Payment for request submission for facility ${submission.request.facility.organizationName}`,
      reference: this.generateReference(),
      requestSubmission: submission._id,
    });

    const data = await this.bachs.createPaymentLink(transaction);
    return httpResponse({
      data: {
        checkoutUrl: data,
      },
    });
  }

  private generateReference(): string {
    const timestamp = Date.now().toString(36);
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomString}`;
  }
}
