import { Outlet } from "react-router-dom";
import "./App.css";
import OtpPage from "./pages/commonPages/OtpPage";

function App() {
  const showOtpPage = localStorage.getItem("showOtpPage");

  // if (user?.other) {
  //   if (user.other.e_v) {
  //     return <MailVerifyPage />;
  //   }
  //   if (!user.other.c_p) {
  //     return <ChangePassword />;
  //   }
  //   return <Outlet />;
  // }

  if (showOtpPage === "Y") {
    return <OtpPage />;
  }

  return <Outlet />;
}

export default App;
