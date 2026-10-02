import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { httpResponse, MONGOOSE_ERROR_CODES } from "../lib/utils";
import { MailService } from "../mail/mail.service";
import {
  DonorDetails,
  OneTimePassword,
  User,
} from "../mongoose/mongoose.schema";
import { ProfileResource } from "./auth.resource";
import {
  DonorSignUpSchemaType,
  ResetPasswordSchemaType,
  SendPasswordResetSchemaType,
  SignInSchemaType,
  VerifyEmailSchemaType,
} from "./auth.schema";

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  async donorSignUp(body: DonorSignUpSchemaType) {
    try {
      const user = new User({
        email: body.email,
        phone: body.phone,
        firstName: body.firstName,
        lastName: body.lastName,
        otherName: body.otherNames,
        address: body.address,
        dob: new Date(body.dob),
        hash: this.hashPassword(body.password),
        role: "donor",
      });
      await user.save();
      await DonorDetails.create({
        bloodGroup: body.bloodGroup,
        status: body.status,
        user: user._id,
      });
      const otp = new OneTimePassword({
        user: user._id,
        code: this.generateOTP(),
        type: "email_verification",
      });
      await otp.save();

      //   Send otp

      const token = this.jwt.sign(
        { userId: user._id, role: user.role },
        {
          expiresIn: "7d",
          secret: process.env.JWT_SECRET || "",
        },
      );
      const userData = await user.populate({
        path: "kyc",
        select: {
          status: 1,
        },
        justOne: true,
      });
      const populatedOtp = await otp.populate({
        path: "user",
        select: {
          email: 1,
          firstName: 1,
        },
      });

      await this.mail.sendOtp(populatedOtp);

      return httpResponse({
        message: "User created successfully",
        data: {
          token,
          profile: new ProfileResource(userData).toJson(),
        },
      });
    } catch (e: any) {
      console.log(e);
      if (e?.errorResponse?.code === MONGOOSE_ERROR_CODES.DUPLICATE_KEY) {
        throw new BadRequestException("Email already exists");
      }
      throw new InternalServerErrorException(
        "An error occurred while creating the user",
      );
    }
  }

  async signIn(body: SignInSchemaType) {
    try {
      const user = await User.findOne({ email: body.email })
        .select({
          firstName: 1,
          lastName: 1,
          otherNames: 1,
          organizationName: 1,
          email: 1,
          phone: 1,
          address: 1,
          role: 1,
          dob: 1,
          status: 1,
          hash: 1,
        })
        .populate({
          path: "kyc",
          select: {
            status: 1,
          },
          justOne: true,
        });

      if (!user) {
        throw new BadRequestException("Invalid email or password");
      }

      const isMatch = this.checkHashedPassword(body.password, user.hash);
      if (!isMatch) {
        throw new BadRequestException("Invalid email or password");
      }

      const token = this.jwt.sign(
        { userId: user._id, role: user.role },
        {
          expiresIn: "7d",
          secret: process.env.JWT_SECRET || "",
        },
      );

      return httpResponse({
        message: "User signed in successfully",
        data: {
          token,
          profile: new ProfileResource(user).toJson(),
        },
      });
    } catch (e: any) {
      console.log(e);
      throw new InternalServerErrorException(
        "An error occurred while signing in the user",
      );
    }
  }

  async verifyEmail(userId: string, body: VerifyEmailSchemaType) {
    const otp = await OneTimePassword.findOne({
      user: userId,
      code: body.code,
      type: "email_verification",
    });
    if (!otp) {
      throw new BadRequestException("Invalid OTP");
    }
    await OneTimePassword.deleteMany({
      user: userId,
      type: "email_verification",
    });

    await User.updateOne({ _id: userId }, { emailVerifiedAt: new Date() });
    return httpResponse({
      message: "Email verified successfully",
    });
  }

  async resendEmailVerification(userId: string) {
    const otp = await OneTimePassword.create({
      user: userId,
      code: this.generateOTP(),
      type: "email_verification",
    });
    const populatedOtp = await otp.populate({
      path: "user",
      select: {
        email: 1,
        firstName: 1,
      },
    });

    await this.mail.sendOtp(populatedOtp);

    return httpResponse({
      message: "Email verification has been resent",
    });
  }

  async getUser(user: any) {
    return httpResponse({
      message: "User signed in successfully",
      data: new ProfileResource(user).toJson(),
    });
  }

  async sendPasswordReset(body: SendPasswordResetSchemaType) {
    const user = await User.findOne({ email: body.email });
    if (!user) {
      throw new NotFoundException("User with this email does not exist");
    }

    const otp = await OneTimePassword.create({
      user: user._id,
      code: this.generateOTP(),
      type: "password_reset",
    });
    const populatedOtp = await otp.populate({
      path: "user",
      select: {
        email: 1,
        firstName: 1,
      },
    });

    await this.mail.sendOtp(populatedOtp);

    return httpResponse({
      message: "Password reset OTP has been sent",
    });
  }

  async resetPassword(body: ResetPasswordSchemaType) {
    const user = await User.findOne({ email: body.email });
    if (!user) {
      throw new NotFoundException("User with this email does not exist");
    }
    const otp = await OneTimePassword.findOne({
      user: user._id,
      type: "password_reset",
      code: body.code,
    });
    if (!otp) {
      throw new NotFoundException("Invalid OTP or code has expired");
    }
    await OneTimePassword.deleteMany({
      user: user._id,
      type: "password_reset",
    });
    user.hash = this.hashPassword(body.password);
    await user.save();

    // Send notification

    return httpResponse({
      message: "Password reset successfully",
    });
  }

  private generateOTP(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  private hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  private checkHashedPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}
