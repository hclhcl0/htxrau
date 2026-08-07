import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: 'hclhcl0@gmail.com' } },
    });
    
    if (users.docs.length > 0) {
      await payload.update({
        collection: 'users',
        id: users.docs[0].id,
        data: {
          password: 'AdminPassword123!',
        }
      });
      return NextResponse.json({ success: true, message: 'Mật khẩu đã được reset thành công!' });
    }
    return NextResponse.json({ success: false, message: 'Không tìm thấy user hclhcl0@gmail.com' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
