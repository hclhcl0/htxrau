import React from 'react';
import { Droplet, Sun, Sprout, ShieldAlert, Scissors, PackageCheck } from 'lucide-react';

export function ProcessStepsSection() {
  const steps = [
    {
      step: '01',
      icon: <Sprout className="w-6 h-6 text-emerald-600" />,
      title: 'Tuyển Chọn Giống F1',
      desc: 'Hạt giống thuần chủng, có nguồn gốc rõ ràng, tỷ lệ nảy mầm cao và kháng sâu bệnh tự nhiên.',
    },
    {
      step: '02',
      icon: <Droplet className="w-6 h-6 text-emerald-600" />,
      title: 'Đất & Nước Sông Túy Loan Đạt Chuẩn',
      desc: 'Đất bãi bồi ven sông giàu phù sa tự nhiên, nguồn nước tưới kiểm định định kỳ không nhiễm kim loại nặng.',
    },
    {
      step: '03',
      icon: <Sun className="w-6 h-6 text-emerald-600" />,
      title: 'Nhà Lưới Sinh Học & Bẫy Côn Trùng',
      desc: 'Hệ thống nhà màng che chắn, sử dụng bẫy dính màu vàng và chế phẩm sinh học thảo mộc xua đuổi sâu bệnh.',
    },
    {
      step: '04',
      icon: <ShieldAlert className="w-6 h-6 text-emerald-600" />,
      title: 'Kiểm Định ATTP & OCOP Định Kỳ',
      desc: 'Xét nghiệm định kỳ dư lượng Nitrat, kim loại nặng và vi sinh vật gây hại theo chuẩn VietGAP & OCOP Đà Nẵng.',
    },
    {
      step: '05',
      icon: <Scissors className="w-6 h-6 text-emerald-600" />,
      title: 'Thu Hoạch 4 Giờ Sáng',
      desc: 'Rau được thu hái lúc sáng sớm khi đọng sương, giữ trọn vẹn vị giòn ngọt và dưỡng chất.',
    },
    {
      step: '06',
      icon: <PackageCheck className="w-6 h-6 text-emerald-600" />,
      title: 'Sơ Chế, Dán Tem & Giao Nhanh',
      desc: 'Cắt tỉa, đóng gói dán tem truy xuất nguồn gốc QR Code và giao đến siêu thị, trường học, bếp ăn trong ngày.',
    },
  ];

  return (
    <section className="py-16 bg-white border-t border-emerald-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Minh Bạch Nguồn Gốc • HTX Túy Loan
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
            Quy Trình 6 Bước Canh Tác Rau An Toàn Chuẩn VietGAP
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Kiểm soát nghiêm ngặt từng luống rau tại vùng sản xuất chuyên canh 8 ha Túy Loan (xã Hòa Phong, huyện Hòa Vang, Đà Nẵng)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="bg-emerald-50/40 rounded-2xl p-6 border border-emerald-100/80 hover:bg-emerald-50/90 transition-all hover:shadow-md relative group"
            >
              <span className="absolute top-4 right-5 text-3xl font-black text-emerald-200/70 group-hover:text-emerald-300 transition-colors">
                {item.step}
              </span>
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
