import React, { useEffect, useState } from "react";
import { useNavigate, useParams, NavLink, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Tooltip, Typography } from "@mui/material";
import { useUser } from "@/hooks/useUser";
interface NavSliderData {
  path: string;
  name: string;
  content: React.ReactNode;
}

export const visibaleArr: any[] = [
  "CRN1245062",
  "CRN28960",
  "CRN2913859",
  "CRN103522",
  "CRN788880",
];

export const navSliderData: NavSliderData[] = [
  { path: "/report/R1", name: "R1", content: <p>Raw MIN Report</p> },
   { path: "/report/R2", name: "R2", content: <p>Dispatch Report</p> },
  // { path: "/report/R2", name: "R2", content: <p>TRC Report</p> },
  { path: "/report/R3", name: "R3", content: <p>Consumption Report</p> },
  { path: "/report/R4", name: "R4", content: <p>Inward Report</p> },
  // { path: "/report/R5", name: "R5", content: <p>Dispatch Report</p> },
  // { path: "/report/R6", name: "R6", content: <p>Raw MIN Report</p> },
  // { path: "/report/R7", name: "R7", content: <p>Date Wise RM Report</p> },
  // { path: "/report/R8", name: "R8", content: <p>Material Issue Report</p> },
  // { path: "/report/R9", name: "R9", content: <p>Device MIN Report V2</p> },
  // { path: "/report/R10", name: "R10", content: <p>MONO Report</p> },
  // { path: "/report/R11", name: "R11", content: <p>BPe Issue Report</p> },
  // { path: "/report/R12", name: "R12", content: <p>TRC Assembly Report</p> },
  // { path: "/report/R13", name: "R13", content: <p>Device Analysis Report</p> },
  // { path: "/report/R14", name: "R14", content: <p>BER Component Report</p> },
  // {
  //   path: "/report/R15",
  //   name: "R15",
  //   content: <p>Physical Quantity Report</p>,
  // },
  // { path: "/report/R16", name: "R16", content: <p>Swipe MIN Report</p> },
  // {
  //   path: "/report/R17",
  //   name: "R17",
  //   content: <p>Swipe Machine Functional Report</p>,
  // },
  // {
  //   path: "/report/R18",
  //   name: "R18",
  //   content: <p>Swipe Machine Rejection Report</p>,
  // },
  // { path: "/report/R19", name: "R19", content: <p>Pre QC Report</p> },
  // { path: "/report/R20", name: "R20", content: <p>AWB Scanning Report</p> },
  // { path: "/report/R21", name: "R21", content: <p>AWB Scan SKU Report</p> },
  // { path: "/report/R22", name: "R22", content: <p>Billing Report</p> },
];

const NavSlider: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user } = useUser();
  const canSeeR22 = visibaleArr.includes(user?.crn_id);
  // State to manage the current tab index
  const [value, setValue] = useState<number>(0);

  // Determine the current tab index based on the current route
  const currentTabIndex = navSliderData.findIndex(
    (tab) => tab.path === location.pathname,
  );

  // Handle tab change
  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    navigate(navSliderData[newValue].path);
  };

  // Sync tab selection with route parameter
  useEffect(() => {
    const index = navSliderData.findIndex((link) => link.name === id);
    if (index !== -1) {
      setValue(index);
    }
  }, [id]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "background.paper",
        borderBottom: "1px solid #ccc",
      }}
    >
      <Tabs
        selectionFollowsFocus
        value={currentTabIndex !== -1 ? currentTabIndex : 0}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="navigation slider"
        sx={{
          [`& .${tabsClasses.scrollButtons}`]: {
            "&.Mui-disabled": { opacity: 0.3 },
          },
        }}
      >
        {navSliderData.map((link, index) => (
          <>
            {link.name === "R22" && !canSeeR22 ? null : (
              <>
                <Tab
                  key={index || link.path}
                  component={NavLink}
                  to={link.path}
                  label={
                    <Tooltip title={link.content} placement="top">
                      <div className="flex items-center gap-[10px]">
                        <Typography fontWeight={500}>{link.name}</Typography>
                        {value === index && (
                          <Typography variant="body2" color="textSecondary">
                            {link.content}
                          </Typography>
                        )}
                      </div>
                    </Tooltip>
                  }
                />
              </>
            )}
          </>
        ))}
      </Tabs>
    </Box>
  );
};

export default NavSlider;
