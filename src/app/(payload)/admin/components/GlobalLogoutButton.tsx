'use client'

import React, { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '@payloadcms/ui'

export const GlobalLogoutButton = ({ children }: { children: React.ReactNode }) => {
  const { logOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (typeof logOut === 'function') {
        await logOut()
      } else {
        await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
      }
    } catch {
      // fallback
    } finally {
      window.location.href = '/admin'
    }
  }

  return (
    <>
      {children}
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
    </>
  )
}
