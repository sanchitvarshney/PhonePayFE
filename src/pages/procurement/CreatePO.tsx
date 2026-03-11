import React from "react";
import { Typography, Button } from "@mui/material";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  getLocationAsync,
  getVendorAsync,
} from "@/features/wearhouse/Divicemin/devaiceMinSlice";
import { getPertCodesync } from "@/features/production/MaterialRequestWithoutBom/MRRequestWithoutBomSlice";
import { getCurrency } from "@/features/common/commonSlice";
import {
  getDispatchFromDetail,
  getShippingAddress,
} from "@/features/master/client/clientSlice";
import { useAppDispatch } from "@/hooks/useReduxHook";

const PHONEPE_PURPLE = "#5F259F";

const CreatePO: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(getVendorAsync(null));
    dispatch(getLocationAsync(null));
    dispatch(getPertCodesync(null));
    dispatch(getCurrency());
    dispatch(getDispatchFromDetail());
    dispatch(getShippingAddress());
  }, [dispatch]);

  return (
    <div className="p-6 bg-white h-full overflow-auto">
      <Typography variant="h1" className="text-slate-600" fontSize={22} fontWeight={500}>
        Create PO
      </Typography>
      <Card className="mt-6 max-w-2xl">
        <CardContent className="pt-6">
          <Typography variant="body1" color="text.secondary">
            Create PO uses the same APIs as BharatPayFE: getVendorAsync, getLocationAsync,
            getPertCodesync, getCurrency, getDispatchFromDetail, getShippingAddress. Use
            createPO thunk from @/features/procurement/poSlices for /po/createPO.
          </Typography>
          <Button
            variant="contained"
            className="mt-4"
            sx={{
              backgroundColor: PHONEPE_PURPLE,
              "&:hover": { backgroundColor: "#4a1d7a" },
            }}
            onClick={() => navigate("/procurement/manage")}
          >
            Go to Manage PO
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePO;
