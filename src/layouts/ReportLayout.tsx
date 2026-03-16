import Navslider from "@/components/shared/Navslider";
import React from "react";

type Props = {
  children: React.ReactNode;
};
const ReportLayout: React.FC<Props> = ({ children }) => {
  return (
    <div>
      <Navslider />
      <div className="h-[calc(100vh-100px)]">{children}</div>
    </div>
  );
};

export default ReportLayout;
