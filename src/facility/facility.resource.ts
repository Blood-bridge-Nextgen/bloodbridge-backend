import { ResourceInterface } from "../lib/interfaces";

type ProfileResourceType = {
  _id: any;
  organizationName?: string | null;
  email: string;
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  role: "facility";
  status: "active" | "pending" | "suspended";
  facilityDetails: {
    _id: any;
    registrationNumber: string;
  };
};

type UserWithProfile = {
  _id: any;
  organizationName?: string | null;
  email: string;
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  role: "facility";
  status: "active" | "pending" | "suspended";
  facilityDetails: {
    _id: any;
    registrationNumber: string;
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
      organizationName: src.organizationName,
      email: src.email,
      phone: src.phone,
      address: src.address,
      location: src.location,
      role: src.role,
      status: src.status,
      facilityDetails: src.facilityDetails,
    };
  }
}
