
import React, { useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { getUserAsync } from "@/features/common/commonSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { CardContent, Divider, Typography } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import LoadingButton from "@mui/lab/LoadingButton";
import SearchIcon from "@mui/icons-material/Search";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import MrRequisitionReqTable from "@/components/MRRequisitionReqTable";
import { getApprovedMaterialList } from "@/features/production/MaterialRequestWithoutBom/MRApprovalSlice";
import SelectUser, { UserData } from "@/components/reusable/SelectUser";
type Fomrstate = {
  user: UserData | null;
  date: Dayjs | null;
};

const MaterialRequistionRequest: React.FC = () => {
  const dispatch = useAppDispatch();
  const { approvedMaterialListLoading } = useAppSelector((state) => state.pendingMr);
  const {
    handleSubmit,

    control,
    formState: { errors },
  } = useForm<Fomrstate>({
    defaultValues: {
      user: null,
      date: null,
    },
  });
  const onSubmit: SubmitHandler<Fomrstate> = (data) => {

    dispatch(
      getApprovedMaterialList({
        date: dayjs(data.date).format("DD-MM-YYYY"),
        user: data.user?.id || "",
      })
    );
  };
  useEffect(() => {
    dispatch(getUserAsync(null));
  }, []);
  return (
    <div className="h-[calc(100vh-100px)] grid grid-cols-[400px_1fr]">
      <div className="h-full overflow-y-auto bg-white border-r border-neutral-300">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div className="h-[40px] p-0 flex flex-col justify-center px-[20px] bg-slate-100">
              <Typography fontSize={17} fontWeight={500} className="flex items-center text-slate-600 gap-[10px]">
                <FilterAltIcon fontSize="small" className="text-slate-600" /> Filter
              </Typography>
            </div>
            <Divider />
            <CardContent>
              <div className="grid  gap-[30px] mt-[30px]">
                <div>
                  <Controller
                    name="user"
                    control={control}
                    rules={{ required: "User is required" }}
                    render={({ field }) => <SelectUser value={field.value} onChange={field.onChange} label="User" error={errors.user !== undefined} helperText={errors.user ? errors.user.message : ""} />}
                  />
                </div>
                <div>
                  <Controller
                    name="date"
                    control={control}
                    rules={{ required: " Date is required" }}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                        format="DD-MM-YYYY"
                     
                          maxDate={dayjs()}
                          slotProps={{
                            textField: {
                              variant: "outlined",

                              error: !!errors.date,
                              helperText: errors.date ? " Date is required" : null,
                            },
                          }}
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          sx={{ width: "100%" }}
                          label="Date"
                          name="startDate"
                        />
                      </LocalizationProvider>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <div className="h-[50px] p-0 flex items-center px-[20px]  gap-[10px] justify-end">
      
              <LoadingButton loadingPosition="start" type="submit" loading={approvedMaterialListLoading} startIcon={<SearchIcon fontSize="small" />} variant="contained">
                Search
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>
      <div>
        <MrRequisitionReqTable />
      </div>
    </div>
  );
};

export default MaterialRequistionRequest;
