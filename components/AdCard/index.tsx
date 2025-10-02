'use client';

import React from 'react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AdPlacement, AdStatus } from '../../types/adSpot';
import styles from './styles.module.css';

export interface AdCardProps {
  id: string;
  title: string;
  imageUrl: string;
  status: AdStatus;
  placement: AdPlacement;
}

const updateAdStatus = async ({ id, status }: { id: string; status: AdStatus }) => {
  const res = await fetch(`/api/adspots/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update ad status: ${res.status}`);
  }

  return res.json();
};

export function AdCard({ id, title, imageUrl, status, placement }: AdCardProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateAdStatus,
    onSuccess: () => {
      // Invalidate and refetch the adspots query
      queryClient.invalidateQueries({ queryKey: ['adspots'] });
    },
  });

  const statusDotClass = [styles.statusDot, styles[status as keyof typeof styles]]
    .filter(Boolean)
    .join(' ');

  // Usar el proxy de imágenes para cargar de forma segura
  const proxiedImageUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;

  const handleToggle = () => {
    const newStatus: AdStatus = status === 'active' ? 'deactivated' : 'active';
    mutation.mutate({ id, status: newStatus });
  };

  const isActive = status === 'active';

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
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button
            className={`${styles.toggleButton} ${isActive ? styles.toggleActive : ''}`}
            onClick={handleToggle}
            disabled={mutation.isPending}
            aria-label={isActive ? 'Deactivate ad' : 'Activate ad'}
            title={isActive ? 'Click to deactivate' : 'Click to activate'}
          >
            <span className="material-icons">
              {mutation.isPending ? 'sync' : isActive ? 'toggle_on' : 'toggle_off'}
            </span>
          </button>
        </div>
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
