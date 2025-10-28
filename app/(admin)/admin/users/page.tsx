'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Badge, Table, Spinner, TableHead, TableBody, TableRow, TableCell, TableHeadCell, TextInput, Select, Pagination } from 'flowbite-react';
import { HiSearch, HiPencil, HiTrash } from 'react-icons/hi';
import { User } from '@/types';
import { format } from 'date-fns';
import UserEditModal from '@/components/admin/UserEditModal';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '10',
      ...(search && { search }),
      ...(roleFilter && { role: roleFilter }),
      ...(planFilter && { plan: planFilter }),
    });

    const response = await fetch(`/api/admin/users?${params}`);
    const data = await response.json();

    if (response.ok) {
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
    }
    setLoading(false);
  }, [currentPage, search, roleFilter, planFilter]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search, roleFilter, planFilter]);

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchUsers();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to delete user');
    }
  };

  const handleSave = () => {
    setEditingUser(null);
    fetchUsers();
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage all user accounts and subscriptions
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <TextInput
          icon={HiSearch}
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </Select>
        <Select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </Select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <Table hoverable>
          <TableHead>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Email</TableHeadCell>
            <TableHeadCell>Role</TableHeadCell>
            <TableHeadCell>Plan</TableHeadCell>
            <TableHeadCell>Forms Limit</TableHeadCell>
            <TableHeadCell>Submissions Limit</TableHeadCell>
            <TableHeadCell>Created</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {users.map((user) => (
              <TableRow key={user._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <TableCell className="font-medium text-gray-900 dark:text-white">
                  {user.name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === 'admin' ? (
                    <Badge color="purple">Admin</Badge>
                  ) : (
                    <Badge color="gray">Client</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.subscription.plan === 'enterprise' && <Badge color="purple">Enterprise</Badge>}
                  {user.subscription.plan === 'pro' && <Badge color="blue">Pro</Badge>}
                  {user.subscription.plan === 'free' && <Badge color="gray">Free</Badge>}
                </TableCell>
                <TableCell>{user.subscription.formsLimit}</TableCell>
                <TableCell>{user.subscription.submissionsLimit}</TableCell>
                <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="xs" color="light" onClick={() => setEditingUser(user)}>
                      <HiPencil className="h-4 w-4" />
                    </Button>
                    <Button size="xs" color="failure" onClick={() => handleDelete(user._id!)}>
                      <HiTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showIcons
          />
        </div>
      )}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
