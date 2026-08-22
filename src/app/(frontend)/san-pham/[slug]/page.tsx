import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  Sprout, 
  MapPin, 
  ChefHat, 
  Refrigerator,
} from 'lucide-react';
import { getMediaUrl } from '@/lib/mediaUrl';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { getJsxConverters } from '@/components/LexicalConverters';
import { unstable_cache } from 'next/cache';
import { ProductOrderButtons } from './ProductOrderButtons';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

const getHotline = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise });
    const s = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as any;
    return s?.header?.hotline?.phone || '0905 559 206';
  },
  ['hotline-product-page'],
  { revalidate: 300, tags: ['site-settings'] },
);

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  const hotline = await getHotline();

  const res = await payload.find({
    collection: 'products',
    where: {
      slug: { equals: slug },
    },
    limit: 1,
    depth: 2,
  });

  const product = res.docs[0];
  if (!product) {
    notFound();
  }

  const imgUrl = getMediaUrl(product.image);
  const gallery = product.gallery || [];

  const standardLabels: Record<string, { label: string; desc: string; badge: string }> = {
    vietgap: {
      label: 'Tiêu chuẩn VietGAP',
      desc: 'Quy trình thực hành sản xuất nông nghiệp tốt cho rau quả tươi an toàn',
      badge: 'bg-emerald-600 text-white',
    },
    globalgap: {
      label: 'Tiêu chuẩn GlobalGAP',
      desc: 'Chứng nhận thực hành nông nghiệp sạch tiêu chuẩn quốc tế toàn cầu',
      badge: 'bg-emerald-800 text-white',
    },
    ocop: {
      label: 'Chuẩn OCOP Đà Nẵng',
      desc: 'Đạt chứng nhận OCOP 3 sao và 4 sao TP. Đà Nẵng cho nông sản thế mạnh',
      badge: 'bg-amber-600 text-white',
    },
    hydroponics: {
      label: 'Thủy canh công nghệ cao',
      desc: 'Trồng trong nhà màng hồi lưu khép kín, cách ly tuyệt đối với côn trùng và mầm bệnh',
      badge: 'bg-emerald-700 text-white',
    },
    safe_certified: {
      label: 'An toàn kiểm định ATTP',
      desc: 'Được cơ quan chức năng kiểm tra và cấp giấy chứng nhận đủ điều kiện an toàn thực phẩm',
      badge: 'bg-amber-600 text-white',
    },
  };

  const stdInfo = standardLabels[product.standard] || standardLabels['vietgap'];

  let relatedProducts: any[] = [];
  try {
    const relRes = await payload.find({
      collection: 'products',
      where: {
        id: { not_equals: product.id },
        category: { equals: product.category },
      },
      limit: 4,
    });
    relatedProducts = relRes.docs;
  } catch (err) {
    console.error('Error related products:', err);
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-emerald-700">Trang chủ</Link>
            <span>/</span>
            <Link href="/san-pham" className="hover:text-emerald-700">Sản phẩm rau an toàn</Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl mt-6">
        <Link
          href="/san-pham"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh mục sản phẩm
        </Link>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100">
              <Image
                src={imgUrl}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority
                unoptimized
              />
            </div>

            {gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {gallery.map((g: any, idx: number) => {
                  const gUrl = getMediaUrl(g.image);
                  if (!gUrl) return null;
                  return (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                      <Image src={gUrl} alt={g.caption || product.name} fill className="object-cover" unoptimized />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
              {product.name}
            </h1>

            <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 mb-6 flex items-baseline gap-3">
              <div className="text-3xl font-black text-emerald-700">
                {product.price ? `${Number(product.price).toLocaleString('vi-VN')} đ` : 'Liên hệ'}
              </div>
              {product.originalPrice && (
                <div className="text-base text-gray-400 line-through">
                  {Number(product.originalPrice).toLocaleString('vi-VN')} đ
                </div>
              )}
              <div className="text-sm font-semibold text-gray-600">/ {product.unit || 'Kg'}</div>
            </div>

            <ProductOrderButtons
              productId={product.id}
              productName={product.name}
              productPrice={product.price}
              productUnit={product.unit || 'kg'}
              hotline={hotline}
            />
          </div>
        </div>

        {product.content && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-200 mt-8">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-600 rounded-full inline-block"></span>
              Thông Tin Chi Tiết & Giới Thiệu Sản Phẩm
            </h2>
            <div className="prose prose-emerald max-w-none text-gray-800 leading-relaxed">
              <RichText converters={getJsxConverters()} data={product.content} />
            </div>
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">
              Sản Phẩm Cùng Loại
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((rp) => {
                const rpImg = getMediaUrl(rp.image);
                return (
                  <Link
                    key={rp.id}
                    href={`/san-pham/${rp.slug}`}
                    className="bg-white rounded-2xl p-3 border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-emerald-50 mb-2">
                      <Image src={rpImg} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                    </div>
                    <h4 className="font-bold text-xs text-gray-900 group-hover:text-emerald-700 line-clamp-1 mb-1">
                      {rp.name}
                    </h4>
                    <div className="text-xs font-black text-emerald-700 mt-auto">
                      {rp.price ? `${Number(rp.price).toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
