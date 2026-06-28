export class GeoCodingService {
  /**
   * Helper to fetch coordinate details for display if needed
   */
  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch('/api/ai/reverse-geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hero_token') || ''}`
        },
        body: JSON.stringify({ lat, lng })
      });
      if (response.ok) {
        const data = await response.json();
        return data.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    } catch (e) {
      console.error("Reverse geocode failed, using coordinates format.", e);
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
