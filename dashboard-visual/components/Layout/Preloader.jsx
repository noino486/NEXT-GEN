import React from 'react';

const Preloader = ({ loaded }) => {
  if (!loaded) return null;

  return (
    <div className="fixed left-0 top-0 z-[999999] w-full h-1 bg-gray-200 dark:bg-gray-800 overflow-hidden">
      <div className="h-full bg-brand-500 animate-progress"></div>
    </div>
  );
};

export default Preloader;

