import { Tooltip, TooltipProps } from "@mui/material";
import React from "react";

type Props = {
  children: React.ReactElement;
  title: string;
  placement?: TooltipProps["placement"];
};

const MuiTooltip: React.FC<Props> = ({ children, title = "Tooltip", placement = "right" }) => {
  return (
    <Tooltip title={title} placement={placement}>
      {children}
    </Tooltip>
  );
};

export default MuiTooltip;
