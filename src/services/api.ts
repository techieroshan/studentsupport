// API client for backend integration
import type { BackendUser, BackendRequest, BackendOffer, BackendDonorPartner, BackendRating, MatchAcceptResponse, PinVerifyResponse, BackendChatThread, BackendMessage } from './apiTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on init
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        return { error: errorData.detail || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // Auth API
  async register(email: string, password: string, role: string, displayName: string, city?: string, state?: string, zip?: string) {
    const response = await this.request<{ access_token: string; token_type: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        role,
        display_name: displayName,
        city: city || '',
        state: state || '',
        zip: zip || '',
      }),
    });
    if (response.data) {
      this.setToken(response.data.access_token);
    }
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.data) {
      this.setToken(response.data.access_token);
    }
    return response;
  }

  async getCurrentUser() {
    return this.request<BackendUser>('/auth/me');
  }

  // Students API
  async getStudentProfile() {
    return this.request('/students/me');
  }

  async updateStudentProfile(updates: any) {
    return this.request<BackendUser>('/students/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Requests API
  async createRequest(requestData: any) {
    return this.request<BackendRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getRequests(filters?: { status?: string; diet?: string; city?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.diet) params.append('diet', filters.diet);
    if (filters?.city) params.append('city', filters.city);
    const query = params.toString();
    return this.request<BackendRequest[]>(`/requests${query ? `?${query}` : ''}`);
  }

  async getMyRequests() {
    return this.request('/requests/mine');
  }

  async getRequest(requestId: string) {
    return this.request(`/requests/${requestId}`);
  }

  async updateRequest(requestId: string, updates: any) {
    return this.request(`/requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteRequest(requestId: string) {
    return this.request(`/requests/${requestId}`, {
      method: 'DELETE',
    });
  }

  // Offers API
  async createOffer(offerData: any) {
    return this.request<BackendOffer>('/offers', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  }

  async getOffers(filters?: { status?: string; diet?: string; city?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.diet) params.append('diet', filters.diet);
    if (filters?.city) params.append('city', filters.city);
    const query = params.toString();
    return this.request<BackendOffer[]>(`/offers${query ? `?${query}` : ''}`);
  }

  async getMyOffers() {
    return this.request('/offers/mine');
  }

  async getOffer(offerId: string) {
    return this.request(`/offers/${offerId}`);
  }

  async updateOffer(offerId: string, updates: any) {
    return this.request(`/offers/${offerId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteOffer(offerId: string) {
    return this.request(`/offers/${offerId}`, {
      method: 'DELETE',
    });
  }

  // Chats API
  async getChatThreads() {
    return this.request<BackendChatThread[]>('/chats');
  }

  async getChatThread(threadId: string) {
    return this.request<BackendChatThread>(`/chats/${threadId}`);
  }

  async sendMessage(threadId: string, text: string, isSystem?: boolean) {
    return this.request<BackendMessage>(`/chats/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, is_system: isSystem || false }),
    });
  }

  async acceptMatch(itemId: string) {
    return this.request<MatchAcceptResponse>(`/chats/matches/${itemId}/accept`, {
      method: 'POST',
    });
  }

  async verifyPin(itemId: string, pin: string) {
    return this.request<PinVerifyResponse>(`/chats/matches/${itemId}/verify-pin`, {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  }

  // Flags API
  async createFlag(itemId: string, itemType: 'REQUEST' | 'OFFER', reason: string, description?: string) {
    return this.request('/flags', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, item_type: itemType, reason, description }),
    });
  }

  // Admin API
  async getFlaggedItems() {
    return this.request('/admin/flags');
  }

  async dismissFlag(flagId: string) {
    return this.request(`/admin/flags/${flagId}/dismiss`, {
      method: 'POST',
    });
  }

  async deleteFlaggedContent(flagId: string) {
    return this.request(`/admin/flags/${flagId}`, {
      method: 'DELETE',
    });
  }

  // Donor Partners API
  async getDonorPartners() {
    return this.request<BackendDonorPartner[]>('/donor-partners');
  }

  // Ratings API
  async createRating(toUserId: string, transactionId: string, stars: number, comment: string, isPublic?: boolean) {
    return this.request<BackendRating>('/ratings', {
      method: 'POST',
      body: JSON.stringify({
        to_user_id: toUserId,
        transaction_id: transactionId,
        stars,
        comment,
        is_public: isPublic !== false,
      }),
    });
  }

  async getRatings(toUserId?: string) {
    const query = toUserId ? `?to_user_id=${toUserId}` : '';
    return this.request(`/ratings${query}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

