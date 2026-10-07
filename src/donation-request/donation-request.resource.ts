import { ResourceInterface } from "../lib/interfaces";

type FacilityResourceType = {
  _id: string;
  organizationName: string;
  email: string;
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  role: "facility";
};

type RequestResourceType = {
  _id: any;
  bloodGroup: string;
  quantity: number;
  requiredDonors: number;
  type: "voluntary" | "paid" | null | undefined;
};

export type RequestData = {
  _id: any;
  bloodGroup: string;
  quantity: number;
  requiredDonors: number;
  type: "voluntary" | "paid" | null | undefined;
};

type Facility = {
  _id: string;
  organizationName: string;
  email: string;
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  role: "facility";
};

export class FacilityResource implements ResourceInterface<FacilityResourceType> {
  constructor(public item: Facility) {}

  static collection(items: Facility[]): FacilityResourceType[] {
    const instance = new FacilityResource(items[0]);
    return items.map((item) => instance.extractObject(item));
  }

  toJson(): FacilityResourceType {
    return this.extractObject();
  }

  extractObject(data?: Facility): FacilityResourceType {
    const src = data ?? this.item;

    return {
      _id: src._id,
      organizationName: src.organizationName,
      email: src.email,
      phone: src.phone,
      address: src.address,
      location: src.location,
      role: src.role,
    };
  }
}

export class DonationRequestResource implements ResourceInterface<RequestResourceType> {
  constructor(public item: RequestData) {}

  static collection(items: RequestData[]): RequestResourceType[] {
    const instance = new DonationRequestResource(items[0]);
    return items.map((item) => instance.extractObject(item));
  }

  toJson(): RequestResourceType {
    return this.extractObject();
  }

  extractObject(data?: RequestData): RequestResourceType {
    const src = data ?? this.item;

    return {
      _id: src._id,
      bloodGroup: src.bloodGroup,
      quantity: src.quantity,
      requiredDonors: src.requiredDonors,
      type: src.type,
    };
  }
}
