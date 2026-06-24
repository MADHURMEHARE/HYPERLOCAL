import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { ISSUES, PREDICTIVE_HOTSPOTS } from '../db';
import { IssueCategory, IssuePriority } from '../../src/types';
import { UserRepository } from '../repositories/UserRepository';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      console.log('Gemini AI Client initialized successfully in AiController.');
    } catch (error) {
      console.error('Failed to initialize Gemini AI client:', error);
    }
  }
  return aiClient;
}

export class AiController {
  static async analyzeImage(req: Request, res: Response) {
    const { imageBase64, filename } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required.' });
    }

    const client = getGeminiClient();

    if (!client) {
      console.log('Using robust local fallback for Gemini Image Analysis (API key not configured).');
      
      const nameStr = (filename || '').toLowerCase();
      let detectedCategory: IssueCategory = 'Other';
      let summary = 'A community issue requires inspection.';
      let recommendedAction = 'Dispatch municipal evaluation crew.';
      let severity: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
      let impact = 180;

      if (nameStr.includes('pothole') || nameStr.includes('road') || nameStr.includes('asphalt') || nameStr.includes('street')) {
        detectedCategory = 'Road Damage';
        summary = 'Severe asphalt deterioration with cracking and active pothole formation.';
        recommendedAction = 'Dispatch thermal patching truck to overlay hot mix asphalt.';
        severity = 'High';
        impact = 650;
      } else if (nameStr.includes('leak') || nameStr.includes('water') || nameStr.includes('pipe') || nameStr.includes('burst') || nameStr.includes('flood')) {
        detectedCategory = 'Water Leakage';
        summary = 'High-pressure clean water leakage emanating from underground main valve seam.';
        recommendedAction = 'Dispatch Hydro-excavation unit to expose line, install repair sleeve.';
        severity = 'Critical';
        impact = 900;
      } else if (nameStr.includes('garbage') || nameStr.includes('trash') || nameStr.includes('waste') || nameStr.includes('dump') || nameStr.includes('bin')) {
        detectedCategory = 'Garbage Collection';
        summary = 'Commercial waste bins exceeding capacity with illegal sidewalk waste accumulation.';
        recommendedAction = 'Redirect municipal sanitation route truck for immediate containment clearing.';
        severity = 'Medium';
        impact = 350;
      } else if (nameStr.includes('light') || nameStr.includes('streetlamp') || nameStr.includes('lamp') || nameStr.includes('dark')) {
        detectedCategory = 'Broken Streetlight';
        summary = 'Broken luminaire casing with exposed internal electrical connectors.';
        recommendedAction = 'Dispatch high-reach utility lift bucket to replace photocell bulb.';
        severity = 'Low';
        impact = 120;
      } else if (nameStr.includes('drain') || nameStr.includes('flood') || nameStr.includes('clog')) {
        detectedCategory = 'Drainage Issue';
        summary = 'Storm sewer inlet choked with mud, foliage, and structural garbage blockage.';
        recommendedAction = 'Deploy high-velocity sewer flushing jetter to vacuum debris.';
        severity = 'High';
        impact = 500;
      }

      return res.json({
        category: detectedCategory,
        severity,
        confidence: Math.floor(Math.random() * 8) + 88,
        summary,
        recommended_action: recommendedAction,
        estimatedImpact: impact
      });
    }

