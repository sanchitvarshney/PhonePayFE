import LocationAllotEditDrawer from "@/components/Drawers/locationAllotement/LocationAllotEditDrawer";
import {
  getAllotedListAsync,
} from "@/features/locationAllotement/locationAllotSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { LocationAllotedItem } from "@/utils/locationAllotementType/locationTypes";
import LocationAllotedListTable from "@/table/locationAllotement/LocationAllotedListTable";
import React, { useCallback, useEffect, useState } from "react";

const LocationAllotedList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { allotedList, getAllotedListLoading, } =
    useAppSelector((state) => state.locationAllot);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchList = useCallback(() => {
    dispatch(getAllotedListAsync());
  }, [dispatch]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleEdit = useCallback((row: LocationAllotedItem) => {
    setEditId(row.loc_all_key);
  }, []);

 



  return (
    <div className="h-full bg-white flex flex-col min-h-0">
      <LocationAllotedListTable
        rowData={allotedList}
        loading={getAllotedListLoading}
        onEdit={handleEdit}

      />

      <LocationAllotEditDrawer
        open={Boolean(editId)}
        editId={editId}
        onClose={() => setEditId(null)}
        onSuccess={fetchList}
      />

  
    </div>
  );
};

export default LocationAllotedList;
