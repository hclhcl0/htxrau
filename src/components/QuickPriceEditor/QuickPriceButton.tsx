"use client";

import React, { useState, useEffect } from 'react';
import { Edit3, Check, X, Loader2, Tag, ShieldCheck, Sparkles } from 'lucide-react';

interface QuickPriceButtonProps {
  productId: string | number;
  productName: string;
  initialPrice: number | null | undefined;
  initialOriginalPrice?: number | null | undefined;
  initialUnit?: string;
  initialStatus?: string;
  className?: string;
  variant?: 'icon' | 'badge' | 'button';
  onPriceUpdated?: (newPrice: number, newUnit: string) => void;
}

export function QuickPriceButton({
  productId,
  productName,
  initialPrice,
  initialOriginalPrice,
  initialUnit = 'Kg',
  initialStatus = 'in_stock',
  className = '',
  variant = 'icon',
  onPriceUpdated,
}: QuickPriceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [price, setPrice] = useState<number | string>(initialPrice || '');
  const [originalPrice, setOriginalPrice] = useState<number | string>(initialOriginalPrice || '');
  const [unit, setUnit] = useState(initialUnit);
  const [status, setStatus] = useState(initialStatus);
  const [adminPass, setAdminPass] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load saved admin password from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('htx_admin_quick_key');
      if (saved) setAdminPass(saved);
    } catch (e) {
      // ignore
    }
  }, []);

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPrice(initialPrice || '');
    setOriginalPrice(initialOriginalPrice || '');
    setUnit(initialUnit);
    setStatus(initialStatus);
    setErrorMsg('');
    setSuccessMsg('');
    setIsOpen(true);
  };

  const closeModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        setErrorMsg('Vui lòng nhập giá bán hợp lệ!');
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/admin/quick-price', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          price: numPrice,
          originalPrice: originalPrice ? Number(originalPrice) : null,
          unit,
          status,
          adminPass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Cập nhật thất bại. Vui lòng kiểm tra quyền quản trị.');
      }

      // Save admin pass for future convenience
      if (adminPass) {
        try {
          localStorage.setItem('htx_admin_quick_key', adminPass);
        } catch (e) {
          // ignore
        }
      }

      setSuccessMsg('Đã cập nhật giá mới thành công!');
      if (onPriceUpdated) {
        onPriceUpdated(numPrice, unit);
      }

      setTimeout(() => {
        setIsOpen(false);
        // Refresh page to show updated server-side data
        window.location.reload();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi lưu giá');
    } finally {
      setIsLoading(false);
    }
  };

  const commonUnits = ['Kg', 'Túi 500g', 'Túi 1Kg', 'Bó 300g', 'Bó 500g', 'Hộp 250g', 'Quả / Trái'];

  return (
    <>
      {/* Trigger Button */}
      {variant === 'icon' && (
        <button
          type="button"
          onClick={openModal}
          title="Sửa giá nhanh (Quản trị viên)"
          className={`inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white transition-all shadow-sm cursor-pointer opacity-80 hover:opacity-100 hover:scale-105 z-10 ${className}`}
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      )}

      {variant === 'badge' && (
        <button
          type="button"
          onClick={openModal}
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all cursor-pointer ${className}`}
        >
          <Edit3 className="w-3 h-3" /> Sửa giá
        </button>
      )}

      {variant === 'button' && (
        <button
          type="button"
          onClick={openModal}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-500 text-amber-800 hover:text-white border border-amber-300 transition-all cursor-pointer shadow-sm ${className}`}
        >
          <Edit3 className="w-3.5 h-3.5" /> Sửa giá nhanh
        </button>
      )}

      {/* Modal Popup */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 relative text-left overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1">
                    Cập Nhật Giá Nhanh <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </h3>
                  <p className="text-xs text-gray-500 font-medium truncate max-w-[240px]">
                    {productName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4 text-xs md:text-sm">
              {/* Giá bán hiện tại */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Giá bán mới (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="VD: 35000"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base font-bold text-emerald-800"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    đ
                  </span>
                </div>
                {price && !isNaN(Number(price)) && (
                  <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
                    Xem trước: {Number(price).toLocaleString('vi-VN')} đ / {unit}
                  </p>
                )}
              </div>

              {/* Giá gốc (Gạch ngang nếu giảm giá) */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Giá gốc / Giá niêm yết (VNĐ - Tùy chọn)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="VD: 45000 (để trống nếu không giảm giá)"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-gray-600"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">
                    đ
                  </span>
                </div>
              </div>

              {/* Đơn vị tính */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Đơn vị tính
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="VD: Kg, Túi 500g, Bó 300g..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs mb-2"
                />
                {/* Gợi ý đơn vị */}
                <div className="flex flex-wrap gap-1.5">
                  {commonUnits.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                        unit === u
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tình trạng hàng */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Tình trạng hàng
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                >
                  <option value="in_stock">✅ Có sẵn - Thu hoạch hôm nay</option>
                  <option value="pre_order">⏳ Đặt trước (Thu hoạch theo đợt)</option>
                  <option value="out_of_stock">❌ Tạm hết hàng / Hết mùa</option>
                </select>
              </div>

              {/* Mật khẩu Admin xác thực nếu chưa đăng nhập */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Mật khẩu Quản trị (Nếu đã đăng nhập Admin thì để trống):
                </label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Nhập mật khẩu Admin (mặc định: admin123 hoặc mật khẩu tài khoản Admin)"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              {/* Thông báo lỗi / thành công */}
              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-1.5 font-bold">
                  <Check className="w-4 h-4 text-emerald-600" /> {successMsg}
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="w-1/3 py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Lưu Giá Mới
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
