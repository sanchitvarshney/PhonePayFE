import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "./App";
import MainLayout from "./layouts/MainLayout";
import ProcurementLayout from "./layouts/ProcurementLayout";
import MasterVendorLayout from "./layouts/MasterVendorLayout";
import Protected from "./components/shared/Protected";

// Static imports – no lazy loading; use FullPageLoading elsewhere when needed (e.g. auth/data loading)
import HomePage from "./pages/HomePage";
import DashBoard from "./pages/DashBoard";
import LoginV2 from "./pages/commonPages/LoginV2";
import MailVerifyPage from "./pages/commonPages/MailVerifyPage";
import ChangePassword from "./pages/commonPages/ChangePassword";
import OtpPage from "./pages/commonPages/OtpPage";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import RecoveryPassword from "./pages/authentication/RecoveryPassword";
import MasterLocation from "./pages/master/MasterLocation";
import MasterCostCenter from "./pages/master/MasterCostCenter";
import MasterComponent from "./pages/master/MasterComponent";
import MasterComponentDeatil from "./pages/master/MasterComponentDeatil";
import MasterAddVendor from "./pages/master/MasterAddVendor";
import MasterVendorDetail from "./pages/master/MasterVendorDetail";
import MasterVendorDetailList from "./pages/master/MasterVendorDetailList";
import CreatePO from "./pages/procurement/CreatePO";
import ManagePO from "./pages/procurement/ManagePO";
import MINFromPO from "./pages/min/MINFromPO";
import Custom404Page from "./pages/commonPages/Custom404Page";
import Report from "./pages/report/Report";
import ReportLayout from "./layouts/ReportLayout";
import Query from "./pages/queries/Query";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/profile/Settings";
import QueryLayout from "@/layouts/QueryLayout";
import ProductionModuleLayout from "./layouts/ProductionModuleLayout";
import ProductionAddDataPage from "./pages/production/ProductionAddDataPage";
import ProductionReportPage from "./pages/production/ProductionReportPage";
import BulkDeviceInwardLayout from "@/layouts/BulkDeviceInwardLayout";
import BulkDeviceInward from "@/pages/bulkDeviceInward/BulkDeviceInward";
import SalesOrderLayout from "@/layouts/SalesOrderLayout";
import CreateSalesOrder from "@/pages/salesorder/CreateSalesOrder";
import ManageSalesOrder from "@/pages/salesorder/ManageSalesOrder";
import ManageChallan from "@/pages/salesorder/ManageChallan";
import Consumption from "@/pages/warehouse/Consumption";
import GoodSpareInwardv2 from "@/pages/warehouse/GoodSpareInwardv2";

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
            <MasterCostCenter />
          </MainLayout>
        ),
        path: "/master-cost-center",
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
            <MasterAddVendor />
          </MainLayout>
        ),
        path: "/master-vendor-add",
      },
      {
        element: (
          <MainLayout>
            <MasterVendorDetail />
          </MainLayout>
        ),
        path: "/master-vendor/:id",
      },
      {
        element: (
          <MainLayout>
            <MasterVendorLayout>
              <MasterVendorDetailList />
            </MasterVendorLayout>
          </MainLayout>
        ),
        path: "/master-vender-detail",
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
      {
        element: (
          <MainLayout>
            <ProcurementLayout>
              <MINFromPO />
            </ProcurementLayout>
          </MainLayout>
        ),
        path: "/procurement/min-from-po",
      },
      {
        element: (
          <MainLayout>
            <ReportLayout>
              <Report />
            </ReportLayout>
          </MainLayout>
        ),
        path: "/report/:id",
      },
      {
        element: (
          <MainLayout>
            <QueryLayout> <Query /></QueryLayout>
          </MainLayout>
        ),
        path: "/queries/:id",
      },
      {
        element: (
          <MainLayout>
            <ProductionModuleLayout />
          </MainLayout>
        ),
        path: "/production-module",
        children: [
          {
            index: true,
            element: <Navigate to="add" replace />,
          },
          {
            path: "add",
            element: <ProductionAddDataPage />,
          },
          {
            path: "report",
            element: <ProductionReportPage />,
          },
        ],
      },
      {
        element: (
          <MainLayout>
            <ReportLayout>
              <Report />
            </ReportLayout>
          </MainLayout>
        ),
        path: "/report/:id",
      },
      {
        element: (
          <MainLayout>
            <BulkDeviceInwardLayout>
              <BulkDeviceInward />
            </BulkDeviceInwardLayout>
          </MainLayout>
        ), 
        path: "/bulk-device-inward/create",
      },
      {
        element: (
          <MainLayout>
            <SalesOrderLayout>
              <CreateSalesOrder />
            </SalesOrderLayout>
          </MainLayout>
        ),
        path: "/sales-order/create",
      },
      {
        element: (
          <MainLayout>
            <SalesOrderLayout>
              <CreateSalesOrder />
            </SalesOrderLayout>
          </MainLayout>
        ),
        path: "/sales-order/create/:salesOrderId",
      },
      {
        element: (
          <MainLayout>
            <SalesOrderLayout>
              <CreateSalesOrder />
            </SalesOrderLayout>
          </MainLayout>
        ),
        path: "/sales-order/edit/:salesOrderId",
      },
      {
        element: (
          <MainLayout>
            <SalesOrderLayout>
              <ManageSalesOrder />
            </SalesOrderLayout>
          </MainLayout>
        ),
        path: "/sales-order/manage",
      },
      {
        element: (
          <MainLayout>
            <SalesOrderLayout>
              <ManageChallan />
            </SalesOrderLayout>
          </MainLayout>
        ),
        path: "/sales-order/manage-challan",
      },
      {
        element: (
          <MainLayout>
            <Consumption />
          </MainLayout>
        ),
        path: "/warehouse/consumption",
      },
      {
        element: (
          <MainLayout>
            <GoodSpareInwardv2 />
          </MainLayout>
        ),
        path: "/warehouse/good-spare-inward",
      },
      {
        element: (
          <MainLayout>
            <Profile />
          </MainLayout>
        ),
        path: "/profile",
      },
      {
        element: (
          <MainLayout>
            <Settings />
          </MainLayout>
        ),
        path: "/profile/settings",
      },
    ],
  },
  {
    element: (
      <Protected authentication={false}>
        <LoginV2 />
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
