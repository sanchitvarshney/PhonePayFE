import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Menu, MenuState } from "./menuType";

const staticMenu: Menu[] = [
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
            order: 3,
            is_active: 1,
            icon: "report",
            description: "Component",
          },
          {
            menu_key: "vendor",
            name: "Vendor",
            parent_menu_key: "master",
            url: "/master-vendor-add",
            order: 4,
            is_active: 1,
            icon: "report",
            description: "Vendor",
          },
          {
            menu_key: "costCenter",
            name: "Cost Center",
            parent_menu_key: "master",
            url: "/master-cost-center",
            order: 5,
            is_active: 1,
            icon: "report",
            description: "Cost Center",
          },
          {
            menu_key: "bom",
            name: "BOM",
            parent_menu_key: "master",
            url: "/master-bom-create",
            order: 6,
            is_active: 1,
            icon: "report",
            description: "Bill Of Materials",
          },
        ],
      },
      {
        menu_key: "material-req",
        name: "Material Request",
        parent_menu_key: "material-req",
        url: null,
        order: 2,
        is_active: 1,
        icon: "report",
        description: "Material Request",
        children: [
          {
            menu_key: "raw-material-request",
            name: "Raw Material Request",
            parent_menu_key: "material-req-row",
            url: "/material-management/raw-material-request",
            order: 1,
            is_active: 1,
            icon: "report",
            description: "Raw Material Request",
          },
             {
            menu_key: "raw-material-request-with-bom",
            name: "MR with BOM",
            parent_menu_key: "material-req-row",
            url: "/material-management/raw-material-request/with-bom",
            order: 2,
            is_active: 2,
            icon: "report",
            description: "Raw Material Request with BOM",
          },
        ],
      },
      {
        menu_key: "material-approval",
        name: "Material Approval",
        parent_menu_key: "material-approval",
        url: null,
        order: 3,
        is_active: 1,
        icon: "report",
        description: "Material Approval",
        children: [
          {
            menu_key: "approval-material-request",
            name: "Approve Request",
            parent_menu_key: "material-req-row",
            url: "/material-management/raw-material-approval",
            order: 1,
            is_active: 1,
            icon: "report",
            description: "Raw Material Request Approval",
          },
          {
            menu_key: "approval-material-request",
            name: "Approved Requisitions",
            parent_menu_key: "material-req-row",
            url: "/material-management/material-requisition-request",
            order: 1,
            is_active: 1,
            icon: "report",
            description: "Raw Material Request Approval",
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
          {
            menu_key: "material-in-from-po",
            name: "MIN From PO",
            parent_menu_key: "procurement",
            url: "/procurement/min-from-po",
            order: 1,
            is_active: 1,
            icon: "report",
            description: "MIN From PO",
          },
        ],
      },
      {
        menu_key: "sales-order",
        name: "Sales Order",
        parent_menu_key: "warehouse",
        url: null,
        order: 2,
        is_active: 1,
        icon: "procurement",
        description: "Sales Order",
        children: [
          {
            menu_key: "create-sales-order",
            name: "Create Sales Order",
            parent_menu_key: "sales-order",
            url: "/sales-order/create",
            order: 1,
            is_active: 1,
            icon: "report",
            description: "Create Sales Order",
          },
          {
            menu_key: "manage-sales-order",
            name: "Manage Sales Order",
            parent_menu_key: "sales-order",
            url: "/sales-order/manage",
            order: 2,
            is_active: 1,
            icon: "report",
            description: "Manage Sales Order",
          },
          {
            menu_key: "manage-sales-challan",
            name: "Manage Challan",
            parent_menu_key: "sales-order",
            url: "/sales-order/manage-challan",
            order: 3,
            is_active: 1,
            icon: "report",
            description: "Manage Challan",
          },
        ],
      },
      {
        menu_key: "warehouse-consumption",
        name: "Consumption",
        parent_menu_key: "warehouse",
        url: "/warehouse/consumption",
        order: 3,
        is_active: 1,
        icon: "material",
        description: "Consumption",
      },
      {
        menu_key: "warehouse-good-spare-inward",
        name: "Goods Spare Inward",
        parent_menu_key: "warehouse",
        url: "/warehouse/good-spare-inward",
        order: 4,
        is_active: 1,
        icon: "material",
        description: "Goods Spare Inward",
      },
      {
        menu_key: "bulk-device-inward",
        name: "Bulk Device Inward",
        parent_menu_key: "procurement",
        url: "/bulk-device-inward/create",
        order: 2,
        is_active: 1,
        icon: "report",
        description: "Bulk Device Inward",
      },
    ],
  },
  {
    menu_key: "report",
    name: "Report",
    parent_menu_key: null,
    url: "/report/R1",
    order: 5,
    is_active: 1,
    icon: "report",
    description: "Report",
  },
  {
    menu_key: "query",
    name: "Query",
    parent_menu_key: null,
    url: "/queries/Q1",
    order: 6,
    is_active: 1,
    icon: "report",
    description: "Query",
  },
 {
    menu_key: "location-alloted",
    name: "Location Allotement",
    parent_menu_key: null,
    url: null,
    order: 3,
    is_active: 1,
    icon: "location",
    description: "Location Allotement for perticular module",
   children: [
       {
        menu_key: "location-allot",
        name: "Location Allot",
        parent_menu_key: "location-allot",
        url: "/location/location-allot",
        order: 1,
        is_active: 1,
        icon: "location",
        description: "Here you can allot the location to the user",
      },
        {
        menu_key: "alloted-list",
        name: "Location Alloted List",
        parent_menu_key: "location",
        url: "/location/location-alloted-list",
        order: 2,
        is_active: 1,
        icon: "location",
        description: "Location Alloted List",
      },
   ]
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
