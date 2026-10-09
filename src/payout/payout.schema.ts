import { z } from "zod";

export const AccountDetailsSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
});

export const PayoutSchema = z.object({
  amount: z.number().min(0, "Amount must be a positive number"),
});

export type AccountDetailsSchemaType = z.infer<typeof AccountDetailsSchema>;
export type PayoutSchemaType = z.infer<typeof PayoutSchema>;
