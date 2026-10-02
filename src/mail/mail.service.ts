import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as handlebars from "handlebars";
import * as nodemailer from "nodemailer";
import * as path from "path";

dotenv.config();
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
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
