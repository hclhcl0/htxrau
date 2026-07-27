import { NextResponse } from 'next/server';
import sharp from 'sharp';

// Bắt buộc dùng Node.js runtime vì sharp không chạy được trong Edge runtime
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const imagePath = url.searchParams.get('path');
    
    if (!imagePath) {
      return new NextResponse('Missing path parameter', { status: 400 });
    }

    // Construct local URL to fetch the image from Payload
    const host = req.headers.get('host') || '127.0.0.1:3000';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    
    const fileUrl = `${protocol}://${host}${imagePath}`;
    
    // Fetch the original image
    const response = await fetch(fileUrl, {
      headers: {
        'user-agent': 'miniapp-image-proxy',
      },
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status });
    }

    // Dùng Uint8Array thay vì Buffer để tránh SharedArrayBuffer issue
    const bytes = new Uint8Array(await response.arrayBuffer());
    const buffer = Buffer.from(bytes);

    const metadata = await sharp(buffer).metadata();
    
    // Pad to square to fit both 4:3 and 1:1 containers without cropping the image itself
    const maxDim = Math.max(metadata.width || 0, metadata.height || 0);
    
    const processedBuffer = await sharp(buffer)
      .resize({
        width: maxDim,
        height: maxDim,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Nền trong suốt
      })
      .toFormat('webp')
      .toBuffer();

    return new NextResponse(processedBuffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Image proxy error:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
