import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Star, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './UI';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-card shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Star className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">StoreRating</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/stores"
              className={`text-gray-600 hover:text-gray-900 font-medium ${
                isActive('/stores') ? 'text-blue-600' : ''
              }`}
            >
              Browse Stores
            </Link>

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className={`text-gray-600 hover:text-gray-900 font-medium ${
                  isActive('/admin/dashboard') ? 'text-blue-600' : ''
                }`}
              >
                Admin Dashboard
              </Link>
            )}

            {isAuthenticated && user?.role === 'owner' && (
              <Link
                to="/store/dashboard"
                className={`text-gray-600 hover:text-gray-900 font-medium ${
                  isActive('/store/dashboard') ? 'text-blue-600' : ''
                }`}
              >
                Store Dashboard
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 font-medium">
                    {user?.username || user?.email}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {user?.role?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
