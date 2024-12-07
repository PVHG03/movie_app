import z from "zod";

const email = z.string().email().min(1).max(255).trim();
const password = z.string().min(8).max(255).trim();

export const loginSchema = z.object({
  email: email,
  password: password,
  userAgent: z.string().min(1).max(255).trim(),
});

export const registerSchema = loginSchema
  .extend({
    username: z.string().min(1).max(255).trim(),
    confirmPassword: password,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
