import { AIIncident } from '../types';

export class AIIncidentRepository {
  private static getHeaders() {
    const token = localStorage.getItem('hero_token') || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getIncidents(): Promise<AIIncident[]> {
    const response = await fetch('/api/ai-intel/incidents', {
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch AI incidents.');
    }
    return response.json();
  }

  static async getIncidentById(id: string): Promise<AIIncident> {
    const response = await fetch(`/api/ai-intel/incidents/${id}`, {
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch AI incident.');
    }
    return response.json();
  }

  static async deleteIncident(id: string): Promise<boolean> {
    const response = await fetch(`/api/ai-intel/incidents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to dismiss incident.');
    }
    const data = await response.json();
    return data.success;
  }

  static async verifyIncident(id: string): Promise<{ success: boolean; message: string; issue: any }> {
    const response = await fetch(`/api/ai-intel/incidents/${id}/verify`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to verify incident.');
    }
    return response.json();
  }

  static async triggerCrawl(): Promise<{ success: boolean; articlesProcessed: number; newIncidentsCreated: number; details: any[] }> {
    const response = await fetch('/api/ai-intel/crawl', {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to trigger AI news monitor scan.');
    }
    return response.json();
  }
}
