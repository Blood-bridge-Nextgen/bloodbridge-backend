import { z } from "zod";

export const UpdateFacilitySchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
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
  registrationNumber: z.string().min(1, "Registration number is required"),
});

export type UpdateFacilitySchemaType = z.infer<typeof UpdateFacilitySchema>;
