'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { PASTE_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    __payloadServerURL?: string
  }
}

/**
 * Plugin tự động upload ảnh khi paste vào Lexical editor.
 * Hỗ trợ:
 *   - Paste ảnh từ clipboard (screenshot, copy file)
 *   - Paste HTML chứa <img src="https://..."> từ trang khác
 */
export default function PasteImagePlugin(): null {
  const [editor] = useLexicalComposerContext()
  const uploadingRef = useRef<Set<string>>(new Set())

  // Detect server URL from meta or window
  const getServerURL = () => {
    if (typeof window !== 'undefined') {
      // Try to detect from current admin URL
      const url = window.location.origin
      return url
    }
    return ''
  }

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const clipboardData = event.clipboardData
        if (!clipboardData) return false

        const serverURL = getServerURL()

        // ── 1. Paste image FILE (screenshot, copied image file) ─────────────
        const imageFiles = Array.from(clipboardData.files).filter(f =>
          f.type.startsWith('image/')
        )

        if (imageFiles.length > 0) {
          event.preventDefault()
          imageFiles.forEach(file => {
            uploadAndInsert(editor, serverURL, file)
          })
          return true
        }

        // ── 2. Paste HTML with <img> from external page ──────────────────────
        const html = clipboardData.getData('text/html')
        if (html) {
          const parser = new DOMParser()
          const doc = parser.parseFromString(html, 'text/html')
          const imgs = Array.from(doc.querySelectorAll('img'))

          imgs.forEach(img => {
            const src = img.getAttribute('src') || ''
            const alt = img.getAttribute('alt') || ''

            // Only handle external images not already hosted here
            if (
              src.startsWith('http') &&
              !src.includes(serverURL) &&
              !src.startsWith('data:') &&
              !uploadingRef.current.has(src)
            ) {
              uploadingRef.current.add(src)
              fetchAndUploadUrl(editor, serverURL, src, alt).finally(() => {
                uploadingRef.current.delete(src)
              })
            }
          })
        }

        return false // Allow default paste for text content
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])

  return null
}

// ─── Upload a File blob ───────────────────────────────────────────────────────

async function uploadAndInsert(editor: any, serverURL: string, file: File) {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${serverURL}/api/media`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })

    if (!res.ok) {
      const text = await res.text()
      console.warn('[PasteImage] Upload failed:', res.status, text.slice(0, 200))
      return
    }

    const data = await res.json()
    const mediaId = data?.doc?.id
    if (mediaId) {
      insertMediaNode(editor, mediaId)
    }
  } catch (err) {
    console.error('[PasteImage] uploadAndInsert error:', err)
  }
}

// ─── Fetch an external URL and upload to media ────────────────────────────────

async function fetchAndUploadUrl(editor: any, serverURL: string, imageUrl: string, alt: string) {
  try {
    // Use our proxy to avoid CORS issues
    const proxyUrl = `${serverURL}/api/fetch-image?url=${encodeURIComponent(imageUrl)}`
    const imgRes = await fetch(proxyUrl)

    if (!imgRes.ok) {
      console.warn('[PasteImage] Proxy fetch failed for:', imageUrl)
      return
    }

    const blob = await imgRes.blob()
    if (!blob.type.startsWith('image/')) return

    const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
    const filename = `paste-${Date.now()}.${ext}`
    const file = new File([blob], filename, { type: blob.type })

    const formData = new FormData()
    formData.append('file', file)
    if (alt) formData.append('alt', alt)

    const res = await fetch(`${serverURL}/api/media`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })

    if (!res.ok) return

    const data = await res.json()
    const mediaId = data?.doc?.id
    if (mediaId) {
      insertMediaNode(editor, mediaId)
      // Show success notification
      if (typeof window !== 'undefined') {
        const msg = document.createElement('div')
        msg.style.cssText = `
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          background: #10b981; color: #fff; padding: 12px 20px;
          border-radius: 8px; font-size: 14px; font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          animation: slideIn 0.3s ease;
        `
        msg.textContent = `✅ Đã upload ảnh lên media (ID: ${mediaId})`
        document.body.appendChild(msg)
        setTimeout(() => msg.remove(), 4000)
      }
    }
  } catch (err) {
    console.error('[PasteImage] fetchAndUploadUrl error:', err)
  }
}

// ─── Insert a Payload Upload node into the editor ─────────────────────────────

function insertMediaNode(editor: any, mediaId: number | string) {
  editor.update(() => {
    try {
      // Dynamically try to create a Payload upload node
      // This works with @payloadcms/richtext-lexical UploadFeature
      const selection = editor.getEditorState()._selection
      if (!selection) return

      // Create a paragraph with link to media as fallback
      const { $getSelection, $isRangeSelection, $createParagraphNode, $createTextNode } =
        require('lexical')
      
      const sel = $getSelection()
      if (!sel) return

      // Try to insert as richtext upload node
      try {
        const { $createServerEditableUploadNode } = require('@payloadcms/richtext-lexical')
        if ($createServerEditableUploadNode) {
          const uploadNode = $createServerEditableUploadNode({
            relationTo: 'media',
            value: mediaId,
          })
          sel.insertNodes([uploadNode])
          return
        }
      } catch (_) {}

      // Try alt approach
      try {
        const lexicalPayload = require('@payloadcms/richtext-lexical')
        const createFn =
          lexicalPayload.$createUploadNode ||
          lexicalPayload.createUploadNode

        if (createFn) {
          const uploadNode = createFn({ relationTo: 'media', value: mediaId })
          sel.insertNodes([uploadNode])
          return
        }
      } catch (_) {}

      console.log('[PasteImage] Media uploaded with ID:', mediaId, '- please insert manually from Media library')
    } catch (err) {
      console.error('[PasteImage] insertMediaNode error:', err)
    }
  })
}
