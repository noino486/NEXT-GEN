import React from 'react';

const Overlay = ({ sidebarToggle, setSidebarToggle }) => {
  if (!sidebarToggle) return null;

  return (
    <div
      onClick={() => setSidebarToggle(false)}
      className="fixed w-full h-screen z-[9] bg-gray-900/50 block lg:hidden"
    ></div>
  );
};

export default Overlay;

