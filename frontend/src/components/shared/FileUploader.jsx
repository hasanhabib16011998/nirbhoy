import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { convertFileToUrl } from "@/lib/utils";

const FileUploader = ({ fieldChange, mediaUrl }) => {
  const [file, setFile] = useState([]);
  const [fileUrl, setFileUrl] = useState(mediaUrl);

  const onDrop = useCallback(
    (acceptedFiles) => {
      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
      setFileUrl(convertFileToUrl(acceptedFiles[0]));
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".svg"],
      "application/pdf": [".pdf"], //for PDF
    },
  });

  // ✅ Helper to check if the newly uploaded file is a PDF
  const isPdf = file.length > 0 && file[0].type === "application/pdf";

  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer">
      <input {...getInputProps()} className="cursor-pointer" />

      {fileUrl ? (
        <>
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            {isPdf ? (
              // ✅ PDF Preview: Shows the file name instead of trying to load it as an image
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-dark-4 rounded-xl w-full">
                <span className="text-4xl mb-2">📄</span>
                <p className="text-white font-medium text-center break-all">
                  {file[0]?.name}
                </p>
                <p className="text-light-3 text-sm mt-1">PDF Document Selected</p>
              </div>
            ) : (
              // Standard Image Preview
              <img src={fileUrl} alt="image" className="file_uploader-img" />
            )}
          </div>
          <p className="file_uploader-label">Click or drag file to replace</p>
        </>
      ) : (
        <div className="file_uploader-box ">
          <img
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
          />

          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Drag photo or document here
          </h3>
          <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG, or PDF</p>

          <Button type="button" className="shad-button_dark_4">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;