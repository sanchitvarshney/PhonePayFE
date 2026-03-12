import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import MainLayout from "./layouts/MainLayout";
import ProcurementLayout from "./layouts/ProcurementLayout";
import MasterVendorLayout from "./layouts/MasterVendorLayout";
import Protected from "./components/shared/Protected";
import FullPageLoading from "./components/shared/FullPageLoading";

// Lazy-loaded page components
const HomePage = lazy(() => import("./pages/HomePage"));
const DashBoard = lazy(() => import("./pages/DashBoard"));
const LoginV2 = lazy(() => import("./pages/commonPages/LoginV2"));
const MailVerifyPage = lazy(() => import("./pages/commonPages/MailVerifyPage"));
const ChangePassword = lazy(() => import("./pages/commonPages/ChangePassword"));
const OtpPage = lazy(() => import("./pages/commonPages/OtpPage"));
const ForgotPassword = lazy(() => import("./pages/authentication/ForgotPassword"));
const RecoveryPassword = lazy(() => import("./pages/authentication/RecoveryPassword"));
const MasterLocation = lazy(() => import("./pages/master/MasterLocation"));
const MasterComponent = lazy(() => import("./pages/master/MasterComponent"));
const MasterComponentDeatil = lazy(() => import("./pages/master/MasterComponentDeatil"));
const MasterAddVendor = lazy(() => import("./pages/master/MasterAddVendor"));
const MasterVendorDetail = lazy(() => import("./pages/master/MasterVendorDetail"));
const MasterVendorDetailList = lazy(() => import("./pages/master/MasterVendorDetailList"));
const CreatePO = lazy(() => import("./pages/procurement/CreatePO"));
const ManagePO = lazy(() => import("./pages/procurement/ManagePO"));
const MINFromPO = lazy(() => import("./pages/min/MINFromPO"));
const Custom404Page = lazy(() => import("./pages/commonPages/Custom404Page"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Settings = lazy(() => import("./pages/profile/Settings"));

const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <Suspense fallback={<FullPageLoading />}>
    <Component />
  </Suspense>
);

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
            {withSuspense(HomePage)}
          </MainLayout>
        ),
        path: "/",
      },
      {
        element: (
          <MainLayout>
            {withSuspense(DashBoard)}
          </MainLayout>
        ),
        path: "/dashboard",
      },
      {
        element: (
          <MainLayout>
            {withSuspense(MasterLocation)}
          </MainLayout>
        ),
        path: "/master-location",
      },
      {
        element: (
          <MainLayout>
            {withSuspense(MasterComponent)}
          </MainLayout>
        ),
        path: "/master-components",
      },
      {
        element: (
          <MainLayout>
            {withSuspense(MasterComponentDeatil)}
          </MainLayout>
        ),
        path: "/master-components/:id",
      },
      {
        element: (
          <MainLayout>
            {withSuspense(MasterAddVendor)}
          </MainLayout>
        ),
        path: "/master-vendor-add",
      },
      {
        element: (
          <MainLayout>
            {withSuspense(MasterVendorDetail)}
          </MainLayout>
        ),
        path: "/master-vendor/:id",
      },
      {
        element: (
          <MainLayout>
            <MasterVendorLayout>
              {withSuspense(MasterVendorDetailList)}
            </MasterVendorLayout>
          </MainLayout>
        ),
        path: "/master-vender-detail",
      },
      {
        element: (
          <MainLayout>
            <ProcurementLayout>
              {withSuspense(CreatePO)}
            </ProcurementLayout>
          </MainLayout>
        ),
        path: "/procurement/create",
      },
      {
        element: (
          <MainLayout>
            <ProcurementLayout>
              {withSuspense(ManagePO)}
            </ProcurementLayout>
          </MainLayout>
        ),
        path: "/procurement/manage",
      },
      {
        element: (
          <MainLayout>
            <ProcurementLayout>
              {withSuspense(MINFromPO)}
            </ProcurementLayout>
          </MainLayout>
        ),
        path: "/procurement/min-from-po",
      },
      {
        element: (
          <MainLayout>
            {withSuspense(Profile)}
          </MainLayout>
        ),
        path: "/profile",
      },
      {
        element: (
          <MainLayout>
            {withSuspense(Settings)}
          </MainLayout>
        ),
        path: "/profile/settings",
      },
    ],
  },
  {
    element: (
      <Protected authentication={false}>
        {withSuspense(LoginV2)}
      </Protected>
    ),
    path: "/login",
  },
  {
    element: (
      <Protected authentication>
        {withSuspense(MailVerifyPage)}
      </Protected>
    ),
    path: "/verify-mail",
  },
  {
    element: (
      <Protected authentication>
        {withSuspense(OtpPage)}
      </Protected>
    ),
    path: "/verify-otp",
  },
  {
    element: (
      <Protected authentication>
        {withSuspense(ChangePassword)}
      </Protected>
    ),
    path: "/change-password",
  },
  {
    element: withSuspense(ForgotPassword),
    path: "/forgot-password",
  },
  {
    element: withSuspense(RecoveryPassword),
    path: "/password-recovery",
  },
  {
    path: "*",
    element: (
      <Protected authentication>
        <MainLayout>
          {withSuspense(Custom404Page)}
        </MainLayout>
      </Protected>
    ),
  },
]);
