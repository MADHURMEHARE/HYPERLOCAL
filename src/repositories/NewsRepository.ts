import { NewsSource } from '../types';

export class NewsRepository {
  private static getHeaders() {
    const token = localStorage.getItem('hero_token') || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getSources(): Promise<NewsSource[]> {
    const response = await fetch('/api/ai-intel/sources', {
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch news sources.');
    }
    return response.json();
  }

  static async createSource(source: Omit<NewsSource, 'id' | 'enabled' | 'lastFetched'>): Promise<NewsSource> {
    const response = await fetch('/api/ai-intel/sources', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(source)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create news source.');
    }
    return response.json();
  }

  static async toggleSource(id: string, enabled: boolean): Promise<NewsSource> {
    const response = await fetch(`/api/ai-intel/sources/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ enabled })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update news source.');
    }
    return response.json();
  }
}
