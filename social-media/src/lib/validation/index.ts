import * as z from "zod";

// ============================================================
// USER
// ============================================================
export const SignupValidation = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone_number: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  role: z.enum(['Survivor', 'Lawyer', 'Volunteer']),
  is_anonymous_user: z.boolean().default(false),
})

export const SigninValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password is required" }),
})
