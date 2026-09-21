import { React } from 'react';
import { Navbar } from '../components/layout/Navbar';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={false} />
      <main>{children}</main>
    </div>
  );
}
