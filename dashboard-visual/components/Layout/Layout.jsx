import React, { useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Preloader from './Preloader';
import Overlay from './Overlay';

const Layout = ({ children, page }) => {
  const { darkMode } = useDarkMode();
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const [loaded, setLoaded] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark bg-gray-900' : ''}`}>
      <Sidebar sidebarToggle={sidebarToggle} page={page} />
      <div className="relative flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
        <Overlay sidebarToggle={sidebarToggle} setSidebarToggle={setSidebarToggle} />
        <Header sidebarToggle={sidebarToggle} setSidebarToggle={setSidebarToggle} />
        <main>
          <div className="p-4 mx-auto max-w-[2000px] md:p-6">
            {children}
          </div>
        </main>
      </div>
      <Preloader loaded={loaded} />
    </div>
  );
};

export default Layout;

