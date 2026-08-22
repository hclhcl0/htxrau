import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { ShoppingBag, CheckCircle2, Filter, Sparkles, Sprout } from 'lucide-react';
import { getMediaUrl } from '@/lib/mediaUrl';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedCat = (params.cat as string) || 'all';
  const selectedStd = (params.std as string) || 'all';

  const payload = await getPayload({ config: configPromise });

  const whereClause: any = {};
  if (selectedCat !== 'all') {
    whereClause.category = { equals: selectedCat };
  }
  if (selectedStd !== 'all') {
    whereClause.standard = { equals: selectedStd };
  }

  let products: any[] = [];
  try {
    const res = await payload.find({
      collection: 'products',
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      limit: 100,
      sort: '-isFeatured -orderNum -createdAt',
      depth: 1,
    });
    products = res.docs;
  } catch (err) {
    console.error('Error fetching products:', err);
  }

  const categories = [
    { id: 'all', label: 'Tất cả nông sản', icon: '🧺' },
    { id: 'rau-an-la', label: 'Rau ăn lá', icon: '🌿' },
    { id: 'rau-an-cu-qua', label: 'Củ, quả tươi', icon: '🥕' },
    { id: 'rau-mam-thuy-canh', label: 'Rau mầm & Thủy canh', icon: '🌱' },
    { id: 'rau-gia-vi', label: 'Rau thơm & Gia vị', icon: '🧄' },
    { id: 'nam-tuoi', label: 'Nấm tươi sạch', icon: '🍄' },
    { id: 'trai-cay-theo-mua', label: 'Trái cây theo mùa', icon: '🍎' },
  ];

  const standards = [
    { id: 'all', label: 'Tất cả tiêu chuẩn' },
    { id: 'vietgap', label: 'VietGAP' },
    { id: 'ocop', label: 'OCOP Đà Nẵng' },
    { id: 'hydroponics', label: 'Thủy canh sạch' },
    { id: 'globalgap', label: 'GlobalGAP' },
  ];

  const standardLabels: Record<string, { label: string; color: string }> = {
    vietgap: { label: 'VietGAP', color: 'bg-emerald-600 text-white' },
    globalgap: { label: 'GlobalGAP', color: 'bg-emerald-800 text-white' },
    ocop: { label: 'OCOP Đà Nẵng', color: 'bg-amber-600 text-white' },
    hydroponics: { label: 'Thủy canh sạch', color: 'bg-emerald-700 text-white' },
    safe_certified: { label: 'Đạt chuẩn ATTP', color: 'bg-amber-600 text-white' },
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#14532d] via-[#15803d] to-[#166534] text-white py-12 px-4 shadow-inner">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sprout className="w-4 h-4" /> HTX Rau An Toàn Túy Loan • Đà Nẵng
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Danh Mục Rau An Toàn Chuẩn VietGAP & OCOP
          </h1>
          <p className="text-emerald-100 text-sm max-w-2xl">
            100% rau củ tươi non thu hoạch sớm từ vùng chuyên canh 8 ha phù sa sông Túy Loan, đạt chứng nhận OCOP 4 sao rau ăn quả và OCOP 3 sao rau ăn lá TP. Đà Nẵng.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl mt-8">
        {/* Bộ lọc Danh mục */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            <Filter className="w-4 h-4 text-emerald-600" /> Nhóm sản phẩm:
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = selectedCat === cat.id;
              return (
                <Link
                  key={cat.id}
                  href={`/san-pham?cat=${cat.id}${selectedStd !== 'all' ? `&std=${selectedStd}` : ''}`}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Lọc Tiêu chuẩn */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 overflow-x-auto text-xs">
            <span className="text-gray-400 font-medium whitespace-nowrap">Tiêu chuẩn:</span>
            {standards.map((std) => {
              const active = selectedStd === std.id;
              return (
                <Link
                  key={std.id}
                  href={`/san-pham?std=${std.id}${selectedCat !== 'all' ? `&cat=${selectedCat}` : ''}`}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'text-gray-600 hover:text-emerald-700'
                  }`}
                >
                  {std.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Danh sách Sản phẩm */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🌱
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Đang cập nhật sản phẩm</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
              Chưa có sản phẩm nào thuộc bộ lọc này hoặc rau đang trong giai đoạn thu hoạch mới.
            </p>
            <Link
              href="/san-pham"
              className="inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => {
              const imgUrl = getMediaUrl(p.image);
              const std = standardLabels[p.standard] || standardLabels['vietgap'];

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-300 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
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
                    <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${std.color}`}>
                      {std.label}
                    </span>

                    {p.status === 'in_stock' && (
                      <span className="absolute bottom-2 left-2 text-[10px] font-medium bg-emerald-900/80 text-white backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-300" /> Tươi trong ngày
                      </span>
                    )}
                  </Link>

                  <div className="p-4 flex flex-col flex-1">
                    <Link href={`/san-pham/${p.slug}`} className="group-hover:text-emerald-700 transition-colors">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-2 mb-1.5 leading-snug">
                        {p.name}
                      </h3>
                    </Link>

                    {p.summary && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.summary}</p>
                    )}

                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="text-emerald-700 font-extrabold text-base md:text-lg">
                          {p.price ? `${Number(p.price).toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                        </div>
                        <div className="text-[10px] text-gray-400">/ {p.unit || 'Kg'}</div>
                      </div>

                      <Link
                        href={`/san-pham/${p.slug}`}
                        className="p-2.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl transition-all shadow-sm"
                        title="Xem chi tiết"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
