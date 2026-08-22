'use client';

import React from 'react';
import { Button } from '@payloadcms/ui';

export const ExportDeliveryButton: React.FC = () => {
  const handleExportToday = () => {
    const today = new Date().toISOString().split('T')[0];
    window.open(`/api/export-delivery?date=${today}`, '_blank');
  };

  const handleExportAllPending = () => {
    window.open(`/api/export-delivery?status=confirmed,preparing`, '_blank');
  };

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
      <Button size="small" buttonStyle="secondary" onClick={handleExportAllPending}>
        🖨️ In đơn cần chuẩn bị
      </Button>
      <Button size="small" buttonStyle="primary" onClick={handleExportToday}>
        🖨️ In đơn hôm nay
      </Button>
    </div>
  );
};
