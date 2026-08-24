import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { ArrowRight, ShoppingBag, CheckCircle2, Sparkles } from 'lucide-react';
import { getMediaUrl } from '@/lib/mediaUrl';
import { QuickPriceButton } from '@/components/QuickPriceEditor/QuickPriceButton';

interface ProductSectionProps {
  title?: string;
  subtitle?: string;
  categoryFilter?: string;
  limit?: number;
}

export async function ProductSection({
  title = '🌿 Sản Phẩm Rau An Toàn Mới Thu Hoạch',
  subtitle = 'Rau tươi sạch thu hái mỗi sớm mai, đạt chuẩn VietGAP & OCOP Túy Loan',
  categoryFilter,
  limit = 8,
}: ProductSectionProps) {
  let products: any[] = [];

  try {
    const payload = await getPayload({ config: configPromise });
    const whereClause: any = {};
    if (categoryFilter) {
      whereClause.category = { equals: categoryFilter };
    }

    const res = await payload.find({
      collection: 'products',
      where: whereClause,
      limit,
      sort: '-isFeatured -orderNum -createdAt',
      depth: 1,
    });
    products = res.docs;
  } catch (err) {
    console.error('Error fetching products:', err);
  }

  if (!products || products.length === 0) {
    // Render fallback demo if no products seeded yet
    return null;
  }

  const categoryLabels: Record<string, string> = {
    'rau-an-la': 'Rau ăn lá',
    'rau-an-cu-qua': 'Củ, quả tươi',
    'rau-mam-thuy-canh': 'Rau mầm & Thủy canh',
    'rau-gia-vi': 'Rau thơm & Gia vị',
    'nam-tuoi': 'Nấm tươi sạch',
    'trai-cay-theo-mua': 'Trái cây theo mùa',
  };

  const standardLabels: Record<string, { label: string; color: string }> = {
    vietgap: { label: 'VietGAP', color: 'bg-emerald-600 text-white' },
    globalgap: { label: 'GlobalGAP', color: 'bg-emerald-800 text-white' },
    ocop: { label: 'OCOP Đà Nẵng', color: 'bg-amber-600 text-white' },
    hydroponics: { label: 'Thủy canh sạch', color: 'bg-emerald-700 text-white' },
    safe_certified: { label: 'Đạt chuẩn ATTP', color: 'bg-amber-600 text-white' },
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Tiêu đề phần */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Nông Sản Tươi Trong Ngày
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          </div>
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors mt-3 md:mt-0 group"
          >
            Xem tất cả sản phẩm
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Lưới sản phẩm */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => {
            const imgUrl = getMediaUrl(p.image);
            const std = standardLabels[p.standard] || standardLabels['vietgap'];
            const catName = categoryLabels[p.category] || 'Rau an toàn';

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Ảnh sản phẩm */}
                <Link
                  href={`/san-pham/${p.slug}`}
                  className="block relative aspect-[4/3] bg-emerald-50 overflow-hidden"
                >
                  <Image
                    src={imgUrl}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  {/* Badge Tiêu chuẩn */}
                  <span className={`absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ${std.color}`}>
                    {std.label}
                  </span>

                  {p.status === 'in_stock' ? (
                    <span className="absolute bottom-2 left-2 text-[10px] font-medium bg-emerald-900/80 text-white backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" /> Tươi trong ngày
                    </span>
                  ) : null}
                </Link>

                {/* Nội dung sản phẩm */}
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                    {catName}
                  </span>
                  <Link href={`/san-pham/${p.slug}`} className="group-hover:text-emerald-700 transition-colors">
                    <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-2 leading-snug">
                      {p.name}
                    </h3>
                  </Link>

                  {p.summary ? (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.summary}</p>
                  ) : null}

                  {/* Giá & Đơn vị tính */}
                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <div className="text-emerald-700 font-extrabold text-lg">
                          {p.price ? `${Number(p.price).toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                        </div>
                        <QuickPriceButton
                          productId={p.id}
                          productName={p.name}
                          initialPrice={p.price}
                          initialOriginalPrice={p.originalPrice}
                          initialUnit={p.unit || 'Kg'}
                          initialStatus={p.status || 'in_stock'}
                          variant="icon"
                        />
                      </div>
                      <div className="text-[11px] text-gray-400">/ {p.unit || 'Kg'}</div>
                    </div>

                    <Link
                      href={`/san-pham/${p.slug}`}
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl transition-all shadow-sm group-hover:shadow"
                      title="Xem chi tiết & Đặt rau"
                    >
                      <ShoppingBag className="w-4 h-4" />
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
