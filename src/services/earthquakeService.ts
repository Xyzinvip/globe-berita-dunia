export interface EarthquakeItem {
  id: string;
  coords: [number, number]; // [lon, lat]
  mag: number;
  place: string;
  time: number;
}

let cachedQuakes: EarthquakeItem[] | null = null;
let lastFetchTime = 0;

export async function fetchUSGSEarthquakes(): Promise<EarthquakeItem[]> {
  const now = Date.now();
  // Cache for 5 minutes
  if (cachedQuakes && now - lastFetchTime < 300000) {
    return cachedQuakes;
  }

  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
      { cache: 'no-cache' }
    );
    if (!res.ok) throw new Error(`USGS HTTP ${res.status}`);
    const data = await res.json();

    const items: EarthquakeItem[] = (data.features || []).map((f: any) => ({
      id: f.id,
      coords: [f.geometry.coordinates[0], f.geometry.coordinates[1]] as [number, number],
      mag: f.properties.mag || 2.5,
      place: f.properties.place || 'Unknown Location',
      time: f.properties.time,
    }));

    cachedQuakes = items;
    lastFetchTime = now;
    return items;
  } catch (err) {
    console.warn('Failed to fetch USGS earthquakes:', err);
    return cachedQuakes || [];
  }
}
