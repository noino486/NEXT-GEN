import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';

// Note: Adaptez les menuItems selon vos besoins
const Sidebar = ({ sidebarToggle, page, menuItems }) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = React.useState(false);

  // Menu items par défaut - vous pouvez les personnaliser
  const defaultMenuItems = menuItems || [
    {
      id: 'Dashboard',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M3.25 4C3.25 3.58579 3.58579 3.25 4 3.25H10C10.4142 3.25 10.75 3.58579 10.75 4V10C10.75 10.4142 10.4142 10.75 10 10.75H4C3.58579 10.75 3.25 10.4142 3.25 10V4ZM4.75 4.75V9.25H9.25V4.75H4.75ZM13.25 4C13.25 3.58579 13.5858 3.25 14 3.25H20C20.4142 3.25 20.75 3.58579 20.75 4V10C20.75 10.4142 20.4142 10.75 20 10.75H14C13.5858 10.75 13.25 10.4142 13.25 10V4ZM14.75 4.75V9.25H19.25V4.75H14.75ZM3.25 14C3.25 13.5858 3.58579 13.25 4 13.25H10C10.4142 13.25 10.75 13.5858 10.75 14V20C10.75 20.4142 10.4142 20.75 10 20.75H4C3.58579 20.75 3.25 20.4142 3.25 20V14ZM4.75 14.75V19.25H9.25V14.75H4.75ZM13.25 14C13.25 13.5858 13.5858 13.25 14 13.25H20C20.4142 13.25 20.75 13.5858 20.75 14V20C20.75 20.4142 20.4142 20.75 20 20.75H14C13.5858 20.75 13.25 20.4142 13.25 20V14ZM14.75 14.75V19.25H19.25V14.75H14.75Z" fill="" />
        </svg>
      ),
      label: 'Dashboard',
      link: '/',
    },
  ];

  const isActive = (item) => {
    return location.pathname === item.link;
  };

  const isCollapsed = sidebarToggle;
  const shouldShowContent = !isCollapsed || isHovered;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`sidebar fixed left-0 top-0 z-30 flex h-screen flex-col overflow-y-hidden border-r border-gray-200 bg-white px-5 dark:border-gray-800 dark:bg-black lg:static lg:translate-x-0 transition-all duration-300 ${
        isCollapsed ? 'translate-x-0 lg:w-[90px]' : '-translate-x-full lg:w-[290px]'
      } ${
        isCollapsed && isHovered ? 'lg:w-[290px]' : ''
      }`}
    >
      <div className={`flex items-center gap-2 pt-8 sidebar-header pb-7 transition-all duration-300 ${shouldShowContent ? 'justify-between' : 'justify-center'}`}>
        <Link to="/">
          {shouldShowContent ? (
            <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">APE</span>
          ) : (
            <span className="text-xl font-bold text-brand-600 dark:text-brand-400">APE</span>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav>
          <div>
            <h3 className="mb-4 text-xs uppercase leading-[20px] text-gray-400">
              {shouldShowContent ? (
                <span className="menu-group-title">MENU</span>
              ) : (
                <svg className="mx-auto fill-current menu-group-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M5.99915 10.2451C6.96564 10.2451 7.74915 11.0286 7.74915 11.9951V12.0051C7.74915 12.9716 6.96564 13.7551 5.99915 13.7551C5.03265 13.7551 4.24915 12.9716 4.24915 12.0051V11.9951C4.24915 11.0286 5.03265 10.2451 5.99915 10.2451ZM17.9991 10.2451C18.9656 10.2451 19.7491 11.0286 19.7491 11.9951V12.0051C19.7491 12.9716 18.9656 13.7551 17.9991 13.7551C17.0326 13.7551 16.2491 12.9716 16.2491 12.0051V11.9951C16.2491 11.0286 17.0326 10.2451 17.9991 10.2451ZM13.7491 11.9951C13.7491 11.0286 12.9656 10.2451 11.9991 10.2451C11.0326 10.2451 10.2491 11.0286 10.2491 11.9951V12.0051C10.2491 12.9716 11.0326 13.7551 11.9991 13.7551C12.9656 13.7551 13.7491 12.9716 13.7491 12.0051V11.9951Z" fill="" />
                </svg>
              )}
            </h3>

            <ul className="flex flex-col gap-4 mb-6">
              {defaultMenuItems.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.link}
                    className={`menu-item group ${isActive(item) ? 'menu-item-active' : 'menu-item-inactive'}`}
                  >
                    <span className={isActive(item) ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}>
                      {item.icon}
                    </span>
                    {shouldShowContent && <span className="menu-item-text">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

