import { z } from "zod";

export const SigninValidation = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const SignupValidation = z.object({
  first_name: z.string().min(2, "First name too short"),
  last_name: z.string().min(2, "Last name too short"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().default("Survivor"),
  is_anonymous_user: z.boolean().default(false),
});

export const PostValidation = z.object({
  caption: z.string().min(5, "Caption too short").max(2200, "Caption too long"),
  file: z.custom((files) => files && files.length > 0, "File is required"),
  location: z.string(),
  tags: z.string(),
});

export const ProfileValidation = z.object({
  file: z.custom(file => file instanceof File || typeof file === 'string'),
  name: z.string().min(2, "Name too short"),
  username: z.string().min(2, "Username too short"),
  email: z.string().email(),
  bio: z.string().max(500, "Bio too long"),
});