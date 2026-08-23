import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy route để fetch ảnh từ URL ngoài, giúp tránh lỗi CORS khi paste ảnh vào editor.
 * GET /api/fetch-image?url=https://example.com/image.jpg
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  // Chỉ cho phép URL hợp lệ
  let parsedUrl: URL
  try {
    parsedUrl = new URL(imageUrl)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HTXRau-CMS/1.0)',
        'Accept': 'image/*,*/*;q=0.8',
        'Referer': parsedUrl.origin,
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: 502 }
      )
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    // Chỉ cho phép các loại ảnh
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL is not an image' }, { status: 400 })
    }

    const imageBuffer = await response.arrayBuffer()
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    console.error('[fetch-image] Error:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch image', detail: error.message },
      { status: 500 }
    )
  }
}
