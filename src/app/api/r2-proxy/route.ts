import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

/**
 * Proxy ảnh từ R2 private bucket để hiển thị trong admin khi chưa bật public access.
 * GET /api/r2-proxy?key=filename.webp
 * 
 * Lưu ý: Route này chỉ dùng khi R2 chưa bật public access.
 * Khi đã có S3_PUBLIC_URL, set biến môi trường và không cần route này nữa.
 */

let s3Client: S3Client | null = null

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    })
  }
  return s3Client
}

export async function GET(request: NextRequest) {
  // If public URL is configured, redirect directly
  if (process.env.S3_PUBLIC_URL) {
    const key = request.nextUrl.searchParams.get('key')
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })
    return NextResponse.redirect(`${process.env.S3_PUBLIC_URL}/${key}`)
  }

  const key = request.nextUrl.searchParams.get('key')
  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 })
  }

  if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY_ID) {
    return NextResponse.json({ error: 'S3 not configured' }, { status: 500 })
  }

  try {
    const client = getS3Client()
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    })

    const response = await client.send(command)
    
    if (!response.Body) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const buffer = await response.Body.transformToByteArray()
    const contentType = response.ContentType || 'application/octet-stream'
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    console.error('[r2-proxy] Error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 })
  }
}
