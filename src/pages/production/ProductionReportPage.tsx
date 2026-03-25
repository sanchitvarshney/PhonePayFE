import React, { useMemo, useState } from "react";
import { fetchProductionR4EntriesByDate, buildProductionReportRows, type ProductionEntry } from "./productionService";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import ProductionReportTab from "./ProductionReportTab";
import { showToast } from "@/utils/toasterContext";

const ProductionReportPage: React.FC = () => {
  const [date, setDate] = useState<Dayjs | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [entries, setEntries] = useState<ProductionEntry[]>([]);

  const reportRows = useMemo(() => buildProductionReportRows(entries), [entries]);

  const handleSearch = async () => {
    if (!date) {
      showToast("Please select date", "error");
      return;
    }

    setLoadingSearch(true);
    try {
      const formatted = dayjs(date).format("DD-MM-YYYY");
      const data = await fetchProductionR4EntriesByDate({
        startDate: formatted,
        endDate: formatted,
        module: "PRODUCTION",
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

  return (
    <ProductionReportTab
      date={date}
      setDate={setDate}
      loadingSearch={loadingSearch}
      onSearch={handleSearch}
      entries={entries}
      reportRows={reportRows}
    />
  );
};

export default ProductionReportPage;

