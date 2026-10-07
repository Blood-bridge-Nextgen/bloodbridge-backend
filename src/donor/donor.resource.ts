import { ResourceInterface } from "../lib/interfaces";

type ProfileResourceType = {
  _id: any;
  firstName?: string | null;
  lastName?: string | null;
  otherNames?: string | null;
  email: string;
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  role: "donor";
  status: "active" | "pending" | "suspended";
  donorDetails: {
    _id: any;
    bloodGroup: string;
    donationStatus: "available" | "unavailable";
  };
};

type UserWithProfile = {
  _id: any;
  firstName?: string | null;
  lastName?: string | null;
  otherNames?: string | null;
  email: string;
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  role: "donor";
  status: "active" | "pending" | "suspended";
  donorDetails: {
    _id: any;
    bloodGroup: string;
    status: "available" | "unavailable";
  };
};

export class ProfileResource implements ResourceInterface<ProfileResourceType> {
  constructor(public item: UserWithProfile) {}

  toJson(): ProfileResourceType {
    return this.extractObject();
  }

  extractObject(data?: UserWithProfile): ProfileResourceType {
    const src = data ?? this.item;

    return {
      _id: src._id,
      firstName: src.firstName,
      lastName: src.lastName,
      otherNames: src.otherNames,
      email: src.email,
      phone: src.phone,
      address: src.address,
      location: src.location,
      role: src.role,
      status: src.status,
      donorDetails: {
        _id: src.donorDetails._id,
        bloodGroup: src.donorDetails.bloodGroup,
        donationStatus: src.donorDetails.status,
      },
    };
  }
}
