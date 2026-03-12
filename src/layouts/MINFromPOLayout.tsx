import * as React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useNavigate, useLocation } from "react-router-dom";
import WarehouseIcon from "@mui/icons-material/Warehouse";

const PHONEPE_PURPLE = "#5F259F";

type Props = {
  children: React.ReactNode;
};

const MINFromPOLayout: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const tabRoutes = ["/material-in/from-po"];
  const currentTabIndex = tabRoutes.indexOf(location.pathname);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    navigate(tabRoutes[newValue]);
  };

  return (
    <div className="h-full">
      <div className="w-full h-[50px] border-b border-neutral-300 bg-white">
        <Tabs
          sx={{
            padding: 0,
            width: "max-content",
            "& .MuiTab-root": { color: "#64748b" },
            "& .Mui-selected": { color: PHONEPE_PURPLE },
            "& .MuiTabs-indicator": { backgroundColor: PHONEPE_PURPLE },
          }}
          TabIndicatorProps={{ style: { height: "3px" } }}
          value={currentTabIndex === -1 ? 0 : currentTabIndex}
          onChange={handleChange}
          centered
        >
          <Tab
            sx={{ fontWeight: "500" }}
            label={
              <div className="flex items-center gap-[10px]">
                <WarehouseIcon fontSize="small" />
                MIN From PO
              </div>
            }
          />
        </Tabs>
      </div>
      <Box sx={{ height: "calc(100vh - 100px)" }}>{children}</Box>
    </div>
  );
};

export default MINFromPOLayout;
