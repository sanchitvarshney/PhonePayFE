import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./config/agGridConfig";
import { AllCommunityModule } from "ag-grid-community";
import { AgGridProvider } from "ag-grid-react";
import { router } from "./route";
import { Provider } from "react-redux";
import { store } from "./features/Store";
import { ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { SocketProvider } from "./components/context/SocketContext";
import { ToasterProvider, ToasterConsumer } from "./utils/toasterContext";
import * as Sentry from "@sentry/react";

const theme = createTheme({
  typography: {
    fontFamily: '"MsCorpres EmberFont", sans-serif',
  },
  palette: {
    primary: { main: "#5F259F" },
  },
});
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_MODE, // "development" or "production"
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance monitoring: capture 10% of transactions in production
  tracesSampleRate: import.meta.env.VITE_MODE === "production" ? 0.1 : 1.0,
  // Session Replay: capture 10% of sessions, 100% on errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ToasterProvider>
        <SocketProvider>
          <AgGridProvider modules={[AllCommunityModule]}>
            <RouterProvider router={router} />
          </AgGridProvider>
          <ToasterConsumer />
        </SocketProvider>
      </ToasterProvider>
    </ThemeProvider>
  </Provider>
);
