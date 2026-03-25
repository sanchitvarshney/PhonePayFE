import React, { useMemo, useState } from "react";
import { Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import { STAGE_CONFIG, TIME_SLOTS, saveProductionDummy } from "./productionService";
import { showToast } from "@/utils/toasterContext";

const ProductionAddDataPage: React.FC = () => {
  const [date, setDate] = useState<Dayjs | null>(null);
  const [saving, setSaving] = useState(false);

  const [stage, setStage] = useState(STAGE_CONFIG[0].stage);
  const [manpower, setManpower] = useState(STAGE_CONFIG[0].manpower);
  const [detail, setDetail] = useState(STAGE_CONFIG[0].details[0]);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [value, setValue] = useState("");

  const selectedStage = useMemo(
    () => STAGE_CONFIG.find((item) => item.stage === stage) ?? STAGE_CONFIG[0],
    [stage]
  );

  const handleStageChange = (nextStage: string) => {
    const next = STAGE_CONFIG.find((item) => item.stage === nextStage) ?? STAGE_CONFIG[0];
    setStage(next.stage);
    setManpower(next.manpower);
    setDetail(next.details[0]);
    // Reset for better UX (avoid wrong detail->slot mapping)
    setTimeSlot(TIME_SLOTS[0]);
  };

  const handleAddOrUpdate = () => {
    if (!date) {
      showToast("Please select date first", "error");
      return;
    }

    const formatted = dayjs(date).format("DD-MM-YYYY");
    const valueToSend = value.trim();

    setSaving(true);
    saveProductionDummy({
      date: formatted,
      stage,
      manpower,
      detail,
      timeSlot,
      value: valueToSend || undefined,
    })
      .then(() => {
        showToast("Saved successfully (dummy endpoint)", "success");
        setValue("");
      })
      .catch((e) => {
        console.error(e);
        showToast("Dummy save failed. Replace endpoint with real API.", "error");
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="h-full p-[20px]">
        <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add Production Data
        </Typography>

        <div className="flex flex-col gap-[12px] md:flex-row md:items-end md:justify-between mb-[16px]">
          <div style={{ width: 280, maxWidth: "100%" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                enableAccessibleFieldDOMStructure={false}
                format="DD-MM-YYYY"
                maxDate={dayjs()}
                value={date}
                onChange={(value) => setDate(value)}
                slotProps={{
                  textField: { fullWidth: true, size: "small" },
                }}
              />
            </LocalizationProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <TextField select label="Stages" value={stage} onChange={(e) => handleStageChange(e.target.value)}>
            {STAGE_CONFIG.map((item) => (
              <MenuItem key={item.stage} value={item.stage}>
                {item.stage}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Manpower"
            type="number"
            value={manpower}
            onChange={(e) => setManpower(Number(e.target.value))}
          />

          <TextField select label="Details" value={detail} onChange={(e) => setDetail(e.target.value)}>
            {selectedStage.details.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>

          <TextField select label="Time Slot" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
            {TIME_SLOTS.map((slot) => (
              <MenuItem key={slot} value={slot}>
                {slot}
              </MenuItem>
            ))}
          </TextField>

          <TextField label="Value / Remarks (Optional)" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>

        <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddOrUpdate} disabled={saving}>
          {saving ? "Saving..." : "Add / Update"}
        </Button>
      </Paper>
    </div>
  );
};

export default ProductionAddDataPage;

