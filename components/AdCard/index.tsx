import React from 'react';
import Image from 'next/image';
import type { AdStatus } from '../../types/adSpot';
import styles from './styles.module.css';

export interface AdCardProps {
  title: string;
  imageUrl: string;
  status: AdStatus;
}

export function AdCard({ title, imageUrl, status }: AdCardProps) {
  const statusDotClass = [styles.statusDot, styles[status as keyof typeof styles]].filter(Boolean).join(' ');

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image src={imageUrl} alt={title} width={320} height={180} style={{ objectFit: 'cover' }} />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.statusRow}>
          <span className={statusDotClass} />
          <small className={styles.statusText}>{status}</small>
        </div>
      </div>
    </article>
  );
}

export default AdCard;
