import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";

const FileUploader = ({ fieldChange, mediaUrl }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      setFiles(acceptedFiles);
      fieldChange(acceptedFiles);
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".svg"],
      "video/*": [".mp4", ".mov", ".avi", ".webm"],
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
          <div className="flex flex-wrap justify-center gap-4 w-full p-5 lg:p-8">
            {files.map((file, index) => {
              const isPdf = file.type === "application/pdf";
              const isVideo = file.type.startsWith("video/"); // ✅ Check if video
              const fileUrl = URL.createObjectURL(file); 

              if (isPdf) {
                return (
                  <div key={index} className="flex flex-col items-center justify-center p-4 border border-dark-4 bg-dark-2 rounded-xl w-32 h-32">
                    <span className="text-3xl mb-1">📄</span>
                    <p className="text-white font-medium text-center text-xs break-all line-clamp-2">
                      {file.name}
                    </p>
                  </div>
                );
              }

              if (isVideo) {
                return (
                  <video 
                    key={index} 
                    src={fileUrl} 
                    className="w-32 h-32 object-cover rounded-xl" 
                    controls // Adds a tiny play button preview
                  />
                );
              }

              return (
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
        <>
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            <img src={mediaUrl} alt="image" className="file_uploader-img" />
          </div>
          <p className="file_uploader-label">Click or drag file to replace</p>
        </>
      ) : (
        <div className="file_uploader-box py-10">
          <img
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
          />
          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Drag media or documents here
          </h3>
          <p className="text-light-4 small-regular mb-6">
            SVG, PNG, JPG, MP4, or PDF (Multiple allowed)
          </p>

          <Button type="button" className="shad-button_dark_4">
            Select from device
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;