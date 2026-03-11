export type Menu = {
  menu_key: string;
  name: string;
  parent_menu_key: string | null;
  url: string | null;
  order: number;
  is_active: number;
  icon: string;
  description: string;
  children?: Menu[];
};

export type MenuState = {
  menu: Menu[] | null;
  menuLoading: boolean;
};
