'use client'

import React from 'react'

export const AdminLogo = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1rem 0' }}>
      <img 
        src="/logo.png" 
        alt="Trang Trại Nông Sản Sạch & Rau An Toàn VietGAP" 
        style={{ width: '90px', height: '90px', objectFit: 'contain' }}
        onError={(e) => {
          // Ẩn ảnh nếu file logo.png bị lỗi 404
          e.currentTarget.style.display = 'none';
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.15rem', 
          fontWeight: 700, 
          color: 'var(--theme-elevation-800)', 
          letterSpacing: '0.02em',
          textTransform: 'uppercase'
        }}>
          HTX RAU AN TOÀN TÚY LOAN
        </h2>
        <p style={{ 
          margin: '0.25rem 0 0 0', 
          fontSize: '0.85rem', 
          color: 'var(--theme-elevation-500)', 
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          Hệ Thống Quản Trị Website
        </p>
      </div>
    </div>
  )
}
