import { z } from "zod";

export const UpdateKycVerificationSchema = z
  .object({
    status: z.enum(["pending", "verified", "rejected"], {
      error: "Invalid status value",
    }),
    rejectionReason: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.status === "rejected" && !data.rejectionReason) {
        return false;
      }
      return true;
    },
    {
      message: "Rejection reason is required when status is rejected",
    },
  );

export type UpdateKycVerificationSchemaType = z.infer<
  typeof UpdateKycVerificationSchema
>;
