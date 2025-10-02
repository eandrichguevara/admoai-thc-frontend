import { NextResponse } from 'next/server';
import type { AdStatus } from '../../../../types/adSpot';
import { adSpots } from '../route';

const allowedStatuses: AdStatus[] = ['active', 'paused', 'deactivated', 'pending', 'scheduled'];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Find the ad spot by ID
  const adIndex = adSpots.findIndex((ad) => ad.id === id);

  if (adIndex === -1) {
    return NextResponse.json({ error: 'Ad spot not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = (body as Record<string, unknown>) ?? {};
  const { status } = parsed;

  // Validate status
  if (!status || typeof status !== 'string' || !allowedStatuses.includes(status as AdStatus)) {
    return NextResponse.json(
      { error: `Invalid 'status'. Allowed values: ${allowedStatuses.join(', ')}` },
      { status: 400 },
    );
  }

  // Update the ad spot
  const updatedAd = {
    ...adSpots[adIndex],
    status: status as AdStatus,
    deactivatedAt:
      status === 'deactivated' ? new Date().toISOString() : adSpots[adIndex].deactivatedAt,
  };

  adSpots[adIndex] = updatedAd;

  return NextResponse.json(updatedAd, { status: 200 });
}
