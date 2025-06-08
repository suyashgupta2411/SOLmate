import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import WalletButton from '../ui/WalletButton';
import Button from '../ui/Button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Browse Groups', href: '/groups' },
    { name: 'Create Group', href: '/create-group' },
    { name: 'Profile', href: '/profile' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-dark-950/90 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Users className="h-8 w-8 text-accent-500" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-accent-500 to-primary-500 bg-clip-text text-transparent">
                SOLmate
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user && (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-accent-400'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-500 to-primary-500"
                        layoutId="navbar-indicator"
                      />
                    )}
                  </Link>
                ))}
              </>
            )}
            
            <div className="flex items-center space-x-4">
              <WalletButton />
              {user ? (
                <Button variant="ghost\" onClick={logout}>
                  Logout
                </Button>
              ) : (
                <Link to="/auth">
                  <Button variant="secondary">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <WalletButton />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-gray-800 bg-dark-950/95 backdrop-blur-lg"
        >
          <div className="px-4 py-4 space-y-2">
            {user && navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'text-accent-400 bg-accent-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-800">
              {user ? (
                <Button variant="ghost\" onClick={logout} className="w-full justify-start">
                  Logout
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}