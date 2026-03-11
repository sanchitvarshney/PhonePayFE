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
  {
    menu_key: "material-mgmt",
    name: "Material Management",
    parent_menu_key: null,
    url: null,
    order: 3,
    is_active: 1,
    icon: "material",
    description: "Material Management",
    children: [
      {
        menu_key: "master",
        name: "Master",
        parent_menu_key: "material-mgmt",
        url: null,
        order: 1,
        is_active: 1,
        icon: "report",
        description: "Master",
        children: [
          {
            menu_key: "locations",
            name: "Locations",
            parent_menu_key: "master",
            url: "/master-location",
            order: 1,
            is_active: 1,
            icon: "report",
            description: "Locations",
          },
          {
            menu_key: "component",
            name: "Component",
            parent_menu_key: "master",
            url: "/master-components",
            order: 2,
            is_active: 1,
            icon: "report",
            description: "Component",
          },
        ],
      },
    ],
  },
  {
    menu_key: "warehouse",
    name: "Warehouse",
    parent_menu_key: null,
    url: null,
    order: 4,
    is_active: 1,
    icon: "warehouse",
    description: "Warehouse",
    children: [
      {
        menu_key: "procurement",
        name: "Procurement",
        parent_menu_key: "warehouse",
        url: null,
        order: 1,
        is_active: 1,
        icon: "procurement",
        description: "Procurement",
        children: [
          {
            menu_key: "create-po",
            name: "Create PO",
            parent_menu_key: "procurement",
            url: "/procurement/create",
            order: 1,
            is_active: 1,
            icon: "report",
            description: "Create PO",
          },
          {
            menu_key: "manage-po",
            name: "Manage PO",
            parent_menu_key: "procurement",
            url: "/procurement/manage",
            order: 2,
            is_active: 1,
            icon: "report",
            description: "Manage PO",
          },
        ],
      },
    ],
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
