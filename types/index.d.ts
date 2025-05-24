// SVG Component Types
declare module "@/components/admin/svg/DownArrow" {
  import { FC } from "react";
  
  interface DownArrowProps {
    className?: string;
  }
  
  const DownArrow: FC<DownArrowProps>;
  export default DownArrow;
}

declare module "@/components/admin/svg/Menu" {
  import { FC } from "react";
  
  interface MenuProps {
    className?: string;
  }
  
  const Menu: FC<MenuProps>;
  export default Menu;
}

declare module "@/components/admin/svg/Search" {
  import { FC } from "react";
  
  interface SearchProps {
    className?: string;
  }
  
  const Search: FC<SearchProps>;
  export default Search;
}

declare module "@/components/admin/svg/Notification" {
  import { FC } from "react";
  
  interface NotificationProps {
    className?: string;
  }
  
  const Notification: FC<NotificationProps>;
  export default Notification;
}

declare module "@/components/admin/svg/Close" {
  import { FC } from "react";
  
  interface CloseProps {
    className?: string;
  }
  
  const Close: FC<CloseProps>;
  export default Close;
}

// Make sure JSX.IntrinsicElements is defined
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
} 