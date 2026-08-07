import MasterFGBOMEditDrawer from "@/components/Drawers/master/MasterFGBOMEditDrawer";
import MasterFGBOMViewDrawer from "@/components/Drawers/master/MasterFGBOMViewDrawer";
import { getFGBomList } from "@/features/master/BOM/BOMSlice";
import { AppDispatch } from "@/features/Store";
import MasterFgBOMTable from "@/table/master/MasterFgBOMTable";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const MasterFGBOM: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [viewProduct, setViwProduct] = useState<boolean>(false);
  const [editProduct, setEditProduct] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [bomName, setBomName] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getFGBomList("FG"));
  }, [dispatch]);

  return (
    <>
      <MasterFGBOMViewDrawer open={viewProduct} setOpen={setViwProduct} bomName={bomName} selectedProductId={selectedProductId} />
      <MasterFGBOMEditDrawer open={editProduct} setOpen={setEditProduct} selectedProductId={selectedProductId} />
      <div className="h-[calc(100vh-100px)] grid">
        <div>
          <MasterFgBOMTable setEdit={setEditProduct} setView={setViwProduct} setSelectedProductId={setSelectedProductId} setBomName={setBomName} />
        </div>
      </div>
    </>
  );
};

export default MasterFGBOM;
