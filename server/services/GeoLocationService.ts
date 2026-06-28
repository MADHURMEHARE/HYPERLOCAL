export interface GeocodeResult {
  latitude: number;
  longitude: number;
  locationName: string;
  city?: string;
  state?: string;
  country?: string;
}

export class GeoLocationService {
  static async geocode(address: string): Promise<GeocodeResult> {
    const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY;

    if (apiKey && apiKey !== 'YOUR_API_KEY' && apiKey.trim() !== '') {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'OK' && data.results?.[0]) {
            const result = data.results[0];
            const { lat, lng } = result.geometry.location;
            
            // Extract components
            let city = "";
            let state = "";
            let country = "";
            
            const components = result.address_components || [];
            for (const c of components) {
              if (c.types.includes('locality')) {
                city = c.long_name;
              } else if (c.types.includes('administrative_area_level_1')) {
                state = c.long_name;
              } else if (c.types.includes('country')) {
                country = c.long_name;
              }
            }

            return {
              latitude: lat,
              longitude: lng,
              locationName: result.formatted_address || address,
              city,
              state,
              country
            };
          }
        }
      } catch (err) {
        console.error("❌ Google Geocoding API request failed, utilizing fallback lookup.", err);
      }
    }

    // Smart Fallback Local Geocoder for Pune & SF Areas
    return this.fallbackGeocode(address);
  }

  private static fallbackGeocode(address: string): GeocodeResult {
    const addr = address.toLowerCase();

    // Default: Pune Central
    let lat = 18.5204;
    let lng = 73.8567;
    let city = "Pune";
    let state = "Maharashtra";
    let country = "India";
    let locationName = address;

    if (addr.includes("mg road")) {
      lat = 18.5215;
      lng = 73.8785;
      locationName = "MG Road, Pune, Maharashtra, India";
    } else if (addr.includes("koregaon park")) {
      lat = 18.5362;
      lng = 73.8940;
      locationName = "Koregaon Park, Pune, Maharashtra, India";
    } else if (addr.includes("kothrud")) {
      lat = 18.5074;
      lng = 73.8077;
      locationName = "Kothrud, Pune, Maharashtra, India";
    } else if (addr.includes("market yard")) {
      lat = 18.4877;
      lng = 73.8688;
      locationName = "Market Yard, Gultekdi, Pune, Maharashtra, India";
    } else if (addr.includes("swargate")) {
      lat = 18.5018;
      lng = 73.8636;
      locationName = "Swargate, Pune, Maharashtra, India";
    } else if (addr.includes("kalyani nagar")) {
      lat = 18.5463;
      lng = 73.9033;
      locationName = "Kalyani Nagar, Pune, Maharashtra, India";
    } else if (addr.includes("fc road") || addr.includes("fergusson")) {
      lat = 18.5246;
      lng = 73.8412;
      locationName = "FC Road, Shivajinagar, Pune, Maharashtra, India";
    } else if (addr.includes("mission") || addr.includes("san francisco") || addr.includes("16th st") || addr.includes("market st") || addr.includes("geary") || addr.includes("lombard")) {
      // SF Geocodes
      city = "San Francisco";
      state = "California";
      country = "United States";
      
      if (addr.includes("mission")) {
        lat = 37.7650;
        lng = -122.4200;
        locationName = "16th St & Mission St, San Francisco, CA";
      } else if (addr.includes("lombard")) {
        lat = 37.8021;
        lng = -122.4188;
        locationName = "Lombard St, San Francisco, CA";
      } else if (addr.includes("geary")) {
        lat = 37.7812;
        lng = -122.4300;
        locationName = "Geary Blvd, San Francisco, CA";
      } else {
        lat = 37.7749;
        lng = -122.4194;
        locationName = "Market St & Powell St, San Francisco, CA";
      }
    }

    return {
      latitude: lat,
      longitude: lng,
      locationName,
      city,
      state,
      country
    };
  }
}
