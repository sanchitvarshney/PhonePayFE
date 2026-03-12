import React, { useRef } from "react";
import { Box, Typography, IconButton, List, ListItem } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";

interface FileUploaderProps {
  multiple?: boolean;
  onFileChange?: (files: File[]) => void;
  value?: File[] | null;
  label?: string;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  multiple = false,
  onFileChange,
  value = null,
  label = "Upload File",
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const files = value || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected?.length) return;
    const newFiles = multiple ? Array.from(selected) : [selected[0]];
    onFileChange?.(newFiles);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = (fileName: string) => {
    const updated = files.filter((f) => f.name !== fileName);
    onFileChange?.(updated);
  };

  return (
    <Box sx={{ width: "100%", textAlign: "center", mt: 2 }}>
      <Box
        onClick={() => !disabled && inputRef.current?.click()}
        sx={{
          p: 3,
          border: "3px dashed #5F259F",
          borderRadius: 1,
          cursor: disabled ? "not-allowed" : "pointer",
          bgcolor: "background.paper",
          opacity: disabled ? 0.7 : 1,
          "&:hover": { bgcolor: disabled ? undefined : "#f5f3ff" },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          onChange={handleChange}
          style={{ display: "none" }}
          disabled={disabled}
        />
        <UploadFileIcon sx={{ color: "#5F259F" }} fontSize="large" />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Click to upload or drag files
        </Typography>
        <Typography color="textSecondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
      {files.length > 0 && (
        <List>
          {files.map((file, index) => (
            <ListItem
              key={index}
              sx={{ display: "flex", justifyContent: "space-between", p: 0 }}
            >
              <Typography variant="body2" noWrap>
                {file.name}
              </Typography>
              <IconButton
                type="button"
                sx={{ paddingX: "10px", paddingY: "5px" }}
                onClick={() => handleDelete(file.name)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FileUploader;