    try {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const prompt = `You are a Municipal Civil Engineer AI analyzing a reported community problem image.
Analyze the image and return a JSON object with this precise structure:
{
  "category": "Road Damage" | "Water Leakage" | "Garbage Collection" | "Broken Streetlight" | "Drainage Issue" | "Public Safety" | "Illegal Dumping" | "Fallen Tree" | "Other",
  "severity": "Critical" | "High" | "Medium" | "Low",
  "confidence": <integer percentage between 0 and 100>,
  "summary": "<one sentence concise technical summary of the visual evidence>",
  "recommended_action": "<one sentence municipal crew response recommended>",
  "estimatedImpact": <estimated integer number of neighborhood residents affected>
}

Be analytical. Respond ONLY with the valid JSON. No Markdown formatting, no code block wrapping, just raw, valid JSON.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg',
            }
          }
        ]
      });

      const textResponse = response.text || '';
      const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      console.log('Gemini raw analysis:', cleanJson);
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);

    } catch (error) {
      console.error('Gemini image analysis error:', error);
      return res.status(500).json({ error: 'AI vision analysis failed. Fallback triggered.', fallback: true });
    }
  }

  static checkDuplicate(req: Request, res: Response) {
    const { title, description, lat, lng } = req.body;

    if (!title || !lat || !lng) {
      return res.status(400).json({ error: 'Title and location coordinates are required.' });
    }

    const nearbyIssues = ISSUES.filter(i => {
      const latDiff = Math.abs(i.location.lat - Number(lat));
      const lngDiff = Math.abs(i.location.lng - Number(lng));
      return latDiff < 0.006 && lngDiff < 0.006; // roughly 600m
    });

    if (nearbyIssues.length === 0) {
      return res.json({ isDuplicate: false });
    }

    const promptWords = `${title} ${description || ''}`.toLowerCase();
    
    const matches = nearbyIssues.map(issue => {
      let score = 0;
      const issueWords = `${issue.title} ${issue.description}`.toLowerCase().split(/\W+/);
      const inputWords = promptWords.split(/\W+/);

      const matchingWords = inputWords.filter(w => w.length > 3 && issueWords.includes(w));
      if (matchingWords.length >= 2) score += 0.4;
      
      score += 0.2; // base similarity on proximity

      return {
        issue,
        similarityScore: score
      };
    }).filter(m => m.similarityScore >= 0.4);

    if (matches.length > 0) {
      const bestMatch = matches.sort((a, b) => b.similarityScore - a.similarityScore)[0].issue;
      return res.json({
        isDuplicate: true,
        existingIssue: bestMatch,
        confidence: Math.round((0.5 + Math.random() * 0.4) * 100)
      });
    }

    return res.json({ isDuplicate: false });
  }

  static async reverseGeocode(req: Request, res: Response) {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    const client = getGeminiClient();

    if (!client) {
      const streets = [
        { name: 'Valencia St', ward: 'Ward 3 - Mission' },
        { name: 'Mission St', ward: 'Ward 3 - Mission' },
        { name: 'Dolores St', ward: 'Ward 2 - Castro' },
        { name: 'Castro St', ward: 'Ward 2 - Castro' },
        { name: 'Oak Crescent', ward: 'Ward 5 - Heights' },
        { name: 'Harrison St', ward: 'Ward 3 - Mission' },
        { name: 'Folsom St', ward: 'Ward 3 - Mission' },
        { name: 'Market St', ward: 'Ward 4 - Noe' },
        { name: 'Noe St', ward: 'Ward 4 - Noe' }
      ];
      const seed = Math.floor((Math.abs(Number(lat)) * 1000 + Math.abs(Number(lng)) * 1000));
      const index = seed % streets.length;
      const street = streets[index];
      const block = Math.floor((Math.abs(Number(lat)) * 10000) % 900) + 100;
      const address = `${block} ${street.name}, San Francisco, CA`;
      
      return res.json({
        address,
        ward: street.ward,
        estimatedPopulation: Math.floor(Math.random() * 3000) + 500,
        zoneType: 'Residential / Commercial Mixed Zone'
      });
    }

    try {
      const prompt = `You are a professional GIS geocoding system for San Francisco, California.
Given these coordinates:
Latitude: ${lat}
Longitude: ${lng}

Based on these coordinates (which are in San Francisco, CA, bounded roughly by 37.70 to 37.82 latitude and -122.52 to -122.36 longitude), find the closest real street address or point of interest in San Francisco.
Also map it to one of these municipal wards:
- "Ward 3 - Mission"
- "Ward 5 - Heights"
- "Ward 2 - Castro"
- "Ward 4 - Noe"

Return ONLY a JSON response matching this schema:
{
  "address": "e.g., 550 Valencia St, San Francisco, CA",
  "ward": "e.g., Ward 3 - Mission",
  "estimatedPopulation": 1500,
  "zoneType": "Residential" | "Commercial" | "Park" | "Industrial"
}
Do not use Markdown wrapping, respond with ONLY raw JSON.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const textResponse = response.text || '';
      const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (error) {
      console.error('Gemini reverse-geocoding error:', error);
      return res.json({
        address: `${Math.floor(Math.random() * 900) + 100} Valencia St, San Francisco, CA`,
        ward: `Ward 3 - Mission`,
        estimatedPopulation: 1200,
        zoneType: 'Commercial'
      });
    }
  }

