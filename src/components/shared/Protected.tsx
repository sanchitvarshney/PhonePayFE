import useAuth from "@/hooks/useAuth";
import { storeCurrentPathAsReturnTo } from "@/utils/authRedirect";
import { LinearProgress } from "@mui/material";
import React, { useEffect, useState, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface ProtectedProps {
  children: ReactNode;
  authentication?: boolean;
}

const Protected: React.FC<ProtectedProps> = ({ children, authentication = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const authStatus: boolean = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (authentication && !authStatus) {
        storeCurrentPathAsReturnTo();
        navigate("/login", { replace: true });
      } else if (!authentication && authStatus) {
        navigate("/", { replace: true });
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [authStatus, authentication, navigate, location.pathname, location.search, location.hash]);

  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center w-full h-screen bg-white">
        <div className="absolute top-0 left-0 right-0 w-full h-full opacity-50">
          <LinearProgress />
        </div>
        <span className="text-lg text-slate-500"><img src={"./images/ms.png"} alt="logo" className="opacity-50" /></span>
      </div>
    );
  }

  return <>{children}</>;
};

export default Protected;
