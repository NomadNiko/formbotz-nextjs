import { getServerSession } from 'next-auth/next';
import { authOptions } from './authOptions';
import { redirect } from 'next/navigation';

/**
 * Get the current user session (server-side)
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Require authentication or redirect to login
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * Require admin role or throw error
 */
export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  return user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}
