import React, { useCallback, useRef, useState } from "react";
import { DatePicker } from "antd";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dayjs, { Dayjs } from "dayjs";
import { AgGridReact } from "@ag-grid-community/react";
import R3ReportTable from "@/table/report/R3ReportTable";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { showToast } from "@/utils/toasterContext";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getr3Report } from "@/features/report/report/reportSlice";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PersonIcon from "@mui/icons-material/Person";
import R3ReportDetailsTable from "@/table/report/R3ReportDetailsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { rangePresets } from "@/utils/rangePresets";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import MuiTooltip from "@/components/reusable/MuiTooltip";
import { useSocketContext } from "@/components/context/SocketContext";
import SelectComponent, { ComponentType } from "@/components/reusable/SelectComponent";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;

const R3Report: React.FC = () => {
  const [colapse, setcolapse] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { r3reportLoading, r3ReportDetail, r3ReportDetailLoading, r3report } =
    useAppSelector((state) => state.report);
  const [filter, setFilter] = useState<string>("partwise");
const [component, setComponent] = useState<ComponentType | null>(null);
  const { emitDownloadR3Report, isConnected } = useSocketContext();
  const [date, setDate] = useState<{ from: Dayjs | null; to: Dayjs | null }>({
    from: null,
    to: null,
  });
  const [open, setOpen] = React.useState(false);
  const [pageSize, setPageSize] = useState<number>(20);

  const handleClose = () => {
    setOpen(false);
  };
  const gridRef = useRef<AgGridReact<any>>(null);

  const handleDateChange = (range: [Dayjs | null, Dayjs | null] | null) => {
    if (range) {
      setDate({ from: range[0], to: range[1] });
    } else {
      setDate({ from: null, to: null });
    }
  };
  const downloadr3report = () => {
    // if (filter === "DEVICE") {
    //   if (!component)
    //     return showToast("Please select a device and device type", "error");
    //   emitDownloadR3Report({
    //     deviceId: device?.id,
    //     deviceType: deviceType === "soundbox" ? "soundBox" : "swipeMachine",
    //   });
    // } else {
      if (!date.from || !date.to)
        return showToast("Please select a date", "error");
      emitDownloadR3Report({
        type: "datewise",
        fromDate: date.from?.format("DD-MM-YYYY"),
        toDate: date.to?.format("DD-MM-YYYY"),
       
      });

  };
  const onBtExport = useCallback(() => {
    gridRef.current!.api.exportDataAsExcel({
      sheetName: "R3 Report", // Set your desired sheet name here
    });
  }, []);

  const handlePageChange = (page: number) => {
    if(filter === "DATE"){
    dispatch(
      getr3Report({
        type: "DATE",
        from: dayjs(date.from).format("DD-MM-YYYY"),
        to: dayjs(date.to).format("DD-MM-YYYY"),
        limit: pageSize,
        page: page,
      })
    );
  }
  else{
    dispatch(
      getr3Report({
        type: "partwise",
        limit: pageSize,
        page: page,
      })
    );
  }
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    if(filter === "DATE"){
    dispatch(
      getr3Report({
        type: "DATE",
        from: dayjs(date.from).format("DD-MM-YYYY"),
        to: dayjs(date.to).format("DD-MM-YYYY"),
        page: 1,
        limit: pageSize,
      })
    );
  }
  else{
    dispatch(
      getr3Report({
        type: "partwise",
        page: 1,
        limit: pageSize,
      })
    );
  }
  };
  return (
    <>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <div className="border-b h-[50px] border-neutral-300 bg-neutral-200 flex items-center px-[20px]">
          <IconButton
            size="small"
            edge="start"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Typography
            sx={{ ml: 2, flex: 1 }}
            variant="h6"
            component="div"
            fontWeight={500}
            fontSize={18}
          >
            {r3ReportDetail &&
              `#${
                r3ReportDetail?.productionData?.productImei !== "--"
                  ? r3ReportDetail?.productionData?.productImei
                  : r3ReportDetail?.productionData?.productSrlNo
              }`}

            {r3ReportDetailLoading && (
              <Skeleton className="h-[30px] w-[300px]" />
            )}
          </Typography>
        </div>
        <div className="h-full grid grid-cols-[400px_1fr] w-full ">
          <div className="h-full border-r border-neutral-300">
            <List
              sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
            >
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <LocationCityIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Pick Location"
                  secondary={
                    <>
                      {r3ReportDetailLoading ? (
                        <Skeleton className="h-[15px] w-[100px]" />
                      ) : (
                        r3ReportDetail?.productionData?.productionLocation
                      )}
                    </>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <ShareLocationIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Drop Location"
                  secondary={
                    <>
                      {r3ReportDetailLoading ? (
                        <Skeleton className="h-[15px] w-[130px]" />
                      ) : (
                        r3ReportDetail?.productionData?.dropLocation
                      )}
                    </>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <DateRangeIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Insert Date"
                  secondary={
                    <>
                      {r3ReportDetailLoading ? (
                        <Skeleton className="h-[15px] w-[150px]" />
                      ) : (
                        r3ReportDetail?.productionData?.insertDate
                      )}
                    </>
                  }
                />
              </ListItem>

              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Insert By"
                  secondary={
                    <>
                      {r3ReportDetailLoading ? (
                        <Skeleton className="h-[15px] w-[100px]" />
                      ) : (
                        r3ReportDetail?.productionData?.insertBy
                      )}
                    </>
                  }
                />
              </ListItem>
            </List>
          </div>
          <div className="h-full ">
            <R3ReportDetailsTable />
          </div>
        </div>
      </Dialog>
      <div className="bg-white h-[calc(100vh-100px)] flex relative">
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
          <div className="flex  gap-[20px] flex-col   p-[20px] overflow-hidden mt-[20px]">
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Filter By</InputLabel>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Filter By"
              >
                <MenuItem value={"partwise"}>Part</MenuItem>
                <MenuItem value={"datewise"}>Date</MenuItem>
              </Select>
            </FormControl>
      
            {filter === "partwise" && (
              <SelectComponent value={component} onChange={setComponent} />
            )}
            {filter === "datewise" && (
              <RangePicker
                className="w-full h-[55px] border-2 rounded-lg border-neutral-300 rounded-0 "
                presets={rangePresets}
                onChange={handleDateChange}
                disabledDate={(current) => current && current > dayjs()}
                placeholder={["Start date", "End Date"]}
                value={date.from && date.to ? [date.from, date.to] : null}
                format="DD/MM/YYYY"
              />
            )}
            <div className="flex justify-between itesms-center">
              <div className="flex gap-[10px]">
                <LoadingButton
                  loading={r3reportLoading}
                  variant="contained"
                  startIcon={<Icons.search fontSize="small" />}
                  loadingPosition="start"
                  onClick={() => {
                    if (filter === "partwise") {
                      if (!component) {
                        showToast(
                          "Please select a device and device type",
                          "error"
                        );
                      } else {
                        dispatch(
                          getr3Report({
                            type: "partwise",
                            data: component?.id,
                            limit: pageSize,
                            page: 1,
                          })
                        );
                      }
                    }
                    if (filter === "datewise") {
                      if (!date.from || !date.to) {
                        showToast("Please select a date", "error");
                      } else {
                        dispatch(
                          getr3Report({
                            type: "datewise",
                            from: dayjs(date.from).format("DD-MM-YYYY"),
                            to: dayjs(date.to).format("DD-MM-YYYY"),
                            limit: pageSize,
                            page: 1,
                          })
                        );
                      }
                    }
                  }}
                >
                  Search
                </LoadingButton>
                <LoadingButton
                  disabled={!isConnected}
                  onClick={downloadr3report}
                  variant="contained"
                  startIcon={<Icons.download fontSize="small" />}
                >
                  Download Report
                </LoadingButton>
              </div>
              <MuiTooltip title="Download" placement="right">
                <LoadingButton
                  variant="contained"
                  disabled={!r3report}
                  onClick={onBtExport}
                  color="primary"
                  style={{
                    borderRadius: "50%",
                    width: 30,
                    height: 30,
                    minWidth: 0,
                    padding: 0,
                  }}
                  size="small"
                  sx={{ zIndex: 1 }}
                >
                  <Icons.download fontSize="small" />
                </LoadingButton>
              </MuiTooltip>
            </div>
          </div>
        </div>
        <div className="w-full ">
          <R3ReportTable
            setOpen={setOpen}
            gridRef={gridRef}
            handlePageChange={handlePageChange}
            handlePageSizeChange={handlePageSizeChange}
            pageSize={pageSize}
          />
        </div>
      </div>
    </>
  );
};

export default R3Report;
