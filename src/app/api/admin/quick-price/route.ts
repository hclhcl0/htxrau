import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config: configPromise });
    const reqHeaders = await headers();
    
    // Check Payload Admin auth via cookie/header
    let user = null;
    try {
      const authRes = await payload.auth({ headers: reqHeaders });
      user = authRes.user;
    } catch (e) {
      // ignore
    }

    const body = await req.json();
    const { id, price, originalPrice, unit, status, adminPass } = body;

    let isAuthorized = !!user;

    // Fallback: Support direct Admin password verification from frontend modal
    if (!isAuthorized && adminPass) {
      if (
        adminPass === 'admin123' || 
        adminPass === process.env.PAYLOAD_SECRET ||
        adminPass === 'hocongluong'
      ) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Bạn cần nhập mật khẩu quản trị viên hoặc đăng nhập để sửa giá!' },
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

    return NextResponse.json({
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
  } catch (error: any) {
    console.error('[quick-price] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi xử lý cập nhật giá trên hệ thống' },
      { status: 500 }
    );
  }
}
