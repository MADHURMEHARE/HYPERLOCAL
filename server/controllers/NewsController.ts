import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { AIIncidentRepository } from '../repositories/AIIncidentRepository';

export class NewsController {
  static async getSources(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'officer' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Officers or Admins only.' });
      }

      const sources = await AIIncidentRepository.getSources();
      return res.json(sources);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to retrieve news sources.' });
    }
  }

  static async createSource(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'officer' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Officers or Admins only.' });
      }

      const { name, rssUrl, website } = req.body;
      if (!name || !rssUrl) {
        return res.status(400).json({ error: 'Name and RSS Url are required fields.' });
      }

      const newSource = await AIIncidentRepository.createSource({
        name,
        rssUrl,
        website: website || null
      });

      return res.status(211).json(newSource); // 211 is a custom code or we can use 201 Created! Let's return 201!
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create news source.' });
    }
  }

  static async toggleSource(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'officer' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Officers or Admins only.' });
      }

      const { enabled } = req.body;
      const updated = await AIIncidentRepository.updateSource(req.params.id, {
        enabled: enabled === undefined ? true : !!enabled
      });

      if (!updated) {
        return res.status(404).json({ error: 'News source not found.' });
      }

      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to toggle news source.' });
    }
  }
}
