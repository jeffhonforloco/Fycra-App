import { Context } from '@netlify/edge-functions';
import sharp from 'sharp';

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get('url');
  const width = parseInt(url.searchParams.get('width') || '1280', 10);
  const quality = parseInt(url.searchParams.get('quality') || '80', 10);

  if (!imageUrl) {
    return new Response('Missing image URL', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();

    const optimizedImage = await sharp(buffer)
      .resize(width)
      .webp({ quality })
      .toBuffer();

    return new Response(optimizedImage, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    return new Response('Error optimizing image', { status: 500 });
  }
}