import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Bắt buộc Node.js runtime - sharp không chạy trên Edge
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const imagePath = url.searchParams.get('path');

    if (!imagePath) {
      return new NextResponse('Missing path parameter', { status: 400 });
    }

    // Trích tên file: /api/media/file/abc.webp -> abc.webp
    const filename = imagePath.replace(/^\/api\/media\/file\//, '').split('?')[0];

    // Thư mục media trong Docker container theo Dockerfile: WORKDIR /app, mkdir /app/media
    const mediaDirs = [
      '/app/media',
      path.join(process.cwd(), 'media'),
    ];

    let fileBuffer: Buffer | null = null;
    let foundPath = '';

    for (const dir of mediaDirs) {
      const filePath = path.join(dir, filename);
      if (fs.existsSync(filePath)) {
        fileBuffer = fs.readFileSync(filePath);
        foundPath = filePath;
        break;
      }
    }

    if (!fileBuffer) {
      console.error(`[miniapp-image] File not found: ${filename} in dirs:`, mediaDirs);
      return new NextResponse('Image not found', { status: 404 });
    }

    // Xử lý ảnh với sharp: pad về hình vuông, nền trong suốt
    const metadata = await sharp(fileBuffer).metadata();
    const w = metadata.width || 400;
    const h = metadata.height || 400;
    const maxDim = Math.max(w, h);

    const processed = await sharp(fileBuffer)
      .resize({
        width: maxDim,
        height: maxDim,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    return new NextResponse(processed, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
        'X-Image-Source': foundPath,
      },
    });
  } catch (error: any) {
    console.error('[miniapp-image] Error:', error.message);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
