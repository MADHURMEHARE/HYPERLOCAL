import { prisma, runWithFallback } from '../../prisma/prisma-client';

export interface DB_AIIncident {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  confidence: number;
  latitude: number;
  longitude: number;
  location: string;
  city: string | null;
  state: string | null;
  country: string | null;
  sourceName: string;
  sourceUrl: string;
  imageUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  duplicateScore: number;
}

export interface DB_NewsSource {
  id: string;
  name: string;
  rssUrl: string;
  website: string | null;
  enabled: boolean;
  lastFetched: Date | null;
}

// In-Memory Fallbacks for robustness
export let MOCK_AI_INCIDENTS: DB_AIIncident[] = [
  {
    id: "ai_inc_1",
    title: "Critical Water Pipe Rupture Near Lane 5 Koregaon Park Pune",
    description: "Thousands of gallons of drinking water are pouring onto Lane 5 of Koregaon Park. The basement parking of local residential societies is currently flooded. The rupture has eroded a portion of the sidewalk foundation.",
    category: "Water Leakage",
    severity: "Critical",
    confidence: 96,
    latitude: 18.5362,
    longitude: 73.8940,
    location: "Lane 5, Koregaon Park, Pune, Maharashtra, India",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    sourceName: "Maharashtra News Network",
    sourceUrl: "https://example.com/mhn/kp-water-burst",
    imageUrl: "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800",
    status: "Detected",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hrs ago
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    verified: false,
    duplicateScore: 0.0
  },
  {
    id: "ai_inc_2",
    title: "Large Crater-Like Pothole Blocking MG Road Near West End",
    description: "Commuters report severe traffic bottlenecks near the West End junction on MG Road. A massive, deep pothole has formed, causing cars to swerve dangerously. Two bikers have reportedly skidded over the wet debris.",
    category: "Road Damage",
    severity: "High",
    confidence: 91,
    latitude: 18.5215,
    longitude: 73.8785,
    location: "MG Road, Pune, Maharashtra, India",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    sourceName: "Pune Local Gazette",
    sourceUrl: "https://example.com/pune-local/mg-road-pothole",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800",
    status: "Detected",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hr ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    verified: false,
    duplicateScore: 0.0
  },
  {
    id: "ai_inc_3",
    title: "Overhead Electrical Circuit Sparking Triggering Power Outage in Kothrud",
    description: "High-voltage wires began sparking near the local playground in Kothrud, dropping live embers on the street. Residents report temporary localized blackouts. Engineers are en route to replace the transformer breaker.",
    category: "Broken Streetlight",
    severity: "Medium",
    confidence: 89,
    latitude: 18.5074,
    longitude: 73.8077,
    location: "Kothrud, Pune, Maharashtra, India",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    sourceName: "Pune Local Gazette",
    sourceUrl: "https://example.com/pune-local/kothrud-blackout",
    imageUrl: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=800",
    status: "Detected",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    verified: false,
    duplicateScore: 0.0
  },
  {
    id: "ai_inc_4",
    title: "Water Main Leakage in San Francisco Mission District Intersections",
    description: "Major water main rupture at 16th Street and Mission Street. Local businesses report flooded entryways and drop in water pressure. SFPUC crews are excavating the pavement to replace the damaged valve.",
    category: "Water Leakage",
    severity: "High",
    confidence: 94,
    latitude: 37.7650,
    longitude: -122.4200,
    location: "16th St & Mission St, San Francisco, CA",
    city: "San Francisco",
    state: "California",
    country: "United States",
    sourceName: "Bay Area Chronicle",
    sourceUrl: "https://example.com/sf-chronicle/mission-leak",
    imageUrl: "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=800",
    status: "Detected",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    verified: false,
    duplicateScore: 0.0
  }
];

export let MOCK_NEWS_SOURCES: DB_NewsSource[] = [
  {
    id: "src_1",
    name: "Pune Local Gazette",
    rssUrl: "https://example.com/rss/pune-local",
    website: "https://example.com/pune-local",
    enabled: true,
    lastFetched: new Date()
  },
  {
    id: "src_2",
    name: "Bay Area Chronicle",
    rssUrl: "https://example.com/rss/bay-area-chronicle",
    website: "https://example.com/bay-chronicle",
    enabled: true,
    lastFetched: new Date()
  },
  {
    id: "src_3",
    name: "Maharashtra News Network",
    rssUrl: "https://example.com/rss/mhn",
    website: "https://example.com/mhn",
    enabled: true,
    lastFetched: new Date()
  }
];

