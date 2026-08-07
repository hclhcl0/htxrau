'use client'

import React from 'react'
import { LogOut } from 'lucide-react'

export const GlobalLogoutButton = ({ children }: { children: React.ReactNode }) => {
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    // Hard navigate đến /admin/logout — Payload xử lý xóa cookie phía server
    window.location.replace('/admin/logout');
  };

  return (
    <>
      {children}
      <button 
        onClick={handleLogout}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
          padding: '12px 20px',
          borderRadius: '50px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
          zIndex: 9999,
          fontFamily: 'Inter, sans-serif',
          transition: 'all 0.2s ease-in-out'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626'
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#ef4444'
          e.currentTarget.style.transform = 'scale(1)'
        }}
        title="Đăng xuất khỏi hệ thống"
      >
        <LogOut size={20} />
        <span>ĐĂNG XUẤT</span>
      </button>
    </>
  )
}
