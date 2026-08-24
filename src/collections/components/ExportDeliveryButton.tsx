'use client';

import React, { useState } from 'react';
import { Button } from '@payloadcms/ui';

export const ExportDeliveryButton: React.FC = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const download = (url: string, key: string) => {
    setLoading(key);
    const a = document.createElement('a');
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setLoading(null), 2000);
  };

  const today = new Date().toISOString().split('T')[0];

  const handleToday = () =>
    download(`/api/export-orders?date=${today}`, 'today');

  const handlePending = () =>
    download(`/api/export-orders?status=new,confirmed,preparing`, 'pending');

  const handleDelivering = () =>
    download(`/api/export-orders?status=delivering`, 'delivering');

  const handleAll30 = () =>
    download(`/api/export-orders`, 'all30');

  const handleDateRange = () => {
    if (!fromDate || !toDate) return;
    download(`/api/export-orders?from=${fromDate}&to=${toDate}`, 'range');
    setShowDatePicker(false);
  };

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
  };

  return (
    <div style={{
      background: 'var(--theme-elevation-50, #f8f9fa)',
      border: '1px solid var(--theme-elevation-200, #dee2e6)',
      borderRadius: '6px',
      padding: '12px 16px',
      marginBottom: '16px',
    }}>
      {/* Title */}
      <div style={{
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--theme-elevation-500)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '10px',
      }}>
        📊 Xuất Excel
      </div>

      {/* Buttons row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <Button
          size="small"
          buttonStyle="primary"
          onClick={handleToday}
          disabled={loading === 'today'}
        >
          <span style={btnStyle}>
            {loading === 'today' ? '⏳' : '📅'} Đơn hôm nay
          </span>
        </Button>

        <Button
          size="small"
          buttonStyle="secondary"
          onClick={handlePending}
          disabled={loading === 'pending'}
        >
          <span style={btnStyle}>
            {loading === 'pending' ? '⏳' : '📦'} Đang xử lý
          </span>
        </Button>

        <Button
          size="small"
          buttonStyle="secondary"
          onClick={handleDelivering}
          disabled={loading === 'delivering'}
        >
          <span style={btnStyle}>
            {loading === 'delivering' ? '⏳' : '🚚'} Đang giao
          </span>
        </Button>

        <Button
          size="small"
          buttonStyle="secondary"
          onClick={handleAll30}
          disabled={loading === 'all30'}
        >
          <span style={btnStyle}>
            {loading === 'all30' ? '⏳' : '📋'} 30 ngày gần nhất
          </span>
        </Button>

        <Button
          size="small"
          buttonStyle="secondary"
          onClick={() => setShowDatePicker(v => !v)}
        >
          <span style={btnStyle}>
            🗓️ Chọn khoảng ngày
          </span>
        </Button>
      </div>

      {/* Date range picker */}
      {showDatePicker && (
        <div style={{
          marginTop: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          padding: '12px',
          background: 'var(--theme-elevation-0, #fff)',
          border: '1px solid var(--theme-elevation-150, #e0e0e0)',
          borderRadius: '4px',
        }}>
          <label style={{ fontSize: '13px', color: 'var(--theme-elevation-700)' }}>
            Từ ngày:
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              style={{
                marginLeft: '8px',
                padding: '4px 8px',
                border: '1px solid var(--theme-elevation-300, #ccc)',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            />
          </label>
          <label style={{ fontSize: '13px', color: 'var(--theme-elevation-700)' }}>
            Đến ngày:
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              style={{
                marginLeft: '8px',
                padding: '4px 8px',
                border: '1px solid var(--theme-elevation-300, #ccc)',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            />
          </label>
          <Button
            size="small"
            buttonStyle="primary"
            onClick={handleDateRange}
            disabled={!fromDate || !toDate || loading === 'range'}
          >
            {loading === 'range' ? '⏳ Đang xuất...' : '⬇️ Xuất Excel'}
          </Button>
          <button
            onClick={() => setShowDatePicker(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--theme-elevation-500)',
              fontSize: '13px',
            }}
          >
            ✕ Đóng
          </button>
        </div>
      )}

      {/* Info note */}
      <div style={{
        marginTop: '8px',
        fontSize: '11px',
        color: 'var(--theme-elevation-400)',
      }}>
        💡 File Excel gồm 2 sheet: Tổng hợp đơn hàng + Chi tiết sản phẩm
      </div>
    </div>
  );
};
