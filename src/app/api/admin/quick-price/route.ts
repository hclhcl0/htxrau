import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { cookies, headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const reqHeaders = await headers();
    const cookieStore = await cookies();
    
    // 1. Check Payload Admin auth via headers & cookies
    let user: any = null;
    
    // Strategy A: Direct req.headers
    try {
      const authRes = await payload.auth({ headers: req.headers });
      if (authRes?.user) user = authRes.user;
    } catch (_) {}

    // Strategy B: next/headers
    if (!user) {
      try {
        const authRes = await payload.auth({ headers: reqHeaders });
        if (authRes?.user) user = authRes.user;
      } catch (_) {}
    }

    // Strategy C: Manually extract token from cookies
    if (!user) {
      const token = cookieStore.get('payload-token')?.value || 
                    cookieStore.get('users-token')?.value ||
                    cookieStore.getAll().find(c => c.name.includes('token') || c.name.includes('payload'))?.value;
      if (token) {
        try {
          const authHeaders = new Headers();
          authHeaders.set('cookie', `payload-token=${token}`);
          authHeaders.set('authorization', `JWT ${token}`);
          const authRes = await payload.auth({ headers: authHeaders });
          if (authRes?.user) user = authRes.user;
        } catch (_) {}
      }
    }

    const body = await req.json();
    const { id, price, originalPrice, unit, status, adminPass } = body;

    let isAuthorized = !!user;
    let newAuthToken: string | null = null;

    // 2. Fallback: If not logged in via cookie, verify via adminPass
    if (!isAuthorized && adminPass && typeof adminPass === 'string' && adminPass.trim()) {
      const cleanPass = adminPass.trim();

      // Check standard emergency/master passwords
      if (
        cleanPass === 'admin123' || 
        cleanPass === 'admin' ||
        cleanPass === process.env.PAYLOAD_SECRET ||
        cleanPass === 'hocongluong'
      ) {
        isAuthorized = true;
      } else {
        // Try logging in against existing admin/editor accounts in DB
        try {
          const adminUsers = await payload.find({
            collection: 'users',
            where: {
              role: {
                in: ['admin', 'editor', 'moderator', 'author'],
              },
            },
            limit: 10,
          });

          for (const u of adminUsers.docs) {
            try {
              const loginRes = await payload.login({
                collection: 'users',
                data: {
                  email: u.email,
                  password: cleanPass,
                },
              });
              if (loginRes?.token) {
                isAuthorized = true;
                user = loginRes.user;
                newAuthToken = loginRes.token;
                break;
              }
            } catch (_) {
              // try next user
            }
          }
        } catch (e) {
          console.warn('[quick-price] Password check warning:', e);
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập tài khoản Admin hoặc nhập mật khẩu quản trị viên để sửa giá!' },
        { status: 401 }
      );
    }

    if (!id || price === undefined || price === null || price === '') {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp ID sản phẩm và giá hợp lệ!' },
        { status: 400 }
      );
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json(
        { error: 'Giá bán phải là số nguyên dương!' },
        { status: 400 }
      );
    }

    const updateData: any = {
      price: numPrice,
    };

    if (originalPrice !== undefined) {
      const numOrig = Number(originalPrice);
      updateData.originalPrice = isNaN(numOrig) || numOrig <= 0 ? null : numOrig;
    }

    if (unit && typeof unit === 'string' && unit.trim()) {
      updateData.unit = unit.trim();
    }

    if (status && ['in_stock', 'pre_order', 'out_of_stock'].includes(status)) {
      updateData.status = status;
    }

    const updated = await payload.update({
      collection: 'products',
      id,
      data: updateData,
    });

    // Revalidate Next.js cache so visitors immediately see new price
    try {
      revalidatePath('/');
      revalidatePath('/san-pham');
      if (updated?.slug) {
        revalidatePath(`/san-pham/${updated.slug}`);
      }
      revalidatePath('/dat-hang');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Cập nhật giá sản phẩm thành công!',
      product: {
        id: updated.id,
        name: updated.name,
        price: updated.price,
        originalPrice: updated.originalPrice,
        unit: updated.unit,
        status: updated.status,
      },
    });

    if (newAuthToken) {
      response.cookies.set({
        name: 'payload-token',
        value: newAuthToken,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 28800,
      });
    }

    return response;
  } catch (error: any) {
    console.error('[quick-price] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi xử lý cập nhật giá trên hệ thống' },
      { status: 500 }
    );
  }
}
