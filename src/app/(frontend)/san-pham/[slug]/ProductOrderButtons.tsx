'use client';

import React, { useState } from 'react';
import { HeartHandshake, PhoneCall, ShoppingCart } from 'lucide-react';
import { QuickOrderModal } from '@/components/QuickOrderModal/QuickOrderModal';
import Link from 'next/link';

interface ProductOrderButtonsProps {
  productId: number;
  productName: string;
  productPrice?: number | null;
  productUnit?: string;
  hotline: string;
}

export function ProductOrderButtons({
  productId, productName, productPrice, productUnit, hotline,
}: ProductOrderButtonsProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="mt-auto flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setModalOpen(true)}
          className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
        >
          <ShoppingCart className="w-4 h-4" /> Đặt Mua Ngay
        </button>

        <Link
          href={`/dat-hang?product=${encodeURIComponent(productName)}`}
          className="py-3.5 px-5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-2xl border-2 border-emerald-200 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <HeartHandshake className="w-4 h-4" /> Đặt Sỉ / Báo Giá
        </Link>

        <a
          href={`tel:${hotline.replace(/\s/g, '')}`}
          className="py-3.5 px-5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
        >
          <PhoneCall className="w-4 h-4" /> {hotline}
        </a>
      </div>

      <QuickOrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        productId={productId}
        productName={productName}
        productPrice={productPrice}
        productUnit={productUnit}
        hotline={hotline}
      />
    </>
  );
}
