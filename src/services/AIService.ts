import { AIIncident } from '../types';
import { AIIncidentRepository } from '../repositories/AIIncidentRepository';

export class AIService {
  static async fetchAllIncidents(): Promise<AIIncident[]> {
    return AIIncidentRepository.getIncidents();
  }

  static async fetchIncidentById(id: string): Promise<AIIncident> {
    return AIIncidentRepository.getIncidentById(id);
  }

  static async verifyIncident(id: string): Promise<{ success: boolean; message: string; issue: any }> {
    return AIIncidentRepository.verifyIncident(id);
  }

  static async dismissIncident(id: string): Promise<boolean> {
    return AIIncidentRepository.deleteIncident(id);
  }

  static async triggerNewsMonitorCrawl(): Promise<{ success: boolean; articlesProcessed: number; newIncidentsCreated: number; details: any[] }> {
    return AIIncidentRepository.triggerCrawl();
  }

  // Analytics Helpers for Dashboard Charts
  static getMetrics(incidents: AIIncident[]) {
    const total = incidents.length;
    const verified = incidents.filter(i => i.verified).length;
    const detected = incidents.filter(i => i.status === 'Detected').length;
    
    // Group by severity
    const severityCount = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    incidents.forEach(i => {
      const sev = i.severity as keyof typeof severityCount;
      if (sev in severityCount) {
        severityCount[sev]++;
      } else {
        severityCount.Medium++;
      }
    });

    // Group by category
    const categoryCount: Record<string, number> = {};
    incidents.forEach(i => {
      categoryCount[i.category] = (categoryCount[i.category] || 0) + 1;
    });

    return {
      total,
      verified,
      detected,
      severityCount,
      categoryCount
    };
  }
}
