import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as z from "zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Loader from "@/components/shared/Loader";

import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useUpdateUser } from "@/lib/react-query/queriesAndMutations";

// 1. Validation for the actual fields in your DB
const ProfileValidation = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  phone_number: z.string().optional(),
  address: z.string().optional(),
});

export default function UpdateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const { data: currentUser, isLoading: isUserLoading } = useGetUserById(id);
  const { mutateAsync: updateUserProfile, isPending: isUpdating } = useUpdateUser();

  // 2. State for handling the profile image
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // 3. Setup form matching your DB
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      address: "",
    },
  });

  // 4. Pre-fill data and image URL
  useEffect(() => {
    if (currentUser) {
      console.log(currentUser);
      reset({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        phone_number: currentUser.phone_number || "",
        address: currentUser.address || "",
      });
      
      // Set the image preview using the clean URL from your Django backend
      if (currentUser.profile_image) {
        setPreviewUrl(currentUser.profile_image);
      }
    }
  }, [currentUser, reset]);

  // Handle local image selection and preview
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Show the new image immediately
    }
  };

  if (user.id !== id) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-1">Unauthorized access</p>
      </div>
    );
  }

  if (isUserLoading) {
    return <div className="flex-center w-full h-full"><Loader /></div>;
  }

  async function onSubmit(values) {
    // 5. Use FormData instead of standard JSON so we can send the image file
    const formData = new FormData();
    formData.append("first_name", values.first_name);
    formData.append("last_name", values.last_name);
    
    // Only append if they exist so we don't accidentally send empty strings to DB
    if (values.phone_number) formData.append("phone_number", values.phone_number);
    if (values.address) formData.append("address", values.address);
    
    // Append the actual file if a new one was selected (must match your Django model field name)
    if (file) {
      formData.append("profile_image", file); 
    }

    try {
      const updatedUser = await updateUserProfile({
        id: currentUser.id,
        userData: formData // Pass the FormData payload
      });

      if (updatedUser) {
        toast.success("Profile updated successfully!");
        navigate(`/profile/${id}`);
      }
    } catch (error) {
      toast.error("Update failed", { description: "Please try again later." });
    }
  }

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
        </div>

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="flex flex-col gap-7 w-full mt-4 max-w-5xl"
        >
          {/* PROFILE IMAGE UI */}
          <div className="flex items-center gap-4">
            <img
              src={previewUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="space-y-2">
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer text-primary-500 font-medium hover:underline"
              >
                Change profile photo
              </label>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* First Name & Last Name row */}
          <div className="flex gap-4 w-full">
            <div className="space-y-2 w-full">
              <label className="shad-form_label text-sm font-medium">First Name</label>
              <Input type="text" className="shad-input" {...register("first_name")} />
              {errors.first_name && <p className="text-red text-sm">{errors.first_name.message}</p>}
            </div>

            <div className="space-y-2 w-full">
              <label className="shad-form_label text-sm font-medium">Last Name</label>
              <Input type="text" className="shad-input" {...register("last_name")} />
              {errors.last_name && <p className="text-red text-sm">{errors.last_name.message}</p>}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="shad-form_label text-sm font-medium">Phone Number</label>
            <Input type="text" className="shad-input" {...register("phone_number")} />
            {errors.phone_number && <p className="text-red text-sm">{errors.phone_number.message}</p>}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="shad-form_label text-sm font-medium">Address</label>
            <Input type="text" className="shad-input" {...register("address")} />
            {errors.address && <p className="text-red text-sm">{errors.address.message}</p>}
          </div>

          <div className="flex gap-4 items-center justify-end">
            <Button 
              type="button" 
              className="shad-button_dark_4"
              onClick={() => navigate(-1)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="shad-button_primary whitespace-nowrap"
              disabled={isUpdating}
            >
              {isUpdating ? <Loader /> : "Update Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}