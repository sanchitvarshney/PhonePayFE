import { configureStore } from "@reduxjs/toolkit";
import menuReducer from "@/features/menu/menuSlice";
import authReducer from "@/features/authentication/authSlice";
import locationReducer from "@/features/master/location/locationSlice";
import uomReducer from "@/features/master/UOM/UOMSlice";
import componentReducer from "@/features/master/component/componentSlice";
import commonReducer from "@/features/common/commonSlice";
import clientReducer from "@/features/master/client/clientSlice";
import deviceMinReducer from "@/features/wearhouse/Divicemin/devaiceMinSlice";
import rawminReducer from "@/features/wearhouse/Rawmin/RawMinSlice";
import materialRequestWithoutBomReducer from "@/features/production/MaterialRequestWithoutBom/MRRequestWithoutBomSlice";
import procurementReducer from "@/features/procurement/poSlices";

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    auth: authReducer,
    location: locationReducer,
    uom: uomReducer,
    component: componentReducer,
    common: commonReducer,
    client: clientReducer,
    divicemin: deviceMinReducer,
    rawmin: rawminReducer,
    materialRequestWithoutBom: materialRequestWithoutBomReducer,
    po: procurementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
