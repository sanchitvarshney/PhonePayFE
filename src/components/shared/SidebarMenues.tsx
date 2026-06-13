import { ChevronRight } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { MdHome } from "react-icons/md";
import { FaArrowLeftLong } from "react-icons/fa6";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import React, { useMemo } from "react";
import { Props } from "@/types/MainLayout";
import { CgArrowTopRight } from "react-icons/cg";
import { Button } from "../ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import { getMenuData } from "@/features/menu/menuSlice";
import { Menu } from "@/features/menu/menuType";
import { useUser } from "@/hooks/useUser";
import { canAccessLocationAllotement } from "@/utils/locationAllotementAccess";
import DynamicIcon from "../reusable/DynamicIcon";
import { Box, CircularProgress } from "@mui/material";
import { Icons } from "../icons";

const renderMenu = (menu: Menu[] | undefined, setSidemenu: React.Dispatch<React.SetStateAction<boolean>>) => {
  return (
    <Accordion type="single" collapsible>
      <ul className="flex flex-col gap-[10px]">
        {menu?.map((item: Menu, index) => (
          <li key={item.menu_key}>
            {item.children ? (
              <AccordionItem value={`${index + item.name}`} className="border-0">
                <AccordionTrigger className="hover:no-underline hover:bg-[#4c1d99] p-[10px] rounded-md cursor-pointer">
                  <span className="flex gap-[10px] items-center">{item.name}</span>
                </AccordionTrigger>
                <AccordionContent className="p-[10px] mt-[10px] border-l-2 border-[#5F259F] bg-[#4c1d99] rounded">
                  {renderMenu(item.children, setSidemenu)}
                </AccordionContent>
              </AccordionItem>
            ) : (
              <div key={item.menu_key} className="flex items-center justify-between w-full">
                <Link
                  onClick={() => setSidemenu(false)}
                  to={`${item.url}` || "#"}
                  className="w-full hover:no-underline hover:bg-[#5F259F] p-[10px] rounded-md cursor-pointer flex items-center gap-[10px]"
                >
                  {item.name} <CgArrowTopRight className="h-[20px] w-[20px] font-[600]" />
                </Link>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Accordion>
  );
};

const filterLocationAllotementMenu = (
  menuItems: Menu[] | undefined,
  hasAccess: boolean,
): Menu[] | undefined => {
  if (!menuItems || hasAccess) return menuItems;
  return menuItems.filter((item) => item.menu_key !== "location-alloted");
};

const SidebarMenues: React.FC<Props> = ({ uiState }) => {
  const { sheetOpen, setSheetOpen, modalRef } = uiState;
  const dispatch = useAppDispatch();
  const { menu, menuLoading } = useAppSelector((state) => state.menu);
  const { user } = useUser();
  const hasLocationAllotementAccess = canAccessLocationAllotement(user?.crn_id);
  const visibleMenu = useMemo(
    () => filterLocationAllotementMenu(menu ?? [], hasLocationAllotementAccess),
    [menu, hasLocationAllotementAccess],
  );

  return (
    <div
      ref={modalRef}
      className={`absolute h-[100vh] w-[300px] z-[60] top-0 bg-[#5F259F] transition-all duration-500 ${sheetOpen ? "left-[60px]" : "left-[-300px]"}`}
    >
      <Button
        disabled={menuLoading}
        onClick={() => dispatch(getMenuData())}
        variant="outline"
        className="cursor-pointer absolute top-[10px] right-[50px] bg-transparent text-white hover:bg-white/20 border-none hover:text-white"
      >
        <Icons.refresh />
      </Button>
      <Button
        variant="outline"
        onClick={() => setSheetOpen(false)}
        className="cursor-pointer absolute top-[10px] right-[10px] bg-transparent text-white hover:bg-white/20 border-none hover:text-white"
      >
        <FaArrowLeftLong className="text-[20px]" />
      </Button>
      {menuLoading ? (
        <div className="h-[100vh] flex items-center justify-center">
          <Box sx={{ display: "flex" }}>
            <CircularProgress />
          </Box>
        </div>
      ) : (
        <ul className="flex flex-col text-white py-[5px] mt-[50px]">
          <li>
            <NavLink
              to="/"
              onClick={() => setSheetOpen(false)}
              className="flex gap-[10px] items-center py-[10px] hover:bg-[#4c1d99] p-[10px]"
            >
              <MdHome className="h-[20px] w-[20px]" />
              Dashboard
            </NavLink>
          </li>
          {visibleMenu?.map((item) =>
            item.children ? (
              <li className="group" key={item.menu_key}>
                <div className="flex justify-between items-center py-[10px] hover:bg-[#4c1d99] p-[10px] group-hover:bg-[#4c1d99] cursor-pointer">
                  <span className="flex gap-[10px] items-center cursor-pointer">
                    <DynamicIcon name={item?.icon} size="small" />
                    {item.name}
                  </span>
                  <ChevronRight />
                </div>
                <div
                  className={`top-[10px] bottom-[10px] z-[-9] bg-[#3b0764] shadow absolute border-l border-slate-600 right-[0] w-[0] opacity-0 overflow-hidden transition-all duration-500 group-hover:w-[400px] group-hover:opacity-100 group-hover:right-[-400px] rounded-md ${!sheetOpen ? "hidden" : ""}`}
                >
                  <div className="min-w-[400px]">
                    <div className="p-[10px] h-[130px]">
                      <span className="flex gap-[10px] items-center cursor-pointer text-[18px] opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <DynamicIcon name={item?.icon} size="small" />
                        {item.name}
                      </span>
                      <p className="font-[350] text-[13px] mt-[10px]">{item.description}</p>
                    </div>
                    <Separator className="bg-slate-200 text-slate-200" />
                    <ul className="p-[10px] overflow-y-auto h-[calc(100vh-170px)] flex flex-col gap-[10px]">
                      {renderMenu(item.children, setSheetOpen)}
                    </ul>
                  </div>
                </div>
              </li>
            ) : (
              <div key={item.menu_key} className="flex items-center justify-between w-full">
                <Link
                  onClick={() => setSheetOpen(false)}
                  to={`${item.url}` || "#"}
                  className="w-full hover:no-underline hover:bg-[#4c1d99] p-[10px] rounded-md cursor-pointer flex items-center gap-[10px]"
                >
                  <DynamicIcon name={item?.icon} size="small" />
                  {item.name} <CgArrowTopRight className="h-[20px] w-[20px] font-[600]" />
                </Link>
              </div>
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default SidebarMenues;
