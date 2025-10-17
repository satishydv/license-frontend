const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/driving-license/index.php/api';

console.log('🌐 API_BASE_URL:', API_BASE_URL);
console.log('🌐 NEXT_PUBLIC_API_BASE_URL env var:', process.env.NEXT_PUBLIC_API_BASE_URL);

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
import { City } from '@/types/city';
import { Vendor } from '@/types/vendor';
import { DTO } from '@/types/dto';

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
      ...(options.headers as Record<string, string>),
    };
    
    // Only set Content-Type for JSON, not for FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

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
        headers: Object.keys(headers),
        body: options.body
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
        throw new Error(data.message || data.error || 'Request failed');
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

  async createUser(userData: { name: string; email: string; password: string; role: string; status?: string; phone_no?: string }): Promise<User> {
    const response = await this.request<{ user: ApiUser }>('/users/create', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      return convertApiUserToUser(response.data.user);
    }

    throw new Error(response.message || 'Failed to create user');
  }

  async updateUser(id: number, userData: { name: string; email: string; role: string; status: string; password?: string; phone_no?: string }): Promise<User> {
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

  async updateProfile(profileData: { name: string; email: string; phone_no?: string }): Promise<User> {
    const response = await this.request<{ user: ApiUser }>('/profile/update', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });

    if (response.success && response.data) {
      return convertApiUserToUser(response.data.user);
    }

    throw new Error(response.message || 'Failed to update profile');
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

  // Report methods
  async getReportData(dateRange: string = 'this_month', startDate?: string, endDate?: string): Promise<{
    totalApplications: number;
    totalIncome: number;
    totalDues: number;
    totalPaid: number;
    applicationsByType: Array<{
      type: string;
      count: number;
      amount: number;
    }>;
    paymentMethods: Array<{
      method: string;
      count: number;
      amount: number;
    }>;
    dateRange: string;
    generatedAt: string;
  }> {
    const params = new URLSearchParams({ date_range: dateRange });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await this.request<{
      totalApplications: number;
      totalIncome: number;
      totalDues: number;
      totalPaid: number;
      applicationsByType: Array<{
        type: string;
        count: number;
        amount: number;
      }>;
      paymentMethods: Array<{
        method: string;
        count: number;
        amount: number;
      }>;
      dateRange: string;
      generatedAt: string;
    }>(`/reports?${params.toString()}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get report data');
  }

  async getFinancialReport(dateRange: string = 'this_month'): Promise<{
    total_income: number;
    total_dues: number;
    total_paid: number;
  }> {
    const response = await this.request<{
      total_income: number;
      total_dues: number;
      total_paid: number;
    }>(`/reports/financial?date_range=${dateRange}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get financial report');
  }

  async getApplicationsReport(dateRange: string = 'this_month'): Promise<{
    totalApplications: number;
    applicationsByType: Array<{
      type: string;
      count: number;
      amount: number;
    }>;
  }> {
    const response = await this.request<{
      totalApplications: number;
      applicationsByType: Array<{
        type: string;
        count: number;
        amount: number;
      }>;
    }>(`/reports/applications?date_range=${dateRange}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get applications report');
  }

  async getIncomeReport(fromDate: string, toDate: string): Promise<{
    total_income: number;
    application_count: number;
    from_date: string;
    to_date: string;
    period: string;
  }> {
    const response = await this.request<{
      total_income: number;
      application_count: number;
      from_date: string;
      to_date: string;
      period: string;
    }>(`/reports/income?from_date=${fromDate}&to_date=${toDate}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get income report');
  }

  async getDueReport(fromDate: string, toDate: string): Promise<{
    total_dues: number;
    application_count: number;
    from_date: string;
    to_date: string;
    period: string;
  }> {
    const response = await this.request<{
      total_dues: number;
      application_count: number;
      from_date: string;
      to_date: string;
      period: string;
    }>(`/reports/dues?from_date=${fromDate}&to_date=${toDate}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get due report');
  }

  async searchCustomers(searchParams: {
    from_date?: string;
    to_date?: string;
    name?: string;
    phone?: string;
    license_no?: string;
    application_no?: string;
  }): Promise<{
    id: number;
    application_no: string;
    name: string;
    phone: string;
    email: string;
    license_no: string;
    amount: number;
    pay_amount: number;
    status: string;
    created_at: string;
    updated_at: string;
  }[]> {
    const queryParams = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });

    const response = await this.request<{
      id: number;
      application_no: string;
      name: string;
      phone: string;
      email: string;
      license_no: string;
      amount: number;
      pay_amount: number;
      status: string;
      created_at: string;
      updated_at: string;
    }[]>(`/reports/customers?${queryParams.toString()}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to search customers');
  }

  // City management methods
  async getCities(page: number = 1, limit: number = 100, search: string = ''): Promise<{
    cities: City[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (search.trim()) {
      params.append('search', search.trim());
    }
    
    console.log('🌐 Making getCities request:', {
      page,
      limit,
      search,
      params: params.toString(),
      fullUrl: `${this.baseURL}/cities?${params.toString()}`
    });
    
    const response = await this.request<{ 
      cities: City[];
      pagination: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
      };
    }>(`/cities?${params.toString()}`);

    console.log('🌐 getCities response:', response);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get cities');
  }

  async createCity(cityData: { city_name: string; city_state: string }): Promise<City> {
    console.log('🌐 createCity called with data:', cityData);
    
    const response = await this.request<{ city: City }>('/cities/create', {
      method: 'POST',
      body: JSON.stringify(cityData),
    });

    console.log('🌐 createCity response:', response);

    if (response.success && response.data) {
      return response.data.city;
    }

    throw new Error(response.message || 'Failed to create city');
  }

  async updateCity(id: number, cityData: { city_name: string; city_state: string }): Promise<City> {
    const response = await this.request<{ city: City }>(`/cities/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(cityData),
    });

    if (response.success && response.data) {
      return response.data.city;
    }

    throw new Error(response.message || 'Failed to update city');
  }

  async deleteCity(id: number): Promise<void> {
    const response = await this.request(`/cities/${id}/delete`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete city');
    }
  }

  async getCity(id: number): Promise<City> {
    const response = await this.request<{ city: City }>(`/cities/${id}`);

    if (response.success && response.data) {
      return response.data.city;
    }

    throw new Error(response.message || 'Failed to get city');
  }

  // Vendor management methods
  async getVendors(page: number = 1, limit: number = 100): Promise<{
    vendors: Vendor[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    console.log('🌐 Making getVendors request:', {
      page,
      limit,
      params: params.toString(),
      fullUrl: `${this.baseURL}/vendors?${params.toString()}`
    });
    
    const response = await this.request<{ 
      vendors: Vendor[];
      pagination: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
      };
    }>(`/vendors?${params.toString()}`);

    console.log('🌐 getVendors response:', response);

    if (response.success && response.data) {
      return response.data; // Expects data to be wrapped in 'data' property
    }

    throw new Error(response.message || 'Failed to get vendors');
  }

  async createVendor(vendorData: Omit<Vendor, 'vendor_id' | 'created_at' | 'updated_at'> & { receipt_image_path?: File | null }): Promise<Vendor> {
    console.log('🌐 createVendor called with data:', vendorData);
    
    const formData = new FormData();
    formData.append('name', vendorData.name);
    formData.append('phone_no', vendorData.phone_no);
    formData.append('address', vendorData.address);
    formData.append('amount', vendorData.amount ? vendorData.amount.toString() : '');
    formData.append('pay_amount', vendorData.pay_amount ? vendorData.pay_amount.toString() : '');
    formData.append('mode_of_payment', vendorData.mode_of_payment || '');
    formData.append('total_customer', vendorData.total_customer.toString());
    
    if (vendorData.receipt_image_path) {
      formData.append('receipt_image_path', vendorData.receipt_image_path);
    }
    
    console.log('🌐 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    const response = await this.request<{ vendor: Vendor }>('/vendors/create', {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type header to let browser set it for FormData
    });

    console.log('🌐 createVendor response:', response);

    if (response.success && response.data) {
      return response.data.vendor;
    }

    throw new Error(response.message || 'Failed to create vendor');
  }

  async updateVendor(id: number, vendorData: Omit<Vendor, 'vendor_id' | 'created_at' | 'updated_at'> & { receipt_image_path?: File | null }): Promise<Vendor> {
    console.log('🌐 updateVendor called with data:', vendorData);
    
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Indicate this is an update
    formData.append('name', vendorData.name);
    formData.append('phone_no', vendorData.phone_no);
    formData.append('address', vendorData.address);
    formData.append('amount', vendorData.amount ? vendorData.amount.toString() : '');
    formData.append('pay_amount', vendorData.pay_amount ? vendorData.pay_amount.toString() : '');
    formData.append('mode_of_payment', vendorData.mode_of_payment || '');
    formData.append('total_customer', vendorData.total_customer.toString());
    
    if (vendorData.receipt_image_path) {
      formData.append('receipt_image_path', vendorData.receipt_image_path);
    }
    
    console.log('🌐 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    const response = await this.request<{ vendor: Vendor }>(`/vendors/${id}/update`, {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type header to let browser set it for FormData
    });

    console.log('🌐 updateVendor response:', response);

    if (response.success && response.data) {
      return response.data.vendor;
    }

    throw new Error(response.message || 'Failed to update vendor');
  }

  async deleteVendor(id: number): Promise<void> {
    const response = await this.request(`/vendors/${id}/delete`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete vendor');
    }
  }

  async getVendor(id: number): Promise<Vendor> {
    const response = await this.request<{ vendor: Vendor }>(`/vendors/${id}`);

    if (response.success && response.data) {
      return response.data.vendor;
    }

    throw new Error(response.message || 'Failed to get vendor');
  }

  // DTO management methods
  async getDTOs(page: number = 1, limit: number = 100): Promise<{
    dtos: DTO[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    console.log('🌐 Making getDTOs request:', {
      page,
      limit,
      params: params.toString(),
      fullUrl: `${this.baseURL}/dto?${params.toString()}`
    });
    
    const response = await this.request<{ 
      dtos: DTO[];
      pagination: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
      };
    }>(`/dto?${params.toString()}`);

    console.log('🌐 getDTOs response:', response);

    if (response.success && response.data) {
      return response.data; // Expects data to be wrapped in 'data' property
    }

    throw new Error(response.message || 'Failed to get DTOs');
  }

  async createDTO(dtoData: Omit<DTO, 'dto_id' | 'created_at' | 'updated_at'> & { receipt?: File | null }): Promise<DTO> {
    console.log('🌐 createDTO called with data:', dtoData);
    
    const formData = new FormData();
    formData.append('date', dtoData.date);
    formData.append('amount', dtoData.amount ? dtoData.amount.toString() : '');
    formData.append('pay_amount', dtoData.pay_amount ? dtoData.pay_amount.toString() : '');
    formData.append('no_of_applicant', dtoData.no_of_applicant.toString());
    
    if (dtoData.receipt) {
      formData.append('receipt', dtoData.receipt);
    }
    
    console.log('🌐 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    const response = await this.request<{ dto: DTO }>('/dto/create', {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type header to let browser set it for FormData
    });

    console.log('🌐 createDTO response:', response);

    if (response.success && response.data) {
      return response.data.dto;
    }

    throw new Error(response.message || 'Failed to create DTO');
  }

  async updateDTO(id: number, dtoData: Omit<DTO, 'dto_id' | 'created_at' | 'updated_at'> & { receipt?: File | null }): Promise<DTO> {
    console.log('🌐 updateDTO called with data:', dtoData);
    
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Indicate this is an update
    formData.append('date', dtoData.date);
    formData.append('amount', dtoData.amount ? dtoData.amount.toString() : '');
    formData.append('pay_amount', dtoData.pay_amount ? dtoData.pay_amount.toString() : '');
    formData.append('no_of_applicant', dtoData.no_of_applicant.toString());
    
    if (dtoData.receipt) {
      formData.append('receipt', dtoData.receipt);
    }
    
    console.log('🌐 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    const response = await this.request<{ dto: DTO }>(`/dto/${id}/update`, {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type header to let browser set it for FormData
    });

    console.log('🌐 updateDTO response:', response);

    if (response.success && response.data) {
      return response.data.dto;
    }

    throw new Error(response.message || 'Failed to update DTO');
  }

  async deleteDTO(id: number): Promise<void> {
    const response = await this.request(`/dto/${id}/delete`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete DTO');
    }
  }

  async getDTO(id: number): Promise<DTO> {
    const response = await this.request<{ dto: DTO }>(`/dto/${id}`);

    if (response.success && response.data) {
      return response.data.dto;
    }

    throw new Error(response.message || 'Failed to get DTO');
  }

  async getDTOReport(fromDate: string, toDate: string): Promise<{
    total_amount: number;
    total_pay_amount: number;
    total_applicants: number;
    dto_count: number;
  }> {
    const params = new URLSearchParams({
      from_date: fromDate,
      to_date: toDate
    });
    
    console.log('🌐 Making getDTOReport request:', {
      fromDate,
      toDate,
      params: params.toString(),
      fullUrl: `${this.baseURL}/dto/report?${params.toString()}`
    });
    
    const response = await this.request<{
      total_amount: number;
      total_pay_amount: number;
      total_applicants: number;
      dto_count: number;
    }>(`/dto/report?${params.toString()}`);

    console.log('🌐 getDTOReport response:', response);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get DTO report');
  }

  async getVendorReport(fromDate: string, toDate: string): Promise<{
    vendor_count: number;
    total_amount: number;
    total_pay_amount: number;
    total_customers: number;
  }> {
    const params = new URLSearchParams({
      from_date: fromDate,
      to_date: toDate
    });
    
    console.log('🌐 Making getVendorReport request:', {
      fromDate,
      toDate,
      params: params.toString(),
      fullUrl: `${this.baseURL}/vendors/report?${params.toString()}`
    });
    
    const response = await this.request<{
      vendor_count: number;
      total_amount: number;
      total_pay_amount: number;
      total_customers: number;
    }>(`/vendors/report?${params.toString()}`);

    console.log('🌐 getVendorReport response:', response);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get vendor report');
  }
}

export const apiService = new ApiService(API_BASE_URL);
export type { User, LoginData, RegisterData, AuthResponse, Role, City, Vendor, DTO };
