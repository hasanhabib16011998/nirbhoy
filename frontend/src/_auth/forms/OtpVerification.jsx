import { useState, useRef } from "react";
import { toast } from "sonner";
import { useVerifyOtp } from "@/lib/react-query/queriesAndMutations";

export default function OtpVerification({ userData, onSuccess }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);

  // ✅ 1. Import your clean, reusable hook
  const { mutateAsync: verifyOtp, isPending: isVerifying } = useVerifyOtp();

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ 2. Handle the submission using mutateAsync
  const handleVerify = async () => {
    if (!userData) {
      toast.error("No user data provided.");
      return;
    }

    try {
      const response = await verifyOtp({
        ...userData,
        otp: otp.join(""),
      });
      
      // Call the parent's success handler
      if (onSuccess) onSuccess(response);

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Verification failed";
      toast.error("Verification Error", { description: errorMessage });
    }
  };

  return (
    <div className="w-full flex-center flex-col">
      <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12 text-center">Enter OTP</h2>
      <p className="text-light-3 small-medium md:base-regular text-center mt-2">
        An OTP has been sent to your phone. Please enter that OTP to verify your account.
      </p>
      
      <div className="flex justify-center gap-6 mt-8 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            ref={(el) => {
              if (el) inputRefs.current[index] = el;
            }}
            maxLength={1}
            className="w-14 h-14 text-center text-xl font-bold border border-dark-4 bg-dark-3 text-light-1 outline-none rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
          />
        ))}
      </div>
      
      <button
        type="button"
        disabled={isVerifying || otp.join("").length < 4}
        onClick={handleVerify}
        className="w-full max-w-sm mt-4 bg-primary-500 text-white p-3 rounded-md font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isVerifying ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );
}