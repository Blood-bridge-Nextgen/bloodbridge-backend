import { z } from "zod";

export const UpdateSubmissionStatusSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]),
});

export type UpdateSubmissionStatusSchemaType = z.infer<
  typeof UpdateSubmissionStatusSchema
>;
