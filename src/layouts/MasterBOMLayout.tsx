import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import QrCodeIcon from "@mui/icons-material/QrCode";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

type Props = {
  children: React.ReactNode;
};

const MasterBOMLayout: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabRoutes = [
    { path: "/master-bom-create", label: "Create Bill Of Materials", icon: <QrCodeIcon /> },
    { path: "/master-fg-bom", label: "FG BOM", icon: <QrCodeScannerIcon /> },
  ];

  const currentTabIndex = tabRoutes.findIndex((route) => route.path === location.pathname);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    navigate(tabRoutes[newValue].path);
  };

  return (
    <div className="h-full">
      <div className="w-full h-[50px] border-b border-neutral-300 bg-white">
        <Tabs
          selectionFollowsFocus
          sx={{ padding: 0, width: "max-content" }}
          TabIndicatorProps={{ style: { height: "3px" } }}
          value={currentTabIndex === -1 ? 0 : currentTabIndex}
          onChange={handleChange}
          centered
        >
          {tabRoutes.map(({ label, icon }, index) => (
            <Tab
              key={index}
              sx={{ fontWeight: 500 }}
              label={<div className="flex items-center gap-[10px]">{icon} {label}</div>}
            />
          ))}
        </Tabs>
      </div>
      <Box sx={{ height: "calc(100vh - 100px)" }}>{children}</Box>
    </div>
  );
};

export default MasterBOMLayout;
