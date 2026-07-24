import type { Block } from 'payload';

export const PDFBlock: Block = {
  slug: 'pdfBlock',
  labels: {
    singular: 'Tệp PDF / Google Drive',
    plural: 'Tệp PDF / Google Drive',
  },
  fields: [
    {
      name: 'source',
      type: 'radio',
      options: [
        { label: 'Tải lên máy chủ', value: 'upload' },
        { label: 'Link Google Drive', value: 'gdrive' },
      ],
      defaultValue: 'upload',
      layout: 'horizontal',
      label: 'Nguồn tài liệu',
    },
    {
      name: 'pdfFile',
      type: 'upload',
      relationTo: 'media',
      label: 'Tải lên hoặc chọn tệp PDF',
      filterOptions: {
        mimeType: { contains: 'pdf' },
      },
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'upload',
      },
    },
    {
      name: 'gdriveUrl',
      type: 'text',
      label: 'Đường dẫn Google Drive',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'gdrive',
        description: 'Dán link chia sẻ hoặc mã nhúng iframe của tài liệu Google Drive',
      },
    },
    {
      name: 'displayMode',
      type: 'select',
      defaultValue: 'inline',
      options: [
        { label: 'Hiển thị trực tiếp (Iframe viewer)', value: 'inline' },
        { label: 'Nút tải xuống (Download Button)', value: 'download' },
      ],
      label: 'Chế độ hiển thị',
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Chú thích / Tên tệp hiển thị (không bắt buộc)',
    },
    {
      name: 'orientation',
      type: 'radio',
      options: [
        { label: 'Dọc (Khổ A4)', value: 'vertical' },
        { label: 'Ngang (Slide 16:9)', value: 'horizontal' },
      ],
      defaultValue: 'vertical',
      layout: 'horizontal',
      label: 'Tỷ lệ khung hình (Chỉ áp dụng khi Hiển thị trực tiếp)',
      admin: {
        condition: (_, siblingData) => siblingData?.displayMode !== 'download',
      },
    }
  ],
};