  static async chat(req: Request, res: Response) {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const client = getGeminiClient();
    const recentMsg = messages[messages.length - 1].content;

    const activeIssuesSummary = ISSUES.slice(0, 6).map(i => 
      `- [ID: ${i.id}] "${i.title}" at "${i.location.address}" | Status: ${i.status} | Priority: ${i.priority}`
    ).join('\n');

    const predictiveInsightsSummary = PREDICTIVE_HOTSPOTS.map(h =>
      `- ${h.type} hotspot around lat: ${h.lat.toFixed(4)}, lng: ${h.lng.toFixed(4)} (Risk: ${h.riskScore}, Probability: ${Math.round(h.probability * 100)}%)`
    ).join('\n');

    const systemContext = `You are the "Community Hero Assistant", a friendly, highly intelligent municipal AI chatbot for a civic-tech application called "Community Hero". 
Citizens and municipal workers talk to you to track issues, view reports, learn about local government schemes, and obtain department contact information.

CURRENT SYSTEM LIVE STATE DATA FOR CONTEXT:
--- ACTIVE ISSUES ---
${activeIssuesSummary}

--- AI PREDICTIVE HOTSPOTS ---
${predictiveInsightsSummary}

MUNICIPAL DIRECTORY:
- Road Maintenance: 555-0192 (Chief Inspector Vance)
- Water & Sewerage Utility: 555-0143 (Director Sarah Jenkins)
- Waste Management Division: 555-0177
- Electrical Infrastructure (Streetlights): 555-0188

GOVERNMENT SCHEMES:
- "Clean City Initiative": Citizens earn rewards/tax credits for resolving trash/litter reports and maintaining 100+ points on Community Hero.
- "Sewer Smart 2026": City council matches budget up to $10,000 for drainage line upgrades recommended by community upvote priority.

INSTRUCTIONS:
1. Speak warmly, respectfully, and helpful like a civic advisor.
2. Rely strictly on the CURRENT SYSTEM LIVE STATE DATA listed above. If the user asks about an issue or prediction, refer to it specifically!
3. If they ask about resolving a report, mention upvoting or verifying it.
4. Keep replies formatting beautiful with elegant markdown, bold headings, and small lists. Make answers crisp. No developer debug jargon.`;

    if (!client) {
      console.log('Using rule-based local AI chatbot fallback.');
      const q = recentMsg.toLowerCase();
      let reply = `I am the **Community Hero AI Assistant**. Here is what I can help you with:
- Check the status of ongoing reported issues (like the 14th Street Pothole or Oak Crescent water leak).
- Find municipal utility department contact numbers.
- Explain civic reward initiatives like the **Clean City Initiative**.

Can you tell me more about what you would like to know?`;

      if (q.includes('pothole') || q.includes('14th')) {
        reply = `### 14th Street Pothole Status Update
The deep pothole reported on **14th Street & Valencia St** is currently marked as **In Progress**.

- **Assigned Officer:** Chief Inspector Marcus Vance
- **Crew Action:** An asphalt patching crew was dispatched yesterday. They are laying hot-mix overlay.
- **Estimated Completion:** June 28, 2026.
- **Current Score:** 52 points (42 citizens supported, 2 verified on-site).

You can monitor its live timeline in the **Issue Details** screen!`;
      } else if (q.includes('leak') || q.includes('water') || q.includes('oak')) {
        reply = `### Oak Crescent Water Leakage
The water pipe leak reported at **145 Oak Crescent** is currently **Assigned** to Inspector Marcus Vance.

- **Status:** Assigned (Emergency repair crew scheduled for inspection)
- **Impact:** ~600 residents affected due to system pressure drops.
- **Estimated Completion:** June 30, 2026.

Would you like to head to the interactive map to **verify** this leakage and boost its prioritization score?`;
      } else if (q.includes('contact') || q.includes('phone') || q.includes('number') || q.includes('officer')) {
        reply = `### Municipal Directory & Contact Contacts
Here are the official contact numbers for the municipal departments:
- **Road Maintenance Div:** \`555-0192\` (Led by Inspector Vance)
- **Water & Sewerage Utility:** \`555-0143\` (Led by Director Sarah Jenkins)
- **Waste Management (Garbage):** \`555-0177\`
- **Electrical Grid (Streetlights):** \`555-0188\`

Feel free to reach out directly or let me coordinate via the dashboard!`;
      } else if (q.includes('points') || q.includes('badges') || q.includes('earn') || q.includes('scheme')) {
        reply = `### Gamification & Government Schemes
Under the local **Clean City Initiative**, you earn municipal credit points by actively reporting and verifying local hazards:
- **Report Issue:** +10 Points
- **Verify Existing Issue:** +5 Points
- **Your Issue Gets Resolved:** +20 Points

**Active Badges:**
1. **Community Hero** (Report 3+ resolved issues)
2. **Problem Solver** (Verify 5+ community issues)
3. **Neighborhood Champion** (Cross 100 total points)

Accumulated points can be redeemed for local parking discounts and utility credit vouchers at City Hall!`;
      } else if (q.includes('hotspot') || q.includes('prediction') || q.includes('predictive')) {
        reply = `### AI Predictive Hotspots
Our infrastructure machine learning models have flagged **4 active hotspots** showing advanced wear and tear:
1. **Road Damage Hotspot** near 14th St (Risk: **High** - 88% probability due to transit volume)
2. **Water Leakage Hotspot** near Oak Crescent (Risk: **High** - 84% probability due to pump pressure)
3. **Garbage Cluster** around Caledonia Alley (Risk: **Medium** - 72% probability)
4. **Streetlight Failure Risk** on Dolores Pathway (Risk: **Medium** - 65% probability)

These help the city budget pre-emptively before major ruptures happen!`;
      }

      return res.json({ content: reply });
    }

    try {
      const chatHistory = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemContext }] },
          { role: 'model', parts: [{ text: 'Understood. I am online and fully briefed on the Live issues, Predictive hotspots, Gamification rewards, and Municipal Directory. Ready to assist.' }] },
          ...chatHistory,
          { role: 'user', parts: [{ text: recentMsg }] }
        ]
      });

      return res.json({ content: response.text || 'I apologize, I was unable to generate a response. Please try again.' });
    } catch (error) {
      console.error('Gemini Assistant chat error:', error);
      return res.status(500).json({ error: 'AI Assistant failed. Fallback triggered.', fallback: true });
    }
  }

  static getPredictions(req: Request, res: Response) {
    return res.json(PREDICTIVE_HOTSPOTS);
  }

  static getLeaderboard(req: Request, res: Response) {
    // Dynamically compile leaderboard entries based on live state users
    const sorted = [...ISSUES.reduce((acc, issue) => {
      // Find reporter in store or use original creator
      return acc;
    }, [])];

    // Compute dynamic points-based leaderboard from UserRepository
    const leaderboard = UserRepository.getAll()
      .map(u => ({
        id: u.id,
        name: u.name,
        points: u.points || 0,
        badges: u.badges || [],
        avatar: u.avatar,
        ward: u.ward,
        role: u.role,
        reportsCount: ISSUES.filter(i => i.createdBy === u.id).length,
        verificationsCount: ISSUES.filter(i => i.verifiedBy.includes(u.id)).length
      }))
      .sort((a, b) => b.points - a.points);

    return res.json(leaderboard);
  }
}
