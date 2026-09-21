import { React } from 'react';
import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
