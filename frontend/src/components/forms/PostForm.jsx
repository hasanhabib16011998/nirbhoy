import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserContext } from "@/context/AuthContext";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import FileUploader from "../shared/FileUploader";
import Loader from "../shared/Loader";
import { PostValidation } from "@/lib/validation";
import { useCreatePost } from "@/lib/react-query/queriesAndMutations";

const PostForm = ({ post, action }) => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  // 1. Destructure register, handleSubmit, control, and errors directly
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post.caption : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? post.tags : "",
    },
  });

  // Query
  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
  
  // Placeholder for Update logic
  const isLoadingUpdate = false; 

  // 2. Renamed handler to onSubmit to avoid clashing with hook's handleSubmit
  const onSubmit = async (value) => {
    // ACTION = UPDATE
    if (post && action === "Update") {
      toast.error("Update functionality not implemented yet for Django");
      return; 
    }

    // ACTION = CREATE
    try {
      const formData = new FormData();
      
      // ✅ 2. Append standard text fields
      formData.append("caption", value.caption || "");
      formData.append("location", value.location || "");
      formData.append("tags", value.tags || "");

      // ✅ 3. Loop through files and append them to "attachments"
      if (value.file && value.file.length > 0) {
        value.file.forEach((f) => {
          // The key MUST be "attachments" to match Django's request.FILES.getlist('attachments')
          formData.append("attachments", f); 
        });
      }

      // ✅ 4. Send the formData to your API
      const newPost = await createPost(formData);

      if (!newPost) {
        toast.error("Create post failed. Please try again.");
      } else {
        toast.success("Post created successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  };

  return (
    // 3. Removed <Form> wrapper, using standard <form>
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-9 w-full max-w-5xl"
    >
      
      {/* Caption */}
      <div className="space-y-2">
        <label className="shad-form_label">Caption</label>
        <Textarea
          className="shad-textarea custom-scrollbar"
          {...register("caption")}
        />
        {errors.caption && (
          <p className="shad-form_message">{errors.caption.message}</p>
        )}
      </div>

      {/* File Upload (Requires Controller because it's a custom component, not a native input) */}
      <div className="space-y-2">
        <label className="shad-form_label">Add Photos</label>
        <Controller
          control={control}
          name="file"
          render={({ field }) => (
            <FileUploader
              fieldChange={field.onChange}
              mediaUrl={post?.imageUrl || ""}
            />
          )}
        />
        {errors.file && (
          <p className="shad-form_message">{errors.file.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="shad-form_label">Add Location</label>
        <Input 
          type="text" 
          className="shad-input" 
          {...register("location")} 
        />
        {errors.location && (
          <p className="shad-form_message">{errors.location.message}</p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="shad-form_label">
          Add Tags (separated by comma " , ")
        </label>
        <Input
          placeholder="Art, Expression, Learn"
          type="text"
          className="shad-input"
          {...register("tags")}
        />
        {errors.tags && (
          <p className="shad-form_message">{errors.tags.message}</p>
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
          disabled={isLoadingCreate || isLoadingUpdate}
        >
          {(isLoadingCreate || isLoadingUpdate) && <Loader />}
          {action} Post
        </Button>
      </div>
    </form>
  );
};

export default PostForm;