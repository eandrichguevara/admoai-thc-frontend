import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // Validar que sea una URL válida
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  // Solo permitir HTTPS
  if (parsedUrl.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only HTTPS URLs are allowed' }, { status: 400 });
  }

  // Blacklist de dominios peligrosos
  const blockedDomains = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  const hostname = parsedUrl.hostname.toLowerCase();

  if (blockedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
  }

  // Prevenir acceso a IPs privadas (protección básica contra SSRF)
  const privateIpPatterns = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
  ];

  if (privateIpPatterns.some((pattern) => pattern.test(hostname))) {
    return NextResponse.json({ error: 'Private IP addresses not allowed' }, { status: 403 });
  }

  try {
    // Fetch la imagen con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AdmoAI-ImageProxy/1.0)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${imageResponse.status}` },
        { status: 502 },
      );
    }

    // Validar que sea realmente una imagen
    const contentType = imageResponse.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      return NextResponse.json({ error: 'URL does not point to an image' }, { status: 400 });
    }

    // Limitar el tamaño de la imagen (10MB máximo)
    const contentLength = imageResponse.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image size exceeds 10MB limit' }, { status: 413 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800', // Cache por 24h, stale 7 días
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
      }
      return NextResponse.json(
        { error: `Failed to proxy image: ${error.message}` },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 });
  }
}
