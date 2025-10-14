'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Card, Label, TextInput } from 'flowbite-react';
import { HiUser, HiMail, HiLockClosed } from 'react-icons/hi';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage('');
    setProfileError('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileMessage('Profile updated successfully!');
        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.user.name,
            email: data.user.email,
          },
        });
        setTimeout(() => setProfileMessage(''), 3000);
      } else {
        setProfileError(data.error || 'Failed to update profile');
      }
    } catch {
      setProfileError('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setPasswordMessage('');
    setPasswordError('');

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsUpdatingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      setIsUpdatingPassword(false);
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage(''), 3000);
      } else {
        setPasswordError(data.error || 'Failed to update password');
      }
    } catch {
      setPasswordError('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account information and password
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your account's profile information and email address
              </p>
            </div>

            {profileMessage && (
              <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900 dark:text-green-200">
                {profileMessage}
              </div>
            )}

            {profileError && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
                {profileError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name">Name</Label>
                </div>
                <TextInput
                  id="name"
                  type="text"
                  icon={HiUser}
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="email">Email</Label>
                </div>
                <TextInput
                  id="email"
                  type="email"
                  icon={HiMail}
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  color="blue"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Password Update */}
        <Card>
          <form onSubmit={handleUpdatePassword}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Update Password
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ensure your account is using a long, random password to stay secure
              </p>
            </div>

            {passwordMessage && (
              <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900 dark:text-green-200">
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="currentPassword">Current Password</Label>
                </div>
                <TextInput
                  id="currentPassword"
                  type="password"
                  icon={HiLockClosed}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="newPassword">New Password</Label>
                </div>
                <TextInput
                  id="newPassword"
                  type="password"
                  icon={HiLockClosed}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                </div>
                <TextInput
                  id="confirmPassword"
                  type="password"
                  icon={HiLockClosed}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  color="blue"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
