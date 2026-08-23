'use client'

import React, { useState } from 'react'

export const LogoutButtonCustom: React.FC = () => {
  const [loading, setLoading] = useState(false)

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    window.location.href = '/api/admin-logout'
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      id="custom-logout-btn"
      aria-label="Đăng xuất"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'none',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        color: 'var(--theme-error-500, #ef4444)',
        padding: '6px 8px',
        borderRadius: '4px',
        fontSize: 'inherit',
        fontWeight: 500,
        width: '100%',
        opacity: loading ? 0.6 : 1,
        transition: 'background-color 0.15s ease',
      }}
      onMouseOver={(e) => {
        if (!loading) e.currentTarget.style.backgroundColor = 'var(--theme-error-100, rgba(239,68,68,0.1))'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span>{loading ? 'Đang xuất...' : 'Đăng xuất'}</span>
    </button>
  )
}
