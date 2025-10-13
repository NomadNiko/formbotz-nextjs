'use client';

import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HiChartPie,
  HiViewBoards,
  HiUser,
  HiArrowSmRight,
  HiPlus,
} from 'react-icons/hi';

export default function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const navItems = [
    { href: '/dashboard', icon: HiChartPie, label: 'Dashboard' },
    { href: '/dashboard/forms', icon: HiViewBoards, label: 'My Forms' },
    { href: '/dashboard/forms/new', icon: HiPlus, label: 'Create Form' },
  ];

  return (
    <aside className="h-screen w-64 flex-shrink-0 border-r bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              FormBotz
            </h1>
            {session?.user?.name && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {session.user.name}
              </p>
            )}
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
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-1 border-t pt-4 dark:border-gray-700">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <HiUser className="h-5 w-5" />
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <HiArrowSmRight className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
