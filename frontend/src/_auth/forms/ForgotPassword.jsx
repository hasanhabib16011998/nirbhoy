import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { toast } from "sonner";
import OtpVerification from "./OtpVerification";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phoneNumber.length < 11) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/users/forgot-password/`, {
        phone_number: phoneNumber,
      });
      toast.success("OTP sent to your phone number.");
      setStep(2); // Move to OTP Verification
    } catch (error) {
      const msg = error.response?.data?.error || "Failed to send OTP.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle successful OTP verification
  const handleOtpSuccess = () => {
    toast.success("Identity verified! Please set a new password.");
    setStep(3); // Move to New Password
  };

  // Step 3: Reset the password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/users/reset-password/`, {
        phone_number: phoneNumber,
        new_password: newPassword,
      });
      toast.success("Password reset successfully! You can now log in.");
      navigate("/sign-in");
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* STEP 1: Enter Phone Number */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12 text-center">Reset Password</h2>
          <p className="text-light-3 small-medium md:base-regular text-center">
            Enter your registered phone number to receive an OTP.
          </p>
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4 mt-4">
            <div className="space-y-2">
              <label className="shad-form_label text-sm font-medium">Phone Number</label>
              <Input 
                type="tel" 
                placeholder="01700000000"
                className="shad-input" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Button type="submit" className="shad-button_primary" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send OTP"}
            </Button>
            <Link to="/sign-in" className="text-primary-500 text-small-semibold text-center mt-2 hover:underline">
              Back to Log in
            </Link>
          </form>
        </div>
      )}

      {/* STEP 2: Reusable OTP Verification Component */}
      {step === 2 && (
        // We pass the phone_number in the userData object exactly as the component expects
        <OtpVerification 
          userData={{ phone_number: phoneNumber }} 
          onSuccess={handleOtpSuccess} 
        />
      )}

      {/* STEP 3: Enter New Password */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12 text-center">Create New Password</h2>
          <p className="text-light-3 small-medium md:base-regular text-center">
            Your identity has been verified. Enter your new secure password below.
          </p>
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4 mt-4">
            <div className="space-y-2">
              <label className="shad-form_label text-sm font-medium">New Password</label>
              <PasswordInput 
                className="shad-input" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="shad-button_primary" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}