import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const cookieStore = await cookies()

  // Get current URL to build redirect
  const url = new URL(request.url)
  const redirectUrl = new URL('/admin', url.origin)

  const response = NextResponse.redirect(redirectUrl, {
    status: 303,
  })

  // List of all possible Payload CMS cookie names
  const cookieNames = [
    'payload-token',
    'users-token',
    'payload-preferences',
    'payload-lng',
  ]

  // Clear specific cookies
  cookieNames.forEach((name) => {
    cookieStore.delete(name)
    response.cookies.set({
      name,
      value: '',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
  })

  // Clear any dynamic cookies with token/payload
  const allCookies = cookieStore.getAll()
  allCookies.forEach((c) => {
    if (c.name.includes('token') || c.name.includes('payload') || c.name.includes('auth')) {
      cookieStore.delete(c.name)
      response.cookies.set({
        name: c.name,
        value: '',
        path: '/',
        maxAge: 0,
        expires: new Date(0),
      })
    }
  })

  // Add explicit header controls
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
}

export async function POST(request: Request) {
  return GET(request)
}
