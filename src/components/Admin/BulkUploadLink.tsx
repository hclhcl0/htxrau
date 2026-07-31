'use client';

import React from 'react';
import Link from 'next/link';

export default function BulkUploadLink() {
  return (
    <li className="nav__link">
      <Link href="/admin/bulk-upload" style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        color: 'var(--theme-elevation-800)',
        textDecoration: 'none',
        height: '40px',
        fontWeight: 'bold',
        gap: '8px'
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span>Tải nhiều ảnh</span>
      </Link>
    </li>
  );
}
