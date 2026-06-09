import MasterSFGBOMEditDrawer from "@/components/Drawers/master/MasterSFGBOMEditDrawer";
import MasterSFGBOMViewDrawer from "@/components/Drawers/master/MasterSFGBOMViewDrawer";
import MasterSFGBOMTable from "@/table/master/MasterSFGBOMTable";
import React, { useState } from "react";

const MasterSfgBOM: React.FC = () => {
  const [viewProduct, setViwProduct] = useState<boolean>(false);
  const [editProduct, setEditProduct] = useState<boolean>(false);

  return (
    <>
      <MasterSFGBOMViewDrawer open={viewProduct} setOpen={setViwProduct} />
      <MasterSFGBOMEditDrawer open={editProduct} setOpen={setEditProduct} />
      <div>
        <MasterSFGBOMTable setEdit={setEditProduct} setView={setViwProduct} />
      </div>
    </>
  );
};

export default MasterSfgBOM;
