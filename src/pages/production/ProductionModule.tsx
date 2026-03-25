import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import axiosInstance from "@/api/axiosInstance";
import { showToast } from "@/utils/toasterContext";
import ProductionReportTab from "./ProductionReportTab";

type StageConfig = {
  stage: string;
  manpower: number;
  details: string[];
};

type ProductionEntry = {
  stage: string;
  manpower: number;
  detail: string;
  timeSlot: string;
  value: string;
};

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const start = String(i).padStart(2, "0");
  const endNum = i + 1;
  const end = endNum === 24 ? "24" : String(endNum).padStart(2, "0");
  return `${start} TO ${end}`;
});

const STAGE_CONFIG: StageConfig[] = [
  { stage: "CHARGING", manpower: 2, details: ["Charging Ok", "Charging Defect"] },
  { stage: "FLASHING", manpower: 2, details: ["Flashing Ok", "Flashing Defect"] },
  { stage: "IQC", manpower: 3, details: ["IQC Ok(Refurb Line)", "IQC Repair", "IQC Defect"] },
  { stage: "REPAIR", manpower: 7, details: ["Repair OK", "Repair BR"] },
  { stage: "QR REMOVAL", manpower: 1, details: ["OK"] },
  { stage: "VI", manpower: 1, details: ["VI OK", "DEFECT"] },
  { stage: "CLENING", manpower: 10, details: ["QR OK", "QR Defect"] },
  { stage: "FQC", manpower: 2, details: ["OK", "NG"] },
  { stage: "QR PASTING", manpower: 1, details: ["OK", "NG"] },
  { stage: "CLIP STICKER", manpower: 2, details: ["OK", "NG"] },
  { stage: "SERIAL NO", manpower: 1, details: ["OK", "NG"] },
];

type FetchPayload = {
  startDate: string; // DD-MM-YYYY
  endDate: string; // DD-MM-YYYY
  page?: number;
  limit?: number;
};

const extractRecords = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.data?.records)) return payload.data.records;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const toTrimmedString = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  return "";
};

const fetchProductionEntriesByDate = async (payload: FetchPayload): Promise<ProductionEntry[]> => {
  const page = payload.page ?? 1;
  const limit = payload.limit ?? 10000;

  // Mirrors the R1 report convention: /report/r1/DATE?startDate=&endDate=&module=&page=&limit=
  const response = await axiosInstance.get(
    `/report/fetchProductionData/DATE?startDate=${payload.startDate}&endDate=${payload.endDate}&page=${page}&limit=${limit}`,
  );

  const records = extractRecords(response.data?.data ?? response.data);
  const out: ProductionEntry[] = [];

  for (const r of records) {
    const stage = toTrimmedString(r?.stage);
    const detail = toTrimmedString(r?.detail);
    const timeSlot = toTrimmedString(r?.timeSlot ?? r?.time_slot);
    const value = toTrimmedString(r?.value ?? r?.val);

    // Shape 1: flat records [{ stage, detail, timeSlot, value, manpower? }, ...]
    if (stage && detail && timeSlot && value) {
      const manpower =
        typeof r?.manpower === "number"
          ? r.manpower
          : STAGE_CONFIG.find((x) => x.stage === stage)?.manpower ?? 0;

      out.push({ stage, manpower, detail, timeSlot, value });
      continue;
    }

    // Shape 2: excel-like records [{ stage, detail, manpower?, "8 TO 9": "...", ... }, ...]
    const manpower =
      typeof r?.manpower === "number"
        ? r.manpower
        : STAGE_CONFIG.find((x) => x.stage === stage)?.manpower ?? 0;

    if (stage && detail) {
      for (const slot of TIME_SLOTS) {
        const cellValue = toTrimmedString(r?.[slot]);
        if (!cellValue) continue;
        out.push({ stage, manpower, detail, timeSlot: slot, value: cellValue });
      }
    }
  }

  return out;
};

