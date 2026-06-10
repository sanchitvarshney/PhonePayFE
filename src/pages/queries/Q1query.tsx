import { Icons } from "@/components/icons";
import SelectComponent, { ComponentType } from "@/components/reusable/SelectComponent";
import { Button } from "@/components/ui/button";
import { getCostCenter } from "@/features/common/commonSlice";
import { getQ3DatA } from "@/features/query/query/querySlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { formatNumber } from "@/utils/numberFormatUtils";
import { showToast } from "@/utils/toasterContext";
import { LoadingButton } from "@mui/lab";
import { List, ListItem, ListItemText, Skeleton, TextField, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState } from "react";

const Q1query: React.FC = () => {
  const [colapse, setcolapse] = useState<boolean>(false);
  const [component, setComponent] = React.useState<ComponentType | null>(null);
  const [date, setDate] = React.useState<Dayjs | null>(dayjs());
  // const [costCenter, setCostCenter] = useState<{ label: string; value: string } | null>(null);
  const dispatch = useAppDispatch();
  const { q3data, q3DataLoading } = useAppSelector((state) => state.query);
  // const { costCenterData } = useAppSelector((state) => state.common);

  useEffect(() => {
    dispatch(getCostCenter());
  }, [dispatch]);

  // const costCenterOptions = useMemo(() => {
  //   if (!costCenterData?.length) return [];
  //   return costCenterData.map((item) => {
  //     const raw = item as {
  //       text?: string;
  //       name?: string;
  //       label?: string;
  //       id?: string | number;
  //       code?: string | number;
  //       value?: string | number;
  //       key?: string | number;
  //     };
  //     return {
  //       label: String(raw.text ?? raw.name ?? raw.label ?? ""),
  //       value: String(
  //         raw.id ??
  //           raw.code ??
  //           raw.value ??
  //           raw.key ??
  //           raw.text ??
  //           raw.name ??
  //           raw.label ??
  //           "",
  //       ),
  //     };
  //   });
  // }, [costCenterData]);

  return (
    <div className="h-[calc(100vh-100px)] bg-white relative">
      <div className="h-full flex">
        <div
          className={`transition-all h-full ${
            colapse ? "min-w-0 max-w-0" : "min-w-[400px] max-w-[400px]"
          } overflow-y-auto overflow-x-hidden border-r border-neutral-400/70`}
        >
          <div
            className={`transition-all ${
              colapse ? "left-0" : "left-[400px]"
            } w-[16px] p-0 h-full top-0 bottom-0 absolute rounded-none text-slate-600 z-[10] flex items-center justify-center`}
          >
            <Button
              onClick={() => setcolapse(!colapse)}
              className="transition-all w-[16px] p-0 py-[35px] bg-neutral-200 rounded-none hover:bg-neutral-300/50 text-slate-600 hover:h-full shadow-sm shadow-neutral-400 duration-300"
            >
              {colapse ? <Icons.right fontSize="small" /> : <Icons.left fontSize="small" />}
            </Button>
          </div>
          <div className="p-[20px]">
            <div className="flex flex-col gap-[30px]">
              <SelectComponent value={component} onChange={setComponent} />
              {/* <Autocomplete
                options={costCenterOptions}
                value={costCenter}
                onChange={(_, value) => setCostCenter(value)}
                getOptionLabel={(option) => option.label || ""}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={(params) => (
                  <TextField {...params} label="Cost Center" variant="outlined" />
                )}
              /> */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  enableAccessibleFieldDOMStructure={false}
                  format="DD-MM-YYYY"
                  slots={{
                    textField: TextField,
                  }}
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      variant: "outlined",
                    },
                  }}
                  value={date}
                  onChange={(value) => setDate(value)}
                  sx={{ width: "100%" }}
                  label="Till Date"
                  name="startDate"
                />
              </LocalizationProvider>
            </div>
            <div className="mt-[20px]">
              <LoadingButton
                loadingPosition="start"
                loading={q3DataLoading}
                onClick={() => {
                  if (!date) showToast("Please select date", "error");
                  if (!component) showToast("Please select component", "error");
                  dispatch(
                    getQ3DatA({
                      date: dayjs(date).format("DD-MM-YYYY"),
                      comp: component?.id || "",
                      // costCenter: costCenter?.value || "",
                    }),
                  );
                }}
                startIcon={<Icons.search fontSize="small" />}
                variant="contained"
              >
                Search
              </LoadingButton>
            </div>
          </div>
          {q3data && (
            <List>
              <ListItem>
                <ListItemText primary={"Part Code"} secondary={q3data?.component?.partCode} />
              </ListItem>
              <ListItem>
                <ListItemText primary={"Name"} secondary={q3data?.component?.name} />
              </ListItem>
              <ListItem>
                <ListItemText primary={"Unit"} secondary={q3data?.component?.uom} />
              </ListItem>
            </List>
          )}
        </div>
        {q3data ? (
          <div className="w-full">
            <div className="flex items-center px-[20px] h-[60px] justify-between">
              <Typography variant="h1" fontWeight={500} fontSize={18} component={"div"}>
                Component Stock at locations as on {dayjs(date).format("DD-MM-YYYY")}
              </Typography>
              <div className="flex items-center gap-[10px]">
                <Typography>Total :</Typography>
                <Typography>
                  {formatNumber(q3data?.locationQty.reduce((sum, item) => sum + Number(item.closeQty), 0))}
                </Typography>
              </div>
            </div>
            <div className="p-[20px] flex flex-wrap gap-[10px]">
              {q3DataLoading
                ? q3data?.locationQty.map((item) => (
                    <Skeleton key={item.locationName} className="w-[150px] min-h-[150px]" />
                  )) ?? null
                : q3data?.locationQty.map((item) => (
                    <div
                      key={item.locationName}
                      className="h-[100px] max-w-max px-[50px] rounded border bg-slate-50 flex flex-col gap-[5px] justify-center items-center"
                    >
                      <Typography fontWeight={500}>{item.locationName}</Typography>
                      <Typography fontWeight={500} className="text-slate-500">
                        {formatNumber(item.closeQty)}
                      </Typography>
                    </div>
                  ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <img src="/search.webp" alt="" className="w-[300px] opacity-50" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Q1query;

