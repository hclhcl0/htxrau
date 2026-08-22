import React from 'react';
import { ShieldCheck, Sprout, Sparkles, Clock, Truck, Award } from 'lucide-react';

export function CommitmentBadges() {
  const commitments = [
    {
      icon: <Sprout className="w-8 h-8 text-emerald-600" />,
      title: 'Đất Bãi Bồi Sông Túy Loan',
      desc: 'Phù sa màu mỡ & nguồn nước tưới kiểm nghiệm đạt 100% chỉ số an toàn',
    },
    {
      icon: <Award className="w-8 h-8 text-emerald-600" />,
      title: 'Đạt Chuẩn OCOP 4 Sao & VietGAP',
      desc: 'OCOP 4 sao rau ăn quả, OCOP 3 sao rau ăn lá chứng nhận bởi UBND TP. Đà Nẵng',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      title: '40+ Hộ Thành Viên HTX',
      desc: 'Canh tác nhà lưới sinh học, 100% không thuốc bảo vệ thực vật hóa học',
    },
    {
      icon: <Truck className="w-8 h-8 text-emerald-600" />,
      title: 'Thu Hoạch 4h Sáng - Giao Tươi',
      desc: 'Cung ứng 1.5 tấn rau sạch/ngày cho siêu thị, trường học, bếp ăn và hộ gia đình',
    },
  ];

  return (
    <div className="bg-emerald-50/70 border-y border-emerald-100 py-8 my-6">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
            Hợp Tác Xã Rau An Toàn Túy Loan • Hòa Vang • Đà Nẵng
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-900 mt-2">
            8 Hecta Canh Tác Chuẩn VietGAP & OCOP - Tươi Ngon Trọn Vị Từ Đất Mẹ
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {commitments.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-emerald-100 flex flex-col items-center text-center group"
            >
              <div className="p-3 bg-emerald-50 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">{item.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
