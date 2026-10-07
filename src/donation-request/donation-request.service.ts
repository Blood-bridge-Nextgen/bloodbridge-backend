import { Injectable, NotFoundException } from "@nestjs/common";
import { httpResponse, paginatedData } from "../lib/utils";
import { DonationRequest, User } from "../mongoose/mongoose.schema";
import {
  DonationRequestResource,
  FacilityResource,
  type RequestData,
} from "./donation-request.resource";
import { type DonationListingSchemaType } from "./donation-request.schema";

@Injectable()
export class DonationRequestService {
  constructor() {}

  async createDonation(body: DonationListingSchemaType, userId: string) {
    await DonationRequest.create({
      bloodGroup: body.bloodGroup,
      quantity: body.quantity,
      requiredDonors: body.requiredDonors,
      type: body.type,
      pricePerPint: body.type === "paid" ? body.pricePerPint : 0,
      facility: userId,
    });

    return httpResponse({
      message: "Donation request created successfully",
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

  async getFacilityRequests(userId: string, query: any) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const filter = { facility: userId };
    const [requests, totalRequests] = await Promise.all([
      DonationRequest.find(filter).skip(skip).limit(limit),
      DonationRequest.countDocuments(filter),
    ]);

    const requestData = DonationRequestResource.collection(
      requests as RequestData[],
    );

    return httpResponse({
      data: {
        data: requestData,
        meta: paginatedData(query, totalRequests),
      },
    });
  }

  async getFacilityRequestById(requestId: string, userId: string) {
    const request = await DonationRequest.findOne({
      _id: requestId,
      facility: userId,
    });
    if (!request) {
      throw new NotFoundException("Request not found");
    }
    const data = await request.populate({
      path: "submissions",
      select: {
        _id: 1,
        user: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
        },
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
      options: { limit: 5 },
    });

    return httpResponse({
      data,
    });
  }

  async updateRequest(
    requestId: string,
    userId: string,
    body: DonationListingSchemaType,
  ) {
    const request = await DonationRequest.findOne({
      _id: requestId,
      facility: userId,
    });

    if (!request) {
      throw new NotFoundException("Request not found");
    }

    request.bloodGroup = body.bloodGroup;
    request.quantity = body.quantity;
    request.requiredDonors = body.requiredDonors;
    request.type = body.type;
    request.pricePerPint = body.type === "paid" ? body.pricePerPint : 0;

    await request.save();

    return httpResponse({
      message: "Request updated successfully",
    });
  }

  async closeRequest(requestId: string, userId: string) {
    const request = await DonationRequest.findOne({
      _id: requestId,
      facility: userId,
    });

    if (!request) {
      throw new NotFoundException("Request not found");
    }

    request.status = "closed";
    await request.save();

    return httpResponse({
      message: "Request closed successfully",
    });
  }
}