export class AIIncidentRepository {
  // --- AI Incident Queries & Actions ---

  static async getAll(): Promise<DB_AIIncident[]> {
    return runWithFallback(
      async () => {
        return await prisma!.aIIncident.findMany({
          orderBy: { createdAt: 'desc' }
        });
      },
      async () => {
        return [...MOCK_AI_INCIDENTS].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
    );
  }

  static async findById(id: string): Promise<DB_AIIncident | null> {
    return runWithFallback(
      async () => {
        return await prisma!.aIIncident.findUnique({
          where: { id }
        });
      },
      async () => {
        return MOCK_AI_INCIDENTS.find(i => i.id === id) || null;
      }
    );
  }

  static async create(data: Omit<DB_AIIncident, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'verified'>): Promise<DB_AIIncident> {
    const id = "ai_inc_" + Math.random().toString(36).substr(2, 9);
    const now = new Date();
    
    return runWithFallback(
      async () => {
        return await prisma!.aIIncident.create({
          data: {
            title: data.title,
            description: data.description,
            category: data.category,
            severity: data.severity,
            confidence: data.confidence,
            latitude: data.latitude,
            longitude: data.longitude,
            location: data.location,
            city: data.city,
            state: data.state,
            country: data.country,
            sourceName: data.sourceName,
            sourceUrl: data.sourceUrl,
            imageUrl: data.imageUrl,
            status: "Detected",
            verified: false,
            duplicateScore: data.duplicateScore
          }
        });
      },
      async () => {
        const newItem: DB_AIIncident = {
          id,
          ...data,
          status: "Detected",
          verified: false,
          createdAt: now,
          updatedAt: now
        };
        MOCK_AI_INCIDENTS.unshift(newItem);
        return newItem;
      }
    );
  }

  static async update(id: string, updates: Partial<DB_AIIncident>): Promise<DB_AIIncident | null> {
    return runWithFallback(
      async () => {
        return await prisma!.aIIncident.update({
          where: { id },
          data: {
            ...updates,
            updatedAt: new Date()
          }
        });
      },
      async () => {
        const index = MOCK_AI_INCIDENTS.findIndex(i => i.id === id);
        if (index === -1) return null;
        
        MOCK_AI_INCIDENTS[index] = {
          ...MOCK_AI_INCIDENTS[index],
          ...updates,
          updatedAt: new Date()
        };
        return MOCK_AI_INCIDENTS[index];
      }
    );
  }

  static async delete(id: string): Promise<boolean> {
    return runWithFallback(
      async () => {
        await prisma!.aIIncident.delete({
          where: { id }
        });
        return true;
      },
      async () => {
        const index = MOCK_AI_INCIDENTS.findIndex(i => i.id === id);
        if (index === -1) return false;
        MOCK_AI_INCIDENTS.splice(index, 1);
        return true;
      }
    );
  }

  // --- News Source Queries & Actions ---

  static async getSources(): Promise<DB_NewsSource[]> {
    return runWithFallback(
      async () => {
        return await prisma!.newsSource.findMany({
          orderBy: { name: 'asc' }
        });
      },
      async () => {
        return MOCK_NEWS_SOURCES;
      }
    );
  }

  static async createSource(data: Omit<DB_NewsSource, 'id' | 'enabled' | 'lastFetched'>): Promise<DB_NewsSource> {
    const id = "src_" + Math.random().toString(36).substr(2, 9);
    
    return runWithFallback(
      async () => {
        return await prisma!.newsSource.create({
          data: {
            name: data.name,
            rssUrl: data.rssUrl,
            website: data.website,
            enabled: true
          }
        });
      },
      async () => {
        const newItem: DB_NewsSource = {
          id,
          ...data,
          enabled: true,
          lastFetched: null
        };
        MOCK_NEWS_SOURCES.push(newItem);
        return newItem;
      }
    );
  }

  static async updateSource(id: string, updates: Partial<DB_NewsSource>): Promise<DB_NewsSource | null> {
    return runWithFallback(
      async () => {
        return await prisma!.newsSource.update({
          where: { id },
          data: updates
        });
      },
      async () => {
        const idx = MOCK_NEWS_SOURCES.findIndex(s => s.id === id);
        if (idx === -1) return null;
        MOCK_NEWS_SOURCES[idx] = {
          ...MOCK_NEWS_SOURCES[idx],
          ...updates
        };
        return MOCK_NEWS_SOURCES[idx];
      }
    );
  }
}
