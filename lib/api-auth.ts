// Helper functions for API authentication
import { NextApiRequest } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
}

/**
 * Get authenticated user from request
 * Checks for user data in headers (sent from client)
 */
export async function getAuthUser(req: NextApiRequest): Promise<AuthUser | null> {
  try {
    // Get user ID from header (client should send this)
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return null;
    }

    // Fetch user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return null;
    }

    return user as AuthUser;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

/**
 * Check if user is admin or superadmin
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'superadmin';
}

/**
 * Check if user is superadmin
 */
export function isSuperAdmin(user: AuthUser | null): boolean {
  return user?.role === 'superadmin';
}

/**
 * Check if user has permission to access resource
 */
export function canAccessResource(user: AuthUser | null, resourceOwnerId?: string): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (resourceOwnerId) return user.id === resourceOwnerId;
  return false;
}
