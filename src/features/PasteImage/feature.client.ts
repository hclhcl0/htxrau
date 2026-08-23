'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { PasteImagePlugin } from './PasteImagePlugin'

/**
 * PasteImageFeatureClient - Client-side feature.
 * Đăng ký plugin Lexical để bắt sự kiện paste ảnh và upload lên media.
 */
export const PasteImageFeatureClient = createClientFeature({
  plugins: [
    {
      Component: PasteImagePlugin,
      position: 'normal',
    },
  ],
})
