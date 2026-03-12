import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AllCommunityModule } from "ag-grid-community";
import { AgGridProvider } from "ag-grid-react";
import { router } from "./route";
import { Provider } from "react-redux";
import { store } from "./features/Store";
import { ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { SocketProvider } from "./components/context/SocketContext";
import { ToasterProvider, ToasterConsumer } from "./utils/toasterContext";

const theme = createTheme({
  typography: {
    fontFamily: '"MsCorpres EmberFont", sans-serif',
  },
  palette: {
    primary: { main: "#5F259F" },
  },
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
