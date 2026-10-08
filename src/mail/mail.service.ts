import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as handlebars from "handlebars";
import * as nodemailer from "nodemailer";
import * as path from "path";
import { currencyFormatter } from "../lib/utils";

dotenv.config();
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendTransactionCompletedEmail(transaction: any, wallet: any) {
    const template = this.getTemplatePath("./transaction/completed");
    const html = template({
      firstName: transaction.user.firstName,
      amount: currencyFormatter(transaction.amount, "NGN"),
      reference: transaction.reference,
      status: transaction.status,
      createdAt: transaction.createdAt.toLocaleString(),
      walletBalance: currencyFormatter(wallet.balance, "NGN"),
    });
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: transaction.user.email,
      subject: "Transaction Completed",
      html,
    });
  }

  async sendOtp(otp: any) {
    const otpData = {
      code: otp.code,
      type: otp.type,
      user: {
        email: otp.user.email,
        firstName: otp.user.firstName,
      },
    };
    const template = this.getTemplatePath("./auth/otp");
    const html = template({
      otp: otpData,
    });
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: otp.user.email,
      subject: `Your OTP is ${otp.code}`,
      html,
    });
  }

  async sendSubmissionAcceptedEmail(data: {
    firstName: string;
    email: string;
    createdAt: Date;
    status: "accepted" | "rejected" | "pending";
    request: {
      bloodGroup: string;
      quantity: number;
      pricePerPint: number;
      facility: {
        organizationName: string;
      };
    };
  }) {
    const template = this.getTemplatePath("./submission/status-update");
    const html = template({
      firstName: data.firstName,
      createdAt: data.createdAt.toLocaleString(),
      status: data.status,
      request: {
        bloodGroup: data.request.bloodGroup,
        quantity: data.request.quantity,
        pricePerPint: currencyFormatter(data.request.pricePerPint, "NGN"),
        facility: {
          organizationName: data.request.facility.organizationName,
        },
      },
    });
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: data.email,
      subject: "Request Submission Accepted",
      html,
    });
  }

  private getTemplatePath(
    templateName: string,
  ): HandlebarsTemplateDelegate<any> {
    const templatePath = path.join(
      process.cwd(),
      "templates",
      `${templateName}.hbs`,
    );
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }
    handlebars.registerHelper("eq", function (a, b) {
      return a === b;
    });
    return handlebars.compile(fs.readFileSync(templatePath, "utf-8"));
  }
}
