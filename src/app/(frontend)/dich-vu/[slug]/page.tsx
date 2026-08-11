import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ArrowLeft, HeartPulse, Tag, Phone, ShieldCheck, ShoppingCart } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic';

async function getService(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise });

    let query = {};
    if (slug.match(/^[0-9a-fA-F]{24}$/) || !isNaN(Number(slug))) {
      query = { id: { equals: slug } };
    } else {
      query = { slug: { equals: slug } };
    }

    const { docs } = await payload.find({
      collection: 'articles',
      where: query,
      limit: 1,
    });

    return (docs[0] as any) || null;
  } catch (err) {
    console.error('Failed to fetch service:', err);
    return null;
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const service = await getService(slug) as any;

  if (!service) {
    notFound();
  }

  const thumbObj = service.thumbnail as any;
  const thumbUrl = thumbObj?.url || null;

  const renderRichText = (content: any) => {
    if (!content) return null;

    if (typeof content === 'object' && content.root && content.root.children) {
      return (
        <div className="prose prose-base max-w-none break-words prose-p:!my-1.5 prose-headings:!my-3 prose-ul:!my-1 prose-li:!my-0.5 prose-headings:text-gov-primary prose-a:text-gov-primary prose-img:rounded-lg">
          {content.root.children.map((block: any, i: number) => {
            if (block.type === 'paragraph') {
              return (
                <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                  {block.children?.map((textNode: any, j: number) => (
                    <span key={j} className={
                      [
                        textNode.format & 1 ? 'font-bold text-gray-900' : '',
                        textNode.format & 2 ? 'italic' : '',
                        textNode.format & 8 ? 'underline' : '',
                      ].filter(Boolean).join(' ')
                    }>
                      {textNode.text}
                    </span>
                  ))}
                </p>
              );
            }
            if (block.type === 'heading') {
              const Tag = `h${block.tag}` as any;
              return (
                <Tag key={i} className="font-bold text-gov-primary mt-6 mb-3">
                  {block.children?.map((textNode: any, j: number) => (
                    <span key={j}>{textNode.text}</span>
                  ))}
                </Tag>
              );
            }
            if (block.type === 'list') {
              const ListTag = block.listType === 'bullet' ? 'ul' : 'ol';
              return (
                <ListTag key={i} className={`mb-4 pl-5 space-y-1 ${block.listType === 'bullet' ? 'list-disc marker:text-gov-primary' : 'list-decimal marker:text-gov-primary marker:font-bold'}`}>
                  {block.children?.map((item: any, j: number) => (
                    <li key={j} className="pl-1 text-gray-700">
                      {item.children?.map((textNode: any, k: number) => (
                        <span key={k} className={textNode.format & 1 ? 'font-bold' : ''}>{textNode.text}</span>
                      ))}
                    </li>
                  ))}
                </ListTag>
              );
            }
            return null;
          })}
        </div>
      );
    }

    return <div className="text-gray-700">{JSON.stringify(content)}</div>;
  };

  const isActive = service.status === 'active';

  // Parse Excel pricing file
  const pricingFileObj = service.pricingFile as any;
  const pricingFileUrl = pricingFileObj?.url || null;
  let excelData: any[][] = [];
  
  if (pricingFileUrl) {
    try {
      let buffer: Buffer | ArrayBuffer;
      if (pricingFileUrl.startsWith('http')) {
        const response = await fetch(pricingFileUrl);
        if (!response.ok) throw new Error('Failed to fetch external file');
        buffer = await response.arrayBuffer();
      } else {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'media', pricingFileObj.filename);
        buffer = await fs.promises.readFile(filePath);
      }
      
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsed = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      // Filter out empty rows
      excelData = parsed.filter(row => row && row.length > 0 && row.some(cell => cell !== undefined && cell !== null && cell !== ''));
    } catch (e) {
      console.error('Failed to parse excel file:', e);
    }
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen">

      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-6xl py-3">
          <nav className="flex flex-wrap items-center text-sm text-gray-500 gap-1.5">
            <Link href="/" className="hover:text-gov-primary transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <Link href="/dich-vu" className="hover:text-gov-primary transition-colors">Dịch vụ - Sản phẩm</Link>
            {service.category && typeof service.category === 'object' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                <span className="text-gray-400">{service.category.name}</span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <span className="text-gray-700 font-medium line-clamp-1">{service.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-6">

        {/* Nút quay lại */}
        <Link
          href="/dich-vu"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gov-primary transition-colors mb-5 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </Link>

        <div className="w-full">

          {/* CỘT TRÁI — nội dung chính */}
          <div className="space-y-5">

            {/* Ảnh + tiêu đề */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {thumbUrl && (
                <div className="relative aspect-[16/7] bg-gray-100 overflow-hidden">
                  <img
                    src={thumbUrl}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  {!isActive && (
                    <div className="absolute top-3 right-3 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                      TẠM NGƯNG
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                {service.category && typeof service.category === 'object' && (
                  <span className="inline-block text-[11px] font-bold text-gov-primary uppercase tracking-wider bg-[var(--primary-50)] px-2.5 py-1 rounded mb-3">
                    {service.category.name}
                  </span>
                )}
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight mb-3">
                  {service.title}
                </h1>
                {service.shortDescription && (
                  <p className="text-gray-500 text-sm leading-relaxed border-l-4 border-[var(--primary-100)] pl-4">
                    {service.shortDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Nội dung chi tiết */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                <ShieldCheck className="w-5 h-5 text-gov-primary" />
                Thông tin chi tiết dịch vụ
              </h2>
              {service.content ? (
                renderRichText(service.content)
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Thông tin chi tiết đang được cập nhật.
                </div>
              )}
            </div>

            {/* Bảng giá từ Excel (Ưu tiên hiển thị nếu có) */}
            {excelData.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100 flex-wrap">
                  <Tag className="w-5 h-5 text-gov-primary shrink-0" />
                  <span>Bảng giá chi tiết</span>
                  {service.pricingEffectiveDate && (
                    <span className="text-[13px] font-normal text-gray-500 italic ml-auto bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                      Hiệu lực từ: <strong className="text-gray-700">{new Date(service.pricingEffectiveDate).toLocaleDateString('vi-VN')}</strong>
                    </span>
                  )}
                </h2>
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm max-h-[700px] overflow-y-auto">
                  <table className="w-full text-left border-collapse min-w-max">
                    <thead className="sticky top-0 z-20 shadow-sm">
                      <tr className="bg-gov-primary text-white">
                        {excelData[0].map((header, idx) => (
                          <th key={idx} className="px-3 py-2.5 border-b border-r border-gov-primary-dark/30 font-bold whitespace-nowrap tracking-wide text-[13px] uppercase last:border-r-0">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-[13px]">
                      {excelData.slice(1).map((row, i) => (
                        <tr key={i} className="hover:bg-blue-50/60 even:bg-gray-50/60 odd:bg-white transition-colors group">
                          {row.map((cell, j) => (
                            <td key={j} className={`px-3 py-2 border-b border-r border-gray-200 group-last:border-b-0 last:border-r-0 ${j === 0 ? 'text-gray-900 font-semibold text-center' : 'text-gray-700'} ${String(cell).match(/^[0-9.,]+(\s)?(đ|VNĐ|VND)?$/i) ? 'text-rose-600 font-bold whitespace-nowrap text-right' : ''}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Bảng giá nhập tay (Dự phòng) */
              service.pricingTable && service.pricingTable.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h2 className="flex items-center gap-2 text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100 flex-wrap">
                    <Tag className="w-5 h-5 text-gov-primary shrink-0" />
                    <span>Bảng giá chi tiết</span>
                    {service.pricingEffectiveDate && (
                      <span className="text-[13px] font-normal text-gray-500 italic ml-auto bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        Hiệu lực từ: <strong className="text-gray-700">{new Date(service.pricingEffectiveDate).toLocaleDateString('vi-VN')}</strong>
                      </span>
                    )}
                  </h2>
                  <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm max-h-[700px] overflow-y-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead className="sticky top-0 z-20 shadow-sm">
                        <tr className="bg-gov-primary text-white">
                          <th className="px-3 py-2.5 border-b border-r border-gov-primary-dark/30 font-bold uppercase text-[13px] tracking-wide">Hạng mục</th>
                          <th className="px-3 py-2.5 border-b border-r border-gov-primary-dark/30 font-bold uppercase text-[13px] tracking-wide whitespace-nowrap">Đơn giá</th>
                          <th className="px-3 py-2.5 border-b border-gov-primary-dark/30 font-bold uppercase text-[13px] tracking-wide">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="text-[13px]">
                        {service.pricingTable.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-blue-50/60 even:bg-gray-50/60 odd:bg-white transition-colors group">
                            <td className="px-3 py-2 border-b border-r border-gray-200 group-last:border-b-0 text-gray-800 font-medium">{row.name}</td>
                            <td className="px-3 py-2 border-b border-r border-gray-200 group-last:border-b-0 text-rose-600 font-bold whitespace-nowrap text-right">{row.price}</td>
                            <td className="px-3 py-2 border-b border-gray-200 group-last:border-b-0 text-gray-600">{row.note || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
