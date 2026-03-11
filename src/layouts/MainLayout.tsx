import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { FaStar } from "react-icons/fa6";
import styled from "styled-components";
import { FavoriteMenuLinkListType, MainUIStateType } from "@/types/MainLayout";
import SidebarMenues from "@/components/shared/SidebarMenues";
import FavoriteSidebar from "@/components/shared/FavoriteSidebar";
import ProfileSidebar from "@/components/shared/ProfileSidebar";
import MainLayoutPopovers from "@/components/shared/MainLayoutPopovers";
import { SiSocketdotio } from "react-icons/si";
import { IconButton } from "@mui/material";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import MuiTooltip from "@/components/reusable/MuiTooltip";
import { useSocketContext } from "@/components/context/SocketContext";

function MainLayout(props: { children: React.ReactNode }) {
  const { isConnected, refreshConnection, isLoading } = useSocketContext();
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [sheet2Open, setSheet2Open] = useState<boolean>(false);
  const [favoriteSheet, setFavoriteSheet] = useState<boolean>(false);
  const [logotAlert, setLogotAlert] = useState<boolean>(false);
  const [notificationSheet, setNotificationSheet] = useState<boolean>(false);
  const [favoriteLinkList, setFavoriteLinkList] = useState<FavoriteMenuLinkListType[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const sidebaref = useRef<HTMLDivElement>(null);
  const favoriteref = useRef<HTMLDivElement>(null);
  const uiState: MainUIStateType = {
    sheetOpen,
    setSheetOpen,
    sheet2Open,
    setSheet2Open,
    favoriteSheet,
    setFavoriteSheet,
    logotAlert,
    setLogotAlert,
    modalRef,
    sidebaref,
    favoriteref,
    notificationSheet,
    setNotificationSheet,
    favoriteLinkList,
    setFavoriteLinkList,
  };

  const handleSheetOpen = () => {
    setSheetOpen(!sheetOpen);
    setSheet2Open(false);
    setFavoriteSheet(false);
  };

  return (
    <Wrapper>
      <MainLayoutPopovers uiState={uiState} />
      <div
        className={`sheetone absolute h-[100vh] z-[50] top-0 w-full transition-all ${sheetOpen || sheet2Open || favoriteSheet ? "bg-[#00000081]" : "left-[-100%]"}`}
      />
      <FavoriteSidebar uiState={uiState} />
      <SidebarMenues uiState={uiState} />
      <ProfileSidebar uiState={uiState} />

      <div>
        <nav
          style={{ boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px" }}
          className="z-[7] flex items-center justify-between h-[50px] px-[20px] fixed top-0 left-[50px] w-[calc(100vw-50px)] bg-[#5F259F]"
        >
          <div className="flex gap-[20px] items-center">
            
          </div>
          <div className="flex items-center gap-[20px]">
            <MuiTooltip title={isConnected ? "Socket Connected" : "Socket Disconnected"} placement="left">
              <IconButton onClick={() => refreshConnection()}>
                <SiSocketdotio
                  className={`h-[25px] w-[25px] ${isConnected ? "text-green-500" : "text-red-500"} ${isLoading ? "animate-spin" : ""}`}
                />
              </IconButton>
            </MuiTooltip>
            <MuiTooltip title="Account" placement="left">
              <IconButton
                onClick={() => {
                  setSheet2Open(!sheet2Open);
                  setSheetOpen(false);
                  setFavoriteSheet(false);
                }}
              >
                <FaCircleUser className="h-[25px] w-[25px] text-white" />
              </IconButton>
            </MuiTooltip>
          </div>
        </nav>
      </div>

      <div className="mt-[50px]">
        <div
          className={`w-[60px] overflow-hidden h-[100vh] bg-[#5F259F] fixed left-0 top-0 pt-[20px] pb-[10px] flex items-center justify-between flex-col z-[70] ${sheetOpen ? "border-r border-white" : "border-r border-transparent"}`}
        >
          <div className="flex flex-col items-center gap-[20px]">
            <Link
              to="/"
              onClick={() => {
                setFavoriteSheet(false);
                setSheet2Open(false);
                setSheetOpen(false);
              }}
              className="flex items-center justify-center"
            >
              <img src="/images/PhonePeIcon.jpg" alt="PhonePe" className="h-9 w-9 object-contain rounded-full" />
            </Link>
            <MuiTooltip title="Favorite Pages" placement="right">
              <IconButton
                onClick={() => {
                  setFavoriteSheet(!favoriteSheet);
                  setSheet2Open(false);
                  setSheetOpen(false);
                }}
              >
                <FaStar className="h-[25px] w-[25px] text-white" />
              </IconButton>
            </MuiTooltip>
            <MuiTooltip title="SOP" placement="right">
              <IconButton
                onClick={() => {
                  setSheet2Open(false);
                  setSheetOpen(false);
                  setFavoriteSheet(false);
                }}
                size="small"
                sx={{
                  background: "white",
                  color: "#5F259F",
                  "&:hover": { background: "#5F259F", color: "white" },
                }}
              >
                <CreateNewFolderIcon fontSize="medium" />
              </IconButton>
            </MuiTooltip>
          </div>
          <div className="flex flex-col gap-[30px]">
            <div className="line" />
            <Button
              onClick={handleSheetOpen}
              className="btn rotate-[270deg] border-[3px] border-white text-white bg-transparent rounded-full max-w-max hover:bg-white/10 hover:text-white"
            >
              <span />
              Menu
            </Button>
          </div>
          <div className="flex flex-col gap-[20px] items-center">
            <MuiTooltip title="Account" placement="right">
              <IconButton
                onClick={() => {
                  setSheet2Open(!sheet2Open);
                  setSheetOpen(false);
                  setFavoriteSheet(false);
                }}
              >
                <FaCircleUser className="h-[25px] w-[25px] text-white" />
              </IconButton>
            </MuiTooltip>
          </div>
        </div>
        <main className="ml-[60px] bg-[#faf5ff] h-full">{props.children}</main>
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  .btn {
    overflow: hidden;
    position: relative;
    span {
      position: absolute;
      background-color: #5F259F;
      height: 100px;
      width: 10px;
      rotate: 30deg;
      left: -20px;
      transition: all 1.3s;
    }
    &:hover span {
      left: 120px;
      transition: all 1.3s;
    }
  }
`;

export default MainLayout;
