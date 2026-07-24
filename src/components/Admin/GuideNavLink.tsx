import Link from 'next/link'
import React from 'react'

export default function GuideNavLink() {
  return (
    <div style={{ marginTop: '1rem', padding: '0 1rem' }}>
      <Link 
        href="/admin/huong-dan" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0.5rem 0.75rem', 
          color: 'var(--theme-text)', 
          textDecoration: 'none', 
          fontWeight: 500, 
          backgroundColor: 'var(--theme-elevation-100)', 
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}
      >
        <span style={{ marginRight: '0.5rem' }}>📘</span> Hướng dẫn sử dụng
      </Link>
    </div>
  )
}
