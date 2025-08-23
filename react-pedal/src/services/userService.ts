interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedDate: string;
  followers: number;
  following: number;
  posts: number;
}

interface RegisterData {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class UserService {
  async searchUsers(query: string, limit: number = 10): Promise<Pick<User, 'id' | 'username' | 'fullName' | 'avatar'>[]> {
    const q = (query || '').trim();
    if (!q) return [];

    const token = localStorage.getItem('authToken');
    try {
      const params = new URLSearchParams({ q, limit: String(limit) });
      const response = await fetch(`${API_BASE_URL}/users/search?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const users = (data.users || []) as any[];
      return users.map(u => ({ id: u.id, username: u.username, fullName: u.fullName, avatar: u.avatar }))
                  .slice(0, limit);
    } catch (error) {
      console.warn('Backend search not available, using mock search:', error);
      return this.mockSearchUsers(q, limit);
    }
  }
  async login(emailOrUsername: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store auth token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      return data.user;
    } catch (error) {
      // Fallback to mock data for development
      console.warn('Backend not available, using mock data:', error);
      return this.getMockUser(emailOrUsername);
    }
  }

  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store auth token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      return data.user;
    } catch (error) {
      // Fallback to mock data for development
      console.warn('Backend not available, using mock data:', error);
      return this.createMockUser(userData);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.warn('Backend not available, using localStorage data:', error);
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile update failed');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.warn('Backend not available, using mock update:', error);
      // Return updated mock user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      return { ...currentUser, ...updates };
    }
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem('authToken');
    
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.warn('Backend logout failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  // Fallback methods for development when backend is unavailable
  private mockSearchUsers(q: string, limit: number): Pick<User, 'id' | 'username' | 'fullName' | 'avatar'>[] {
    // Return empty array - no dummy users
    return [];
  }
  
  private getMockUser(emailOrUsername: string): User {
    return {
      id: 'temp-user-' + Date.now(),
      username: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
      email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@example.com`,
      fullName: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
      avatar: '',
      bio: '',
      location: '',
      joinedDate: new Date().toISOString(),
      followers: 0,
      following: 0,
      posts: 0
    };
  }

  private createMockUser(userData: RegisterData): User {
    return {
      id: 'temp-user-' + Date.now(),
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      avatar: '',
      bio: '',
      location: '',
      joinedDate: new Date().toISOString(),
      followers: 0,
      following: 0,
      posts: 0
    };
  }
}

export const userService = new UserService();
export default userService;
