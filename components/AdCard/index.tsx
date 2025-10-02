import React from 'react';
import Image from 'next/image';
import type { AdPlacement, AdStatus } from '../../types/adSpot';
import styles from './styles.module.css';

export interface AdCardProps {
  title: string;
  imageUrl: string;
  status: AdStatus;
  placement: AdPlacement;
}

export function AdCard({ title, imageUrl, status, placement }: AdCardProps) {
  const statusDotClass = [styles.statusDot, styles[status as keyof typeof styles]]
    .filter(Boolean)
    .join(' ');

  // Usar el proxy de imágenes para cargar de forma segura
  const proxiedImageUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image
          src={proxiedImageUrl}
          alt={title}
          width={320}
          height={180}
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.metadata}>
          <div className={styles.placementBadge}>
            <span className="material-icons">place</span>
            <span>{placement}</span>
          </div>
          <div className={styles.statusRow}>
            <span className={statusDotClass} />
            <small className={styles.statusText}>{status}</small>
          </div>
        </div>
      </div>
    </article>
  );
}

export default AdCard;
