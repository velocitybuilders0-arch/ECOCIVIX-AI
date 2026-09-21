import { React } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  isAuthenticated: boolean;
}

export function Navbar({ isAuthenticated }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">ECOCIVIX AI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <a href="/app" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Dashboard
                </a>
                <a href="/app/issues" className="text-gray-700 hover:text-primary-600 transition-colors">
                  My Issues
                </a>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <a href="/how-it-works" className="text-gray-700 hover:text-primary-600 transition-colors">
                  How It Works
                </a>
                <a href="/features" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Features
                </a>
                <a
                  href="/login"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {isAuthenticated ? (
              <>
                <a href="/app" className="block text-gray-700 hover:text-primary-600">
                  Dashboard
                </a>
                <a href="/app/issues" className="block text-gray-700 hover:text-primary-600">
                  My Issues
                </a>
                <div className="pt-4 border-t">
                  <span className="block text-sm text-gray-600 mb-2">
                    {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="block text-sm text-gray-600 hover:text-primary-600"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <a href="/how-it-works" className="block text-gray-700 hover:text-primary-600">
                  How It Works
                </a>
                <a href="/features" className="block text-gray-700 hover:text-primary-600">
                  Features
                </a>
                <a
                  href="/login"
                  className="block bg-primary-600 text-white px-4 py-2 rounded-lg text-center hover:bg-primary-700"
                >
                  Get Started
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
