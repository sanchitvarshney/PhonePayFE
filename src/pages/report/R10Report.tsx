import { useSocketContext } from "@/components/context/SocketContext";
import { Icons } from "@/components/icons";
import SelectLocation, { LocationType } from "@/components/reusable/SelectLocation";
import SelectSku, { DeviceType } from "@/components/reusable/SelectSku";
import { rangePresets } from "@/utils/rangePresets";
import { showToast } from "@/utils/toasterContext";
import { Button, Card, Typography } from "@mui/material";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";
const { RangePicker } = DatePicker;

const R10Report: React.FC = () => {
  const { emitDownloadR10Report, isConnected } = useSocketContext();
  const [device, setDevice] = useState<DeviceType | null>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
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
    if (!location) return showToast("Please select a location", "error");
    if (!date.from || !date.to)
      return showToast("Please select date range", "error");

    const reportPayload = {
      startDate: date.from.format("DD-MM-YYYY"),
      endDate: date.to.format("DD-MM-YYYY"),
      device_key: device?.deviceKey ?? device?.device_key ?? device?.key ?? device?.id,
      location: location.id,
    };
    emitDownloadR10Report(reportPayload);
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
            Download Device On Location Report
          </Typography>
        </div>
        <SelectSku
          varient="outlined"
          skuType="soundBox"
          value={device}
          onChange={setDevice}
          label="-- Device --"
        />
        <SelectLocation
          value={location}
          onChange={setLocation}
          label="-- Location --"
        />
        <RangePicker
          className="w-full h-[50px] border-[2px] rounded-sm "
          presets={rangePresets}
          onChange={handleDateChange}
          disabledDate={(current) => current && current > dayjs()}
          placeholder={["Start date", "End Date"]}
          value={date.from && date.to ? [date.from, date.to] : null}
          format="DD/MM/YYYY"
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

export default R10Report;
