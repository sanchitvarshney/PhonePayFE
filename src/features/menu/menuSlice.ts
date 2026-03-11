import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Menu, MenuState } from "./menuType";

const staticMenu: Menu[] = [
  {
    menu_key: "home",
    name: "Home",
    parent_menu_key: null,
    url: "/",
    order: 1,
    is_active: 1,
    icon: "home",
    description: "Home",
  },
  {
    menu_key: "dashboard",
    name: "Dashboard",
    parent_menu_key: null,
    url: "/dashboard",
    order: 2,
    is_active: 1,
    icon: "report",
    description: "Dashboard",
  },
];

export const getMenuData = createAsyncThunk("menu/getMenuData", async () => {
  return { data: { success: true, menu: staticMenu } };
});

const initialState: MenuState = {
  menu: staticMenu,
  menuLoading: false,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMenuData.pending, (state) => {
        state.menuLoading = true;
      })
      .addCase(getMenuData.fulfilled, (state, action: any) => {
        state.menuLoading = false;
        const payload = action.payload;
        if (payload?.data?.success && payload?.data?.menu) {
          state.menu = payload.data.menu;
        }
      })
      .addCase(getMenuData.rejected, (state) => {
        state.menuLoading = false;
      });
  },
});

export default menuSlice.reducer;
