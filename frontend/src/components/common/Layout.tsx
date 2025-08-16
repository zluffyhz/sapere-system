import React, { ReactNode, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sapere-gray">
      {showSidebar ? (
        <div className="flex h-screen">
          {/* Sidebar para Desktop */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          
          {/* Sidebar Mobile Overlay */}
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
              <div className="fixed inset-y-0 left-0 w-64 z-50">
                <Sidebar />
              </div>
              <div 
                className="absolute inset-0" 
                onClick={() => setIsSidebarOpen(false)}
              />
            </div>
          )}
          
          {/* Conteúdo Principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className="flex-1 overflow-y-auto">
              <div className="px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      ) : (
        <div className="min-h-screen">
          <Header />
          <main className="pt-4">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Layout;