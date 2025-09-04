import React, { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  isLoading?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true, isLoading = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Simula carregamento da página
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading || isLoading) {
    return (
      <div className="min-h-screen bg-sapere-gray flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-sapere-orange border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sapere-brown font-medium">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sapere-gray">
      {showSidebar ? (
        <div className="flex h-screen">
          {/* Sidebar para Desktop */}
          <div className="hidden lg:block transform transition-transform duration-300 ease-in-out">
            <Sidebar />
          </div>
          
          {/* Sidebar Mobile Overlay */}
          <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
            <div className={`fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <Sidebar />
            </div>
          </div>
          
          {/* Conteúdo Principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className="flex-1 overflow-y-auto">
              <div className="px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
                {children}
              </div>
            </main>
          </div>
        </div>
      ) : (
        <div className="min-h-screen">
          <Header />
          <main className="pt-4">
            <div className="px-4 sm:px-6 lg:px-8 animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Layout;