const buildReportRows = (entries: ProductionEntry[]): Array<Record<string, string>> => {
  const lookup = new Map<string, string>();
  for (const e of entries) {
    lookup.set(`${e.stage}|${e.detail}|${e.timeSlot}`, e.value);
  }

  const rows: Array<Record<string, string>> = [];
  for (const config of STAGE_CONFIG) {
    for (const d of config.details) {
      const row: Record<string, string> = {
        stage: config.stage,
        manpower: String(config.manpower),
        detail: d,
      };

      for (const slot of TIME_SLOTS) {
        row[slot] = lookup.get(`${config.stage}|${d}|${slot}`) ?? "";
      }

      rows.push(row);
    }
  }

  return rows;
};

const ProductionModule: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [stage, setStage] = useState(STAGE_CONFIG[0].stage);
  const [manpower, setManpower] = useState(STAGE_CONFIG[0].manpower);
  const [detail, setDetail] = useState(STAGE_CONFIG[0].details[0]);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [value, setValue] = useState("");
  const [entries, setEntries] = useState<ProductionEntry[]>([]);

  const selectedStage = useMemo(
    () => STAGE_CONFIG.find((item) => item.stage === stage) ?? STAGE_CONFIG[0],
    [stage]
  );

  const reportRows = useMemo(() => buildReportRows(entries), [entries]);

  const existingValue = useMemo(() => {
    return entries.find((e) => e.stage === stage && e.detail === detail && e.timeSlot === timeSlot)?.value ?? "";
  }, [entries, stage, detail, timeSlot]);

  useEffect(() => {
    setValue(existingValue);
  }, [existingValue]);

  const handleStageChange = (nextStage: string) => {
    const next = STAGE_CONFIG.find((item) => item.stage === nextStage) ?? STAGE_CONFIG[0];
    setStage(next.stage);
    setManpower(next.manpower);
    setDetail(next.details[0]);
  };

  const handleSearch = async () => {
    if (!date) {
      showToast("Please select date", "error");
      return;
    }

    setLoadingSearch(true);
    try {
      const formatted = dayjs(date).format("DD-MM-YYYY");
      const data = await fetchProductionEntriesByDate({
        startDate: formatted,
        endDate: formatted,
        page: 1,
        limit: 10000,
      });
      setEntries(data);
    } catch (e) {
      console.error(e);
      setEntries([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleAddOrUpdate = () => {
    if (!date) {
      showToast("Please select date first", "error");
      return;
    }
    if (!value.trim()) {
      showToast("Please enter value / remarks", "warning");
      return;
    }

    setEntries((prev) => {
      const filtered = prev.filter((e) => !(e.stage === stage && e.detail === detail && e.timeSlot === timeSlot));
      return [...filtered, { stage, manpower, detail, timeSlot, value: value.trim() }];
    });
    showToast("Updated locally for the selected date", "success");
  };

  return (
    <div className="h-[calc(100vh-50px)] bg-white overflow-hidden">
      <div className="border-b border-neutral-200 px-2">
        <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="fullWidth">
          <Tab label="Add Production Data" />
          <Tab label="Production Report" />
        </Tabs>
      </div>

      {tab === 0 ? (
        <div className="p-4">
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
                      textField: {
                        fullWidth: true,
                        size: "small",
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

              <div>
                <Button variant="contained" onClick={handleSearch} disabled={loadingSearch}>
                  {loadingSearch ? "Searching..." : "Search"}
                </Button>
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

              <TextField label="Value / Remarks" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>

            <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddOrUpdate}>
              Add / Update
            </Button>
          </Paper>
        </div>
      ) : (
        <ProductionReportTab
          date={date}
          setDate={setDate}
          loadingSearch={loadingSearch}
          onSearch={handleSearch}
          entries={entries}
          reportRows={reportRows}
        />
      )}
    </div>
  );
};

export default ProductionModule;
