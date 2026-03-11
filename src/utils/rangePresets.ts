import dayjs, { Dayjs } from "dayjs";

export type RangePreset = { label: string; value: [Dayjs, Dayjs] };

export const rangePresets: RangePreset[] = [
  { label: "Today", value: [dayjs().startOf("day"), dayjs()] },
  { label: "Yesterday", value: [dayjs().add(-1, "d"), dayjs()] },
  { label: "Last 7 Days", value: [dayjs().add(-7, "d"), dayjs()] },
  { label: "Last 14 Days", value: [dayjs().add(-14, "d"), dayjs()] },
  { label: "Current Month", value: [dayjs().startOf("month"), dayjs()] },
  {
    label: "Previous Month",
    value: [
      dayjs().subtract(1, "month").startOf("month"),
      dayjs().subtract(1, "month").endOf("month"),
    ],
  },
  {
    label: "Last 3 Months",
    value: [dayjs().subtract(3, "month").startOf("month"), dayjs()],
  },
];
