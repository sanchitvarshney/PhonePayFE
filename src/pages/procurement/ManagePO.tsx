import React from "react";
import { Typography, TextField, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const PHONEPE_PURPLE = "#5F259F";

const ManagePO: React.FC = () => {
  return (
    <div className="p-6 bg-white h-full overflow-auto">
      <Typography variant="h1" className="text-slate-600" fontSize={22} fontWeight={500}>
        Manage PO
      </Typography>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <TextField
          size="small"
          placeholder="Search PO..."
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "#94a3b8", mr: 1 }} fontSize="small" />,
          }}
          sx={{ minWidth: 280 }}
        />
        <Button
          variant="contained"
          sx={{ backgroundColor: PHONEPE_PURPLE, "&:hover": { backgroundColor: "#4a1d7a" } }}
        >
          Search
        </Button>
      </div>
      <div className="mt-6 border border-neutral-200 rounded-md p-8 text-center text-slate-500">
        <Typography variant="body2">
          PO list table — same layout as BharatPayFE. Connect your procurement slices and grid to enable full functionality.
        </Typography>
      </div>
    </div>
  );
};

export default ManagePO;
