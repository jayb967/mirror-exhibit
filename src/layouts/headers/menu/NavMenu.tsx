
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import menu_data from './MenuData';


const NavMenu = ({style_2} : any) => {
  return ( 
    <>
      <ul>
        {menu_data.map((item, i) => (
          <li key={i} className={`${item.has_dropdown ? 'has-dropdown-2' : ''} ${style_2 && item.has_dropdown || item.img_dropdown ? 'has-dropdown' : ''}`}>
            <Link href={item.link}>{item.title}</Link>
            {item.img_dropdown &&
              <div className="tp-submenu submenu has-homemenu">
                <div className="row gx-6 row-cols-1 row-cols-md-2 row-cols-xl-5">
                  {item.sub_menus?.map((sub_menu, index) => (
                    <div key={index} className="col homemenu">
                      <div className="homemenu-thumb mb-15">
                        <Image src={sub_menu.demo_img} alt="image" />
                        <div className="homemenu-btn">
                          <Link className="tp-menu-btn" href={sub_menu.link}>Multi page</Link>
                          <Link className="tp-menu-btn" href={sub_menu.one_page_link}>One Page</Link>
                        </div>
                      </div>
                      <div className="homemenu-content text-center">
                        <h4 className="homemenu-title">
                          <Link href={sub_menu.link}>{sub_menu.title}</Link>
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
            {item.has_dropdown &&
              <ul className="submenu tp-submenu">
                {item.sub_menus?.map((sub_menu, index) => (
                  <li key={index}><Link href={sub_menu.link}>{sub_menu.title}</Link></li>
                ))}
              </ul>
            }
          </li>
        ))}
      </ul>
    </>
  );
};

export default NavMenu;