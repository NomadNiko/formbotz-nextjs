'use client';

import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  HiChartPie,
  HiViewBoards,
  HiUser,
  HiArrowSmRight,
  HiPlus,
  HiChevronLeft,
  HiChevronRight,
  HiLightningBolt,
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
    signOut({ callbackUrl: '/login' });
  };

  const isAdmin = session?.user?.role === 'admin';

  const navItems = [
    { href: '/dashboard', icon: HiChartPie, label: 'Dashboard' },
    { href: '/dashboard/forms', icon: HiViewBoards, label: 'My Forms' },
    { href: '/dashboard/forms/new', icon: HiPlus, label: 'Create Form' },
    { href: '/dashboard/actions', icon: HiLightningBolt, label: 'Actions' },
  ];

  return (
    <aside
      data-tour="sidebar"
      className={`h-screen flex-shrink-0 border-r bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex h-full flex-col justify-between p-2">
        <div className="space-y-4">
          {/* Header section */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2 px-2 py-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Image
                  src="/formbots-face.svg"
                  alt="FormBotz Logo"
                  width={40}
                  height={40}
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    FormBotz
                  </h1>
                  {session?.user?.name && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {session.user.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={toggleCollapse}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 flex-shrink-0"
                title="Collapse sidebar"
              >
                <HiChevronLeft className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center px-2 py-2">
                <button
                  onClick={toggleCollapse}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  title="Expand sidebar"
                >
                  <HiChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className="flex justify-center px-2">
                <Image
                  src="/formbots-face.svg"
                  alt="FormBotz Logo"
                  width={32}
                  height={32}
                  className="flex-shrink-0"
                />
              </div>
            </>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {(() => {
              // Don't highlight any nav items if we're on Profile page
              const isProfilePage = pathname === '/dashboard/profile';

              // Find the best matching route (longest match wins)
              const activeHref = isProfilePage ? null : navItems
                .filter(item => pathname === item.href || pathname?.startsWith(item.href + '/'))
                .sort((a, b) => b.href.length - a.href.length)[0]?.href;

              return navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === activeHref;
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
              });
            })()}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-1 border-t pt-2 dark:border-gray-700">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-900/20"
              title="Admin Panel"
            >
              <HiLightningBolt className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Admin Panel</span>}
            </Link>
          )}
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/dashboard/profile'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            } ${isCollapsed ? 'justify-center' : ''}`}
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
