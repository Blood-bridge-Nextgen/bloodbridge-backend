import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import crypto from "crypto";
import * as dotenv from "dotenv";
import { httpResponse } from "../lib/utils";
import { MailService } from "../mail/mail.service";
import {
  RequestSubmission,
  Transaction,
  Wallet,
} from "../mongoose/mongoose.schema";

dotenv.config();

@Injectable()
export class WebhookService {
  constructor(private readonly mail: MailService) {}

  async handleWebhook(body: any, req: any) {
    const webhookSecret = process.env.BACHS_WEBHOOK_SECRET || "";

    if (!webhookSecret) {
      throw new InternalServerErrorException(
        "Webhook secret is not defined in environment variables.",
      );
    }

    const rawBody = JSON.stringify(body);
    const timestampHeader = req.headers["x-bachs-timestamp"];
    const signatureHeader = req.headers["x-bachs-signature"];

    const isValidSignature = this.verifyBachsSignature(
      rawBody,
      webhookSecret,
      timestampHeader,
      signatureHeader,
    );

    if (!isValidSignature) {
      throw new BadRequestException("Invalid signature");
    }

    if (body.type !== "checkout.completed") {
      throw new BadRequestException("Invalid event type");
    }

    const transactionId = body.data.metadata?.transactionId;

    const transaction = await Transaction.findById(transactionId)
      .populate({
        path: "requestSubmission",
        select: {
          _id: 1,
          request: 1,
          populate: {
            path: "request",
          },
        },
      })
      .populate({
        path: "user",
        select: {
          _id: 1,
          firstName: 1,
          email: 1,
        },
      });

    if (!transaction) {
      throw new BadRequestException("Transaction not found");
    }

    if (transaction.status === "completed") {
      return httpResponse({
        message: "Transaction already completed",
      });
    }

    const wallet = await Wallet.findOne({ user: transaction.user });
    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    const hasCompletedPayment =
      body.data.status === "completed" &&
      parseFloat(body.data.amount) === transaction.amount;
    if (hasCompletedPayment) {
      transaction.status = "completed";
      await transaction.save();

      wallet.balance += transaction.amount;
      await wallet.save();

      const requestSubmission = await RequestSubmission.findById(
        transaction?.requestSubmission?._id,
      );
      if (requestSubmission) {
        requestSubmission.status = "paid";
        await requestSubmission.save();
      }

      await this.mail.sendTransactionCompletedEmail(transaction, wallet);
    }

    return httpResponse({
      message: "Webhook processed successfully",
    });
  }

  verifyBachsSignature(
    rawBody: string,
    secret: string,
    timestampHeader: string,
    signatureHeader: string,
    toleranceSeconds = 300,
  ) {
    const timestamp = parseInt(timestampHeader, 10);
    if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) {
      return false;
    }

    const message = `${timestamp}.${rawBody}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(message, "utf8")
      .digest("hex");

    return expected === signatureHeader;
  }
}
