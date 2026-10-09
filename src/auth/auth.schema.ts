import { z } from "zod";

export const FacilitySignUpSchema = z
  .object({
    organizationName: z.string().min(1, "Organization name is required"),
    email: z.email("Invalid email"),
    phone: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
    registrationNumber: z.string().min(1, "Registration number is required"),
    location: z.object({
      lat: z.number({
        error: "Latitude must be a number",
      }),
      lng: z.number({
        error: "Longitude must be a number",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

export const DonorSignUpSchema = z
  .object({
    firstName: z.string().min(1, " is required"),
    lastName: z.string().min(1, " is required"),
    otherNames: z.string().nullable().optional(),
    email: z.email("Invalid email"),
    phone: z.string().min(1, " is required"),
    address: z.string().min(1, " is required"),
    dob: z
      .string()
      .refine((value) => {
        const date = new Date(value);
        return !isNaN(date.getTime());
      }, "Invalid date")
      // Check whether user is at least 18 years old
      .refine((value) => {
        const date = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < date.getDate())
        ) {
          return age - 1 >= 18;
        }
        return age >= 18;
      }, "You must be at least 18 years old"),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
      error: "Accepted values are A+, A-, B+, B-, AB+, AB-, O+, O-",
    }),
    status: z.enum(["available", "unavailable"], {
      error: "Accepted values are available, unavailable",
    }),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export const VerifyEmailSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

export const SignInSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const SendPasswordResetSchema = z.object({
  email: z.email("Invalid email"),
});

export const ResetPasswordSchema = z
  .object({
    code: z.string().min(1, "Code is required"),
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type DonorSignUpSchemaType = z.infer<typeof DonorSignUpSchema>;
export type SignInSchemaType = z.infer<typeof SignInSchema>;
export type VerifyEmailSchemaType = z.infer<typeof VerifyEmailSchema>;
export type SendPasswordResetSchemaType = z.infer<
  typeof SendPasswordResetSchema
>;
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;
export type FacilitySignUpSchemaType = z.infer<typeof FacilitySignUpSchema>;
