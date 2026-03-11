import React from "react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Icons } from "@/components/icons";

type IconName = keyof typeof Icons | string;

interface IconProps {
  name: IconName;
  size?: "small" | "inherit" | "large" | "medium";
  color?: string;
}

const DynamicIcon: React.FC<IconProps> = ({ name, size = "medium", color = "inherit" }) => {
  const IconComponent = Icons[name as keyof typeof Icons] || HelpOutlineIcon;
  return <IconComponent fontSize={size} style={{ color }} />;
};

export default DynamicIcon;
