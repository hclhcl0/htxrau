import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Award, CheckCircle2, ArrowRight, FileCheck } from 'lucide-react';

interface CertificatesSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

export async function CertificatesSection({
  title = '🏆 Hồ Sơ Chứng Nhận & Kiểm Định Chất Lượng',
  subtitle = 'Được chứng nhận bởi các cơ quan chuyên môn có thẩm quyền về an toàn thực phẩm',
  limit = 4,
}: CertificatesSectionProps) {
  let certs: any[] = [];

  try {
    const payload = await getPayload({ config: configPromise });
    const res = await payload.find({
      collection: 'certificates',
      limit,
      sort: '-orderNum -createdAt',
      depth: 1,
    });
    certs = res.docs;
  } catch (err) {
    console.error('Error fetching certificates:', err);
  }

  if (!certs || certs.length === 0) {
    return null;
  }

  return (
    <section className="py-14 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full mb-2">
              <Award className="w-3.5 h-3.5" /> Pháp Lý & Kiểm Nghiệm Rõ Ràng
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          </div>
          <Link
            href="/chung-nhan"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors mt-3 md:mt-0 group"
          >
            Xem tất cả chứng nhận
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {certs.map((c) => {
            const imgUrl = typeof c.image === 'object' && c.image?.url ? c.image.url : '/placeholder-cert.jpg';

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col group"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-3 border border-gray-100">
                  <Image
                    src={imgUrl}
                    alt={c.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {c.code && (
                    <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-emerald-900/90 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                      Mã: {c.code}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 mb-2">{c.issuer}</p>

                  <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-emerald-700 font-medium">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Có hiệu lực
                    </span>
                    <Link href="/chung-nhan" className="hover:underline flex items-center gap-0.5">
                      <FileCheck className="w-3.5 h-3.5" /> Xem chi tiết
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
