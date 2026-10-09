import { model, Schema } from "mongoose";

const isDonor = function (this: any) {
  return this.role === "donor";
};
const isFacility = function (this: any) {
  return this.role === "facility";
};

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: isDonor,
    },
    lastName: {
      type: String,
      required: isDonor,
    },
    otherNames: {
      type: String,
    },
    organizationName: {
      type: String,
      required: isFacility,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    phone: {
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
    location: {
      type: new Schema(
        {
          lat: {
            type: Number,
            required: true,
          },
          lng: {
            type: Number,
            required: true,
          },
        },
        { _id: false },
      ),
      required: isFacility,
      default: null,
    },
    role: {
      type: String,
      enum: ["donor", "facility", "admin"],
      required: true,
    },
    dob: {
      type: Date,
      required: isDonor,
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
UserSchema.virtual("facilityDetails", {
  ref: "FacilityDetails",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});

UserSchema.virtual("donorDetails", {
  ref: "DonorDetails",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});

UserSchema.virtual("kyc", {
  ref: "KycVerification",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});

UserSchema.virtual("oneTimePasswords", {
  ref: "OneTimePassword",
  localField: "_id",
  foreignField: "user",
});
UserSchema.virtual("wallet", {
  ref: "Wallet",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});
UserSchema.virtual("accountDetails", {
  ref: "AccountDetails",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});

const DonorDetailsSchema = new Schema(
  {
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

const FacilityDetailsSchema = new Schema(
  {
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

const DonationRequestSchema = new Schema(
  {
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    quantity: {
      type: Number,
      required: true,
    },
    pricePerPint: {
      type: Number,
      required: function (this: any) {
        return this.type === "paid";
      },
      default: 0,
    },
    requiredDonors: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["voluntary", "paid"],
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
DonationRequestSchema.virtual("submissions", {
  ref: "RequestSubmission",
  localField: "_id",
  foreignField: "request",
});

const RequestSubmissionSchema = new Schema(
  {
    request: {
      type: Schema.Types.ObjectId,
      ref: "DonationRequest",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "paid", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

RequestSubmissionSchema.index({ request: 1, user: 1 }, { unique: true });
RequestSubmissionSchema.virtual("transaction", {
  ref: "Transaction",
  localField: "_id",
  foreignField: "requestSubmission",
  justOne: true,
});

const WalletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const TransactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestSubmission: {
      type: Schema.Types.ObjectId,
      ref: "RequestSubmission",
      required: false,
      default: null,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["NGN"],
      default: "NGN",
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    description: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

TransactionSchema.index(
  { user: 1, requestSubmission: 1 },
  { unique: true },
  // { unique: true, sparse: true },
);
const AccountDetailsSchema = new Schema(
  {
    accountName: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    bankCode: {
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

const PayoutSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },
    failedReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Payout = model("Payout", PayoutSchema);
export const AccountDetails = model("AccountDetails", AccountDetailsSchema);
export const FacilityDetails = model("FacilityDetails", FacilityDetailsSchema);
export const OneTimePassword = model("OneTimePassword", OneTimePasswordSchema);
export const User = model("User", UserSchema);
export const DonorDetails = model("DonorDetails", DonorDetailsSchema);
export const KycVerification = model("KycVerification", KycVerificationSchema);
export const DonationRequest = model("DonationRequest", DonationRequestSchema);
export const RequestSubmission = model(
  "RequestSubmission",
  RequestSubmissionSchema,
);
export const Wallet = model("Wallet", WalletSchema);
export const Transaction = model("Transaction", TransactionSchema);
