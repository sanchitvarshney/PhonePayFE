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
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  multiple: boolean;
};

const FileUploaderContext = createContext<FileUploaderContextType | null>(null);

function buildAcceptString(accept?: Record<string, string[]>): string | undefined {
  if (!accept) return undefined;
  const parts: string[] = [];
  Object.entries(accept).forEach(([mime, exts]) => {
    parts.push(mime);
    exts.forEach((ext) => {
      if (ext && !parts.includes(ext)) parts.push(ext);
    });
  });
  return parts.length ? parts.join(",") : undefined;
}

const useFileUpload = () => {
  const ctx = useContext(FileUploaderContext);
  if (!ctx) throw new Error("useFileUpload must be used within FileUploader");
  return ctx;
};

type FileUploaderProps = {
  value: File[] | null;
  onValueChange: (value: File[] | null) => void;
  onFileUpload?: (file: File) => void;
  dropzoneOptions?: {
    maxFiles?: number;
    accept?: Record<string, string[]>;
    maxSize?: number;
    multiple?: boolean;
  };
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
        event.target.value = "";
      },
      [dropzoneOptions, onFileUpload, onValueChange]
    );

    const accept = buildAcceptString(dropzoneOptions?.accept);
    const multiple = dropzoneOptions?.multiple ?? false;

    React.useEffect(() => {
      setFiles(value ?? null);
    }, [value]);

    return (
      <FileUploaderContext.Provider
        value={{ files, setFiles, onChange: handleChange, accept, multiple }}
      >
        <div
          ref={ref}
          className={cn("grid w-full overflow-hidden", className)}
          {...props}
        >
          {children}
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
  ({ className, loading, children, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { files, onChange, accept, multiple } = useFileUpload();

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        if (loading) return;
        const items = e.dataTransfer?.files;
        if (!items?.length) return;
        const dt = new DataTransfer();
        const maxFiles = 5;
        for (let i = 0; i < Math.min(items.length, maxFiles); i++) {
          dt.items.add(items[i]);
        }
        const fakeEvent = {
          target: { files: dt.files },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(fakeEvent);
      },
      [onChange, loading]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        className={cn(
          "relative w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-background p-4 text-center transition-colors hover:border-gray-400 hover:bg-gray-50/50",
          loading ? "opacity-50 cursor-not-allowed" : "",
          className
        )}
        onClick={() => !loading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={onChange}
          {...props}
        />
        {files && files.length > 0 ? (
          <span className="text-sm text-slate-600">
            {files.map((f) => f.name).join(", ")}
          </span>
        ) : children != null ? (
          children
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

