import { Outlet } from "react-router-dom";
import "./App.css";
import { useUser } from "./hooks/useUser";
import MailVerifyPage from "./pages/commonPages/MailVerifyPage";
import ChangePassword from "./pages/commonPages/ChangePassword";
import OtpPage from "./pages/commonPages/OtpPage";

function App() {
  const { user } = useUser();
  const showOtpPage = localStorage.getItem("showOtpPage");

  if (user?.other) {
    if (!user.other.e_v) {
      return <MailVerifyPage />;
    }
    if (!user.other.c_p) {
      return <ChangePassword />;
    }
    return <Outlet />;
  }

  if (showOtpPage === "Y") {
    return <OtpPage />;
  }

  return <Outlet />;
}

export default App;
