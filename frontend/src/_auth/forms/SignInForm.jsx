import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Loader from "@/components/shared/Loader"
import { Input } from "@/components/ui/input"
import { SigninValidation } from "@/lib/validation"
import { useSignInAccount } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"
import { PasswordInput } from "@/components/shared/PasswordInput"

export default function SignInForm() {
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  const { mutateAsync: signInAccount, isLoading } = useSignInAccount();

  // 1. Destructure register, handleSubmit, and errors directly
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset 
  } = useForm({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      phone_number: "",
      password: "",
    },
  });
 
  async function handleSignin(values) {    
    try {
      // 1. Await the mutation. If it fails, it will jump straight to the catch block.
      const session = await signInAccount(values);

      // 2. If successful, set the tokens
      localStorage.setItem('accessToken', session.access_token);
      localStorage.setItem('refreshToken', session.refresh_token);

      // 3. Verify the session
      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        reset();
        navigate("/");
      } else {
        toast.error("Login failed", {
          description: "Could not verify session. Please try again."
        });
      }
      
    } catch (error) {
      // 4. Catch the error and display the specific message from your API
      console.error("Login submission error:", error);
      
      toast.error("Login failed", {
        // error.message will contain "Invalid email or password"
        description: error.message || "Please try again." 
      });
    }
  }

  return (
    // 2. Removed the <Form> wrapper
    <>
      <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
        Log in to your account
      </h2>
      <p className="text-light-3 small-medium md:base-regular mt-2">
        Welcome back! Please enter your details.
      </p>

      {/* 3. Use standard HTML form with handleSubmit */}
      <form
        onSubmit={handleSubmit(handleSignin)}
        className="flex flex-col gap-5 w-full mt-4"
      >
        
        {/* ✅ Phone Number Field */}
        <div className="space-y-2">
          <label className="shad-form_label text-sm font-medium">Phone Number</label>
          <Input 
            type="tel" 
            className="shad-input" 
            {...register("phone_number")} 
          />
          {errors.phone_number && (
            <p className="text-[0.8rem] font-medium text-red">{errors.phone_number.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="shad-form_label text-sm font-medium">Password</label>
          <PasswordInput 
            className="shad-input" 
            {...register("password")} 
          />
          {errors.password && (
            <p className="text-[0.8rem] font-medium text-red">{errors.password.message}</p>
          )}
        </div>

        {/* Note: I added the disabled prop here so users can't click twice while loading */}
        <Button 
          type="submit" 
          className="shad-button_primary"
          disabled={isLoading || isUserLoading}
        >
          {isLoading || isUserLoading ? (
            <div className="flex-center gap-2">
              <Loader /> Loading...
            </div>
          ) : (
            "Log in"
          )}
        </Button>

        <p className="text-small-regular text-light-2 text-center mt-2">
          Don't have an account?
          <Link
            to="/sign-up"
            className="text-primary-500 text-small-semibold ml-1">
            Sign up
          </Link>
        </p>
      </form>
    </>
  )
}