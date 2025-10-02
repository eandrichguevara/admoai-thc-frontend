'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdCard from '../AdCard/index';
import type { AdPlacement, AdSpot } from '../../types/adSpot';
import styles from './styles.module.css';

const placements: AdPlacement[] = [
  'banner',
  'sidebar',
  'interstitial',
  'native',
  'video',
  'footer',
  'header',
];

interface AdSpotListProps {
  adSpots: AdSpot[];
}

export default function AdSpotList({ adSpots }: AdSpotListProps) {
  const router = useRouter();
  const [selectedPlacement, setSelectedPlacement] = useState<AdPlacement | 'all'>('all');

  // Filter ads by placement
  const filteredData =
    selectedPlacement !== 'all'
      ? adSpots.filter((ad) => ad.placement === selectedPlacement)
      : adSpots;

  const handleCreateNew = () => {
    router.push('/adspots/create');
  };

  return (
    <main className={styles.root}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <span className={`material-icons ${styles.logoIcon}`}>campaign</span>
            <div>
              <h1 className={styles.heading}>Ad Spots</h1>
              <p className={styles.subtitle}>Manage your advertising placements</p>
            </div>
          </div>
          <button onClick={handleCreateNew} className={styles.createButton}>
            <span className="material-icons">add_circle_outline</span>
            <span>New Ad Spot</span>
          </button>
        </header>

        <div className={styles.filterSection}>
          <div className={styles.filterLabel}>
            <span className="material-icons">filter_list</span>
            <span>Filter by placement:</span>
          </div>
          <div className={styles.filterChips}>
            <button
              className={`${styles.chip} ${selectedPlacement === 'all' ? styles.chipActive : ''}`}
              onClick={() => setSelectedPlacement('all')}
            >
              All
            </button>
            {placements.map((placement) => (
              <button
                key={placement}
                className={`${styles.chip} ${selectedPlacement === placement ? styles.chipActive : ''}`}
                onClick={() => setSelectedPlacement(placement)}
              >
                {placement}
              </button>
            ))}
          </div>
        </div>

        {Array.isArray(filteredData) && (
          <>
            {filteredData.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={`material-icons ${styles.emptyIcon}`}>inventory_2</span>
                <h2 className={styles.emptyTitle}>
                  {adSpots.length > 0 ? 'No ads found' : 'No ad spots yet'}
                </h2>
                <p className={styles.emptyDescription}>
                  {adSpots.length > 0
                    ? `No ads found for ${selectedPlacement} placement`
                    : 'Create your first ad spot to get started'}
                </p>
                <button onClick={handleCreateNew} className={styles.emptyButton}>
                  <span className="material-icons">add</span>
                  <span>Create Ad Spot</span>
                </button>
              </div>
            ) : (
              <div className={styles.grid}>
                {filteredData.map((ad: AdSpot) => (
                  <AdCard
                    key={ad.id}
                    id={ad.id}
                    title={ad.title}
                    imageUrl={ad.imageUrl ?? '/file.svg'}
                    status={ad.status}
                    placement={ad.placement}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
