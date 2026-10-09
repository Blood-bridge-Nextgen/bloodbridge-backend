import { ResourceInterface } from "../lib/interfaces";

type ProfileResourceType = {
  _id: string;
  firstName?: string | null;
  lastName?: string | null;
  otherNames?: string | null;
  organizationName?: string | null;
  email: string;
  phone: string;
  address: string;
  role: "admin" | "donor" | "facility";
  dob?: NativeDate | null | undefined;
  emailVerifiedAt?: NativeDate | null;
  status: "active" | "pending" | "suspended";
  kyc?: {
    status: "pending" | "approved" | "rejected";
  };
  displayName: string;
};

type UserWithProfile = {
  _id: any;
  firstName?: string | null;
  lastName?: string | null;
  otherNames?: string | null;
  organizationName?: string | null;
  emailVerifiedAt?: NativeDate | null;
  email: string;
  phone: string;
  address: string;
  role: "admin" | "donor" | "facility";
  dob?: NativeDate | null | undefined;
  status: "active" | "pending" | "suspended";
  kyc?: {
    status: "pending" | "approved" | "rejected";
  };
};

export class ProfileResource implements ResourceInterface<ProfileResourceType> {
  constructor(public item: UserWithProfile) {}

  toJson(): ProfileResourceType {
    return this.extractObject();
  }

  extractObject(data?: UserWithProfile): ProfileResourceType {
    const src = data ?? this.item;

    const base: ProfileResourceType = {
      _id: src._id,
      email: src.email,
      phone: src.phone,
      firstName: src.firstName,
      lastName: src.lastName,
      dob: src.dob,
      address: src.address,
      otherNames: src.otherNames,
      organizationName: src.organizationName,
      role: src.role,
      emailVerifiedAt: src.emailVerifiedAt,
      displayName: src.firstName
        ? `${src.firstName} ${src.lastName} ${src.otherNames || ""}`
        : src.organizationName || "",
      status: src.status,
      kyc: src.kyc,
    };

    return base;
  }
}
