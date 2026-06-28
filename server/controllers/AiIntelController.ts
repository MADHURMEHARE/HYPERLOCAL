import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { AIIncidentRepository } from '../repositories/AIIncidentRepository';
import { IssueRepository } from '../repositories/IssueRepository';
import { NewsCrawler } from '../services/NewsCrawler';
import { GeminiAnalyzer } from '../services/GeminiAnalyzer';
import { GeoLocationService } from '../services/GeoLocationService';
import { DuplicateDetector } from '../services/DuplicateDetector';
import { NotificationRepository } from '../repositories/NotificationRepository';

export class AiIntelController {
  static async getIncidents(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'officer' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Officers or Admins only.' });
      }

      const incidents = await AIIncidentRepository.getAll();
      return res.json(incidents);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to retrieve AI incidents.' });
    }
  }

  static async getIncidentById(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'officer' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Officers or Admins only.' });
      }

      const incident = await AIIncidentRepository.findById(req.params.id);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found.' });
      }
      return res.json(incident);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to retrieve incident details.' });
    }
  }

  static async deleteIncident(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'officer' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Officers or Admins only.' });
      }

      const success = await AIIncidentRepository.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Incident not found.' });
      }
      return res.json({ success: true, message: 'Incident ignored and removed successfully.' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete incident.' });
    }
  }

  static async verifyIncident(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'officer' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Officers or Admins only.' });
      }

      const incidentId = req.params.id;
      const incident = await AIIncidentRepository.findById(incidentId);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found.' });
      }

      if (incident.status === 'Verified') {
        return res.status(400).json({ error: 'Incident is already verified and escalated.' });
      }

      // Escalation Step: Create an official civic issue using IssueRepository.create
      const newIssue = await IssueRepository.create({
        title: `[AI Escalated] ${incident.title}`,
        description: incident.description,
        category: incident.category as any,
        severity: incident.severity as any,
        location: {
          lat: incident.latitude,
          lng: incident.longitude,
          address: incident.location,
          ward: 'Citywide'
        },
        imageUrl: incident.imageUrl || undefined,
        aiConfidence: incident.confidence,
        createdBy: req.user.id,
        creatorName: 'Municipal AI Integration',
        creatorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150',
        estimatedImpact: 250
      });

      // Update AIIncident status
      await AIIncidentRepository.update(incidentId, {
        verified: true,
        status: 'Verified'
      });

      // Separate Notifications: Municipal Alert / Officer Alert using correct positional arguments
      try {
        await NotificationRepository.create(
          req.user.id,
          '🚨 AI Incident Verified',
          `Incident "${incident.title}" has been verified and escalated to a priority report.`,
          'success',
          newIssue.id
        );
      } catch (e) {
        console.warn("Could not dispatch push notification, skipping gracefully.", e);
      }

      return res.json({ 
        success: true, 
        message: 'Incident verified and successfully escalated to an official report.',
        issue: newIssue
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to verify and escalate incident.' });
    }
  }

  static async triggerCrawl(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.role !== 'officer' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Officers or Admins only.' });
      }

      const sources = await AIIncidentRepository.getSources();
      const enabledSources = sources.filter(s => s.enabled);
      
      let articlesProcessed = 0;
      let newIncidentsCreated = 0;
      const processedDetails = [];

      // Fetch existing incidents to run duplicate detection
      const existingIncidents = await AIIncidentRepository.getAll();

      for (const src of enabledSources) {
        const rawArticles = await NewsCrawler.fetchLatestArticles(src.rssUrl);
        const batch = rawArticles.slice(0, 2);

        for (const article of batch) {
          articlesProcessed++;

          const isExactDuplicate = existingIncidents.some(
            existing => existing.title.toLowerCase() === article.title.toLowerCase() ||
                        existing.sourceUrl === article.sourceUrl
          );

          if (isExactDuplicate) {
            continue;
          }

          const extracted = await GeminiAnalyzer.analyzeArticle(article.title, article.description);
          const geoResult = await GeoLocationService.geocode(extracted.location);

          let maxDuplicateScore = 0.0;
          let isDuplicate = false;

          for (const existing of existingIncidents) {
            const score = DuplicateDetector.computeScore(
              {
                title: extracted.title,
                category: extracted.category,
                latitude: geoResult.latitude,
                longitude: geoResult.longitude
              },
              {
                title: existing.title,
                category: existing.category,
                latitude: existing.latitude,
                longitude: existing.longitude
              }
            );

            if (score > maxDuplicateScore) {
              maxDuplicateScore = score;
            }

            if (score >= 0.75) {
              isDuplicate = true;
              const newConfidence = Math.min(100, Math.round((existing.confidence + extracted.confidence) / 2) + 5);
              await AIIncidentRepository.update(existing.id, {
                confidence: newConfidence,
                duplicateScore: Math.max(existing.duplicateScore, score)
              });
              
              processedDetails.push({
                title: article.title,
                status: "Merged (Duplicate)",
                duplicateScore: score
              });
              break;
            }
          }

          if (isDuplicate) {
            continue;
          }

          const newIncident = await AIIncidentRepository.create({
            title: extracted.title,
            description: extracted.description,
            category: extracted.category,
            severity: extracted.severity,
            confidence: extracted.confidence,
            latitude: geoResult.latitude,
            longitude: geoResult.longitude,
            location: geoResult.locationName,
            city: geoResult.city || null,
            state: geoResult.state || null,
            country: geoResult.country || null,
            sourceName: article.sourceName,
            sourceUrl: article.sourceUrl,
            imageUrl: article.imageUrl || null,
            duplicateScore: maxDuplicateScore
          });

          newIncidentsCreated++;
          processedDetails.push({
            id: newIncident.id,
            title: newIncident.title,
            status: "Created",
            location: newIncident.location,
            duplicateScore: maxDuplicateScore
          });
        }

        await AIIncidentRepository.updateSource(src.id, {
          lastFetched: new Date()
        });
      }

      return res.json({
        success: true,
        articlesProcessed,
        newIncidentsCreated,
        details: processedDetails
      });
    } catch (err: any) {
      console.error("Crawl error:", err);
      return res.status(500).json({ error: err.message || 'Pipeline processing failed.' });
    }
  }
}
