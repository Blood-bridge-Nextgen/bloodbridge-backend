import { z } from "zod";

export const UpdateDonorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  otherNames: z.string().optional().nullable(),
  email: z.email("Invalid email"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  location: z.object({
    lat: z.number({
      error: "Latitude must be a number",
    }),
    lng: z.number({
      error: "Longitude must be a number",
    }),
  }),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    error: "Accepted values are A+, A-, B+, B-, AB+, AB-, O+, O-",
  }),
  status: z.enum(["available", "unavailable"], {
    error: "Accepted values are available, unavailable",
  }),
});

export const UpdateAvailabilitySchema = z.object({
  status: z.enum(["available", "unavailable"], {
    error: "Accepted values are available, unavailable",
  }),
});

export type UpdateDonorSchemaType = z.infer<typeof UpdateDonorSchema>;
export type UpdateAvailabilitySchemaType = z.infer<
  typeof UpdateAvailabilitySchema
>;
