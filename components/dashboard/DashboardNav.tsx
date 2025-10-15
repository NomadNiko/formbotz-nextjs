'use client';

import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  HiChartPie,
  HiViewBoards,
  HiUser,
  HiArrowSmRight,
  HiPlus,
  HiChevronLeft,
  HiChevronRight,
  HiMenu,
} from 'react-icons/hi';

export default function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }

    // Auto-collapse on smaller screens
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const navItems = [
    { href: '/dashboard', icon: HiChartPie, label: 'Dashboard' },
    { href: '/dashboard/forms', icon: HiViewBoards, label: 'My Forms' },
    { href: '/dashboard/forms/new', icon: HiPlus, label: 'Create Form' },
  ];

  return (
    <aside
      className={`h-screen flex-shrink-0 border-r bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex h-full flex-col justify-between p-2">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-2">
            {!isCollapsed && (
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  FormBotz
                </h1>
                {session?.user?.name && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {session.user.name}
                  </p>
                )}
              </div>
            )}
            {isCollapsed && (
              <div className="mx-auto">
                <HiMenu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <div className="flex justify-end px-1">
            <button
              onClick={toggleCollapse}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <HiChevronRight className="h-5 w-5" />
              ) : (
                <HiChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-1 border-t pt-2 dark:border-gray-700">
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Profile' : ''}
          >
            <HiUser className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Profile</span>}
          </Link>
          <button
            onClick={handleSignOut}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <HiArrowSmRight className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
