import { z } from "zod";

export const DonationListingSchema = z
  .object({
    pricePerPint: z.number().nullable().optional(),
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
  })
  .refine(
    (data) => {
      if (data.type === "paid" && !data.pricePerPint) {
        return false;
      }
      return true;
    },
    {
      message: "Price per pint is required for paid donations.",
      path: ["pricePerPint"],
    },
  );

export type DonationListingSchemaType = z.infer<typeof DonationListingSchema>;
