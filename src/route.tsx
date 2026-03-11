import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import MainLayout from "./layouts/MainLayout";
import ProcurementLayout from "./layouts/ProcurementLayout";
import HomePage from "./pages/HomePage";
import DashBoard from "./pages/DashBoard";
import LogningV2 from "./pages/commonPages/LogningV2";
import MailVerifyPage from "./pages/commonPages/MailVerifyPage";
import ChangePassword from "./pages/commonPages/ChangePassword";
import OtpPage from "./pages/commonPages/OtpPage";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import RecoveryPassword from "./pages/authentication/RecoveryPassword";
import MasterLocation from "./pages/master/MasterLocation";
import MasterComponent from "./pages/master/MasterComponent";
import CreatePO from "./pages/procurement/CreatePO";
import ManagePO from "./pages/procurement/ManagePO";
import Custom404Page from "./pages/commonPages/Custom404Page";
import Protected from "./components/shared/Protected";
import MasterComponentDeatil from "@/pages/master/MasterComponentDeatil";

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
      {
        element: (
          <MainLayout>
            <MasterLocation />
          </MainLayout>
        ),
        path: "/master-location",
      },
      {
        element: (
          <MainLayout>
            <MasterComponent />
          </MainLayout>
        ),
        path: "/master-components",
      },
      {
        element: (
          <MainLayout>
            <MasterComponentDeatil />
          </MainLayout>
        ),
        path: "/master-components/:id",
      },
      {
        element: (
          <MainLayout>
            <ProcurementLayout>
              <CreatePO />
            </ProcurementLayout>
          </MainLayout>
        ),
        path: "/procurement/create",
      },
      {
        element: (
          <MainLayout>
            <ProcurementLayout>
              <ManagePO />
            </ProcurementLayout>
          </MainLayout>
        ),
        path: "/procurement/manage",
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
  {
    path: "*",
    element: (
      <Protected authentication>
        <MainLayout>
          <Custom404Page />
        </MainLayout>
      </Protected>
    ),
  },
]);
