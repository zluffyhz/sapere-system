import React, { ReactNode } from 'react';
import HeaderSimple from './HeaderSimple';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Principal */}
      <HeaderSimple />
      
      {/* Conteúdo Principal */}
      <main className="pt-4">
        <div className="px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;