'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AdPlacement, AdSpot } from '../../types/adSpot';
import InputForm from '../InputForm';
import styles from './styles.module.css';

const allowedPlacements: AdPlacement[] = [
  'banner',
  'sidebar',
  'interstitial',
  'native',
  'video',
  'footer',
  'header',
];

export interface AdSpotFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  title: string;
  imageUrl: string;
  placement: AdPlacement;
  ttlMinutes?: number;
}

const createAdSpot = async (data: FormData): Promise<AdSpot> => {
  const body: Record<string, unknown> = {
    title: data.title.trim(),
    imageUrl: data.imageUrl.trim(),
    placement: data.placement,
  };

  if (data.ttlMinutes !== undefined && data.ttlMinutes > 0) {
    body.ttlMinutes = data.ttlMinutes;
  }

  const res = await fetch('/api/adspots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const responseData = await res.json();
    throw new Error(responseData.error || `Server error: ${res.status}`);
  }

  return res.json();
};

export default function AdSpotForm({ onSuccess, onCancel }: AdSpotFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      placement: 'banner',
    },
  });

  const mutation = useMutation({
    mutationFn: createAdSpot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adspots'] });

      if (onSuccess) {
        onSuccess();
      }
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formContent}>
        <InputForm
          label="Title"
          type="text"
          required
          icon="title"
          error={errors.title}
          {...register('title', {
            required: 'Title is required',
            validate: (value) => {
              if (!value || value.trim().length === 0) {
                return 'Title cannot be empty';
              }
              return true;
            },
          })}
        />

        <InputForm
          label="Image URL"
          type="text"
          required
          icon="image"
          error={errors.imageUrl}
          {...register('imageUrl', {
            required: 'Image URL is required',
            validate: (value) => {
              if (!value || value.trim().length === 0) {
                return 'Image URL cannot be empty';
              }
              return true;
            },
          })}
        />

        <InputForm
          label="Placement"
          type="select"
          icon="location_on"
          error={errors.placement}
          options={allowedPlacements.map((p) => ({ value: p, label: p }))}
          {...register('placement')}
        />

        <InputForm
          label="TTL Minutes (optional)"
          type="number"
          placeholder="e.g., 60"
          icon="schedule"
          error={errors.ttlMinutes}
          {...register('ttlMinutes', {
            valueAsNumber: true,
            min: { value: 1, message: 'TTL must be at least 1 minute' },
          })}
        />

        {mutation.error && (
          <div className={styles.error}>
            <span className="material-icons">error_outline</span>
            <span>
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'Failed to create ad spot'}
            </span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={styles.buttonSecondary}
            disabled={mutation.isPending}
          >
            <span className="material-icons">close</span>
            <span>Cancel</span>
          </button>
        )}
        <button type="submit" className={styles.buttonPrimary} disabled={mutation.isPending}>
          <span className="material-icons">
            {mutation.isPending ? 'hourglass_empty' : 'check_circle'}
          </span>
          <span>{mutation.isPending ? 'Creating...' : 'Create Ad Spot'}</span>
        </button>
      </div>
    </form>
  );
}
