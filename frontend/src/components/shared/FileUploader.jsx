import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";

const FileUploader = ({ fieldChange, mediaUrl }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      // Sets the state to the FULL array of selected files
      setFiles(acceptedFiles);
      fieldChange(acceptedFiles);
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true, // ✅ Explicitly tell Dropzone to allow multiple files
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".svg"],
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer border-2 border-dashed border-dark-4 hover:border-primary-500 transition-all"
    >
      <input {...getInputProps()} className="cursor-pointer" />

      {files.length > 0 ? (
        <>
          {/* ✅ Multi-file Preview Grid */}
          <div className="flex flex-wrap justify-center gap-4 w-full p-5 lg:p-8">
            {files.map((file, index) => {
              const isPdf = file.type === "application/pdf";
              // Generate a temporary local URL for the preview
              const fileUrl = URL.createObjectURL(file); 

              return isPdf ? (
                <div key={index} className="flex flex-col items-center justify-center p-4 border border-dark-4 bg-dark-2 rounded-xl w-32 h-32">
                  <span className="text-3xl mb-1">📄</span>
                  <p className="text-white font-medium text-center text-xs break-all line-clamp-2">
                    {file.name}
                  </p>
                </div>
              ) : (
                <img 
                  key={index} 
                  src={fileUrl} 
                  alt={`uploaded preview ${index}`} 
                  className="w-32 h-32 object-cover rounded-xl" 
                />
              );
            })}
          </div>
          <p className="file_uploader-label pb-5">Click or drag files to replace</p>
        </>
      ) : mediaUrl ? (
        // ✅ Fallback for PostForm when editing a post with an existing single image
        <>
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            <img src={mediaUrl} alt="image" className="file_uploader-img" />
          </div>
          <p className="file_uploader-label">Click or drag file to replace</p>
        </>
      ) : (
        // ✅ Default Empty State
        <div className="file_uploader-box py-10">
          <img
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
          />
          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Drag photos or documents here
          </h3>
          <p className="text-light-4 small-regular mb-6">
            SVG, PNG, JPG, or PDF (Multiple allowed)
          </p>

          <Button type="button" className="shad-button_dark_4">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;