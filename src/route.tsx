import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import DashBoard from "./pages/DashBoard";
import LogningV2 from "./pages/commonPages/LogningV2";
import MailVerifyPage from "./pages/commonPages/MailVerifyPage";
import ChangePassword from "./pages/commonPages/ChangePassword";
import OtpPage from "./pages/commonPages/OtpPage";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import RecoveryPassword from "./pages/authentication/RecoveryPassword";
import Protected from "./components/shared/Protected";

export const router = createBrowserRouter([
  {
    element: (
      <Protected authentication>
        <App />
      </Protected>
    ),
    path: "/",
    children: [
      {
        element: (
          <MainLayout>
            <HomePage />
          </MainLayout>
        ),
        path: "/",
      },
      {
        element: (
          <MainLayout>
            <DashBoard />
          </MainLayout>
        ),
        path: "/dashboard",
      },
    ],
  },
  {
    element: (
      <Protected authentication={false}>
        <LogningV2 />
      </Protected>
    ),
    path: "/login",
  },
  {
    element: (
      <Protected authentication>
        <MailVerifyPage />
      </Protected>
    ),
    path: "/verify-mail",
  },
  {
    element: (
      <Protected authentication>
        <OtpPage />
      </Protected>
    ),
    path: "/verify-otp",
  },
  {
    element: (
      <Protected authentication>
        <ChangePassword />
      </Protected>
    ),
    path: "/change-password",
  },
  {
    element: <ForgotPassword />,
    path: "/forgot-password",
  },
  {
    element: <RecoveryPassword />,
    path: "/password-recovery",
  },
]);
