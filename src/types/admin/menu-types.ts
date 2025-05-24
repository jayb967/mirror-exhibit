import { FC } from "react";
import { IconType } from "react-icons";

export interface SubMenu {
  title: string;
  link: string;
}

export interface SidebarMenuItem {
  id: number;
  title: string;
  icon: IconType;
  link: string;
  subMenus?: SubMenu[];
}

export type SidebarMenuItems = SidebarMenuItem[];

export interface ISubMenu {
  title: string;
  link: string;
}

export interface ISidebarMenus {
  id: number;
  icon: FC;
  title: string;
  link: string;
  subMenus?: ISubMenu[];
} 