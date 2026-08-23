'use client'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { PASTE_COMMAND, COMMAND_PRIORITY_LOW } from '@payloadcms/richtext-lexical/lexical'
import { useEffect, useRef } from 'react'

/**
 * PasteImagePlugin - Lexical plugin xử lý paste ảnh:
 * 1. Paste file ảnh từ clipboard (screenshot, Ctrl+C trên file)
 * 2. Paste HTML từ trang khác có chứa <img src="https://...">
 *    → Fetch qua proxy /api/fetch-image rồi upload lên /api/media
 */
export function PasteImagePlugin(): null {
  const [editor] = useLexicalComposerContext()
  const uploadingRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const clipboardData = event.clipboardData
        if (!clipboardData) return false

        const serverURL = window.location.origin

        // ── 1. Paste file ảnh trực tiếp (screenshot, copy file ảnh) ───────────
        const imageFiles = Array.from(clipboardData.files).filter(f =>
          f.type.startsWith('image/')
        )

        if (imageFiles.length > 0) {
          event.preventDefault()
          imageFiles.forEach(file => {
            uploadFile(serverURL, file).then(mediaId => {
              if (mediaId) showToast(`✅ Đã upload ảnh vào Media (ID: ${mediaId})`)
            })
          })
          return true
        }

        // ── 2. Paste HTML có <img> từ trang ngoài ─────────────────────────────
        const html = clipboardData.getData('text/html')
        if (html) {
          const parser = new DOMParser()
          const doc = parser.parseFromString(html, 'text/html')
          const imgs = Array.from(doc.querySelectorAll('img'))

          imgs.forEach(img => {
            const src = img.getAttribute('src') || ''
            const alt = img.getAttribute('alt') || ''

            if (
              src.startsWith('http') &&
              !src.includes(serverURL) &&
              !src.startsWith('data:') &&
              !uploadingRef.current.has(src)
            ) {
              uploadingRef.current.add(src)
              fetchAndUpload(serverURL, src, alt)
                .then(mediaId => {
                  if (mediaId) {
                    showToast(`✅ Đã upload ảnh từ link ngoài (ID: ${mediaId})\nVào Media Library để chèn ảnh vào bài.`)
                  }
                })
                .finally(() => {
                  uploadingRef.current.delete(src)
                })
            }
          })
        }

        return false // Để Lexical xử lý text bình thường
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])

  return null
}

// ─── Upload file trực tiếp lên /api/media ─────────────────────────────────────

async function uploadFile(serverURL: string, file: File): Promise<number | null> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${serverURL}/api/media`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })

    if (!res.ok) {
      console.warn('[PasteImage] Upload failed:', res.status, await res.text().catch(() => ''))
      return null
    }

    const data = await res.json()
    return data?.doc?.id ?? null
  } catch (err) {
    console.error('[PasteImage] uploadFile error:', err)
    return null
  }
}

// ─── Fetch ảnh từ URL ngoài qua proxy rồi upload ─────────────────────────────

async function fetchAndUpload(serverURL: string, imageUrl: string, alt: string): Promise<number | null> {
  try {
    showToast(`⏳ Đang tải ảnh từ link ngoài...`, 2000)
    
    const proxyUrl = `${serverURL}/api/fetch-image?url=${encodeURIComponent(imageUrl)}`
    const imgRes = await fetch(proxyUrl)

    if (!imgRes.ok) {
      console.warn('[PasteImage] Proxy fetch failed for:', imageUrl, imgRes.status)
      return null
    }

    const blob = await imgRes.blob()
    if (!blob.type.startsWith('image/')) return null

    const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
    const filename = `paste-${Date.now()}.${ext}`
    const file = new File([blob], filename, { type: blob.type })

    return await uploadFile(serverURL, file)
  } catch (err) {
    console.error('[PasteImage] fetchAndUpload error:', err)
    return null
  }
}

// ─── Hiện thông báo toast ─────────────────────────────────────────────────────

function showToast(message: string, duration = 5000) {
  if (typeof window === 'undefined') return

  const existing = document.getElementById('paste-image-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.id = 'paste-image-toast'
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 99999;
    background: #1a1a2e;
    color: #fff;
    padding: 14px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    box-shadow: 0 8px 24px rgba(0,0,0,0.35);
    border-left: 4px solid #10b981;
    max-width: 340px;
    white-space: pre-line;
    animation: slideInRight 0.3s ease;
  `
  
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `
  document.head.appendChild(style)
  
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), duration)
}
