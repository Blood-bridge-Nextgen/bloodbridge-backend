import { z } from "zod";

export const DonationListingSchema = z.object({
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    error:
      "Invalid blood group. Must be one of A+, A-, B+, B-, AB+, AB-, O+, O-.",
  }),
  quantity: z
    .number()
    .positive({ error: "Quantity must be a positive number." }),
  requiredDonors: z
    .number()
    .positive({ error: "Required donors must be a positive number." }),
  type: z.enum(["voluntary", "paid"], {
    error: "Invalid donation type. Must be either 'voluntary' or 'paid'.",
  }),
});

export type DonationListingSchemaType = z.infer<typeof DonationListingSchema>;
