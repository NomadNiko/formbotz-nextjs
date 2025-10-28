'use client';

import { useState } from 'react';
import { Modal, Button, Label, TextInput, Select } from 'flowbite-react';
import { User } from '@/types';

interface UserEditModalProps {
  user: User;
  onClose: () => void;
  onSave: () => void;
}

export default function UserEditModal({ user, onClose, onSave }: UserEditModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.subscription.plan,
    formsLimit: user.subscription.formsLimit,
    submissionsLimit: user.subscription.submissionsLimit,
    validUntil: user.subscription.validUntil 
      ? new Date(user.subscription.validUntil).toISOString().split('T')[0] 
      : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const response = await fetch(`/api/admin/users/${user._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        subscription: {
          plan: formData.plan,
          formsLimit: formData.formsLimit,
          submissionsLimit: formData.submissionsLimit,
          validUntil: formData.validUntil || undefined,
        },
      }),
    });

    if (response.ok) {
      onSave();
    } else {
      const data = await response.json();
      setError(data.error || 'Failed to update user');
    }
    setSaving(false);
  };

  return (
    <Modal show onClose={onClose} size="lg">
      <div className="p-6">
        <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
          Edit User
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
            Note: Subscription limits are not enforced during beta. These values are stored in the database only.
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            <TextInput
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'client' | 'admin' })}
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="plan">Subscription Plan</Label>
            <Select
              id="plan"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value as 'free' | 'pro' | 'enterprise' })}
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="formsLimit">Forms Limit</Label>
              <TextInput
                id="formsLimit"
                type="number"
                min="0"
                value={formData.formsLimit}
                onChange={(e) => setFormData({ ...formData, formsLimit: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="submissionsLimit">Submissions Limit</Label>
              <TextInput
                id="submissionsLimit"
                type="number"
                min="0"
                value={formData.submissionsLimit}
                onChange={(e) => setFormData({ ...formData, submissionsLimit: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="validUntil">Valid Until (Optional)</Label>
            <TextInput
              id="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button color="gray" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" color="purple" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
