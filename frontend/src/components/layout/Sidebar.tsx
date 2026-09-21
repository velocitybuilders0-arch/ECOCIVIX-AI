import { React } from 'react';
import { clsx } from 'clsx';
import {
  Shield,
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMobile } from '../../hooks/useMobile';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const { isMobile } = useMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/app' },
    { icon: FileText, label: 'Issues', href: '/app/issues' },
  ];

  const roleMenuItems: Record<string, typeof menuItems> = {
    staff: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/staff' },
      { icon: FileText, label: 'Assigned Issues', href: '/staff/issues' },
    ],
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
      { icon: FileText, label: 'All Issues', href: '/admin/issues' },
      { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
      { icon: Users, label: 'Users', href: '/admin/users' },
    ],
  };

  const role = user?.role || 'citizen';
  const items = roleMenuItems[role] || menuItems;

  return (
    <aside
      className={clsx(
        'bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40 transition-all duration-300',
        isMobile ? (isOpen ? 'w-64' : 'w-0') : isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">ECOCIVIX</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                'hover:bg-gray-100 text-gray-700'
              )}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <a
            href="/app/profile"
            className={clsx(
              'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
              'hover:bg-gray-100 text-gray-700'
            )}
          >
            <Settings className="h-5 w-5" />
            {!isCollapsed && <span>Profile</span>}
          </a>
          <button
            onClick={logout}
            className={clsx(
              'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full',
              'hover:bg-red-50 text-red-600'
            )}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
