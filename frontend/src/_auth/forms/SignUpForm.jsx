import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { SignupValidation } from "@/lib/validation";
import {
  useCreateUserAccount,
  useSignInAccount,
} from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from 'axios';

export default function SignUpForm() {
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["","","",""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const [userData, setUserData] = useState(null);

  const { mutateAsync: createUserAccount, isPending: isCreatingUser } = useCreateUserAccount();
  const { mutateAsync: signInAccount, isPending: isSigningIn } = useSignInAccount();

  // 1. Destructure register, handleSubmit, control, and errors directly from useForm
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";


  const verifyOtpMutation = useMutation({
      mutationFn: async() => {
          if(!userData) return;
          const response = await axios.post(`${API_BASE_URL}/users/verify-user`,
              { 
                  ...userData,
                  otp: otp.join(""),
              }
          );
          return response.data;
      },
      onSuccess: () => {
          navigate("/sign-in");
      }
    })

    const handleOtpChange = (index, value) => {
        if(!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if(value && index < inputRefs.current.length -1) {
            inputRefs.current[index + 1]?.focus();
        }

    };

    const handleOtpKeyDown = (index, e) => {
        if(e.key === "Backspace" && !otp[index] && index>0){
            inputRefs.current[index -1]?.focus();
        }
    };

  async function onSubmit(values) {
    try {
      const newUser = await createUserAccount(values);

      if (newUser) {
        toast.success("Account created successfully", {
          description: "Logging In...",
        });

        console.log("New User created:",newUser);
        setUserData(newUser.user);
        if(!newUser.user.is_verified) {
          setShowOtp(true);
        }
        

      }
    } catch (error) {
      console.error("Signup failed:", error);
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error("Registration Failed", {
        description: errorMessage,
      });
    }
  }

  return (
    // 2. Remove the <Form> wrapper entirely
    <div className="sm:w-420 flex-center flex-col">
      <img src="/assets/images/logo.png" alt="logo" />

      {!showOtp ? (
        <div className="registration-form">
          <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
            Create a new account
          </h2>
          <p className="text-light-3 small-medium md:base-regular">
            To use Nirbhoy enter your account details
          </p>

          {/* 3. Use standard HTML form with handleSubmit */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5 w-full mt-4"
          >
            {/* Name Fields */}
            <div className="flex gap-4">
              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-white">
                  First Name
                </label>
                <Input
                  placeholder="Jane"
                  className="shad-input"
                  {...register("first_name")}
                />
                {errors.first_name && (
                  <p className="text-[0.8rem] font-medium text-red">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-white">
                  Last Name
                </label>
                <Input
                  placeholder="Doe"
                  className="shad-input"
                  {...register("last_name")}
                />
                {errors.last_name && (
                  <p className="text-[0.8rem] font-medium text-red">
                    {errors.last_name.message}
                  </p>
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
                <p className="text-[0.8rem] font-medium text-red">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="01700000000"
                className="shad-input"
                {...register("phone_number")}
              />
              {errors.phone_number && (
                <p className="text-[0.8rem] font-medium text-red">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Password</label>
              <PasswordInput className="shad-input" {...register("password")} />
              {errors.password && (
                <p className="text-[0.8rem] font-medium text-red">
                  {errors.password.message}
                </p>
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
                <label className="text-sm font-medium text-white">
                  Stay Anonymous?
                </label>
                <p className="text-[0.8rem] text-light-3">
                  We will hide your real name from your public profile.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="shad-button_primary"
              disabled={isCreatingUser || isSigningIn}
            >
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
                className="text-primary-500 text-small-semibold ml-1"
              >
                Log in
              </Link>
            </p>

            <div className="mt-6 mb-6 border-t border-dark-4 pt-4 text-center w-full">
              <p className="text-small-regular text-light-2">
                Want to help the community?
              </p>
              <Link
                to="/pro-sign-up"
                className="text-secondary-500 text-small-semibold hover:underline"
              >
                Register as a Volunteer/Lawyer
              </Link>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Enter OTP</h2>
          <p className="text-light-3 small-medium md:base-regular">
            An OTP has been sent to your email. Please enter that OTP to verify your account.
          </p>
          <div className="flex justify-center gap-6 mt-6">
            {otp?.map((digit, index) => (
              <input
                key={index}
                type="text"
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                maxLength={1}
                className="w-12 h-12 text-center border border-gray-300 outline-none !rounded-xl"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={false}
            onClick={() => verifyOtpMutation.mutate()}
            className="w-full mt-6 bg-[#3489ff] text-white p-3 rounded-md font-medium hover:bg-blue-600 transition-colors"
          >
            {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
          </button>
          {verifyOtpMutation?.isError && (
              <p className="text-red-500 text-sm mt-2">
                {verifyOtpMutation.error.response?.data?.message ||
                  verifyOtpMutation.error.message}
              </p>
            )}
        </div>
      )}
    </div>
  );
}
