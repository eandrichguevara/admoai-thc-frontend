import { NextResponse } from 'next/server';
import type { AdSpot, AdPlacement, AdStatus } from '../../../types/adSpot';

// In-memory store for AdSpots. This will be reset when the server restarts.
const adSpots: AdSpot[] = [];

const allowedPlacements: AdPlacement[] = [
  'banner',
  'sidebar',
  'interstitial',
  'native',
  'video',
  'footer',
  'header',
];

const allowedStatuses: AdStatus[] = ['active', 'paused', 'deactivated', 'pending', 'scheduled'];

export async function GET() {
  return NextResponse.json(adSpots);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = (body as Record<string, unknown>) ?? {};
  const { title, imageUrl, placement, status, deactivatedAt, ttlMinutes } = parsed;

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: "Missing or invalid 'title'" }, { status: 400 });
  }

  if (!imageUrl || typeof imageUrl !== 'string') {
    return NextResponse.json({ error: "Missing or invalid 'imageUrl'" }, { status: 400 });
  }

  // Validar que imageUrl sea una URL válida y use HTTPS
  let parsedImageUrl: URL;
  try {
    parsedImageUrl = new URL(imageUrl as string);
  } catch {
    return NextResponse.json({ error: "Invalid URL format for 'imageUrl'" }, { status: 400 });
  }

  if (parsedImageUrl.protocol !== 'https:') {
    return NextResponse.json({ error: 'Image URL must use HTTPS protocol' }, { status: 400 });
  }

  // Opcional: Verificar que la URL realmente apunte a una imagen
  try {
    const imageCheckResponse = await fetch(parsedImageUrl.toString(), {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 segundos timeout
    });

    if (!imageCheckResponse.ok) {
      return NextResponse.json(
        { error: `Unable to verify image URL: ${imageCheckResponse.status}` },
        { status: 400 },
      );
    }

    const contentType = imageCheckResponse.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      return NextResponse.json({ error: 'URL does not point to an image' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to verify image URL. Please ensure it is accessible.' },
      { status: 400 },
    );
  }

  if (
    !placement ||
    typeof placement !== 'string' ||
    !allowedPlacements.includes(placement as AdPlacement)
  ) {
    return NextResponse.json(
      { error: `Missing or invalid 'placement' (allowed: ${allowedPlacements.join(',')})` },
      { status: 400 },
    );
  }

  const finalStatus: AdStatus = allowedStatuses.includes(status as AdStatus)
    ? (status as AdStatus)
    : 'active';

  const deactivatedAtValue = typeof deactivatedAt === 'string' ? deactivatedAt : null;

  const newAd: AdSpot = {
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : String(Date.now()),
    title: title as string,
    imageUrl: imageUrl as string,
    placement: placement as AdPlacement,
    status: finalStatus,
    createdAt: new Date().toISOString(),
    deactivatedAt: deactivatedAtValue,
    ttlMinutes: typeof ttlMinutes === 'number' ? ttlMinutes : null,
  };

  adSpots.push(newAd);

  return NextResponse.json(newAd, { status: 201 });
}
