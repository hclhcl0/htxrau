import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { ShoppingBasket, Users, Check, Sparkles, PhoneCall } from 'lucide-react';

interface ComboSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

export async function ComboSection({
  title = '🧺 Combo Giỏ Rau Tươi Tuần Cho Gia Đình',
  subtitle = 'Được đóng gói cân đối dinh dưỡng từ nhiều loại rau củ sạch, giao định kỳ tận nhà',
  limit = 3,
}: ComboSectionProps) {
  let combos: any[] = [];

  try {
    const payload = await getPayload({ config: configPromise });
    const res = await payload.find({
      collection: 'combos',
      limit,
      sort: '-isFeatured -orderNum -createdAt',
      depth: 2,
    });
    combos = res.docs;
  } catch (err) {
    console.error('Error fetching combos:', err);
  }

  if (!combos || combos.length === 0) {
    return null;
  }

  return (
    <section className="py-14 bg-gradient-to-b from-emerald-50/50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Tiết Kiệm & Đủ Đầy Dinh Dưỡng
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h2>
          {subtitle && <p className="text-gray-600 text-sm mt-2">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combos.map((combo) => {
            const imgUrl = typeof combo.image === 'object' && combo.image?.url ? combo.image.url : '/placeholder-combo.jpg';
            const items = combo.items || [];

            return (
              <div
                key={combo.id}
                className="bg-white rounded-2xl border-2 border-emerald-100/80 hover:border-emerald-500 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative group"
              >
                {combo.isFeatured && (
                  <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                    Bán Chạy Nhất 🔥
                  </div>
                )}

                <div className="relative h-48 bg-emerald-100/50 overflow-hidden">
                  <Image
                    src={imgUrl}
                    alt={combo.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-2">
                    <Users className="w-4 h-4" /> {combo.servingSize || '3 - 4 người'}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {combo.name}
                  </h3>

                  {combo.summary && (
                    <p className="text-xs text-gray-600 mb-4">{combo.summary}</p>
                  )}

                  {/* Danh sách rau trong gói */}
                  <div className="bg-emerald-50/60 rounded-xl p-3.5 mb-6 border border-emerald-100/50">
                    <div className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1">
                      <ShoppingBasket className="w-3.5 h-3.5" /> Thành phần trong giỏ:
                    </div>
                    <ul className="space-y-1.5 text-xs text-gray-700">
                      {items.slice(0, 5).map((it: any, idx: number) => {
                        const prodName = typeof it.product === 'object' && it.product?.name ? it.product.name : it.customName;
                        return (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="font-medium text-gray-800">{prodName || 'Rau sạch tự chọn'}</span>
                            {it.quantity && <span className="text-gray-400 text-[11px]">({it.quantity})</span>}
                          </li>
                        );
                      })}
                      {items.length > 5 && (
                        <li className="text-[11px] text-emerald-700 font-medium italic pt-1">
                          + và {items.length - 5} loại rau củ tươi khác...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Giá & Nút liên hệ */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-emerald-700">
                        {Number(combo.price).toLocaleString('vi-VN')} đ
                      </div>
                      {combo.originalPrice && (
                        <div className="text-xs text-gray-400 line-through">
                          {Number(combo.originalPrice).toLocaleString('vi-VN')} đ
                        </div>
                      )}
                    </div>

                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Đặt Giao Tận Nhà
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
