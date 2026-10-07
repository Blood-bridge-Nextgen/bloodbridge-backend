import { Injectable, NotFoundException } from "@nestjs/common";
import { httpResponse } from "../lib/utils";
import { FacilityDetails, User } from "../mongoose/mongoose.schema";
import { ProfileResource } from "./facility.resource";
import { UpdateFacilitySchemaType } from "./facility.schema";

@Injectable()
export class FacilityService {
  constructor() {}

  async getFacilityDetails(user: any) {
    const facility = await user.populate({
      path: "facilityDetails",
      select: {
        registrationNumber: 1,
      },
    });

    if (!facility) {
      throw new NotFoundException("Facility not found");
    }

    return httpResponse({
      data: new ProfileResource(facility).toJson(),
    });
  }

  async updateDetails(user: any, body: UpdateFacilitySchemaType) {
    user.organizationName = body.organizationName;
    user.email = body.email;
    user.phone = body.phone;
    user.address = body.address;
    user.location = body.location;
    await user.save();

    const facilityDetails = await FacilityDetails.findOne({ user: user._id });
    if (!facilityDetails) {
      throw new NotFoundException("Facility details not found");
    }

    facilityDetails.registrationNumber = body.registrationNumber;
    await facilityDetails.save();

    const populatedUser = await user.populate({
      path: "facilityDetails",
      select: {
        registrationNumber: 1,
      },
    });

    return httpResponse({
      message: "Facility details updated successfully",
      data: new ProfileResource(populatedUser).toJson(),
    });
  }
}
