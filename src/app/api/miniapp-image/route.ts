import { NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Bắt buộc dùng Node.js runtime vì sharp không chạy được trong Edge runtime
export const runtime = 'nodejs';

// Đọc ảnh từ filesystem thay vì HTTP để tránh SharedArrayBuffer
async function readImageBuffer(imagePath: string, host: string): Promise<Buffer> {
  // imagePath dạng: /api/media/file/abc.webp
  // Thử đọc trực tiếp từ filesystem trong Docker container
  // Payload lưu media ở thư mục /media hoặc ./media tương đối với thư mục gốc
  
  // Trích xuất filename từ path
  const filename = imagePath.replace(/^\/api\/media\/file\//, '');
  
  // Các thư mục Payload có thể lưu media
  const possiblePaths = [
    path.join(process.cwd(), 'media', filename),
    path.join(process.cwd(), 'public', 'media', filename),
    path.join('/app', 'media', filename),
    path.join('/data', 'media', filename),
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
  }
  
  // Fallback: đọc qua HTTP nội bộ dùng blob stream để tránh SharedArrayBuffer
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
  const fileUrl = `${protocol}://${host}${imagePath}`;
  
  const response = await fetch(fileUrl, {
    headers: { 'user-agent': 'miniapp-image-proxy' },
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  
  // Đọc từng chunk qua ReadableStream để tránh SharedArrayBuffer
  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  
  return Buffer.concat(chunks.map(c => Buffer.from(c)));
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const imagePath = url.searchParams.get('path');
    
    if (!imagePath) {
      return new NextResponse('Missing path parameter', { status: 400 });
    }

    const host = req.headers.get('host') || '127.0.0.1:3000';
    const buffer = await readImageBuffer(imagePath, host);

    const metadata = await sharp(buffer).metadata();
    
    // Pad về hình vuông với nền trong suốt
    const maxDim = Math.max(metadata.width || 400, metadata.height || 400);
    
    const processedBuffer = await sharp(buffer)
      .resize({
        width: maxDim,
        height: maxDim,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png() // PNG hỗ trợ transparency tốt hơn WebP trong một số trường hợp
      .toBuffer();

    return new NextResponse(processedBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error: any) {
    console.error('Image proxy error:', error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
