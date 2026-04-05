// src/pages/ProSignUpForm.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createProfessionalAccount } from "@/lib/api";
import FileUploader from "@/components/shared/FileUploader"; // ✅ Import your FileUploader

export default function ProSignUpForm() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Volunteer");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize React Hook Form
  const { register, handleSubmit, control, formState: { errors } } = useForm();

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
      await createProfessionalAccount(formData);
      
      toast.success("Application Submitted", {
        description: "Your professional account has been created and is pending verification. Please log in.",
      });
      
      navigate("/sign-in");
    } catch (error) {
      toast.error("Registration Failed", {
        description: "Please check your inputs and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center flex-col p-6 w-full max-w-2xl mx-auto">
      <h2 className="h3-bold md:h2-bold pt-5">Join as a Professional</h2>
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
          <Input type="password" {...register("password", { required: true })} className="shad-input" />
        </div>

        {/* --- FILE UPLOADERS --- */}

        {/* Profile Image (Common) */}
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

        {/* Conditional Document Uploads based on Role */}
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
      
      <Link to="/sign-in" className="mt-4 text-primary-500 small-regular hover:underline">
        Back to Login
      </Link>
    </div>
  );
}