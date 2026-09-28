import { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    firstName: {
      type: String,
      required: function () {
        return this.role === "donor";
      },
    },
    lastName: {
      type: String,
      required: function () {
        return this.role === "donor";
      },
    },
    otherNames: {
      type: String,
      required: function () {
        return this.role === "donor";
      },
    },
    organizationName: {
      type: String,
      required: function () {
        return this.role === "organization";
      },
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["donor", "facility", "admin"],
      required: true,
    },
    dob: {
      type: Date,
      required: function () {
        return this.role === "donor";
      },
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.virtual("donorDetails", {
  ref: "DonorDetails",
  localField: "_id",
  foreignField: "user",
});

UserSchema.virtual("kyc", {
  ref: "KycVerification",
  localField: "_id",
  foreignField: "user",
});

UserSchema.virtual("oneTimePasswords", {
  ref: "OneTimePassword",
  localField: "_id",
  foreignField: "user",
});
UserSchema.virtual("facilityDetails", {
  ref: "FacilityDetails",
  localField: "_id",
  foreignField: "user",
});

const DonorDetailsSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

DonorDetailsSchema.virtual("user", {
  ref: "User",
  localField: "_id",
  foreignField: "donorDetails",
});

const FacilityDetailsSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    registrationNumber: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const KycVerificationSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    document: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const OneTimePasswordSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["password_reset", "email_verification"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    expires: "30m",
  },
);

export const FacilityDetails = model("FacilityDetails", FacilityDetailsSchema);
export const OneTimePassword = model("OneTimePassword", OneTimePasswordSchema);
export const User = model("User", UserSchema);
export const DonorDetails = model("DonorDetails", DonorDetailsSchema);
export const KycVerification = model("KycVerification", KycVerificationSchema);
