import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button } from "@/components/ui/button";

const PHONEPE_PURPLE = "#5F259F";

const MasterComponent: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      component: "",
      part: "",
      notes: "",
    },
  });

  return (
    <div className="h-[calc(100vh-50px)] grid grid-cols-[400px_1fr] bg-white">
      <form
        onSubmit={handleSubmit(() => {})}
        className="p-[20px] border-r border-neutral-300 flex flex-col gap-4"
      >
        <Typography variant="h1" className="text-slate-600" fontSize={20} fontWeight={500}>
          Add Component
        </Typography>
        <TextField
          fullWidth
          label="Component Name"
          {...register("component", { required: "Component is required" })}
        />
        {errors.component && (
          <span className="text-[12px] text-red-500">{errors.component.message}</span>
        )}
        <TextField fullWidth label="Part" {...register("part")} />
        <TextField
          fullWidth
          label="Notes"
          multiline
          rows={3}
          {...register("notes")}
        />
        <div className="flex gap-[10px] justify-end mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            className="gap-1"
          >
            <RefreshIcon fontSize="small" /> Reset
          </Button>
          <LoadingButton
            type="submit"
            startIcon={<SaveIcon fontSize="small" />}
            variant="contained"
            sx={{ backgroundColor: PHONEPE_PURPLE, "&:hover": { backgroundColor: "#4a1d7a" } }}
          >
            Submit
          </LoadingButton>
        </div>
      </form>
      <div className="p-[20px] overflow-auto">
        <Typography variant="h2" className="text-slate-600" fontSize={18} fontWeight={500}>
          Component List
        </Typography>
        <p className="text-sm text-slate-500 mt-2">Component table will appear here.</p>
      </div>
    </div>
  );
};

export default MasterComponent;
