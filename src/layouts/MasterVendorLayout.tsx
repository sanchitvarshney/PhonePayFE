import React from "react";
import { NavLink } from "react-router-dom";

const MasterVendorLayout = (props: { children: React.ReactNode }) => {
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-shrink-0 w-full bg-white tab h-[50px] shadow z-[5] border-b border-slate-300 relative">
        <ul className="group flex items-center h-[50px] ">
          <li className="h-[50px]">
            <NavLink
              to={"/master-vendor-add"}
              className={({ isActive }) =>
                `h-[50px] text-[14px] px-[20px] flex items-center text-center ${
                  isActive ? "bg-cyan-50 border-b-[4px] border-cyan-400" : ""
                } hover:bg-cyan-50`
              }
            >
              Add Vendor
            </NavLink>
          </li>
          <li className="h-[50px]">
            <NavLink
              to={"/master-vender-detail"}
              className={({ isActive }) =>
                `h-[50px] text-[14px] px-[20px] flex items-center text-center ${
                  isActive ? "bg-cyan-50 border-b-[4px] border-cyan-400" : ""
                } hover:bg-cyan-50`
              }
            >
              Vendor Detail
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="h-[calc(100vh-150px)] min-h-0 flex flex-col bg-transparent overflow-hidden">
        {props.children}
      </div>
    </div>
  );
};

export default MasterVendorLayout;
