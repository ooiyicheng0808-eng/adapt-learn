const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  async request(method: string, endpoint: string, body?: any) {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  },

  async post(endpoint: string, body: any) {
    return this.request('POST', endpoint, body);
  },

  async put(endpoint: string, body: any) {
    return this.request('PUT', endpoint, body);
  },

  async get(endpoint: string) {
    return this.request('GET', endpoint);
  }
};

