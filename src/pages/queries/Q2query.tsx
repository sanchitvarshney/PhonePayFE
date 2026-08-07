import { Icons } from "@/components/icons";
import { LoadingButton } from "@mui/lab";
import React, { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { AgGridReact } from "ag-grid-react";
import { CardFooter } from "@/components/ui/card";
import { getQ2Data } from "@/features/query/query/querySlice";
import { CardContent, Divider, FormControl, List, ListItem, ListItemText, MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
// import MuiTooltip from "@/components/reusable/MuiTooltip";
import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/toasterContext";
import Q2ReportTable from "@/table/queryTables/Q2ReportTable";

const Q6Statement: React.FC = () => {
  const [input, setInput] = useState("");
  const [deviceType, setDeviceType] = useState<string>("soundbox");
  const { q2StatementLoading, q2Statement } = useAppSelector(
    (state) => state.query
  );
  const [colapse, setcolapse] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const gridRef = useRef<AgGridReact<any>>(null);

//   const onBtExport = useCallback(() => {
//     gridRef.current!.api.exportDataAsExcel();
//   }, []);

  return (
 
    <div>
      <div className="relative flex bg-white">
        <div
          className={`transition-all flex flex-col gap-[10px] h-[calc(100vh-100px)]  border-r border-neutral-300   ${
            colapse ? "min-w-0 max-w-0" : "min-w-[400px] max-w-[400px] "
          }`}
        >
          <div
            className={`transition-all ${
              colapse ? "left-0" : "left-[400px]"
            } w-[16px] p-0  h-full top-0 bottom-0 absolute rounded-none  text-slate-600 z-[10] flex items-center justify-center`}
          >
            <Button
              onClick={() => setcolapse(!colapse)}
              className={`transition-all w-[16px] p-0 py-[35px] bg-neutral-200  rounded-none hover:bg-neutral-300/50 text-slate-600 hover:h-full shadow-sm shadow-neutral-400 duration-300   `}
            >
              {colapse ? (
                <Icons.right fontSize="small" />
              ) : (
                <Icons.left fontSize="small" />
              )}
            </Button>
          </div>
          <div className="h-full overflow-y-auto ">
            <Paper elevation={0}>
              <CardContent>
                <div className="flex flex-col gap-[20px] px-[10px] py-[0px]">
                  <div className="flex flex-col gap-[10px]">
                    <Typography
                      variant="subtitle1"
                      className="text-slate-600 font-medium"
                    >
                      Device Type
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={deviceType}
                        onChange={(e) => setDeviceType(e.target.value)}
                        displayEmpty
                        inputProps={{ "aria-label": "Device Type" }}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgb(203 213 225)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgb(148 163 184)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgb(14 116 144)",
                          },
                        }}
                      >
                     
                        <MenuItem value="soundbox">Sound Box</MenuItem>
                        {/* <MenuItem value="swipe">Swipe Machine</MenuItem> */}
                      </Select>
                    </FormControl>
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <Typography
                      variant="subtitle1"
                      className="text-slate-600 font-medium"
                    >
                      Serial Number
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (input) {
                            dispatch(getQ2Data({ id: input, type: deviceType }));
                          }
                        }
                      }}
                      inputProps={{ maxLength: deviceType === "soundbox" ? 15 : undefined }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "rgb(203 213 225)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgb(148 163 184)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "rgb(14 116 144)",
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="h-[50px] p-0 flex items-center justify-end px-[20px]  gap-[10px]">
                <LoadingButton
                  loadingPosition="start"
                  onClick={() => {
                    if (input && deviceType) {
                      dispatch(getQ2Data({ id: input, type: deviceType }));
                    }
                    else{
                      showToast(`Please enter ${deviceType ? "Serial Number" : "Device Type"} `, "error");
                    }
                  }}
                  loading={q2StatementLoading}
                  startIcon={<Icons.search />}
                  variant="contained"
                >
                  Search
                </LoadingButton>
                {/* <div className="flex items-center gap-[5px]">
                  <MuiTooltip title="Download" placement="right">
                    <LoadingButton
                      disabled={!q2Statement || q2Statement?.length === 0}
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
                    </LoadingButton>
                  </MuiTooltip>
                </div> */}
              </CardFooter>
            </Paper>
            {q2Statement && (
              <>
                <Paper elevation={0} className="rounded-md mt-[20px] px-[20px] max-h-[300px] ">
                  <Typography className=" text-slate-600" fontWeight={600} gutterBottom>
                    Device Info
                  </Typography>
                  <Divider />
                  <List>
                    {/* <ListItem>
                      <ListItemText primary="IMEI" secondary={q2Statement?.[0]?.imei || "--"} />
                    </ListItem> */}
                    <ListItem>
                      <ListItemText primary="Serial No." secondary={q2Statement?.[0]?.serial || "--"} />
                    </ListItem>
                     <ListItem>
                      <ListItemText primary="Model Name" secondary={q2Statement?.[0]?.name || "--"} />
                    </ListItem>
                    {/* <ListItem>
                      <ListItemText primary="Manufacturing Month" secondary={q2Statement?.[0]?.manufacturingMonth || "--"} />
                    </ListItem> */}
                  </List>
                </Paper>
              </>
            )}
          </div>
        </div>
        <div className="w-full">
          <Q2ReportTable gridRef={gridRef} />
        </div>
      </div>
    </div>
  );
};

export default Q6Statement;
