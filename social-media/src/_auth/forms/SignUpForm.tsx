import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SignupValidation } from "@/lib/validation"
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"

export default function SignUpForm() {
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  const { mutateAsync: createUserAccount, isPending: isCreatingUser } = useCreateUserAccount();
  const { mutateAsync: signInAccount, isPending: isSigningIn } = useSignInAccount();

  // 1. Create a Type Alias for your form
  type SignupFormValues = z.infer<typeof SignupValidation>;

  // 2. Pass that Type to useForm
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      password: "",
      role: "Survivor", 
      is_anonymous_user: false,
    },
  });
 
  // 3. Use that Type in your handler
  async function onSubmit(values: SignupFormValues) {    
    try {
      const newUser = await createUserAccount(values);

      if (newUser) {
        toast.success("Account created successfully", {
          description: "Logging In...",
        });

        // 4. Sign In
        const session = await signInAccount({
          email: values.email,
          password: values.password,
        });

        if (!session) {
          toast.error("Sign In failed", {
            description: "Please log in with your new credentials."
          });
          return;
        }

        // ---------------------------------------------------------
        // ✅ CRITICAL: Save Token before checking auth!
        // ---------------------------------------------------------
        localStorage.setItem('accessToken', session.access_token);
        localStorage.setItem('refreshToken', session.refresh_token);

        // 5. Check Auth (Now that token is in localStorage, this will work)
        const isLoggedIn = await checkAuthUser();
        
        if (isLoggedIn){
          form.reset();
          navigate('/');
        } else {
          toast.error("Login failed", {
            description: "Please try again."
          });
        }
      }
    } catch (error: any) {
      console.error("Signup failed:", error);
      const errorMessage = error?.message || "Something went wrong. Please try again.";
      toast.error("Registration Failed", {
          description: errorMessage,
      });
    }
  }

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.png" alt="logo" />
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Create a new account</h2>
        <p className="text-light-3 small-medium md:base-regular">
          To use Nirbhoy enter your account details
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
          
          {/* Name Fields */}
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="01700000000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Anonymous Checkbox */}
          <FormField
            control={form.control}
            name="is_anonymous_user"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-dark-4 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Stay Anonymous?
                  </FormLabel>
                  <FormDescription>
                    We will hide your real name from your public profile.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="shad-button_primary" disabled={isCreatingUser || isSigningIn}>
            {isCreatingUser || isSigningIn ? (
              <div className="flex-center gap-2">Processing...</div>
            ) : (
              "Sign Up"
            )}
          </Button>

          <p className="text-small-regular text-light-2 text-center mt-2">
            Already have an account?
            <Link
              to="/sign-in"
              className="text-primary-500 text-small-semibold ml-1">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </Form>
  )
}