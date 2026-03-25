import React from "react";
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { TIME_SLOTS, type ProductionEntry } from "./productionService";

type ProductionReportTabProps = {
  date: Dayjs | null;
  setDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  loadingSearch: boolean;
  onSearch: () => void;
  entries: ProductionEntry[];
  reportRows: Array<Record<string, string>>;
};

const ProductionReportTab: React.FC<ProductionReportTabProps> = ({
  date,
  setDate,
  loadingSearch,
  onSearch,
  entries,
  reportRows,
}) => {
  return (
    <div className="h-full flex bg-white overflow-hidden">
      <div className="w-[400px] border-r border-neutral-300 p-[20px] overflow-auto">
        <Typography variant="h6" sx={{ mb: 2 }}>
          Production Report
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            enableAccessibleFieldDOMStructure={false}
            format="DD-MM-YYYY"
            maxDate={dayjs()}
            value={date}
            onChange={(value) => setDate(value)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
              },
            }}
          />
        </LocalizationProvider>

        <div className="mt-[16px]">
          <Button variant="contained" onClick={onSearch} disabled={loadingSearch} fullWidth>
            {loadingSearch ? "Searching..." : "Search"}
          </Button>
        </div>

        {date && (
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            Showing data for {dayjs(date).format("DD-MM-YYYY")}
          </Typography>
        )}
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <TableContainer component={Paper} sx={{ maxHeight: "100%", overflow: "auto" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>SL.NO</TableCell>
                <TableCell>STAGES</TableCell>
                <TableCell>MANPOWER</TableCell>
                <TableCell>DETAILS</TableCell>
                {TIME_SLOTS.map((slot) => (
                  <TableCell key={slot} align="center">
                    {slot}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4 + TIME_SLOTS.length}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Select a date and click Search to load report.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                reportRows.map((row, index) => (
                  <TableRow key={`${row.stage}-${row.detail}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.stage}</TableCell>
                    <TableCell>{row.manpower}</TableCell>
                    <TableCell>{row.detail}</TableCell>
                    {TIME_SLOTS.map((slot) => (
                      <TableCell key={slot} align="center">
                        {row[slot]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default ProductionReportTab;

