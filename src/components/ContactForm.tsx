'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const SUBJECT_OPTIONS = [
  { value: 'retail_order', label: 'Đặt mua rau tươi lẻ / Đơn hàng theo ngày' },
  { value: 'wholesale_quote', label: 'Báo giá sỉ cho trường học / bếp ăn / nhà hàng' },
  { value: 'partnership', label: 'Hợp tác đại lý phân phối / Cung ứng nông sản' },
  { value: 'feedback', label: 'Góp ý & Phản hồi chất lượng sản phẩm' },
  { value: 'other', label: 'Nhu cầu khác' },
];

export function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', organization: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Đã có lỗi xảy ra.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Không thể kết nối. Vui lòng thử lại sau.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
        <CheckCircle size={56} className="text-green-500 mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Cảm ơn bạn!</h3>
        <p className="text-gray-600 text-lg mb-6">
          Thông tin của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="px-8 py-3 rounded-full bg-[var(--primary)] text-white font-bold hover:bg-[var(--primary-dark)] transition-colors"
        >
          Gửi thêm yêu cầu
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === 'error' && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Name + Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="cf-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="email@example.com"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Phone + Organization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="cf-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Số điện thoại
          </label>
          <input
            id="cf-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="0901 234 567"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
          />
        </div>
        <div>
          <label htmlFor="cf-org" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Cơ quan / Đơn vị
          </label>
          <input
            id="cf-org"
            name="organization"
            type="text"
            value={form.organization}
            onChange={handleChange}
            placeholder="Trường học / Bếp ăn / Nhà hàng / Hộ gia đình..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="cf-subject" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Chủ đề liên hệ <span className="text-red-500">*</span>
        </label>
        <select
          id="cf-subject"
          name="subject"
          required
          value={form.subject}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-gray-800 bg-white appearance-none"
        >
          <option value="">-- Chọn chủ đề --</option>
          {SUBJECT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="cf-message" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Nội dung <span className="text-red-500">*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={6}
          value={form.message}
          onChange={handleChange}
          placeholder="Trình bày nội dung cần hỏi hoặc phản hồi..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-gray-800 placeholder-gray-400 resize-none"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          <span className="text-red-500">*</span> Thông tin bắt buộc
        </p>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2.5 px-8 py-3 rounded-full bg-[var(--primary)] text-white font-bold hover:bg-[var(--primary-dark)] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {status === 'loading' ? (
            <><Loader2 size={18} className="animate-spin" /> Đang gửi...</>
          ) : (
            <><Send size={18} /> Gửi thông tin</>
          )}
        </button>
      </div>
    </form>
  );
}
