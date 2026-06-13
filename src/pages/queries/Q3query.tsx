import { CardFooter } from "@/components/ui/card";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getQ3Data } from "@/features/query/query/querySlice";
import { getPertCodesync } from "@/features/production/MaterialRequestWithoutBom/MRRequestWithoutBomSlice";
import { RowData } from "@/features/query/query/queryType";
import { AgGridReact } from "@ag-grid-community/react";


import {
  CardContent,
  Divider,
  FormControl,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import SelectComponent, {
  ComponentType,
} from "@/components/reusable/SelectComponent";
import SelectLocation, {
  LocationType,
} from "@/components/reusable/SelectLocation";
import LoadingButton from "@mui/lab/LoadingButton";
import SearchIcon from "@mui/icons-material/Search";
import FilterIcon from "@mui/icons-material/Filter";
import { showToast } from "@/utils/toasterContext";
import MuiTooltip from "@/components/reusable/MuiTooltip";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { rangePresets } from "@/utils/rangePresets";
import { formatNumber } from "@/utils/numberFormatUtils";
import { Download } from "@mui/icons-material";
import { useSocketContext } from "@/components/context/SocketContext";
import Q3ReportTable from "@/table/queryTables/Q3ReportTable";
dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;
const Q3query: React.FC = () => {
   const { emitDownloadQ3Report} = useSocketContext();
  const [colapse, setcolapse] = useState<boolean>(false);
  const [date, setDate] = useState<{ from: Dayjs | null; to: Dayjs | null }>({
    from: null,
    to: null,
  });
  const [filterType, setFilterType] = useState<string>("DATE");
  const gridRef = useRef<AgGridReact<RowData>>(null);
  const dispatch = useAppDispatch();
  const { q3Data, getQ3DataLading } = useAppSelector((state) => state.query);
  const [value, setValue] = useState<ComponentType | null>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [pageSize, setPageSize] = useState(20);

  const handleDateChange = (range: [Dayjs | null, Dayjs | null] | null) => {
    if (range) {
      setDate({ from: range[0], to: range[1] });
    } else {
      setDate({ from: null, to: null });
    }
  };

  const onBtExport = useCallback(() => {
    gridRef.current!.api.exportDataAsExcel();
  }, []);

  useEffect(() => {
    // dispatch(getQ1Data());
    dispatch(getPertCodesync(null));
  }, []);

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
                <div className="py-[20px] flex flex-col gap-[20px]">
                  <FormControl fullWidth>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <MenuItem value="DATE">Date</MenuItem>
                      <MenuItem value="LOCATION">Location</MenuItem>
                    </Select>
                  </FormControl>
                  <div>
                    <SelectComponent
                      value={value}
                      onChange={(e) => setValue(e)}
                      label="-- Part --"
                    />
                  </div>
                  <div className="">
                    {filterType === "DATE" ? (
                      <RangePicker
                        className="w-full h-[50px] border-[2px] rounded-sm "
                        presets={rangePresets}
                        onChange={handleDateChange}
                        disabledDate={(current) => current && current > dayjs()}
                        placeholder={["Start date", "End Date"]}
                        value={
                          date.from && date.to ? [date.from, date.to] : null
                        } // Set value based on `from` and `to`
                        format="DD/MM/YYYY" // Update with your desired format
                      />
                    ) : (
                      <SelectLocation
                        value={location}
                        onChange={(e) => setLocation(e)}
                        label="-- Location --"
                      />
                    )}
                  </div>
                </div>
               
              </CardContent>

              <CardFooter className="h-[50px] p-0 flex items-center justify-between px-[20px]  gap-[10px]">
                <LoadingButton
                  variant="contained"
                  loadingPosition="start"
                  loading={getQ3DataLading}
                  onClick={() => {
                    if (value && (date || location)) {
                      dispatch(
                        getQ3Data({
                          date: date
                            ? `${dayjs(date.from).format(
                                "DD-MM-YYYY"
                              )}_to_${dayjs(date.to).format("DD-MM-YYYY")}`
                            : null,
                          value: value.id,
                          location: location ? location.id : null,
                          page: 1,
                          limit: pageSize,
                        })
                      ).then((res: any) => {
                        if (!res.payload?.data?.success) {
                          // showToast(res.payload?.data?.message, "error");
                        }
                      });
                    } else {
                      showToast("Please select required fields", "error");
                    }
                  }}
                  type="submit"
                  startIcon={<SearchIcon fontSize="small" />}
                >
                  Search
                </LoadingButton>
                 <LoadingButton
                  variant="outlined"
              
               
                  onClick={() => {
                    if (value && (date || location)) {
                      const payload = {
                           date: date
                            ? `${dayjs(date.from).format(
                                "DD-MM-YYYY"
                              )}_to_${dayjs(date.to).format("DD-MM-YYYY")}`
                            : null,
                          data: value.id,
                          location: location ? location.id : null,
                          type: filterType.toLowerCase(),
                      }
                 
                      emitDownloadQ3Report(payload);
                    
                    } else {
                      showToast("Please select required fields", "error");
                    }
                  }}
                  type="submit"
                  startIcon={<Download fontSize="small" />}
                >
                  Download
                </LoadingButton>

                <div className="flex items-center gap-[5px]">
                  <MuiTooltip title="Download" placement="right">
                    <LoadingButton
                      disabled={!q3Data || q3Data.body.length === 0}
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
                  <IconButton disabled color="warning">
                    <FilterIcon />
                  </IconButton>
                </div>
              </CardFooter>
            </Paper>
            {q3Data && (
              <>
                <Paper
                  elevation={0}
                  className="rounded-md mt-[20px] px-[20px] "
                >
                  <Typography
                    className=" text-slate-600"
                    fontWeight={600}
                    gutterBottom
                  >
                    Device Info
                  </Typography>
                  <Divider />
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Name"
                        secondary={q3Data?.head?.name || "--"}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Part Code"
                        secondary={q3Data?.head?.code || "--"}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="UOM"
                        secondary={q3Data?.head?.uom || "--"}
                      />
                    </ListItem>
                  </List>
                </Paper>
                <Paper elevation={0} className="rounded-md px-[20px] ">
                  <Typography
                    className=" text-slate-600"
                    fontWeight={600}
                    gutterBottom
                  >
                    Stock Summary
                  </Typography>
                  <Divider />
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Opening Qty"
                        secondary={
                          formatNumber(q3Data?.head?.openingQty) || "--"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Closing Qty"
                        secondary={
                          formatNumber(q3Data?.head?.closingQty) || "--"
                        }
                      />
                    </ListItem>
                  </List>
                </Paper>
              </>
            )}
          </div>
        </div>
        <div className="w-full">
          <Q3ReportTable
            gridRef={gridRef}
            pageSize={pageSize}
            handlePageChange={(page: number) => {
              if (value && (date || location)) {
                dispatch(
                  getQ3Data({
                    date: date
                      ? `${dayjs(date.from).format("DD-MM-YYYY")}_to_${dayjs(
                          date.to
                        ).format("DD-MM-YYYY")}`
                      : null,
                    value: value.id,
                    location: location ? location.id : null,
                    page: page,
                    limit: pageSize,
                  })
                );
              }
            }}
            handlePageSizeChange={(newPageSize: number) => {
              setPageSize(newPageSize);
              if (value && (date || location)) {
                dispatch(
                  getQ3Data({
                    date: date
                      ? `${dayjs(date.from).format("DD-MM-YYYY")}_to_${dayjs(
                          date.to
                        ).format("DD-MM-YYYY")}`
                      : null,
                    value: value.id,
                    location: location ? location.id : null,
                    page: 1,
                    limit: newPageSize,
                  })
                );
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Q3query;
