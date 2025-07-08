import { authService } from './aws-auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/prod';

export class ApiClient {
  private async getHeaders(): Promise<Record<string, string>> {
    const token = await authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`${response.status}: ${error.error || 'Request failed'}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`${response.status}: ${error.error || 'Request failed'}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`${response.status}: ${error.error || 'Request failed'}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`${response.status}: ${error.error || 'Request failed'}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();