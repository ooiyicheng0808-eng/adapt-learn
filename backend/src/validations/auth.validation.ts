import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(1, "Username is required").optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    role: z.enum(["learner", "seller"]).default("learner"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});
