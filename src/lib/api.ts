const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/driving-license/index.php/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  role?: string;
}

import { User } from '@/types/user';

interface ApiUser extends Omit<User, 'role' | 'status'> {
  role: string;
  status: string;
  permissions?: string[];
}

// Helper function to convert ApiUser to User
function convertApiUserToUser(apiUser: ApiUser): User {
  return {
    ...apiUser,
    role: apiUser.role as 'admin' | 'user' | 'moderator',
    status: apiUser.status as 'active' | 'inactive' | 'pending'
  };
}

interface AuthResponse {
  user: User;
  token: string;
  expires_in: number;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // Try different token keys in order of preference
      const authToken = localStorage.getItem('auth_token');
      const authTokenAlt = localStorage.getItem('authToken');
      const token = localStorage.getItem('token');
      
      console.log('🔍 Token search in localStorage:', {
        auth_token: authToken ? authToken.substring(0, 20) + '...' : 'null',
        authToken: authTokenAlt ? authTokenAlt.substring(0, 20) + '...' : 'null',
        token: token ? token.substring(0, 20) + '...' : 'null'
      });
      
      this.token = authToken || authTokenAlt || token;
      
      console.log('🎯 Selected token:', this.token ? this.token.substring(0, 20) + '...' : 'null');
      
      // Clear token if it's empty or invalid
      if (!this.token || this.token === 'null' || this.token === 'undefined' || this.token.length < 10) {
        console.log('🧹 Clearing invalid token:', this.token);
        this.clearToken();
      } else {
        console.log('✅ Token validated and kept:', this.token.substring(0, 20) + '...');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('🔑 API Request with token:', {
        endpoint,
        tokenPreview: this.token.substring(0, 20) + '...',
        hasToken: !!this.token,
        tokenLength: this.token.length
      });
    } else {
      console.log('❌ API Request without token:', {
        endpoint,
        hasToken: !!this.token,
        tokenValue: this.token
      });
    }

    try {
      console.log('🌐 Making API request:', {
        url,
        method: options.method || 'GET',
        headers: Object.keys(headers)
      });

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      console.log('📄 API Response data:', data);

      if (!response.ok) {
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: data.message,
          data,
          url,
          method: options.method || 'GET'
        });
        
        // Handle specific error cases
        if (response.status === 401) {
          // Token expired or invalid
          console.log('🔓 Clearing token due to 401');
          this.clearToken();
        } else if (response.status === 403) {
          console.log('🚫 Permission denied - 403 Forbidden');
        }
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await this.request<{ user: ApiUser; token: string; expires_in: number }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      return {
        user: convertApiUserToUser(response.data.user),
        token: response.data.token,
        expires_in: response.data.expires_in
      };
    }

    throw new Error(response.message || 'Login failed');
  }

  async register(userData: RegisterData): Promise<{ user: ApiUser }> {
    const response = await this.request<{ user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Registration failed');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<{ user: ApiUser }>('/auth/me');

    if (response.success && response.data) {
      return convertApiUserToUser(response.data.user);
    }

    throw new Error(response.message || 'Failed to get user data');
  }

  async refreshToken(): Promise<{ token: string; expires_in: number }> {
    const response = await this.request<{ token: string; expires_in: number }>('/auth/refresh');

    if (response.success && response.data) {
      this.setToken(response.data.token);
      return response.data;
    }

    throw new Error(response.message || 'Token refresh failed');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.clearToken();
    }
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      // Clear other token keys to avoid confusion
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Role management methods
  async getRoles(): Promise<Role[]> {
    const response = await this.request<{ roles: Role[] }>('/roles');

    if (response.success && response.data) {
      return response.data.roles;
    }

    throw new Error(response.message || 'Failed to get roles');
  }

  async createRole(roleData: { name: string; description: string; permissions: string[] }): Promise<Role> {
    const response = await this.request<{ role: Role }>('/roles/create', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });

    if (response.success && response.data) {
      return response.data.role;
    }

    throw new Error(response.message || 'Failed to create role');
  }

  async updateRole(id: number, roleData: { name: string; description: string; permissions: string[] }): Promise<Role> {
    const response = await this.request<{ role: Role }>(`/roles/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });

    if (response.success && response.data) {
      return response.data.role;
    }

    throw new Error(response.message || 'Failed to update role');
  }

  async deleteRole(id: number): Promise<void> {
    const response = await this.request(`/roles/${id}/delete`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete role');
    }
  }

  async getRole(id: number): Promise<Role> {
    const response = await this.request<{ role: Role }>(`/roles/${id}`);

    if (response.success && response.data) {
      return response.data.role;
    }

    throw new Error(response.message || 'Failed to get role');
  }

  // User management methods
  async getUsers(): Promise<User[]> {
    const response = await this.request<{ users: ApiUser[] }>('/users');

    if (response.success && response.data) {
      return response.data.users.map(convertApiUserToUser);
    }

    throw new Error(response.message || 'Failed to get users');
  }

  async createUser(userData: { name: string; email: string; password: string; role: string; status?: string }): Promise<User> {
    const response = await this.request<{ user: ApiUser }>('/users/create', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      return convertApiUserToUser(response.data.user);
    }

    throw new Error(response.message || 'Failed to create user');
  }

  async updateUser(id: number, userData: { name: string; email: string; role: string; status: string; password?: string }): Promise<User> {
    const response = await this.request<{ user: ApiUser }>(`/users/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      return convertApiUserToUser(response.data.user);
    }

    throw new Error(response.message || 'Failed to update user');
  }

  async deleteUser(id: number): Promise<void> {
    const response = await this.request(`/users/${id}/delete`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete user');
    }
  }

  async getUser(id: number): Promise<User> {
    const response = await this.request<{ user: ApiUser }>(`/users/${id}`);

    if (response.success && response.data) {
      return convertApiUserToUser(response.data.user);
    }

    throw new Error(response.message || 'Failed to get user');
  }

  // Application management methods
  async getApplications(licenseType?: string): Promise<unknown[]> {
    const endpoint = licenseType ? `/applications?license_type=${licenseType}` : '/applications';
    const response = await this.request<{ data: unknown }>(endpoint);

    if (response.success) {
      const payload = response.data as unknown;
      // Handle common API shapes gracefully
      // 1) { data: [...] }
      // 2) { applications: [...] }
      // 3) [ ... ]
      if (Array.isArray(payload)) {
        return payload as unknown[];
      }
      if (payload && typeof payload === 'object') {
        const maybeData = (payload as Record<string, unknown>).data;
        if (Array.isArray(maybeData)) {
          return maybeData as unknown[];
        }
        const maybeApps = (payload as Record<string, unknown>).applications;
        if (Array.isArray(maybeApps)) {
          return maybeApps as unknown[];
        }
      }
      return [];
    }

    throw new Error(response.message || 'Failed to get applications');
  }

  async getApplication(id: number): Promise<unknown> {
    const response = await this.request<{ data: unknown }>(`/applications/${id}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get application');
  }

  async createApplication(formData: FormData): Promise<unknown> {
    const url = `${this.baseURL}/applications/create`;
    
    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create application');
    }

    return data;
  }

  async updateApplication(id: number, formData: FormData): Promise<unknown> {
    const url = `${this.baseURL}/applications/${id}/update`;
    
    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update application');
    }

    return data;
  }

  async deleteApplication(id: number): Promise<void> {
    const response = await this.request(`/applications/${id}/delete`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete application');
    }
  }
}

export const apiService = new ApiService(API_BASE_URL);
export type { User, LoginData, RegisterData, AuthResponse, Role };
