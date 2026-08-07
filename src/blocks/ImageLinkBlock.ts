import type { Block } from 'payload';

export const ImageLinkBlock: Block = {
  slug: 'imageLinkBlock',
  labels: {
    singular: 'Ảnh kèm Link (Banner/Poster)',
    plural: 'Ảnh kèm Link (Banner/Poster)',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Hình ảnh',
      required: true,
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Đường dẫn liên kết (URL)',
      required: true,
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      label: 'Mở đường dẫn ở Tab mới',
      defaultValue: true,
    }
  ],
};
