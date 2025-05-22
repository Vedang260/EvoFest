'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Ticket, User, Calendar, LogOut, Plus, LayoutDashboard, CreditCard, QrCode } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/lib/hooks/hook';
import { logout } from '../lib/redux/slice/authSlice';
import { useRouter } from 'next/navigation';

// Define the interface for dropdown items
interface DropdownItem {
  name: string;
  icon: React.ReactNode;
  className?: string; // Optional className
  href?: string; // Optional for navigation items
  onClick?: () => void; // Optional for action items like logout
}

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Events', href: '/events', icon: <Calendar size={18} /> },
    { name: 'Tickets', href: '/tickets', icon: <Ticket size={18} /> },
    { name: 'Discover', href: '/discover' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setIsProfileDropdownOpen(!isProfileDropdownOpen);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    router.push('/');
  };

  const getProfileDropdownItems = (): DropdownItem[] => {
    if (!user?.role) return [];

    const commonItems: DropdownItem[] = [
      {
        name: 'Logout',
        onClick: handleLogout,
        icon: <LogOut size={18} className="text-red-500" />,
        className: 'text-red-500 hover:bg-red-50',
      },
    ];

    switch (user.role) {
      case 'ORGANIZER':
        return [
          {
            name: 'Your Events',
            href: '/organizer/events',
            icon: <Calendar size={18} className="text-primary-600" />,
          },
          {
            name: 'Create New Event',
            href: '/dashboard/events/new',
            icon: <Plus size={18} className="text-primary-600" />,
          },
          {
            name: 'Organizer Dashboard',
            href: '/organizer/dashboard',
            icon: <LayoutDashboard size={18} className="text-primary-600" />,
          },
          ...commonItems,
        ];
      case 'ATTENDEE':
        return [
          {
            name: 'Your Bookings',
            href: '/bookings',
            icon: <Ticket size={18} className="text-primary-600" />,
          },
          {
            name: 'Your Payments',
            href: '/payments',
            icon: <CreditCard size={18} className="text-primary-600" />,
          },
          ...commonItems,
        ];
      case 'STAFF':
        return [
          {
            name: 'Create Check-in',
            href: '/checkin',
            icon: <QrCode size={18} className="text-primary-600" />,
          },
          ...commonItems,
        ];
      default:
        return commonItems;
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center"
              >
                <span className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                  EvoFest
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xl font-medium text-gray-700 hover:text-primary-600 transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600">
                      <User size={18} />
                    </div>
                    <span>{user?.username}</span>
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      >
                        <div className="py-1">
                          {getProfileDropdownItems().map((item) =>
                            item.href ? (
                              <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${item.className || ''}`}
                                onClick={() => setIsProfileDropdownOpen(false)}
                              >
                                {item.icon}
                                <span className="ml-2">{item.name}</span>
                              </Link>
                            ) : (
                              <button
                                key={item.name}
                                onClick={item.onClick}
                                className={`flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${item.className || ''}`}
                              >
                                {item.icon}
                                <span className="ml-2">{item.name}</span>
                              </button>
                            )
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User size={18} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 space-y-2 bg-white border-t border-gray-200">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      {link.icon && link.icon}
                      <span>{link.name}</span>
                    </div>
                  </Link>
                ))}
                <div className="pt-2 border-t border-gray-200">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 text-base font-medium text-gray-700">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600">
                            <User size={14} />
                          </div>
                          <span>{user?.username.toLocaleUpperCase()}</span>
                        </div>
                      </div>
                      {getProfileDropdownItems().map((item) =>
                        item.href ? (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 transition-colors ${
                              item.className || 'text-gray-700 hover:text-primary-600'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className="flex items-center space-x-2">
                              {item.icon}
                              <span>{item.name}</span>
                            </div>
                          </Link>
                        ) : (
                          <button
                            key={item.name}
                            onClick={item.onClick}
                            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-50 transition-colors ${
                              item.className || 'text-gray-700 hover:text-primary-600'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {item.icon}
                              <span>{item.name}</span>
                            </div>
                          </button>
                        )
                      )}
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <User size={18} />
                        <span>Sign In</span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;