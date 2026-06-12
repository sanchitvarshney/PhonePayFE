import Custom404Page from "@/pages/commonPages/Custom404Page";
import { canAccessLocationAllotement } from "@/utils/locationAllotementAccess";
import { useUser } from "@/hooks/useUser";
import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const LocationAllotementProtected: React.FC<Props> = ({ children }) => {
  const { user } = useUser();

  if (!canAccessLocationAllotement(user?.crn_id)) {
    return <Custom404Page />;
  }

  return <>{children}</>;
};

export default LocationAllotementProtected;
