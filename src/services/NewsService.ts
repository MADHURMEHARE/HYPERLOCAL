import { NewsSource } from '../types';
import { NewsRepository } from '../repositories/NewsRepository';

export interface RawArticle {
  title: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  imageUrl?: string;
  publishedAt: string;
}

export class NewsService {
  static async fetchSources(): Promise<NewsSource[]> {
    return NewsRepository.getSources();
  }

  static async createSource(source: Omit<NewsSource, 'id' | 'enabled' | 'lastFetched'>): Promise<NewsSource> {
    return NewsRepository.createSource(source);
  }

  static async toggleSource(id: string, enabled: boolean): Promise<NewsSource> {
    return NewsRepository.toggleSource(id, enabled);
  }
}
