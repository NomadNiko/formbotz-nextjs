'use client';

import { Sidebar } from 'flowbite-react';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  HiChartPie,
  HiViewBoards,
  HiInbox,
  HiUser,
  HiArrowSmRight,
  HiTable,
  HiPlus,
} from 'react-icons/hi';

export default function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <Sidebar aria-label="Dashboard navigation" className="h-screen">
      <div className="flex h-full flex-col justify-between">
        <div>
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              <div className="mb-4 px-3 py-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  FormBotz
                </h1>
                {session?.user?.name && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {session.user.name}
                  </p>
                )}
              </div>
            </Sidebar.ItemGroup>

            <Sidebar.ItemGroup>
              <Sidebar.Item
                href="/dashboard"
                icon={HiChartPie}
                active={pathname === '/dashboard'}
              >
                Dashboard
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/forms"
                icon={HiViewBoards}
                active={pathname?.startsWith('/dashboard/forms')}
              >
                My Forms
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/forms/new"
                icon={HiPlus}
                active={pathname === '/dashboard/forms/new'}
              >
                Create Form
              </Sidebar.Item>
            </Sidebar.ItemGroup>

            <Sidebar.ItemGroup>
              <Sidebar.Item
                href="/dashboard/submissions"
                icon={HiInbox}
                active={pathname?.startsWith('/dashboard/submissions')}
              >
                Submissions
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/analytics"
                icon={HiTable}
                active={pathname === '/dashboard/analytics'}
              >
                Analytics
              </Sidebar.Item>
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </div>

        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <Sidebar.Item
              href="/dashboard/profile"
              icon={HiUser}
              active={pathname === '/dashboard/profile'}
            >
              Profile
            </Sidebar.Item>
            <Sidebar.Item
              icon={HiArrowSmRight}
              onClick={handleSignOut}
              className="cursor-pointer"
            >
              Sign Out
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </div>
    </Sidebar>
  );
}
