import type { User, AuthSession } from '../../types/auth';

export const mockUser: User = {
  id: 'citizen-1',
  email: 'citizen@ecocivix.local',
  name: 'John Doe',
  role: 'citizen',
  avatar: undefined,
  createdAt: '2024-09-01T00:00:00Z',
};

export const mockAuthSession: AuthSession = {
  user: mockUser,
  token: 'mock-jwt-token',
  expiresAt: new Date(Date.now() + 3600000).toISOString(),
};

export const mockStaffUser: User = {
  id: 'staff-1',
  email: 'staff@ecocivix.local',
  name: 'Mike Johnson',
  role: 'staff',
  avatar: undefined,
  createdAt: '2024-08-15T00:00:00Z',
};

export const mockAdminUser: User = {
  id: 'admin-1',
  email: 'admin@ecocivix.local',
  name: 'Admin User',
  role: 'admin',
  avatar: undefined,
  createdAt: '2024-08-01T00:00:00Z',
};
