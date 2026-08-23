import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  const resolvedParams = await params;
  const filename = resolvedParams?.filename?.join('/') || '';

  if (!filename) {
    return NextResponse.json({ error: 'Filename not specified' }, { status: 400 });
  }

  // Redirect 307 to the static asset served from public/media/
  const url = new URL(`/media/${filename}`, request.url);
  return NextResponse.redirect(url, { status: 307 });
}
