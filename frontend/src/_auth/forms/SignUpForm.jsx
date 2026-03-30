import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { SignupValidation } from "@/lib/validation"
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"

export default function SignUpForm() {
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  const { mutateAsync: createUserAccount, isPending: isCreatingUser } = useCreateUserAccount();
  const { mutateAsync: signInAccount, isPending: isSigningIn } = useSignInAccount();

  // 1. Destructure register, handleSubmit, control, and errors directly from useForm
  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors }, 
    reset 
  } = useForm({
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
 
  async function onSubmit(values) {    
    try {
      const newUser = await createUserAccount(values);

      if (newUser) {
        toast.success("Account created successfully", {
          description: "Logging In...",
        });

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

        localStorage.setItem('accessToken', session.access_token);
        localStorage.setItem('refreshToken', session.refresh_token);

        const isLoggedIn = await checkAuthUser();
        
        if (isLoggedIn){
          reset();
          navigate('/');
        } else {
          toast.error("Login failed", {
            description: "Please try again."
          });
        }
      }
    } catch (error) {
      console.error("Signup failed:", error);
      const errorMessage = error?.message || "Something went wrong. Please try again.";
      toast.error("Registration Failed", {
          description: errorMessage,
      });
    }
  }

  return (
    // 2. Remove the <Form> wrapper entirely
    <div className="sm:w-420 flex-center flex-col">
      <img src="/assets/images/logo.png" alt="logo" />
      <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Create a new account</h2>
      <p className="text-light-3 small-medium md:base-regular">
        To use Nirbhoy enter your account details
      </p>

      {/* 3. Use standard HTML form with handleSubmit */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
        
        {/* Name Fields */}
        <div className="flex gap-4">
          <div className="w-full space-y-2">
            <label className="text-sm font-medium text-white">First Name</label>
            <Input 
              placeholder="Jane" 
              className="shad-input" 
              {...register("first_name")} 
            />
            {errors.first_name && (
              <p className="text-[0.8rem] font-medium text-red">{errors.first_name.message}</p>
            )}
          </div>

          <div className="w-full space-y-2">
            <label className="text-sm font-medium text-white">Last Name</label>
            <Input 
              placeholder="Doe" 
              className="shad-input" 
              {...register("last_name")} 
            />
            {errors.last_name && (
              <p className="text-[0.8rem] font-medium text-red">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Email</label>
          <Input 
            type="email" 
            placeholder="jane@example.com" 
            className="shad-input"
            {...register("email")} 
          />
          {errors.email && (
            <p className="text-[0.8rem] font-medium text-red">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Phone Number</label>
          <Input 
            type="tel" 
            placeholder="01700000000" 
            className="shad-input"
            {...register("phone_number")} 
          />
          {errors.phone_number && (
            <p className="text-[0.8rem] font-medium text-red">{errors.phone_number.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Password</label>
          <Input 
            type="password" 
            className="shad-input"
            {...register("password")} 
          />
          {errors.password && (
            <p className="text-[0.8rem] font-medium text-red">{errors.password.message}</p>
          )}
        </div>

        {/* Anonymous Checkbox */}
        {/* We use <Controller /> here because the Checkbox is a custom Radix UI component, not a native HTML input */}
        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-dark-4 p-4 mt-2">
          <Controller
            name="is_anonymous_user"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <div className="space-y-1 leading-none">
            <label className="text-sm font-medium text-white">Stay Anonymous?</label>
            <p className="text-[0.8rem] text-light-3">
              We will hide your real name from your public profile.
            </p>
          </div>
        </div>

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
  )
}