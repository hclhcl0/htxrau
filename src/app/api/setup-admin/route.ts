import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: 'admin@test.com' } },
    })

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'users',
        id: existing.docs[0].id,
        data: {
          password: 'password123',
          role: 'admin',
        },
      })
      return NextResponse.json({ success: true, message: 'Updated admin@test.com password to password123 on Vercel' })
    } else {
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@test.com',
          password: 'password123',
          name: 'Super Admin',
          role: 'admin',
        },
      })
      return NextResponse.json({ success: true, message: 'Created admin@test.com with password123 on Vercel' })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
