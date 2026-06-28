export class DuplicateDetector {
  /**
   * Calculates the Haversine distance in kilometers between two coordinates
   */
  static getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculates a simple Jaccard-like similarity score (0.0 to 1.0) between two strings
   */
  static getStringSimilarity(str1: string, str2: string): number {
    const getWords = (s: string) => new Set(s.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3));
    const words1 = getWords(str1);
    const words2 = getWords(str2);

    if (words1.size === 0 || words2.size === 0) return 0;

    let intersection = 0;
    for (const w of words1) {
      if (words2.has(w)) {
        intersection++;
      }
    }

    const union = words1.size + words2.size - intersection;
    return intersection / union;
  }

  /**
   * Computes a duplicate score between an incoming incident and an existing one.
   * Returns a score between 0 and 1.0.
   */
  static computeScore(
    incoming: { title: string; category: string; latitude: number; longitude: number },
    existing: { title: string; category: string; latitude: number; longitude: number }
  ): number {
    // 1. Category must match (or both must be "Other")
    if (incoming.category !== existing.category) {
      return 0.0;
    }

    // 2. Geographic distance check (must be within 1.0 km)
    const distanceKm = this.getHaversineDistance(
      incoming.latitude,
      incoming.longitude,
      existing.latitude,
      existing.longitude
    );

    if (distanceKm > 1.0) {
      return 0.0; // Too far apart to be the same local municipal issue
    }

    // Weight 1: Distance (closer is higher similarity)
    // 1.0km -> 0 points, 0km -> 1.0 points
    const distanceScore = Math.max(0, 1.0 - distanceKm);

    // Weight 2: Text similarity of titles
    const textScore = this.getStringSimilarity(incoming.title, existing.title);

    // Composite score
    return (distanceScore * 0.4) + (textScore * 0.6);
  }
}
