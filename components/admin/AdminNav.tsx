'use client';

import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  HiChartPie,
  HiUsers,
  HiViewBoards,
  HiInbox,
  HiArrowSmRight,
  HiHome,
} from 'react-icons/hi';

export default function AdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const navItems = [
    { href: '/admin', icon: HiChartPie, label: 'Admin Dashboard' },
    { href: '/admin/users', icon: HiUsers, label: 'Users' },
    { href: '/admin/forms', icon: HiViewBoards, label: 'All Forms' },
    { href: '/admin/submissions', icon: HiInbox, label: 'All Submissions' },
  ];

  return (
    <aside className="h-screen w-64 flex-shrink-0 border-r bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-full flex-col justify-between p-2">
        <div className="space-y-4">
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
                <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  Admin Panel
                </h1>
                {session?.user?.name && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {session.user.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-1 border-t pt-2 dark:border-gray-700">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <HiHome className="h-5 w-5 flex-shrink-0" />
            <span>Back to Dashboard</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <HiArrowSmRight className="h-5 w-5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
