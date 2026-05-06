import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; // ✅ Importing zod for the schema
import axios from "axios";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/shared/FileUploader"; // Ensure correct path
import Loader from "@/components/shared/Loader"; // Ensure correct path

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// ✅ Validation schema specifically for Legal Aid
const LegalAidValidation = z.object({
  caption: z.string().min(5, "Subject must be at least 5 characters").max(255),
  description: z.string().min(10, "Please provide more details (at least 10 characters)"),
  attachments: z.custom().optional(), // Accepts files from your FileUploader
});

const LegalAid = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(LegalAidValidation),
    defaultValues: {
      caption: "",
      description: "",
      attachments: [],
    },
  });

  const onSubmit = async (values) => {
    try {
      const token = localStorage.getItem("accessToken");
      
      // 1. We must use FormData because we are sending Files + Text
      const formData = new FormData();
      formData.append("caption", values.caption);
      formData.append("description", values.description);

      // 2. Loop through the uploaded files and append them
      if (values.attachments && values.attachments.length > 0) {
        values.attachments.forEach((file) => {
          // 'attachments' is the exact key the Django API expects!
          formData.append("attachments", file); 
        });
      }

      // 3. Post to the Django API we created earlier
      const response = await axios.post(`${API_BASE_URL}/complains/legal-aid/apply/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        toast.success("Application submitted successfully!");
        navigate(-1); // Go back to the previous page
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit application.");
    }
  };

  return (
    <div className="flex flex-1">
      <div className="common-container">
        
        {/* Header section matching your Post form */}
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <img
            src="/assets/icons/edit.svg" // Feel free to change this icon!
            width={36}
            height={36}
            alt="apply"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Apply for Legal Aid</h2>
        </div>
        
        <p className="text-light-3 max-w-5xl w-full mt-2">
          Submit your details securely. Only verified Bar Council lawyers will be able to review your case.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-9 w-full max-w-5xl mt-8"
        >
          {/* Subject / Caption */}
          <div className="space-y-2">
            <label className="shad-form_label">Subject / Incident Title</label>
            <Input 
              type="text" 
              className="shad-input" 
              placeholder="E.g., Need immediate consultation regarding domestic violence"
              {...register("caption")} 
            />
            {errors.caption && (
              <p className="shad-form_message text-red">{errors.caption.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="shad-form_label">Detailed Description</label>
            <Textarea
              className="shad-textarea custom-scrollbar h-48"
              placeholder="Describe your situation in detail. Everything you write is strictly confidential."
              {...register("description")}
            />
            {errors.description && (
              <p className="shad-form_message text-red">{errors.description.message}</p>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <label className="shad-form_label">Upload Documents/Evidence (Optional)</label>
            <Controller
              control={control}
              name="attachments"
              render={({ field }) => (
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl=""
                />
              )}
            />
            {errors.attachments && (
              <p className="shad-form_message text-red">{errors.attachments.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 items-center justify-end">
            <Button
              type="button"
              className="shad-button_dark_4"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="shad-button_primary whitespace-nowrap"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader />}
              Submit Application
            </Button>
          </div>
        </form>
        
      </div>
    </div>
  );
};

export default LegalAid;