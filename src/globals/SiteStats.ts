import type { GlobalConfig } from 'payload';

export const SiteStats: GlobalConfig = {
  slug: 'site-stats',
  label: 'Thống kê Truy cập',
  admin: {
    group: 'Cấu hình',
    description: 'Số liệu thống kê lượt truy cập website. Tự động cập nhật, không cần chỉnh sửa thủ công.',
  },
  access: {
    read: () => true,
    update: () => true, // API tự update qua overrideAccess
  },
  fields: [
    {
      name: 'totalVisits',
      type: 'number',
      label: 'Tổng lượt truy cập',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Tổng số lượt truy cập kể từ khi bật tính năng này.',
      },
    },
    {
      name: 'todayVisits',
      type: 'number',
      label: 'Lượt truy cập hôm nay',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'monthVisits',
      type: 'number',
      label: 'Lượt truy cập tháng hiện tại',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'lastVisitDate',
      type: 'text',
      label: 'Ngày cập nhật gần nhất (YYYY-MM-DD)',
      defaultValue: '',
      admin: { readOnly: true },
    },
    {
      name: 'lastVisitMonth',
      type: 'text',
      label: 'Tháng cập nhật gần nhất (YYYY-MM)',
      defaultValue: '',
      admin: { readOnly: true },
    },
  ],
};
