import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./route";
import { Provider } from "react-redux";
import { store } from "./features/Store";
import { ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { SocketProvider } from "./components/context/SocketContext";
import { ToasterProvider, ToasterConsumer } from "./utils/toasterContext";

const theme = createTheme({
  palette: {
    primary: { main: "#0e7490" },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ToasterProvider>
        <SocketProvider>
          <RouterProvider router={router} />
          <ToasterConsumer />
        </SocketProvider>
      </ToasterProvider>
    </ThemeProvider>
  </Provider>
);
