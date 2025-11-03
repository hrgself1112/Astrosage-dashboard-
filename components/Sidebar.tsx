

import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { Bars3Icon } from './icons/Bars3Icon';
import { PhotoIcon } from './icons/PhotoIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ShieldIcon } from './icons/ShieldIcon';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar, currentPage, onNavigate }) => {
  const navItems = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'documents', icon: DocumentTextIcon, label: 'All Documents' },
    { id: 'panelists', icon: UserGroupIcon, label: 'Panelists' },
    { id: 'image-generator', icon: PhotoIcon, label: 'Image Generator' },
    { id: 'search', icon: MagnifyingGlassIcon, label: 'Search' },
    { id: 'background-remover', icon: PhotoIcon, label: 'Background Remover' },
    { id: 'admin', icon: ShieldIcon, label: 'Admin', adminOnly: true },
  ];

  return (
    <aside className={`bg-m3-surface flex flex-col justify-between transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-[72px]'}`}>
      <div>
        <div className={`flex items-center h-[73px] ${isSidebarOpen ? 'pl-5' : 'justify-center'}`}>
          <button onClick={toggleSidebar} className="p-3 rounded-full hover:bg-m3-surface-variant text-m3-on-surface-variant">
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>
        <nav className={`flex flex-col pt-4 gap-2 ${isSidebarOpen ? 'px-3' : 'items-center'}`}>
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              className={`flex items-center gap-4 transition-colors duration-200 group rounded-full 
              ${isSidebarOpen ? 'px-4 py-3 w-full' : 'w-12 h-12 justify-center'}
              ${ currentPage === item.id
                  ? `bg-m3-primary-container text-m3-on-primary-container`
                  : `text-m3-on-surface-variant hover:bg-m3-surface-variant hover:text-m3-on-surface`
              }`}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium text-sm truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className={`flex flex-col pb-4 gap-2 ${isSidebarOpen ? 'px-3' : 'items-center'}`}>
         <button
            title="Settings"
            className={`flex items-center gap-4 transition-colors duration-200 group rounded-full text-m3-on-surface-variant hover:bg-m3-surface-variant hover:text-m3-on-surface
            ${isSidebarOpen ? 'px-4 py-3 w-full' : 'w-12 h-12 justify-center'}`}
          >
            <Cog6ToothIcon className="w-6 h-6 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm truncate">Settings</span>}
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;