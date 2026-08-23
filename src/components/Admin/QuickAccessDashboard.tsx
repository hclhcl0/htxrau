'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'

export const QuickAccessDashboard: React.FC = () => {
  const { user } = useAuth()
  const [currentDateStr, setCurrentDateStr] = useState('')

  useEffect(() => {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    setCurrentDateStr(now.toLocaleDateString('vi-VN', options))
  }, [])

  if (!user) return null

  const userRole = Array.isArray(user.role) ? user.role[0] : user.role || 'author'

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Quản trị viên (Admin)', bg: 'rgba(16, 185, 129, 0.15)', color: '#059669', border: 'rgba(16, 185, 129, 0.3)' }
      case 'editor':
        return { label: 'Biên tập viên (Editor)', bg: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', border: 'rgba(59, 130, 246, 0.3)' }
      case 'moderator':
        return { label: 'Kiểm duyệt viên (Moderator)', bg: 'rgba(245, 158, 11, 0.15)', color: '#d97706', border: 'rgba(245, 158, 11, 0.3)' }
      case 'author':
        return { label: 'Tác giả / Xã viên (Author)', bg: 'rgba(139, 92, 246, 0.15)', color: '#7c3aed', border: 'rgba(139, 92, 246, 0.3)' }
      default:
        return { label: 'Thành viên', bg: 'rgba(107, 114, 128, 0.15)', color: '#4b5563', border: 'rgba(107, 114, 128, 0.3)' }
    }
  }

  const roleInfo = getRoleBadge(userRole)

  return (
    <div style={{
      marginBottom: '2.5rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* ─── HERO HEADER BANNER ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        borderRadius: '16px',
        padding: '1.75rem 2rem',
        color: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.25)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        marginBottom: '1.75rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Pattern */}
        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-30px',
          opacity: 0.08,
          fontSize: '12rem',
          userSelect: 'none',
          pointerEvents: 'none'
        }}>
          🌿
        </div>

        <div style={{ zIndex: 1, maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              🌱 HTX RAU AN TOÀN TÚY LOAN
            </span>
            <span style={{
              background: roleInfo.bg,
              color: '#d1fae5',
              border: `1px solid ${roleInfo.border}`,
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              {roleInfo.label}
            </span>
          </div>

          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            margin: '0.25rem 0 0.5rem 0',
            lineHeight: 1.25,
            letterSpacing: '-0.01em'
          }}>
            Xin chào, {user.name || user.email}! 👋
          </h1>
          <p style={{
            margin: 0,
            fontSize: '0.925rem',
            opacity: 0.9,
            lineHeight: 1.5,
            color: '#a7f3d0'
          }}>
            {currentDateStr ? `${currentDateStr} • ` : ''}Trung tâm điều phối nông sản sạch & quản lý nội dung số HTX Túy Loan.
          </p>
        </div>

        {/* Live Site & Quick Portal */}
        <div style={{ zIndex: 1, display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#065f46',
              padding: '0.7rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.875rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.background = '#ffffff'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)'
            }}
          >
            <span>🌐</span> Xem Website Trực Tiếp ↗
          </a>
          <Link
            href="/admin/huong-dan"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(8px)',
              padding: '0.7rem 1.15rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
            }}
          >
            <span>📖</span> Cẩm nang HDSD
          </Link>
        </div>
      </div>

      {/* ─── QUICK ACTION CARDS (GRID 4 CỘT) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        {/* CARD 1: VIẾT BÀI VIẾT */}
        <div style={{
          background: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '14px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
              }}>
                ✍️
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--theme-text)' }}>
                  Tin Tức & Bài Viết
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--theme-text)', opacity: 0.6 }}>
                  Quản lý nội dung & truyền thông
                </span>
              </div>
            </div>
            <p style={{
              margin: '0 0 1.25rem 0',
              fontSize: '0.875rem',
              color: 'var(--theme-text)',
              opacity: 0.8,
              lineHeight: 1.5
            }}>
              Soạn thảo tin tức mùa vụ, phóng sự VietGAP, quy trình canh tác và kinh nghiệm nông sản sạch.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link
              href="/admin/collections/articles/create"
              style={{
                background: '#059669',
                color: '#ffffff',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
              }}
            >
              <span>➕</span> Viết bài mới ngay
            </Link>
            <Link
              href="/admin/collections/articles"
              style={{
                background: 'var(--theme-elevation-100)',
                color: 'var(--theme-text)',
                border: '1px solid var(--theme-elevation-200)',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '0.825rem',
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              Danh sách 20 bài viết ➔
            </Link>
          </div>
        </div>

        {/* CARD 2: NÔNG SẢN & DANH MỤC */}
        <div style={{
          background: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '14px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.2s ease'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                color: '#ffffff',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
              }}>
                🥬
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--theme-text)' }}>
                  Nông Sản & Rau Củ
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--theme-text)', opacity: 0.6 }}>
                  Sản phẩm OCOP & VietGAP
                </span>
              </div>
            </div>
            <p style={{
              margin: '0 0 1.25rem 0',
              fontSize: '0.875rem',
              color: 'var(--theme-text)',
              opacity: 0.8,
              lineHeight: 1.5
            }}>
              Thêm rau củ mới, điều chỉnh giá bán, chứng nhận OCOP 3 sao/4 sao, tình trạng mùa vụ rau.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link
              href="/admin/collections/products/create"
              style={{
                background: '#10b981',
                color: '#ffffff',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
              }}
            >
              <span>➕</span> Thêm nông sản mới
            </Link>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <Link
                href="/admin/collections/categories/create"
                style={{
                  background: 'var(--theme-elevation-100)',
                  color: 'var(--theme-text)',
                  border: '1px solid var(--theme-elevation-200)',
                  padding: '0.55rem 0.5rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                + Danh mục
              </Link>
              <Link
                href="/admin/collections/products"
                style={{
                  background: 'var(--theme-elevation-100)',
                  color: 'var(--theme-text)',
                  border: '1px solid var(--theme-elevation-200)',
                  padding: '0.55rem 0.5rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                Tất cả rau ➔
              </Link>
            </div>
          </div>
        </div>

        {/* CARD 3: QUẢN LÝ ĐƠN HÀNG */}
        <div style={{
          background: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '14px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.2s ease'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: '#ffffff',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)'
              }}>
                🛒
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--theme-text)' }}>
                  Quản Lý Đơn Hàng
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--theme-text)', opacity: 0.6 }}>
                  Bán lẻ & Hợp đồng sỉ
                </span>
              </div>
            </div>
            <p style={{
              margin: '0 0 1.25rem 0',
              fontSize: '0.875rem',
              color: 'var(--theme-text)',
              opacity: 0.8,
              lineHeight: 1.5
            }}>
              Tiếp nhận đơn đặt hàng trực tuyến, in phiếu giao rau tươi, theo dõi khách hàng và trạng thái đơn.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link
              href="/admin/collections/orders"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
              }}
            >
              <span>📦</span> Xem danh sách đơn hàng
            </Link>
            <a
              href="/dat-hang"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--theme-elevation-100)',
                color: 'var(--theme-text)',
                border: '1px solid var(--theme-elevation-200)',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '0.825rem',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              Trang đặt mua trên web ↗
            </a>
          </div>
        </div>

        {/* CARD 4: CÀI ĐẶT & HỆ THỐNG */}
        <div style={{
          background: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '14px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.2s ease'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                color: '#ffffff',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                boxShadow: '0 4px 10px rgba(217, 119, 6, 0.25)'
              }}>
                ⚙️
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--theme-text)' }}>
                  Cài Đặt & Giao Diện
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--theme-text)', opacity: 0.6 }}>
                  Hotline, Banner & Cloudflare R2
                </span>
              </div>
            </div>
            <p style={{
              margin: '0 0 1.25rem 0',
              fontSize: '0.875rem',
              color: 'var(--theme-text)',
              opacity: 0.8,
              lineHeight: 1.5
            }}>
              Cấu hình Hotline, Zalo, địa chỉ HTX, điều chỉnh banner trang chủ và quản trị ảnh Cloudflare R2.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link
              href="/admin/globals/site-settings"
              style={{
                background: '#d97706',
                color: '#ffffff',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)'
              }}
            >
              <span>⚙️</span> Cấu hình website
            </Link>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <Link
                href="/admin/collections/banners"
                style={{
                  background: 'var(--theme-elevation-100)',
                  color: 'var(--theme-text)',
                  border: '1px solid var(--theme-elevation-200)',
                  padding: '0.55rem 0.5rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                Banner web
              </Link>
              <Link
                href="/admin/collections/media"
                style={{
                  background: 'var(--theme-elevation-100)',
                  color: 'var(--theme-text)',
                  border: '1px solid var(--theme-elevation-200)',
                  padding: '0.55rem 0.5rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                Ảnh R2 ➔
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SHORTCUTS & RESOURCES BAR ─── */}
      <div style={{
        background: 'var(--theme-elevation-100)',
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--theme-text)', opacity: 0.9 }}>
            ⚡ Lối tắt nhanh:
          </span>
          <Link
            href="/admin/collections/pages"
            style={{
              background: 'var(--theme-elevation-50)',
              color: 'var(--theme-text)',
              border: '1px solid var(--theme-elevation-200)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            📄 Trang tĩnh
          </Link>
          <Link
            href="/admin/collections/certificates"
            style={{
              background: 'var(--theme-elevation-50)',
              color: 'var(--theme-text)',
              border: '1px solid var(--theme-elevation-200)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            🏆 Chứng nhận VietGAP
          </Link>
          <Link
            href="/admin/collections/videos"
            style={{
              background: 'var(--theme-elevation-50)',
              color: 'var(--theme-text)',
              border: '1px solid var(--theme-elevation-200)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            🎥 Video HTX
          </Link>
          <Link
            href="/admin/collections/users"
            style={{
              background: 'var(--theme-elevation-50)',
              color: 'var(--theme-text)',
              border: '1px solid var(--theme-elevation-200)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            👥 Tài khoản
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--theme-text)', opacity: 0.75 }}>
          <span>🔒 Dữ liệu đám mây Cloudflare R2 & Supabase</span>
        </div>
      </div>
    </div>
  )
}
