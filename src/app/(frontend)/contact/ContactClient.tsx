"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Sprout, 
  HeartHandshake, 
  Building2,
  Map as MapIcon
} from 'lucide-react';

export interface ContactPageData {
  badgeText?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  orgName?: string;
  address?: string;
  representative?: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  policyTitle?: string;
  policies?: { text?: string }[] | string[];
  mapEmbedUrl?: string;
}

export function ContactClient({ data }: { data: ContactPageData }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    customerType: 'Gia đình mua lẻ',
    title: '',
    content: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          customerType: 'Gia đình mua lẻ',
          title: '',
          content: '',
        });
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  // Safe fallback values
  const badgeText = data?.badgeText || 'HTX Nông Nghiệp Tiêu Biểu Đà Nẵng';
  const bannerTitle = data?.bannerTitle || 'Liên Hệ Đặt Hàng & Nhận Báo Giá Sỉ';
  const bannerSubtitle = data?.bannerSubtitle || 'Cung cấp rau an toàn chuẩn VietGAP cho hộ gia đình, trường học, bếp ăn tập thể, nhà hàng và siêu thị với chính sách chiết khấu tốt nhất.';
  const orgName = data?.orgName || 'HỢP TÁC XÃ DỊCH VỤ SẢN XUẤT & TIÊU THỤ RAU AN TOÀN TÚY LOAN';
  const address = data?.address || 'Thôn Túy Loan Tây, xã Hòa Vang, TP. Đà Nẵng';
  const representative = data?.representative || 'Đặng Thị Yến Khanh - Giám đốc Hợp tác xã';
  const phone1 = data?.phone1 || '0905 559 206';
  const phone2 = data?.phone2 || '0236 3890 407';
  const email = data?.email || 'rauantoantuyloan@gmail.com';
  const policyTitle = data?.policyTitle || 'Chính Sách Cung Ứng & Giao Hàng:';

  // Format policies list
  let policyItems: string[] = [];
  if (Array.isArray(data?.policies) && data.policies.length > 0) {
    policyItems = data.policies.map((p: any) => typeof p === 'string' ? p : (p?.text || '')).filter(Boolean);
  }
  if (policyItems.length === 0) {
    policyItems = [
      'Cung ứng 1.5 tấn rau tươi/ngày cho siêu thị, trường học, bếp ăn công nghiệp.',
      'Thu hoạch sáng sớm từ 4h00, sơ chế và giao tận nơi trong 2 - 4h.',
      'Cung cấp đầy đủ hóa đơn VAT, hợp đồng và hồ sơ kiểm định ATTP, OCOP 4 sao.'
    ];
  }

  // Parse map embed url (extract src if user pasted iframe)
  let mapSrc = data?.mapEmbedUrl?.trim() || '';
  if (mapSrc.includes('<iframe') && mapSrc.includes('src="')) {
    const match = mapSrc.match(/src=["']([^"']+)["']/);
    if (match && match[1]) {
      mapSrc = match[1];
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#14532d] via-[#15803d] to-[#166534] text-white py-12 px-4 shadow-inner">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <HeartHandshake className="w-4 h-4" /> Kết Nối & Hợp Tác
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            {bannerTitle}
          </h1>
          <p className="text-emerald-100 text-sm max-w-2xl">
            {bannerSubtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-emerald-700">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 flex-shrink-0" />
          <span className="font-semibold text-emerald-800">Liên hệ & Đặt hàng</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Thông tin HTX bên trái */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200">
              <div className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold mb-4">
                <Sprout className="w-3.5 h-3.5" /> {badgeText}
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-4 leading-snug">
                {orgName}
              </h2>

              <div className="space-y-4 text-xs md:text-sm text-gray-700">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-gray-900">Trụ sở & Vùng sản xuất:</span>
                    <p className="text-gray-600 mt-0.5">{address}</p>
                  </div>
                </div>

                {representative && (
                  <div className="flex items-start">
                    <Building2 className="w-5 h-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-gray-900">Người đại diện:</span>
                      <p className="text-gray-600 mt-0.5">{representative}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-gray-900">Hotline đặt hàng & Báo giá sỉ: </span>
                    <a href={`tel:${phone1.replace(/\s+/g, '')}`} className="text-emerald-700 font-bold hover:underline">
                      {phone1}
                    </a>
                    {phone2 && (
                      <>
                        <span className="text-gray-400 mx-1.5">|</span>
                        <a href={`tel:${phone2.replace(/\s+/g, '')}`} className="text-emerald-700 font-bold hover:underline">
                          {phone2}
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-gray-900">Email: </span>
                      <a href={`mailto:${email}`} className="text-emerald-700 hover:underline">
                        {email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Chính sách cam kết */}
              <div className="mt-6 pt-6 border-t border-gray-100 bg-emerald-50/50 -mx-6 -mb-6 p-6 rounded-b-3xl">
                <h4 className="font-bold text-emerald-900 text-xs uppercase mb-2">{policyTitle}</h4>
                <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
                  {policyItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Google Maps nhúng nếu có */}
            {mapSrc && (
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800 mb-3 px-2">
                  <MapIcon className="w-4 h-4 text-emerald-600" /> Bản đồ vị trí vùng rau
                </div>
                <div className="rounded-2xl overflow-hidden aspect-video border border-gray-100">
                  <iframe 
                    src={mapSrc} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form liên hệ bên phải */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                Gửi Yêu Cầu Tư Vấn & Báo Giá
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Vui lòng điền thông tin bên dưới, nhân viên phụ trách nông trại sẽ liên hệ lại trong vòng 15-30 phút.
              </p>

              {status === 'success' ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                  <h3 className="text-lg font-bold">Gửi Yêu Cầu Thành Công!</h3>
                  <p className="text-xs text-emerald-700 mt-1">
                    Cảm ơn bạn đã quan tâm đến Nông sản Rau An Toàn. Đội ngũ tư vấn sẽ liên hệ lại ngay theo thông tin đã cung cấp.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Họ và tên của bạn <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="VD: Nguyễn Văn A"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Số điện thoại / Zalo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="VD: 0905 123 456"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Đối tượng khách hàng</label>
                      <select
                        name="customerType"
                        value={formData.customerType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                      >
                        <option value="Gia đình mua lẻ">Gia đình mua lẻ / Combo tuần</option>
                        <option value="Trường học / Mầm non">Trường học / Trường Mầm non</option>
                        <option value="Bếp ăn tập thể / Công ty">Bếp ăn tập thể / Bệnh viện / Công ty</option>
                        <option value="Nhà hàng / Khách sạn">Nhà hàng / Khách sạn</option>
                        <option value="Đại lý / Siêu thị phân phối">Đại lý / Siêu thị phân phối</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Nội dung yêu cầu / Loại rau cần đặt <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="content"
                      rows={4}
                      value={formData.content}
                      onChange={handleChange}
                      required
                      placeholder="VD: Cần nhận bảng báo giá sỉ hàng tuần cho bếp ăn 200 suất / Muốn đặt Combo giỏ rau gia đình 5kg giao định kỳ thứ 3 & thứ 6..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                      Có lỗi xảy ra khi gửi thông tin. Vui lòng liên hệ trực tiếp qua số Hotline {phone1}.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs md:text-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> {status === 'loading' ? 'Đang gửi...' : 'Gửi Yêu Cầu Ngay'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
