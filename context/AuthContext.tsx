import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type UserRole = 'superadmin' | 'admin' | 'user';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
}

interface AuthContextType {
    user: AuthUser | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    canManageRoles: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    updateUserRole: (userId: string, newRole: UserRole) => Promise<{ success: boolean; message: string }>;
    getAllUsers: () => typeof defaultUsers;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts - stored in localStorage for persistence
const STORAGE_KEY = 'perumahan_auth_user';
const USERS_KEY = 'perumahan_users';

// Default demo accounts with superadmin
const defaultUsers = [
    {
        id: '0',
        name: 'Superadmin Perumahan',
        email: 'superadmin@perumahan.com',
        phone: '081234567890',
        password: 'superadmin123',
        role: 'superadmin' as UserRole,
    },
    {
        id: '1',
        name: 'Admin Perumahan',
        email: 'admin@perumahan.com',
        phone: '081234567890',
        password: 'admin123',
        role: 'admin' as UserRole,
    },
    {
        id: '2',
        name: 'Budi Warga',
        email: 'budi@gmail.com',
        phone: '081298765432',
        password: 'user123',
        role: 'user' as UserRole,
    },
];

function getStoredUsers(): typeof defaultUsers {
    if (typeof window === 'undefined') return defaultUsers;
    try {
        const stored = localStorage.getItem(USERS_KEY);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return defaultUsers;
}

function saveUsers(users: typeof defaultUsers) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setUser(JSON.parse(stored));
            }
        } catch { /* ignore */ }
        // Initialize default users if not exists
        if (!localStorage.getItem(USERS_KEY)) {
            saveUsers(defaultUsers);
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
        try {
            console.log('🔐 [AUTH Context] Login dimulai untuk email:', email);
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            console.log('📡 [AUTH Context] Response status:', response.status);
            const result = await response.json();
            console.log('📦 [AUTH Context] Response data:', { success: result.success, message: result.message });

            if (result.success && result.user) {
                console.log('✅ [AUTH Context] Login berhasil, menyimpan ke localStorage...');
                const authUser: AuthUser = {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    phone: result.user.phone,
                    role: result.user.role,
                };
                setUser(authUser);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
                if (result.token) {
                    localStorage.setItem('auth_token', result.token);
                    console.log('🔑 [AUTH Context] Token disimpan');
                }
            } else {
                console.error('❌ [AUTH Context] Login gagal:', result.message);
            }

            return result;
        } catch (error) {
            console.error('❌ [AUTH Context] Login error:', error);
            if (error instanceof Error) {
                console.error('   Message:', error.message);
                console.error('   Stack:', error.stack);
            }
            return { success: false, message: 'Terjadi kesalahan saat login' };
        }
    }, []);

    const register = useCallback(async (data: { name: string; email: string; phone: string; password: string }): Promise<{ success: boolean; message: string }> => {
        try {
            console.log('📝 [AUTH Context] Registrasi dimulai untuk:', { name: data.name, email: data.email });
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            console.log('📡 [AUTH Context] Response status:', response.status);
            const result = await response.json();
            console.log('📦 [AUTH Context] Response data:', { success: result.success, message: result.message, userId: result.userId });

            if (result.success) {
                console.log('✅ [AUTH Context] Registrasi berhasil, user ID:', result.userId);
            } else {
                console.error('❌ [AUTH Context] Registrasi gagal:', result.message);
            }

            return result;
        } catch (error) {
            console.error('❌ [AUTH Context] Register error:', error);
            if (error instanceof Error) {
                console.error('   Message:', error.message);
                console.error('   Stack:', error.stack);
            }
            return { success: false, message: 'Terjadi kesalahan saat registrasi' };
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const updateUserRole = useCallback(async (userId: string, newRole: UserRole): Promise<{ success: boolean; message: string }> => {
        // Only superadmin can change roles
        if (user?.role !== 'superadmin') {
            return { success: false, message: 'Hanya superadmin yang bisa mengubah role!' };
        }

        // Simulate network delay
        await new Promise(r => setTimeout(r, 500));

        const users = getStoredUsers();
        const targetUser = users.find(u => u.id === userId);

        if (!targetUser) {
            return { success: false, message: 'Pengguna tidak ditemukan!' };
        }

        // Prevent changing superadmin's role
        if (targetUser.role === 'superadmin') {
            return { success: false, message: 'Tidak bisa mengubah role superadmin!' };
        }

        targetUser.role = newRole;
        saveUsers(users);

        // If updating current user, update state
        if (user?.id === userId) {
            const updatedUser = { ...user, role: newRole };
            setUser(updatedUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
        }

        return { success: true, message: `Role diubah menjadi ${newRole}` };
    }, [user]);

    const getAllUsers = useCallback(() => {
        return getStoredUsers();
    }, []);

    const isLoggedIn = !!user;
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isSuperAdmin = user?.role === 'superadmin';
    const canManageRoles = isSuperAdmin;

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isAdmin, isSuperAdmin, canManageRoles, loading, login, register, logout, updateUserRole, getAllUsers }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
