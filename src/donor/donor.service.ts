import { Injectable } from "@nestjs/common";
import { FacilityResource } from "../donation-request/donation-request.resource";
import { httpResponse, paginatedData } from "../lib/utils";
import { DonorDetails, User } from "../mongoose/mongoose.schema";
import { ProfileResource } from "./donor.resource";
import {
  UpdateAvailabilitySchemaType,
  UpdateDonorSchemaType,
} from "./donor.schema";

@Injectable()
export class DonorService {
  constructor() {}

  async getDonorDetails(user: any) {
    const populatedUser = await user.populate({
      path: "donorDetails",
      select: {
        bloodGroup: 1,
        status: 1,
      },
    });
    const data = new ProfileResource(populatedUser).toJson();

    return httpResponse({
      data,
    });
  }

  async updateDonorDetails(user: any, body: UpdateDonorSchemaType) {
    user.firstName = body.firstName;
    user.lastName = body.lastName;
    user.otherNames = body.otherNames;
    user.email = body.email;
    user.phone = body.phone;
    user.address = body.address;
    user.location = body.location;
    await user.save();

    const donorDetails = await DonorDetails.findOne({ user: user._id });
    if (!donorDetails) {
      throw new Error("Donor details not found");
    }

    donorDetails.bloodGroup = body.bloodGroup;
    donorDetails.status = body.status;
    await donorDetails.save();

    const populatedUser = await user.populate({
      path: "donorDetails",
      select: {
        bloodGroup: 1,
        status: 1,
      },
    });

    return httpResponse({
      message: "Donor details updated successfully",
      data: new ProfileResource(populatedUser).toJson(),
    });
  }

  async updateDonorAvailability(user: any, body: UpdateAvailabilitySchemaType) {
    const donorDetails = await DonorDetails.findOne({ user: user._id });
    if (!donorDetails) {
      throw new Error("Donor details not found");
    }

    donorDetails.status = body.status;
    await donorDetails.save();

    return httpResponse({
      message: "Donor availability updated successfully",
    });
  }
  async getFacilitiesClosestToLocation(query: any) {
    if (!query.lat || !query.lng) {
      throw new Error("Latitude and longitude are required");
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const lat = parseFloat(query.lat);
    const lng = parseFloat(query.lng);
    // Within 100km radius
    const radius = 100 / 6378.1; // 100km in radians

    const facilities = await User.aggregate([
      {
        $match: {
          role: "facility",
          "location.lat": { $exists: true },
          "location.lng": { $exists: true },
        },
      },
      {
        $addFields: {
          distance: {
            $multiply: [
              6378.1,
              {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        { $sin: { $degreesToRadians: lat } },
                        { $sin: { $degreesToRadians: "$location.lat" } },
                      ],
                    },
                    {
                      $multiply: [
                        { $cos: { $degreesToRadians: lat } },
                        { $cos: { $degreesToRadians: "$location.lat" } },
                        {
                          $cos: {
                            $subtract: [
                              { $degreesToRadians: "$location.lng" },
                              { $degreesToRadians: lng },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      { $match: { distance: { $lte: radius * 6378.1 } } },
      { $sort: { distance: 1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalFacilities = await User.countDocuments({
      role: "facility",
      "location.lat": { $exists: true },
      "location.lng": { $exists: true },
      $expr: {
        $lte: [
          {
            $multiply: [
              6378.1,
              {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        { $sin: { $degreesToRadians: lat } },
                        { $sin: { $degreesToRadians: "$location.lat" } },
                      ],
                    },
                    {
                      $multiply: [
                        { $cos: { $degreesToRadians: lat } },
                        { $cos: { $degreesToRadians: "$location.lat" } },
                        {
                          $cos: {
                            $subtract: [
                              { $degreesToRadians: "$location.lng" },
                              { $degreesToRadians: lng },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
          radius * 6378.1,
        ],
      },
    });

    const data = FacilityResource.collection(facilities);

    return httpResponse({
      data: {
        data,
        meta: paginatedData(query, totalFacilities),
      },
    });
  }
}
