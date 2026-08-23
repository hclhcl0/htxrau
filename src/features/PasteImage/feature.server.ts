import { createServerFeature } from '@payloadcms/richtext-lexical'

/**
 * PasteImageFeature - Server-side entry point.
 * Đăng ký client plugin để tự động upload ảnh khi paste vào editor.
 */
export const PasteImageFeature = createServerFeature({
  feature: {
    ClientFeature: '@/features/PasteImage/feature.client#PasteImageFeatureClient',
  },
  key: 'pasteImage',
})
