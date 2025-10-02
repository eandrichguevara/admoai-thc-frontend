'use client';

import { useQuery } from '@tanstack/react-query';
import AdCard from '../components/AdCard/index';
import type { AdStatus, AdSpot } from '../types/adSpot';
import styles from './page.module.css';

const fetchAdSpots = async () => {
  const res = await fetch('/api/adspots');
  if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
  return res.json();
};

export default function Home() {
  const { data, error, isLoading } = useQuery<AdSpot[], Error>({
    queryKey: ['adspots'],
    queryFn: fetchAdSpots,
  });

  return (
    <main className={styles.root}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Hello Mobility Ad Spots!</h1>

        {error && <div>Failed to load ad spots</div>}

        {isLoading && <div>Loading...</div>}

        {!isLoading && Array.isArray(data) && (
          <div className={styles.cards}>
            {data.length === 0 && <div>No ad spots yet</div>}
            {data.map((ad: { id: string; title: string; imageUrl?: string; status?: string }) => (
              <AdCard
                key={ad.id}
                title={ad.title}
                imageUrl={ad.imageUrl ?? '/file.svg'}
                status={(ad.status ?? 'active') as AdStatus}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
