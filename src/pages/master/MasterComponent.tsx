import MsterComponentsMaterialListTable from "./MsterComponentsMaterialListTable";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MasterComponentsUpdateDrawer from "@/components/Drawers/master/MasterComponentsUpdateDrawer";
import MasterComponentsUplaodImageDrawer from "@/components/Drawers/master/MasterComponentsUplaodImageDrawer";
import MasterComponnetsViewImageDrawer from "@/components/Drawers/master/MasterComponnetsViewImageDrawer";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { createComponentAsync, getComponentsAsync, getGroupsAsync } from "@/features/master/component/componentSlice";
import { getUOMAsync } from "@/features/master/UOM/UOMSlice";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Autocomplete, Button, TextField, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import { showToast } from "@/utils/toasterContext";
import { AgGridReact } from "@ag-grid-community/react";
import { Icons } from "@/components/icons";
type OptionType = {
  id: string;
  text: string;
};
export type createComponentdata = {
  component: string;
  part: string;
  uom: { units_id: string; units_name: string } | null;
  group: OptionType | null;
  notes: string;
  module:{id:string,text:string}|null;
  hsn:string;
};
const MasterComponent: React.FC = () => {
  const [update, setUpadte] = useState<boolean>(false);
  const [viewImage, setViewImage] = useState<boolean>(false);
  const [uploadImage, setUploadImage] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const gridRef = useRef<AgGridReact<any>>(null);
  const {
    register,
    watch,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<createComponentdata>({
    defaultValues: {
      component: "",
      part: "",
      uom: null,
      group: null,
      notes: "",
      module:null,
      hsn:"",
    },
  });

  const moduleOptions = [
    { id: "BPE", text: "BPe" },
    { id: "MSC", text: "MSc" },
  ]
  
  const { UOM, getUOMloading } = useAppSelector((state) => state.uom);
  const { createComponentLoading, component } = useAppSelector((state) => state.component);

  const onSubmit: SubmitHandler<createComponentdata> = (data) => {
    if (data.uom !== null) {
      let newdata = { name: data.component, description: data.notes, uom: data.uom?.units_id,compFor:data?.module?.id,part:data.part,hsn:data.hsn };
      dispatch(createComponentAsync(newdata)).then((res: any) => {
        if (res.payload?.data?.success) {
          reset();
          dispatch(getComponentsAsync());
          showToast(res.payload.data.message, "success");
        }
      });
    } else {
      !data.group ? showToast("Please select a Group ", "error") : showToast("Please select a UOM", "error");
    }
  };

  const onBtExport = useCallback(() => {
    component &&
      gridRef.current!.api.exportDataAsExcel({
        sheetName: "R6 Report",
      });
  }, [component]);
  useEffect(() => {
    dispatch(getComponentsAsync());
    dispatch(getUOMAsync());
    dispatch(getGroupsAsync());
  }, []);

  return (
    <>
      {/* drawers */}
      <MasterComponentsUpdateDrawer open={update} setOpen={setUpadte} />
      <MasterComponentsUplaodImageDrawer open={uploadImage} setOpen={setUploadImage} />
      <MasterComponnetsViewImageDrawer open={viewImage} setOpen={setViewImage} />
      {/* drawers */}
      <div className="h-[calc(100vh-100px)] grid grid-cols-[550px_1fr] bg-white">
        <div className="h-full overflow-y-auto border-r border-neutral-300 ">
          <form onSubmit={handleSubmit(onSubmit)} className="p-[20px]">
            <Typography className="text-slate-600" variant="h1" component={"div"} fontSize={20} fontWeight={500}>
              Add New Component
            </Typography>
            <div className="grid grid-cols-2 gap-[20px] mt-[20px]">
            <div>
                <Controller
                  name="module"
                  control={control}
                  rules={{ required: "You must select a module" }}
                  render={({ field }) => (
                    <Autocomplete
                      // loading={getUOMloading}
                      value={field.value}
                      options={moduleOptions}
                      getOptionLabel={(option) => option.text}
                      renderInput={(params) => <TextField {...params} label={"Select Module"} variant="outlined" />}
                      onChange={(_, value) => field.onChange(value)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  )}
                />

                {errors.module && <span className=" text-[12px] text-red-500">{errors.module.message}</span>}
              </div>
              <div>
                <TextField disabled={watch("module")?.id !== "BPE"} placeholder="Part Code" fullWidth label="Part Code"{...register("part")} />
                {errors.part && <span className=" text-[12px] text-red-500">{errors.part.message}</span>}
              </div>
              
              </div>
              <div >
              <div className="mt-[20px]">
                <TextField fullWidth label="Component Name" {...register("component", { required: "Component Name is required" })} />
                {errors.component && <span className=" text-[12px] text-red-500">{errors.component.message}</span>}
              </div>
              <div className="grid grid-cols-2 gap-[20px] mt-[20px]">
                <Controller
                  name="uom"
                  control={control}
                  rules={{ required: "You must select a unit" }}
                  render={({ field }) => (
                    <Autocomplete
                      loading={getUOMloading}
                      value={field.value}
                      options={UOM ? UOM : []}
                      getOptionLabel={(option) => option.units_name}
                      renderInput={(params) => <TextField {...params} label={"Select UOM"} variant="outlined" />}
                      onChange={(_, value) => field.onChange(value)}
                      isOptionEqualToValue={(option, value) => option.units_id === value.units_id}
                    />
                  )}
                />

                {errors.uom && <span className=" text-[12px] text-red-500">{errors.uom.message}</span>}
                <TextField placeholder=" HSN Code" fullWidth label="HSN Code"{...register("hsn")} />
                {errors.hsn && <span className=" text-[12px] text-red-500">{errors.hsn.message}</span>}
              </div>
              {/* <div>
                <Controller
                  name="group"
                  control={control}
                  rules={{ required: "You must select a group" }}
                  render={({ field }) => (
                    <Autocomplete
                      loading={getGroupListLoading}
                      value={field.value}
                      options={groupList ? groupList : []}
                      getOptionLabel={(option) => option.text}
                      renderInput={(params) => <TextField {...params} label={"Groups"} variant="outlined" />}
                      onChange={(_, value) => field.onChange(value)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  )}
                />
                {errors.group && <span className=" text-[12px] text-red-500">{errors.group.message}</span>}
              </div> */}
            </div>
            <div className="mt-[30px]">
              <TextField label={"Description"} fullWidth multiline rows={3} className="h-[100px] resize-none" {...register("notes", { required: "Description Name is required" })} />
              {errors.notes && <span className=" text-[12px] text-red-500">{errors.notes.message}</span>}
            </div>
            <div className="h-[50px] p-0 flex items-center px-[20px]  gap-[10px] justify-end mt-[20px]">
              <Button
                type="button"
                onClick={() => {
                  reset();
                }}
                startIcon={<RefreshIcon fontSize="small" />}
                variant={"contained"}
                sx={{ background: "white", color: "red" }}
              >
                Reset
              </Button>
              <LoadingButton loadingPosition="start" loading={createComponentLoading} type="submit" startIcon={<SaveIcon fontSize="small" />} variant="contained">
                Submit
              </LoadingButton>
              <Button
                disabled={!component}
                variant="contained"
                color="primary"
                style={{
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  minWidth: 0,
                  padding: 0,
                }}
                onClick={() => onBtExport()}
                size="small"
                sx={{ zIndex: 1 }}
              >
                <Icons.download fontSize="small" />
              </Button>
            </div>
          </form>

          <div className="h-[100px]"></div>
        </div>
        <div>
          <div className="h-[40px] flex items-center gap-[20px] justify-end bg-white px-[20px]">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" className="data-[state=checked]:bg-cyan-800 data-[state=checked]:text-[#fff] border-slate-400" disabled />
              <label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-500">
                Show Rejected
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="Disabled" className="data-[state=checked]:bg-cyan-800 data-[state=checked]:text-[#fff] border-slate-400" disabled />
              <label htmlFor="Disabled" className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-500">
                Show Disabled
              </label>
            </div>
          </div>
          <MsterComponentsMaterialListTable gridRef={gridRef} setOpen={setUpadte} open={update} setViewImage={setViewImage} setUploadImage={setUploadImage} viewImage={viewImage} uploadImage={uploadImage} />
        </div>
      </div>
    </>
  );
};

export default MasterComponent;
