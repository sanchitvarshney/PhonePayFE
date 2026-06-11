import React from "react";
import { useParams, NavLink, useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Tooltip, Typography } from "@mui/material";

interface NavSliderData {
  path: string;
  name: string;
  content: React.ReactNode;
}

export const queryNavSliderData: NavSliderData[] = [
  { path: "/queries/Q1", name: "Q1", content: <p>Component Stocks</p> },
  // { path: "/queries/Q2", name: "Q2", content: <p>Raw Material Stocks</p> },
  // { path: "/queries/Q3", name: "Q3", content: <p>Component Stocks</p> },
  // { path: "/queries/Q4", name: "Q4", content: <p>SKU Stocks</p> },
  // { path: "/queries/Q5", name: "Q5", content: <p>SIM MIN Statement</p> },
  { path: "/queries/Q2", name: "Q2", content: <p>Device Statement</p> },
];

const QueryNavSlider: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [value, setValue] = React.useState(0);
  const location = useLocation();

  // Determine the active tab index based on the current route
  const currentTabIndex = queryNavSliderData.findIndex((tab) => tab.path === location.pathname);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    navigate(queryNavSliderData[newValue].path);
  };

  React.useEffect(() => {
    const index = queryNavSliderData.findIndex((link) => link.name === id);
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
        scrollButtons
        aria-label="query navigation slider"
        sx={{
          [`& .${tabsClasses.scrollButtons}`]: {
            "&.Mui-disabled": { opacity: 0.3 },
          },
        }}
      >
        {queryNavSliderData.map((link, index) => (
          <Tab
            key={index}
            component={NavLink}
            to={`/queries/${link.name}`}
            label={
              <Tooltip title={link.content} placement="top" arrow>
              <div className="flex items-center gap-[10px]">
                <Typography fontWeight={500}>{link.name}</Typography>
                {value === index && (
                  <Typography variant="inherit" className="text-slate-600">
                    {link.content}
                  </Typography>
                )}
              </div>
              </Tooltip>
            }
            wrapped
            onFocus={() => setValue(index)} // Update value on focus
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default QueryNavSlider;
