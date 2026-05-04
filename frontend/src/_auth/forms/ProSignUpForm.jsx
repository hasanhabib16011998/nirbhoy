// src/pages/ProSignUpForm.jsx
import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { toast } from "sonner";
import { createProfessionalAccount } from "@/lib/api";
import FileUploader from "@/components/shared/FileUploader";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function ProSignUpForm() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Volunteer");
  const [isLoading, setIsLoading] = useState(false);

  // --- OTP States ---
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const [userData, setUserData] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  // Initialize React Hook Form
  const { register, handleSubmit, control, formState: { errors } } = useForm();

  // --- OTP Mutation & Handlers ---
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(`${API_BASE_URL}/users/verify-user`, {
        ...userData,
        otp: otp.join(""),
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Account verified successfully", {
        description: "Your professional account is pending admin approval. You can now log in.",
      });
      navigate("/sign-in");
    },
  });

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (values) => {
    setIsLoading(true);

    // We must manually construct the FormData object because we are sending files
    const formData = new FormData();
    
    // Append standard text fields
    formData.append("first_name", values.first_name);
    formData.append("last_name", values.last_name);
    formData.append("email", values.email);
    formData.append("phone_number", values.phone_number);
    formData.append("address", values.address);
    formData.append("password", values.password);
    formData.append("role", role);

    // Append Profile Image (FileUploader returns an array of files, we just want the first one)
    if (values.profile_image && values.profile_image.length > 0) {
      formData.append("profile_image", values.profile_image[0]);
    } else {
      toast.error("Profile Image is required");
      setIsLoading(false);
      return;
    }

    // Append Conditional Documents based on Role
    if (role === "Volunteer") {
      if (values.nid_image && values.nid_image.length > 0) {
        formData.append("nid_image", values.nid_image[0]);
      } else {
        toast.error("NID Image is required for Volunteers");
        setIsLoading(false);
        return;
      }
    }

    if (role === "Lawyer") {
      if (values.bar_council_id_image && values.bar_council_id_image.length > 0) {
        formData.append("bar_council_id_image", values.bar_council_id_image[0]);
      } else {
        toast.error("Bar Council ID is required for Lawyers");
        setIsLoading(false);
        return;
      }
    }

    // Submit to backend
    try {
      const newUser = await createProfessionalAccount(formData);
      
      if (newUser) {
        toast.success("Application Submitted", {
          description: "Please verify your email address.",
        });

        console.log("New Professional created:", newUser);
        setUserData(newUser.user);
        
        // Trigger OTP Screen
        if (!newUser.user?.is_verified) {
          setShowOtp(true);
        }
      }
    } catch (error) {
      console.error("Pro Signup failed:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Please check your inputs and try again.";
      toast.error("Registration Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

return (
    <div className="flex-center flex-col p-6 w-full max-w-2xl mx-auto">
      <img src="/assets/images/logo.png" alt="logo" className="mb-6" />

      {!showOtp ? (
        <div className="registration-form w-full">
          <h2 className="h3-bold md:h2-bold pt-5 text-center">Join as a Professional</h2>
          <p className="text-light-3 small-medium md:base-regular text-center mb-6">
            Help us make a difference. Your account will require admin verification.
          </p>

          {/* Role Toggle Buttons */}
          <div className="flex gap-4 w-full mb-6">
            <Button 
              type="button" 
              onClick={() => setRole("Volunteer")}
              className={`w-1/2 ${role === "Volunteer" ? "bg-primary-500 text-white" : "bg-dark-4 text-light-2"}`}
            >
              Volunteer
            </Button>
            <Button 
              type="button" 
              onClick={() => setRole("Lawyer")}
              className={`w-1/2 ${role === "Lawyer" ? "bg-secondary-500 text-white" : "bg-dark-4 text-light-2"}`}
            >
              Lawyer
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
            {/* Common Fields */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-white">First Name</label>
                <Input {...register("first_name", { required: true })} className="shad-input" />
              </div>
              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-white">Last Name</label>
                <Input {...register("last_name", { required: true })} className="shad-input" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Email</label>
              <Input type="email" {...register("email", { required: true })} className="shad-input" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Phone Number</label>
              <Input type="tel" {...register("phone_number", { required: true })} className="shad-input" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Address</label>
              <Input type="text" {...register("address", { required: true })} className="shad-input" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Password</label>
              <PasswordInput 
                className="shad-input"
                {...register("password", { required: true })} 
              />
            </div>

            {/* --- FILE UPLOADERS --- */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Profile Image</label>
              <Controller
                control={control}
                name="profile_image"
                render={({ field }) => (
                  <FileUploader fieldChange={field.onChange} mediaUrl="" />
                )}
              />
            </div>

            {role === "Volunteer" && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary-500">Upload NID Image</label>
                <Controller
                  control={control}
                  name="nid_image"
                  render={({ field }) => (
                    <FileUploader fieldChange={field.onChange} mediaUrl="" />
                  )}
                />
              </div>
            )}

            {role === "Lawyer" && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary-500">Upload Bar Council ID Image</label>
                <Controller
                  control={control}
                  name="bar_council_id_image"
                  render={({ field }) => (
                    <FileUploader fieldChange={field.onChange} mediaUrl="" />
                  )}
                />
              </div>
            )}

            <Button type="submit" className="shad-button_primary mt-4" disabled={isLoading}>
              {isLoading ? "Submitting Application..." : `Register as ${role}`}
            </Button>
          </form>
          
          <Link to="/sign-in" className="mt-6 block text-center text-primary-500 small-regular hover:underline">
            Back to Login
          </Link>
        </div>
      ) : (
        // --- OTP VERIFICATION UI ---
        <div className="w-full flex-center flex-col">
          <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Enter OTP</h2>
          <p className="text-light-3 small-medium md:base-regular text-center">
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
            type="button"
            disabled={verifyOtpMutation.isPending}
            onClick={() => verifyOtpMutation.mutate()}
            className="w-full mt-6 bg-[#3489ff] text-white p-3 rounded-md font-medium hover:bg-blue-600 transition-colors"
          >
            {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
          </button>
          {verifyOtpMutation?.isError && (
            <p className="text-red-500 text-sm mt-2 text-center">
              {verifyOtpMutation.error.response?.data?.message ||
                verifyOtpMutation.error.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}