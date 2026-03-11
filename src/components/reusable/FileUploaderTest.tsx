import React from "react";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
} from "@/components/ui/Fileupload";
import { Paperclip } from "lucide-react";

type Props = {
  className?: string;
  requiredFilename?: string;
  files?: File[] | null;
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
  maxFiles?: number;
  mulTiple?: boolean;
  onValuchange?: (value: File[] | null) => void;
  onFileUpload?: (file: File) => void;
};

type Filename = {
  fileFormats: string;
};

const FileSvgDraw: React.FC<Filename> = ({ fileFormats }) => {
  return (
    <>
      <svg
        className="w-8 h-8 mb-3 text-gray-500"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-gray-500">
        <span className="font-semibold">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-gray-500">{fileFormats}</p>
    </>
  );
};

const FileUploaderTest: React.FC<Props> = ({
  className,
  files = null,
  setFiles,
  maxFiles = 1,
  mulTiple = false,
  requiredFilename = "jpg, png",
  onValuchange,
  onFileUpload,
}) => {
  return (
    <FileUploader
      value={files}
      onFileUpload={onFileUpload}
      onValueChange={(newFiles) => {
        onValuchange && onValuchange(newFiles);
        setFiles(newFiles);
      }}
      dropzoneOptions={{ maxFiles: mulTiple ? (maxFiles ?? 10) : 1 }}
      className={`relative p-2 border-2 border-dashed rounded-lg bg-background border-slate-300 ${className ?? ""}`}
    >
      <FileInput className="outline-dashed outline-1 outline-white" />
      <div className="flex flex-col items-center justify-center w-full pt-3 pb-4">
        <FileSvgDraw fileFormats={requiredFilename} />
      </div>
      <FileUploaderContent>
        {files &&
          files.length > 0 &&
          files.map((file, i) => (
            <FileUploaderItem key={i} index={i}>
              <Paperclip className="w-4 h-4 stroke-current" />
              <span>{file.name}</span>
            </FileUploaderItem>
          ))}
      </FileUploaderContent>
    </FileUploader>
  );
};

export default FileUploaderTest;

