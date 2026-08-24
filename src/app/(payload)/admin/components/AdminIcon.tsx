'use client'

import React from 'react'

export const AdminIcon = () => {
  return (
    <img 
      src="/logo.png" 
      alt="Logo HTX Rau An Toàn Túy Loan" 
      style={{ width: '32px', height: '32px', objectFit: 'contain' }}
      onError={(e) => {
        // Fallback text if image 404s
        e.currentTarget.style.display = 'none';
      }}
    />
  )
}
