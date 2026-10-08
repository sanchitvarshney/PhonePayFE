import React from "react";
import Barcode from "@/components/reusable/Barcode";
import { MasterCartonDetails } from "@/features/masterCarton/masterCartonType";

export const STICKER_LOGO_SRC = "/images/PhonePeIcon.jpg";

const ROWS: { label: string; key: keyof MasterCartonDetails; suffix?: string }[] = [
  { label: "Product", key: "product" },
  { label: "Color", key: "color" },
  { label: "MFG Date", key: "mfgDate" },
  { label: "Quantity", key: "quantity" },
  { label: "Gross Weight", key: "grossWeight", suffix: " KG" },
];

type Props = {
  details: MasterCartonDetails;
};


const MasterCartonSticker: React.FC<Props> = ({ details }) => (
  <div
    className="w-[100mm] h-[75mm] box-border p-[2mm] bg-white text-black overflow-hidden"
    style={{
      fontFamily: "Arial, Helvetica, sans-serif",
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    }}
  >
    <div className="h-full flex flex-col border-[0.4mm] border-black overflow-hidden">
      <div className="relative h-[10mm] shrink-0 flex items-center justify-center border-b-[0.4mm] border-black">
        <span className="text-[3.6mm] font-bold tracking-[0.6mm] leading-none">MASTER CARTON</span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {ROWS.map(({ label, key, suffix }) => {
          const value = details[key];
          return (
            <div key={key} className="flex-1 min-h-[4.6mm] flex border-b-[0.25mm] border-black">
              <div className="w-[45mm] shrink-0 flex items-center px-[2mm] border-r-[0.25mm] border-black text-[2.9mm] font-semibold uppercase leading-tight">
                {label}
              </div>
              <div className="flex-1 min-w-0 flex items-center px-[2mm] leading-tight text-[3.3mm] font-bold">
                <span className="line-clamp-2 break-words  ">{value ? `${value}${suffix ?? ""}` : "—"}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-[23mm] shrink-0 flex flex-col items-center justify-center gap-[1mm]">
        <span className="text-[2.9mm] font-semibold uppercase tracking-[0.4mm] leading-none">Carton ID</span>
        {details.cartonId ? (
          <>
            <Barcode value={details.cartonId} height="12mm" moduleMm={0.375} maxWidthMm={94} />
            <span className="text-[3.4mm] font-bold tracking-[0.5mm] leading-none">{details.cartonId}</span>
          </>
        ) : (
          <span className="text-[2.8mm] text-neutral-500">Carton number is issued on print</span>
        )}
      </div>
    </div>
  </div>
);

export default React.memo(MasterCartonSticker);
