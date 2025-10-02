import AdSpotList from '../components/AdSpotList/index';
import type { AdSpot } from '../types/adSpot';

async function fetchAdSpots(): Promise<AdSpot[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/adspots`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`Failed to fetch ad spots: ${res.status}`);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching ad spots:', error);
    return [];
  }
}

export default async function Home() {
  const adSpots = await fetchAdSpots();

  return <AdSpotList adSpots={adSpots} />;
}
