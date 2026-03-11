import { Dispatch, SetStateAction, RefObject } from "react";

export interface MainUIStateType {
  sheetOpen: boolean;
  setSheetOpen: Dispatch<SetStateAction<boolean>>;
  sheet2Open: boolean;
  setSheet2Open: Dispatch<SetStateAction<boolean>>;
  favoriteSheet: boolean;
  setFavoriteSheet: Dispatch<SetStateAction<boolean>>;
  notificationSheet: boolean;
  setNotificationSheet: Dispatch<SetStateAction<boolean>>;
  logotAlert: boolean;
  setLogotAlert: Dispatch<SetStateAction<boolean>>;
  favoriteLinkList: FavoriteMenuLinkListType[];
  setFavoriteLinkList: Dispatch<SetStateAction<FavoriteMenuLinkListType[]>>;
  modalRef: RefObject<HTMLDivElement>;
  sidebaref: RefObject<HTMLDivElement>;
  favoriteref: RefObject<HTMLDivElement>;
}

export interface Props {
  uiState: MainUIStateType;
  menu?: SidebarMenuLinkType;
}

export interface FavoriteMenuLinkListType {
  name: string;
  path: string;
}

export interface SidebarMenuLinkType {
  name: string;
  path?: string;
  subMenu?: SidebarMenuLinkType[];
}
