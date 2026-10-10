import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { httpResponse } from "./lib/utils";
import { initializeMongooseConnection } from "./mongoose/db";
import {
  AccountDetails,
  DonationRequest,
  DonorDetails,
  FacilityDetails,
  KycVerification,
  RequestSubmission,
  User,
  Wallet,
} from "./mongoose/mongoose.schema";

@Injectable()
export class AppService {
  async healthCheck() {
    await initializeMongooseConnection();

    return httpResponse({
      message: "BloodBridge API is healthy and running.",
    });
  }

  async seedDatabase() {
    await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "bloodbrige@gmail.com",
      phone: "000000000",
      emailVerifiedAt: new Date(),
      address: "Admin Address",
      dob: new Date("1990-01-01"),
      status: "active",
      role: "admin",
      hash: bcrypt.hashSync("password", 10),
    });

    //    Create donor
    const donor = await User.create({
      firstName: "Mfoniso",
      lastName: "Ebong",
      email: "mfonisoischris+donor@gmail.com",
      phone: "0000000000",
      emailVerifiedAt: new Date(),
      address: "Donor Address",
      dob: new Date("2004-11-18"),
      status: "active",
      hash: bcrypt.hashSync("password", 10),
      role: "donor",
    });

    await Wallet.create({
      user: donor._id,
      balance: 0,
    });

    await DonorDetails.create({
      bloodGroup: "A+",
      status: "available",
      user: donor._id,
    });

    await AccountDetails.create({
      user: donor._id,
      bankName: "United Bank for Africa",
      accountNumber: "2300513109",
      accountName: "Mfoniso Ebong",
      bankCode: "033",
    });

    // Create facility

    const facility = await User.create({
      organizationName: "New facility",
      email: "mfonisoischris+facility@gmail.com",
      phone: "0000000000",
      emailVerifiedAt: new Date(),
      address: "Facility Address",
      dob: new Date("1990-01-01"),
      status: "active",
      hash: bcrypt.hashSync("password", 10),
      role: "facility",
      location: {
        lat: 4.892,
        lng: 7.032,
      },
    });

    await KycVerification.create({
      user: facility._id,
      document:
        "/uploads/kyc/documents/6ac929e8fb4244c84bdacd93-document-1791607819761.jpg",
      status: "verified",
    });

    await FacilityDetails.create({
      user: facility._id,
      registrationNumber: "29372321321",
    });

    await DonationRequest.create({
      facility: facility._id,
      bloodGroup: "A+",
      quantity: 5,
      requiredDonors: 5,
      type: "paid",
      pricePerPint: 5000,
      status: "open",
    });

    await DonationRequest.create({
      facility: facility._id,
      bloodGroup: "B+",
      quantity: 2,
      requiredDonors: 1,
      type: "voluntary",
      pricePerPint: 0,
      status: "open",
    });

    await DonationRequest.create({
      facility: facility._id,
      bloodGroup: "B-",
      quantity: 10,
      requiredDonors: 50,
      type: "paid",
      pricePerPint: 2000,
      status: "open",
    });

    await RequestSubmission.create({
      request: (await DonationRequest.findOne({ bloodGroup: "A+" }))?._id,
      user: donor._id,
      status: "pending",
    });

    return httpResponse({
      message: "Database seeded successfully",
    });
  }
}
