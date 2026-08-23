'use client'

import React, { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '@payloadcms/ui'

export const GlobalLogoutButton = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    // Direct server-side redirect that clears cookies via Set-Cookie headers
    window.location.href = '/api/admin-logout'
  }

  return (
    <>
      {children}
      {user && (
        <button
          onClick={handleLogout}
          disabled={loading}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: loading ? '#9ca3af' : '#ef4444',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            padding: '12px 20px',
            borderRadius: '50px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            zIndex: 9999,
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s ease-in-out',
            opacity: loading ? 0.75 : 1,
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#dc2626'
              e.currentTarget.style.transform = 'scale(1.05)'
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#ef4444'
              e.currentTarget.style.transform = 'scale(1)'
            }
          }}
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut size={20} />
          <span>{loading ? 'Đang xuất...' : 'ĐĂNG XUẤT'}</span>
        </button>
      )}
    </>
  )
}
