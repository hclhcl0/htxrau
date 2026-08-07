'use client'

import React from 'react'
import { LogOut } from 'lucide-react'

export const LogoutButton = () => {
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      window.location.replace('/admin/login');
    }
  };

  return (
    <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--theme-elevation-150)' }}>
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--theme-error-500)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 500,
          padding: '0.5rem',
          borderRadius: '4px',
          transition: 'background-color 0.2s',
          width: '100%',
          fontSize: 'inherit',
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-error-100)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <LogOut size={18} />
        <span>Đăng xuất</span>
      </button>
    </div>
  )
}
