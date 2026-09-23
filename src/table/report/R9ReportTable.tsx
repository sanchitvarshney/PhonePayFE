import React from "react";
import { Button, Skeleton, Typography } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { useAppSelector } from "@/hooks/useReduxHook";
import { formatNumber } from "@/utils/numberFormatUtils";

type Props = {
  onView: (stage: { stage: string; transaction_type: string; qty: string }) => void;
};

const R9ReportTable: React.FC<Props> = ({ onView }) => {
  const { r9Report, r9ReportLoading } = useAppSelector((state) => state.report);
  const deviceQty = r9Report?.data?.deviceQty || [];

  if (r9ReportLoading) {
    return (
      <div className="p-[20px] flex flex-wrap gap-[10px]">
        {[1, 2, 3, 4].map((key) => (
          <Skeleton key={key} className="w-[220px] min-h-[130px]" />
        ))}
      </div>
    );
  }

  if (!r9Report) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <img src="/search.webp" alt="" className="w-[300px] opacity-50" />
      </div>
    );
  }

  return (
    <div className="p-[20px] flex flex-wrap gap-[15px]">
      {deviceQty.map((item: any) => (
        <div
          key={item.transaction_type}
          className="w-[220px] min-h-[130px] rounded border bg-slate-50 flex flex-col gap-[10px] justify-center items-center p-[15px]"
        >
          <Typography fontWeight={500}>{item.stage}</Typography>
          <Typography fontWeight={600} fontSize={24} className="text-slate-600">
            {formatNumber(Number(item.qty))}
          </Typography>
          <Button
            onClick={() => onView(item)}
            variant="contained"
            size="small"
            startIcon={<FullscreenIcon fontSize="small" />}
          >
            View
          </Button>
        </div>
      ))}
    </div>
  );
};

export default R9ReportTable;
