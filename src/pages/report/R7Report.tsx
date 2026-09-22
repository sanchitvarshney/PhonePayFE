import { useSocketContext } from "@/components/context/SocketContext";
import { Icons } from "@/components/icons";
import SelectSku, { DeviceType } from "@/components/reusable/SelectSku";
import { rangePresets } from "@/utils/rangePresets";
import { showToast } from "@/utils/toasterContext";
import { Button, Card, Typography } from "@mui/material";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";
const { RangePicker } = DatePicker;
const R4Report: React.FC = () => {
  const { emitDownloadReport, isConnected } = useSocketContext();
  const [device, setDevice] = useState<DeviceType | null>(null);
  const [date, setDate] = useState<{ from: Dayjs | null; to: Dayjs | null }>({
    from: null,
    to: null,
  });
  const handleDateChange = (range: [Dayjs | null, Dayjs | null] | null) => {
    if (range) {
      setDate({ from: range[0], to: range[1] });
    } else {
      setDate({ from: null, to: null });
    }
  };
  const downloadReport = () => {
    if (!device) return showToast("Please select a device", "error");
    if (!date.from || !date.to)
      return showToast("Please select date range", "error");
    const reportPayload = {
      fromDate: date.from?.format("DD-MM-YYYY"),
      toDate: date.to?.format("DD-MM-YYYY"),
      device: device?.deviceKey ?? device?.device_key ?? device?.key ?? device?.id,
    };
    emitDownloadReport(reportPayload);
    showToast("Start downloading ", "success");
  };

  return (
    <div className="flex items-center justify-center h-full bg-white">
      <Card
        elevation={1}
        className="p-[20px] flex flex-col gap-[20px] w-[400px]"
      >
        <div className="mb-[20px] text-center">
          <Typography variant="h1" fontSize={20} fontWeight={500}>
            Download Consumption Detail Report
          </Typography>
        </div>
        <Typography
          variant="h3"
          fontSize={14}
          fontWeight={400}
          className="text-center"
        >
          This report provides consumption details based on date and device.
        </Typography>
        <SelectSku
          varient="outlined"
          skuType="soundBox"
          value={device}
          onChange={setDevice}
          label="-- Device --"
        />
        <RangePicker
          className="w-full h-[50px] border-[2px] rounded-sm "
          presets={rangePresets}
          onChange={handleDateChange}
          disabledDate={(current) => current && current > dayjs()}
          placeholder={["Start date", "End Date"]}
          value={date.from && date.to ? [date.from, date.to] : null} // Set value based on `from` and `to`
          format="DD/MM/YYYY" // Update with your desired format
        />
        <Button
          disabled={!isConnected}
          onClick={downloadReport}
          variant="contained"
          startIcon={<Icons.download fontSize="small" />}
        >
          Download
        </Button>
      </Card>
    </div>
  );
};

export default R4Report;
