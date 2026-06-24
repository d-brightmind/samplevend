import { z } from "zod";
import { accountTypes } from "@/lib/auth/types";

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[0-9\W]/, "Password must include a number or symbol.");

export const registerSchema = z
  .object({
    accountType: z.enum(accountTypes),
    accountName: z.string().trim().min(2).max(120).optional(),
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: passwordSchema,
    serviceCategory: z.string().trim().min(2).max(80).optional()
  })
  .superRefine((value, ctx) => {
    if (value.accountType === "BUSINESS" && !value.accountName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["accountName"],
        message: "Business name is required."
      });
    }
    if (value.accountType === "INDIVIDUAL_PROVIDER" && !value.serviceCategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["serviceCategory"],
        message: "Service category is required."
      });
    }
  });

export const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required.")
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase())
});

export const resetPasswordSchema = z.object({
  password: passwordSchema
});
