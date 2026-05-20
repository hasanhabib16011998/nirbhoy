import { z } from "zod";

export const SigninValidation = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const SignupValidation = z.object({
  first_name: z.string().min(3, "First name too short"),
  last_name: z.string().min(3, "Last name too short"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string()
  .length(11, { message: "Phone number must be exactly 11 digits." })
  .regex(/^\d+$/, { message: "Phone number can only contain numbers." }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().default("Survivor"),
  is_anonymous_user: z.boolean().default(false),
});

export const ProSignupValidation = z.object({
  first_name: z.string().min(3, { message: "First name too short" }),
  last_name: z.string().min(3, { message: "Last name too short" }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone_number: z.string()
  .length(11, { message: "Phone number must be exactly 11 digits." })
  .regex(/^\d+$/, { message: "Phone number can only contain numbers." }),
  address: z.string().min(5, { message: "Please enter a valid address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  
  // We use any().optional() here because your onSubmit function already 
  // includes excellent manual validation for checking if these files exist.
  profile_image: z.any().optional(),
  nid_file: z.any().optional(),
  bar_council_id_file: z.any().optional(),
});

export const PostValidation = z.object({
  caption: z.string().min(5, "Caption too short").max(2200, "Caption too long"),
  file: z.custom((files) => files && files.length > 0, "File is required"),
  location: z.string(),
  tags: z.string(),
  is_anonymous: z.boolean().default(false).optional(),
});

export const ProfileValidation = z.object({
  file: z.custom(file => file instanceof File || typeof file === 'string'),
  name: z.string().min(2, "Name too short"),
  username: z.string().min(2, "Username too short"),
  email: z.string().email(),
  bio: z.string().max(500, "Bio too long"),
});