import { Injectable } from "@nestjs/common";
import { DonationListing } from "../mongoose/mongoose.schema";
import { DonationListingSchemaType } from "./donation.schema";

@Injectable()
export class DonationService {
  constructor() {}

  async createDonation(body: DonationListingSchemaType, userId: string) {
    await DonationListing.create({
      ...body,
      facility: userId,
    });
  }
}
