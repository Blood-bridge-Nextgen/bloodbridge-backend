import { z } from "zod";

export const DonationListingSchema = z.object({
  pricePerPint: z.number().refine((value) => value >= 0, {
    message: "Price per pint must be greater than or equal to 0.",
  }),
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
  status: z.enum(["open", "closed"], {
    error: "Invalid status. Must be either 'open' or 'closed'.",
  }),
});

export type DonationListingSchemaType = z.infer<typeof DonationListingSchema>;
