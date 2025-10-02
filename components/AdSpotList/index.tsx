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
  const [searchQuery, setSearchQuery] = useState('');

  // Filter ads by placement and search query
  const filteredData = adSpots.filter((ad) => {
    const matchesPlacement = selectedPlacement === 'all' || ad.placement === selectedPlacement;
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlacement && matchesSearch;
  });

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

        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={styles.clearButton}
                aria-label="Clear search"
              >
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
        </div>

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
                <span className={`material-icons ${styles.emptyIcon}`}>
                  {searchQuery || selectedPlacement !== 'all' ? 'search_off' : 'inventory_2'}
                </span>
                <h2 className={styles.emptyTitle}>
                  {adSpots.length > 0 ? 'No ads found' : 'No ad spots yet'}
                </h2>
                <p className={styles.emptyDescription}>
                  {adSpots.length > 0
                    ? searchQuery
                      ? `No ads match "${searchQuery}"`
                      : `No ads found for ${selectedPlacement} placement`
                    : 'Create your first ad spot to get started'}
                </p>
                {adSpots.length === 0 ? (
                  <button onClick={handleCreateNew} className={styles.emptyButton}>
                    <span className="material-icons">add</span>
                    <span>Create Ad Spot</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedPlacement('all');
                    }}
                    className={styles.emptyButton}
                  >
                    <span className="material-icons">refresh</span>
                    <span>Clear Filters</span>
                  </button>
                )}
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
