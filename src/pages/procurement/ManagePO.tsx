import React, { useEffect, useState } from "react";
import { Typography, TextField, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getListofPo } from "@/features/procurement/poSlices";

const PHONEPE_PURPLE = "#5F259F";

const ManagePO: React.FC = () => {
  const dispatch = useAppDispatch();
  const { managePoData, loading } = useAppSelector((state) => state.po);
  const [poSearch, setPoSearch] = useState("");
  const [type, setType] = useState<"datewise" | "powise">("datewise");
  const dataStr =
    type === "datewise"
      ? new Date().toISOString().slice(0, 10)
      : poSearch;

  useEffect(() => {
    dispatch(
      getListofPo({
        wise: type,
        data: dataStr,
        limit: 20,
        page: 1,
      })
    );
  }, [dispatch, type, dataStr]);

  const list = Array.isArray(managePoData)
    ? managePoData
    : (managePoData as { data?: unknown[] })?.data ?? [];

  return (
    <div className="p-6 bg-white h-full overflow-auto">
      <Typography variant="h1" className="text-slate-600" fontSize={22} fontWeight={500}>
        Manage PO
      </Typography>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <TextField
          size="small"
          placeholder="Search PO..."
          value={poSearch}
          onChange={(e) => setPoSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: "#94a3b8", mr: 1 }} fontSize="small" />
            ),
          }}
          sx={{ minWidth: 280 }}
        />
        <Button
          variant="contained"
          sx={{
            backgroundColor: PHONEPE_PURPLE,
            "&:hover": { backgroundColor: "#4a1d7a" },
          }}
          onClick={() => {
            setType("powise");
            dispatch(
              getListofPo({
                wise: "powise",
                data: poSearch,
                limit: 20,
                page: 1,
              })
            );
          }}
        >
          Search
        </Button>
      </div>
      <div className="mt-6 border border-neutral-200 rounded-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            {list.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">PO No.</th>
                    <th className="px-4 py-2">Vendor</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(list as Record<string, unknown>[]).slice(0, 20).map((row: Record<string, unknown>, i: number) => (
                    <tr key={i} className="border-t border-neutral-200">
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">{String(row.po_transaction ?? row.po_no ?? "-")}</td>
                      <td className="px-4 py-2">{String(row.vendor_name ?? row.vendor_id ?? "-")}</td>
                      <td className="px-4 py-2">{String(row.po_reg_date ?? "-")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500">
                No PO data. Same API as BharatPayFE: /po/fetchPendingData4PO
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePO;
