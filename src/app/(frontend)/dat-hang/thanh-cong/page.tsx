import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Phone, ShoppingBag, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Đặt Hàng Thành Công — HTX Rau Túy Loan',
  description: 'Đơn hàng rau an toàn của bạn đã được ghi nhận. Nhân viên sẽ liên hệ xác nhận sớm nhất.',
};

interface Props {
  searchParams: Promise<{ code?: string; name?: string }>;
}

export default async function ThanhCongPage({ searchParams }: Props) {
  const sp = await searchParams;
  const orderCode = sp.code || '—';
  const name = sp.name || 'Quý khách';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden">
          {/* Top banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-500 px-8 py-10 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-white drop-shadow-lg" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Đặt Hàng Thành Công! 🎉</h1>
            <p className="text-emerald-100 text-sm">Cảm ơn {name} đã tin tưởng HTX Rau Túy Loan</p>
          </div>

          {/* Order code */}
          <div className="bg-emerald-50 border-b border-emerald-100 px-8 py-5 text-center">
            <p className="text-sm text-gray-500 mb-1">Mã đơn hàng của bạn:</p>
            <div className="text-2xl font-black text-emerald-700 tracking-widest font-mono">{orderCode}</div>
            <p className="text-xs text-gray-400 mt-1">Lưu mã này để tra cứu đơn hàng qua hotline</p>
          </div>

          {/* Info steps */}
          <div className="px-8 py-7 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Nhân viên sẽ liên hệ xác nhận</p>
                <p className="text-xs text-gray-500 mt-0.5">Trong vòng 30–60 phút trong giờ làm việc (6h–18h)</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Rau được thu hoạch & chuẩn bị theo đơn</p>
                <p className="text-xs text-gray-500 mt-0.5">Tươi ngon đúng tiêu chuẩn VietGAP từ HTX Túy Loan</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Cần hỗ trợ? Gọi ngay hotline</p>
                <a
                  href="tel:0905546207"
                  className="text-emerald-600 font-black text-base hover:text-emerald-700 transition-colors"
                >
                  0905 546 207 - 0903 596 767
                </a>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="px-8 pb-8 flex flex-col gap-3">
            <Link
              href="/dat-hang"
              className="flex items-center justify-center gap-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all text-sm shadow-md hover:shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" /> Đặt thêm đơn hàng mới
            </Link>
            <Link
              href="/san-pham"
              className="flex items-center justify-center gap-2 py-3 px-6 bg-white hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl border-2 border-emerald-200 transition-all text-sm"
            >
              Xem thêm sản phẩm <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          HTX Rau An Toàn Túy Loan · Chuẩn VietGAP · Đà Nẵng
        </p>
      </div>
    </div>
  );
}
