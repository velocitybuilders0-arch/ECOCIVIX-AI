import { React, useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useMobile } from '../hooks/useMobile';
import { useAuth } from '../hooks/useAuth';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isMobile } = useMobile();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole={user?.role || 'citizen'}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isMobile ? 'ml-0' : 'ml-64'
        }`}
      >
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
