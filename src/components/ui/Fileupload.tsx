import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  Dispatch,
  SetStateAction,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

type FileUploaderContextType = {
  files: File[] | null;
  setFiles: Dispatch<SetStateAction<File[] | null>>;
};

const FileUploaderContext = createContext<FileUploaderContextType | null>(null);

const useFileUpload = () => {
  const ctx = useContext(FileUploaderContext);
  if (!ctx) throw new Error("useFileUpload must be used within FileUploader");
  return ctx;
};

type FileUploaderProps = {
  value: File[] | null;
  onValueChange: (value: File[] | null) => void;
  onFileUpload?: (file: File) => void;
  dropzoneOptions?: { maxFiles?: number };
} & React.HTMLAttributes<HTMLDivElement>;

export const FileUploader = forwardRef<HTMLDivElement, FileUploaderProps>(
  ({ className, value, onValueChange, onFileUpload, children, dropzoneOptions, ...props }, ref) => {
    const [files, setFiles] = useState<File[] | null>(value ?? null);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const list = event.target.files;
        if (!list) return;
        const maxFiles = dropzoneOptions?.maxFiles ?? 1;
        const newFiles: File[] = [];
        for (let i = 0; i < Math.min(list.length, maxFiles); i++) {
          newFiles.push(list[i]);
        }
        setFiles(newFiles);
        onValueChange(newFiles);
        if (newFiles[0] && onFileUpload) onFileUpload(newFiles[0]);
      },
      [dropzoneOptions, onFileUpload, onValueChange]
    );

    return (
      <FileUploaderContext.Provider value={{ files, setFiles }}>
        <div
          ref={ref}
          className={cn("grid w-full overflow-hidden", className)}
          {...props}
        >
          {React.Children.map(children, (child) => {
            if (
              React.isValidElement(child) &&
              (child as any).type?.displayName === "FileInput"
            ) {
              return React.cloneElement(child as any, { onChange: handleChange });
            }
            return child;
          })}
        </div>
      </FileUploaderContext.Provider>
    );
  }
);
FileUploader.displayName = "FileUploader";

export const FileUploaderContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2 mt-2", className)}
      {...props}
    />
  );
});
FileUploaderContent.displayName = "FileUploaderContent";

export const FileUploaderItem = forwardRef<
  HTMLDivElement,
  { index: number } & React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between rounded-md border px-2 py-1 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
FileUploaderItem.displayName = "FileUploaderItem";

type FileInputProps = {
  loading?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const FileInput = forwardRef<HTMLDivElement, FileInputProps>(
  ({ className, loading, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { files } = useFileUpload();

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-background p-4 text-center",
          loading ? "opacity-50 cursor-not-allowed" : "",
          className
        )}
        onClick={() => !loading && inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          {...props}
          multiple={false}
        />
        {files && files.length > 0 ? (
          <span className="text-sm text-slate-600">
            {files.map((f) => f.name).join(", ")}
          </span>
        ) : (
          <span className="text-sm text-slate-500">
            Click to upload or drag and drop
          </span>
        )}
      </div>
    );
  }
);
FileInput.displayName = "FileInput";

