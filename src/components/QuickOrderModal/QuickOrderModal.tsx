'use client';

import React, { useState } from 'react';
import { X, ShoppingCart, Phone, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import styles from './QuickOrderModal.module.css';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: number;
  productName: string;
  productPrice?: number | null;
  productUnit?: string;
  hotline?: string;
}

const UNITS = [
  { label: 'kg', value: 'kg' },
  { label: 'gram', value: 'gram' },
  { label: 'bó', value: 'bo' },
  { label: 'hộp', value: 'hop' },
  { label: 'túi', value: 'tui' },
  { label: 'cái', value: 'cai' },
  { label: 'khay', value: 'khay' }
];

export function QuickOrderModal({
  isOpen, onClose,
  productId, productName,
  productPrice, productUnit = 'kg',
  hotline = '0905 559 206',
}: QuickOrderModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(productUnit);
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qr'>('cod');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [orderCode, setOrderCode] = useState('');

  const reset = () => {
    setName(''); setPhone(''); setAddress('');
    setQuantity(1); setUnit(productUnit); setNote('');
    setPaymentMethod('cod'); setState('idle'); setErrorMsg(''); setOrderCode('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErrorMsg('Vui lòng nhập họ tên.'); return; }
    if (!phone.trim() || !/^(0|\+84)[0-9]{8,10}$/.test(phone.replace(/\s/g, ''))) {
      setErrorMsg('Số điện thoại không hợp lệ.'); return;
    }

    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          paymentMethod,
          totalNote: note,
          items: [{
            product: productId,
            productName,
            quantity,
            unit,
            unitPrice: productPrice,
          }],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi hệ thống');
      setOrderCode(data.orderCode);
      setState('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi hệ thống. Vui lòng gọi hotline.');
      setState('error');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={handleClose} />

      {/* Modal */}
      <div className={styles.modal} role="dialog" aria-modal="true">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <h2 className={styles.title}>Đặt Mua Nhanh</h2>
          </div>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product badge */}
        <div className={styles.productBadge}>
          <span className={styles.productName}>{productName}</span>
          {productPrice && (
            <span className={styles.productPrice}>
              {Number(productPrice).toLocaleString('vi-VN')} đ/{productUnit}
            </span>
          )}
        </div>

        {/* Success state */}
        {state === 'success' ? (
          <div className={styles.successState}>
            <CheckCircle2 className="w-12 h-12 text-emerald-500" strokeWidth={1.5} />
            <h3 className={styles.successTitle}>Đặt Hàng Thành Công! 🎉</h3>
            <div className={styles.successCode}>
              Mã đơn: <strong>{orderCode}</strong>
            </div>
            <p className={styles.successMsg}>
              Nhân viên sẽ gọi điện xác nhận trong 30–60 phút.
            </p>
            <a href={`tel:${hotline.replace(/\s/g, '')}`} className={styles.hotlineBtn}>
              <Phone className="w-4 h-4" /> Hotline: {hotline}
            </a>
            <button className={styles.closeSuccessBtn} onClick={handleClose}>Đóng</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Error */}
            {(state === 'error' || errorMsg) && (
              <div className={styles.error}>⚠️ {errorMsg}</div>
            )}

            {/* Quantity & unit */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Số lượng <span className={styles.req}>*</span></label>
                <input
                  type="number" min={0.1} step={0.1}
                  className={styles.input}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Đơn vị</label>
                <div className={styles.selectWrap}>
                  <select className={styles.select} value={unit} onChange={e => setUnit(e.target.value)}>
                    {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                  <ChevronDown className={styles.selectIcon} />
                </div>
              </div>
            </div>

            {/* Name & phone */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Họ tên <span className={styles.req}>*</span></label>
                <input className={styles.input} placeholder="Nguyễn Thị Lan" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>SĐT <span className={styles.req}>*</span></label>
                <input className={styles.input} type="tel" placeholder="0905 559 206" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>

            {/* Address */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Địa chỉ giao hàng</label>
              <input className={styles.input} placeholder="Số nhà, đường, phường, Đà Nẵng" value={address} onChange={e => setAddress(e.target.value)} />
            </div>

            {/* Payment */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Thanh toán</label>
              <div className={styles.payRow}>
                <button
                  type="button"
                  className={`${styles.payChip} ${paymentMethod === 'cod' ? styles.payChipActive : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >💵 Tiền mặt (COD)</button>
                <button
                  type="button"
                  className={`${styles.payChip} ${paymentMethod === 'qr' ? styles.payChipActive : ''}`}
                  onClick={() => setPaymentMethod('qr')}
                >🏦 Chuyển khoản</button>
              </div>
            </div>

            {/* Note */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Ghi chú (tuỳ chọn)</label>
              <textarea className={styles.textarea} rows={2} placeholder="VD: Giao trước 7h sáng..." value={note} onChange={e => setNote(e.target.value)} />
            </div>

            {productPrice && (
              <div className={styles.estimate}>
                💰 Dự tính: <strong>{(quantity * productPrice).toLocaleString('vi-VN')} đ</strong>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={state === 'loading'}>
              {state === 'loading'
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</>
                : <><ShoppingCart className="w-4 h-4" /> Xác nhận đặt hàng</>
              }
            </button>
          </form>
        )}
      </div>
    </>
  );
}
