'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Trash2, ShoppingCart, Phone, MapPin, User,
  ChevronDown, CreditCard, Banknote, ClipboardList, CheckCircle2, Loader2
} from 'lucide-react';
import styles from './dat-hang.module.css';

interface Product { id: number; name: string; price: number | null; unit: string; slug: string; }
interface OrderItem { productId: string; productName: string; quantity: number; unit: string; unitPrice: number | null; itemNote: string; }

interface OrderFormProps {
  products: Product[];
  hotline: string;
  bankName?: string;
  bankAccount?: string;
  bankOwner?: string;
  qrImageUrl?: string;
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

export function OrderForm({ products, hotline, bankName, bankAccount, bankOwner, qrImageUrl }: OrderFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'qr'>('cod');
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState('');
  const [totalNote, setTotalNote] = useState('');

  // Items
  const [items, setItems] = useState<OrderItem[]>([
    { productId: '', productName: '', quantity: 1, unit: 'kg', unitPrice: null, itemNote: '' },
  ]);

  // ── Item handlers ──────────────────────────────────────────────
  const addItem = useCallback(() => {
    setItems(prev => [...prev, { productId: '', productName: '', quantity: 1, unit: 'kg', unitPrice: null, itemNote: '' }]);
  }, []);

  const removeItem = useCallback((idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const updateItem = useCallback((idx: number, field: keyof OrderItem, value: any) => {
    setItems(prev => {
      const next = [...prev];
      (next[idx] as any)[field] = value;
      // Auto-fill price when product selected
      if (field === 'productId' && value) {
        const prod = products.find(p => String(p.id) === String(value));
        if (prod) {
          next[idx].productName = prod.name;
          next[idx].unitPrice = prod.price;
          next[idx].unit = prod.unit || 'kg';
        }
      }
      return next;
    });
  }, [products]);

  // ── Validation ─────────────────────────────────────────────────
  const validateStep1 = () => {
    if (!customerName.trim()) return 'Vui lòng nhập họ và tên.';
    if (!customerPhone.trim()) return 'Vui lòng nhập số điện thoại.';
    if (!/^(0|\+84)[0-9]{8,10}$/.test(customerPhone.replace(/\s/g, '')))
      return 'Số điện thoại không hợp lệ (VD: 0905559206).';
    return '';
  };

  const validateStep2 = () => {
    for (const it of items) {
      if (!it.productName.trim() && !it.productId) return 'Vui lòng chọn hoặc nhập tên sản phẩm.';
      if (it.quantity <= 0) return 'Số lượng phải lớn hơn 0.';
    }
    return '';
  };

  const goStep2 = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const goStep3 = () => {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setStep(3);
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        customerName,
        customerPhone,
        customerAddress,
        paymentMethod,
        requestedDeliveryDate: requestedDeliveryDate || undefined,
        totalNote,
        items: items.map(it => ({
          product: it.productId || undefined,
          productName: it.productName,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
          itemNote: it.itemNote,
        })),
      };

      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Lỗi không xác định.');

      router.push(`/dat-hang/thanh-cong?code=${encodeURIComponent(data.orderCode)}&name=${encodeURIComponent(customerName)}`);
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống. Vui lòng gọi hotline.');
      setSubmitting(false);
    }
  };

  const totalEstimate = items.reduce((s, it) => {
    if (it.unitPrice) return s + it.quantity * it.unitPrice;
    return s;
  }, 0);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className={styles.formCard}>
      {/* Step indicator */}
      <div className={styles.steps}>
        {(['1. Thông tin', '2. Giỏ hàng', '3. Xác nhận'] as const).map((label, idx) => (
          <div key={label} className={`${styles.step} ${step === idx + 1 ? styles.stepActive : ''} ${step > idx + 1 ? styles.stepDone : ''}`}>
            <span className={styles.stepNum}>{step > idx + 1 ? '✓' : idx + 1}</span>
            <span className={styles.stepLabel}>{label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className={styles.errorBanner}>
          ⚠️ {error}
        </div>
      )}

      {/* ── STEP 1: Customer info ──────────────────────────────── */}
      {step === 1 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}><User className="w-5 h-5" /> Thông tin khách hàng</h2>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Họ và tên <span className={styles.required}>*</span></label>
              <input className={styles.input} placeholder="VD: Nguyễn Thị Lan" value={customerName} onChange={e => setCustomerName(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Số điện thoại <span className={styles.required}>*</span></label>
              <input className={styles.input} placeholder="VD: 0905559206" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}><MapPin className="w-4 h-4 inline mr-1" />Địa chỉ giao hàng</label>
            <input className={styles.input} placeholder="Số nhà, tên đường, phường/xã, quận/huyện, Đà Nẵng" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ngày giao hàng mong muốn</label>
              <input className={styles.input} type="date" min={new Date().toISOString().split('T')[0]} value={requestedDeliveryDate} onChange={e => setRequestedDeliveryDate(e.target.value)} />
            </div>
          </div>

          {/* Payment method */}
          <div className={styles.formGroup}>
            <label className={styles.label}><CreditCard className="w-4 h-4 inline mr-1" />Phương thức thanh toán</label>
            <div className={styles.paymentOptions}>
              <button type="button" className={`${styles.payBtn} ${paymentMethod === 'cod' ? styles.payBtnActive : ''}`} onClick={() => setPaymentMethod('cod')}>
                <Banknote className="w-5 h-5" />
                <span>
                  <strong>Tiền mặt (COD)</strong>
                  <small>Trả khi nhận hàng</small>
                </span>
              </button>
              <button type="button" className={`${styles.payBtn} ${paymentMethod === 'qr' ? styles.payBtnActive : ''}`} onClick={() => setPaymentMethod('qr')}>
                <CreditCard className="w-5 h-5" />
                <span>
                  <strong>Chuyển khoản QR</strong>
                  <small>Thanh toán trước qua ngân hàng</small>
                </span>
              </button>
            </div>

            {paymentMethod === 'qr' && (bankName || bankAccount) && (
              <div className={styles.bankInfo}>
                <p className={styles.bankTitle}>🏦 Thông tin tài khoản nhận tiền:</p>
                <div className={styles.bankDetails}>
                  {bankName && <div><span>Ngân hàng:</span> <strong>{bankName}</strong></div>}
                  {bankAccount && <div><span>Số tài khoản:</span> <strong className={styles.bankAccount}>{bankAccount}</strong></div>}
                  {bankOwner && <div><span>Chủ tài khoản:</span> <strong>{bankOwner}</strong></div>}
                  <p className={styles.bankNote}>Nội dung chuyển khoản: <em>[SĐT] + Đặt hàng rau</em></p>
                </div>
                {qrImageUrl && (
                  <div className={styles.qrWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrImageUrl} alt="QR chuyển khoản" className={styles.qrImg} />
                    <p className={styles.qrCaption}>Quét mã QR để chuyển khoản</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <button type="button" className={styles.btnPrimary} onClick={goStep2}>
            Tiếp theo — Chọn sản phẩm →
          </button>
        </div>
      )}

      {/* ── STEP 2: Items ──────────────────────────────────────── */}
      {step === 2 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}><ShoppingCart className="w-5 h-5" /> Giỏ hàng đặt rau</h2>
          <p className={styles.sectionHint}>Chọn từ danh mục hoặc gõ tên rau vào ô tên sản phẩm</p>

          {items.map((it, idx) => (
            <div key={idx} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <span className={styles.itemNum}>#{idx + 1}</span>
                {items.length > 1 && (
                  <button type="button" className={styles.removeBtn} onClick={() => removeItem(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label className={styles.label}>Chọn sản phẩm từ danh mục</label>
                  <div className={styles.selectWrap}>
                    <select
                      className={styles.select}
                      value={it.productId}
                      onChange={e => updateItem(idx, 'productId', e.target.value)}
                    >
                      <option value="">— Chọn rau có sẵn —</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}{p.price ? ` — ${Number(p.price).toLocaleString('vi-VN')}đ/${p.unit}` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={styles.selectIcon} />
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label className={styles.label}>Tên sản phẩm <span className={styles.required}>*</span></label>
                  <input className={styles.input} placeholder="VD: Cải ngọt, Rau muống..." value={it.productName} onChange={e => updateItem(idx, 'productName', e.target.value)} />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Số lượng <span className={styles.required}>*</span></label>
                  <input className={styles.input} type="number" min={0.1} step={0.1} value={it.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Đơn vị</label>
                  <div className={styles.selectWrap}>
                    <select className={styles.select} value={it.unit} onChange={e => updateItem(idx, 'unit', e.target.value)}>
                      {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                    <ChevronDown className={styles.selectIcon} />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Ghi chú mặt hàng này</label>
                <input className={styles.input} placeholder="VD: Rau non, không cần gốc..." value={it.itemNote} onChange={e => updateItem(idx, 'itemNote', e.target.value)} />
              </div>
            </div>
          ))}

          <button type="button" className={styles.btnOutline} onClick={addItem}>
            <Plus className="w-4 h-4" /> Thêm sản phẩm
          </button>

          {totalEstimate > 0 && (
            <div className={styles.totalEstimate}>
              💰 Dự tính: <strong>{totalEstimate.toLocaleString('vi-VN')} đ</strong>
              <small> (giá sẽ được xác nhận lại qua điện thoại)</small>
            </div>
          )}

          <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
            <label className={styles.label}><ClipboardList className="w-4 h-4 inline mr-1" />Ghi chú đơn hàng</label>
            <textarea className={styles.textarea} rows={3} placeholder="VD: Giao trước 7h sáng, để trước cổng. Cần xuất hoá đơn..." value={totalNote} onChange={e => setTotalNote(e.target.value)} />
          </div>

          <div className={styles.btnRow}>
            <button type="button" className={styles.btnSecondary} onClick={() => setStep(1)}>← Quay lại</button>
            <button type="button" className={styles.btnPrimary} onClick={goStep3}>Xem lại đơn hàng →</button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Confirm ────────────────────────────────────── */}
      {step === 3 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}><CheckCircle2 className="w-5 h-5" /> Xác nhận đơn hàng</h2>

          <div className={styles.confirmBox}>
            <div className={styles.confirmRow}><span>Khách hàng:</span> <strong>{customerName}</strong></div>
            <div className={styles.confirmRow}><span>Điện thoại:</span> <strong>{customerPhone}</strong></div>
            {customerAddress && <div className={styles.confirmRow}><span>Địa chỉ:</span> <strong>{customerAddress}</strong></div>}
            <div className={styles.confirmRow}><span>Thanh toán:</span> <strong>{paymentMethod === 'cod' ? '💵 Tiền mặt (COD)' : '🏦 Chuyển khoản QR'}</strong></div>
            {requestedDeliveryDate && <div className={styles.confirmRow}><span>Ngày giao:</span> <strong>{new Date(requestedDeliveryDate).toLocaleDateString('vi-VN')}</strong></div>}
          </div>

          <div className={styles.itemsReview}>
            <h3 className={styles.reviewTitle}>🥦 Danh sách đặt hàng</h3>
            {items.map((it, idx) => (
              <div key={idx} className={styles.reviewItem}>
                <span className={styles.reviewName}>{it.productName || 'Sản phẩm'}</span>
                <span className={styles.reviewQty}>{it.quantity} {it.unit}</span>
                {it.unitPrice && <span className={styles.reviewPrice}>{(it.quantity * it.unitPrice).toLocaleString('vi-VN')} đ</span>}
              </div>
            ))}
            {totalEstimate > 0 && (
              <div className={styles.reviewTotal}>
                Dự tính: <strong>{totalEstimate.toLocaleString('vi-VN')} đ</strong>
              </div>
            )}
          </div>

          {totalNote && (
            <div className={styles.noteBox}>
              <span>📝 Ghi chú:</span> {totalNote}
            </div>
          )}

          <div className={styles.submitNotice}>
            Sau khi đặt hàng, nhân viên sẽ gọi điện xác nhận trong vòng <strong>30–60 phút</strong> trong giờ làm việc.
            Hotline: <a href={`tel:${hotline}`} className={styles.phoneLink}><Phone className="w-4 h-4 inline" /> {hotline}</a>
          </div>

          <div className={styles.btnRow}>
            <button type="button" className={styles.btnSecondary} onClick={() => setStep(2)}>← Sửa đơn</button>
            <button
              type="button"
              className={styles.btnSubmit}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi đơn...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Xác nhận đặt hàng</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
