import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { FacilityResource } from "../donation-request/donation-request.resource";
import {
  httpResponse,
  MONGOOSE_ERROR_CODES,
  paginatedData,
} from "../lib/utils";
import {
  DonationRequest,
  DonorDetails,
  RequestSubmission,
  User,
} from "../mongoose/mongoose.schema";
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
    const address = query.address;
    const addressFilter = address?.trim()
      ? {
          address: {
            $regex: address.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
          },
        }
      : {};
    // Within 100km radius
    const radius = 100 / 6378.1; // 100km in radians

    const facilities = await User.aggregate([
      {
        $match: {
          role: "facility",
          "location.lat": { $exists: true },
          "location.lng": { $exists: true },
          ...addressFilter,
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
      ...addressFilter,
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

  async getRequests(query: any) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const status = query.status;
    const skip = (page - 1) * limit;

    const requests = await DonationRequest.find({
      ...(status ? { status } : {}),
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "facility",
        select: {
          organizationName: 1,
          email: 1,
          phone: 1,
        },
      });
    const totalRequests = await DonationRequest.countDocuments({
      ...(status ? { status } : {}),
    });
    const pagination = paginatedData(query, totalRequests);

    return httpResponse({
      data: {
        data: requests,
        meta: pagination,
      },
    });
  }

  async respondToRequest(requestId: string, user: any) {
    try {
      await RequestSubmission.create({
        request: requestId,
        user: user._id,
      });

      return httpResponse({
        message: "Request submission created successfully",
      });
    } catch (e: any) {
      if (e?.errorResponse?.code === MONGOOSE_ERROR_CODES.DUPLICATE_KEY) {
        throw new BadRequestException(
          "You have already responded to this request",
        );
      }
      throw new InternalServerErrorException(
        "An error occurred while creating the user",
      );
    }
  }

  async getRequestSubmissions(user: any, query: any) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const status = query.status;
    const skip = (page - 1) * limit;

    const submissions = await RequestSubmission.find({
      user: user._id,
      ...(status ? { status } : {}),
    })
      .select({
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "request",
        select: {
          bloodGroup: 1,
          status: 1,
          quantity: 1,
          pricePerPint: 1,
          requiredDonors: 1,
          type: 1,
        },
        populate: {
          path: "facility",
          select: {
            organizationName: 1,
            email: 1,
            phone: 1,
            address: 1,
            location: 1,
          },
        },
      });
    const totalSubmissions = await RequestSubmission.countDocuments({
      user: user._id,
      ...(status ? { status } : {}),
    });
    const pagination = paginatedData(query, totalSubmissions);

    return httpResponse({
      data: {
        data: submissions,
        meta: pagination,
      },
    });
  }
}
