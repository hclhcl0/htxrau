import type { CollectionConfig, GlobalConfig } from 'payload';

export const withRBAC = (collections: CollectionConfig[]): CollectionConfig[] => {
  return collections.map((col) => {
    return {
      ...col,
      admin: {
        ...(col.admin || {}),
        hidden: ({ user }: any) => {
          return !user; // Chỉ ẩn nếu chưa đăng nhập
        }
      }
    };
  });
};

export const globalsWithRBAC = (globals: GlobalConfig[]): GlobalConfig[] => {
  return globals.map((glb) => {
    return {
      ...glb,
      admin: {
        ...(glb.admin || {}),
        hidden: ({ user }: any) => {
          return !user; // Chỉ ẩn nếu chưa đăng nhập
        }
      }
    };
  });
};
