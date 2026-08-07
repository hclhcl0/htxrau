'use client';

import React, { useEffect, useState } from 'react';
import { useListQuery } from '@payloadcms/ui';

interface Folder {
  id: number;
  name: string;
  parent?: { id: number; name: string } | null;
}

export function MediaFolderFilter() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const { query, handleWhereChange, handlePageChange } = useListQuery();

  // Đọc folder đang lọc từ query của Payload
  let currentFolderRaw: any = null;
  if (query?.where?.folder?.equals) {
    currentFolderRaw = query.where.folder.equals;
  } else if (query?.where?.folder?.in?.[0]) {
    currentFolderRaw = query.where.folder.in[0];
  }
  const currentFolder = currentFolderRaw ? parseInt(String(currentFolderRaw), 10) : null;

  useEffect(() => {
    fetch('/api/media-folders?limit=200&depth=1')
      .then((r) => r.json())
      .then((data) => setFolders(data.docs || []))
      .catch(() => {});
  }, []);

  const goToFolder = (folderId: number | null) => {
    const newWhere = { ...(query?.where || {}) };
    
    // Xoá filter folder cũ
    delete newWhere.folder;

    if (folderId !== null) {
      newWhere.folder = { equals: folderId };
    }

    if (handleWhereChange) {
      handleWhereChange(newWhere);
    }
    
    // Reset về trang đầu
    if (handlePageChange) {
      handlePageChange(1);
    }
  };

  // Nhóm thư mục gốc và thư mục con
  const roots = folders.filter((f) => !f.parent);
  const childrenOf = (id: number) => folders.filter((f) => f.parent && f.parent.id === id);

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 0 14px',
      borderBottom: '1px solid var(--theme-elevation-100)',
      marginBottom: '12px',
    }}>
      <style>{`
        /* Phóng to ảnh thumbnail và cả khung chứa ảnh trong danh sách Media của Payload */
        table.payload-table td .thumbnail,
        table.payload-table td [class*="thumbnail"],
        table.payload-table td .file-thumbnail {
          width: 120px !important;
          height: 120px !important;
          max-width: 120px !important;
          max-height: 120px !important;
          flex-shrink: 0 !important;
          border-radius: 8px !important;
        }
        table.payload-table td .thumbnail img,
        table.payload-table td [class*="thumbnail"] img,
        table.payload-table td img {
          width: 120px !important;
          height: 120px !important;
          max-width: 120px !important;
          max-height: 120px !important;
          object-fit: cover !important;
          border-radius: 8px !important;
        }
        /* Đảm bảo dòng chữ (Tên file) không bị chèn ép quá mức */
        table.payload-table td.cell-filename > div,
        table.payload-table td > div {
          display: flex !important;
          align-items: center !important;
          gap: 16px !important;
        }
      `}</style>
      <span style={{ fontSize: '12px', color: 'var(--theme-elevation-500)', marginRight: '4px', whiteSpace: 'nowrap' }}>
        📁 Thư mục:
      </span>

      {/* Nút "Tất cả" */}
      <button
        onClick={() => goToFolder(null)}
        style={{
          padding: '4px 12px',
          borderRadius: '20px',
          border: '1px solid',
          borderColor: currentFolder === null ? 'var(--theme-success-500)' : 'var(--theme-elevation-200)',
          backgroundColor: currentFolder === null ? 'var(--theme-success-100)' : 'transparent',
          color: currentFolder === null ? 'var(--theme-success-700)' : 'var(--theme-elevation-800)',
          fontSize: '13px',
          cursor: 'pointer',
          fontWeight: currentFolder === null ? 600 : 400,
          whiteSpace: 'nowrap',
        }}
      >
        Tất cả
      </button>

      {/* Nút từng thư mục gốc */}
      {roots.map((folder) => {
        const isActive = currentFolder === folder.id;
        const children = childrenOf(folder.id);
        return (
          <React.Fragment key={folder.id}>
            <button
              onClick={() => goToFolder(folder.id)}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: isActive ? 'var(--theme-success-500)' : 'var(--theme-elevation-200)',
                backgroundColor: isActive ? 'var(--theme-success-100)' : 'transparent',
                color: isActive ? 'var(--theme-success-700)' : 'var(--theme-elevation-800)',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              📁 {folder.name}
            </button>
            {/* Thư mục con (hiển thị thụt vào) */}
            {children.map((child) => {
              const isChildActive = currentFolder === child.id;
              return (
                <button
                  key={child.id}
                  onClick={() => goToFolder(child.id)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: isChildActive ? 'var(--theme-success-500)' : 'var(--theme-elevation-150)',
                    backgroundColor: isChildActive ? 'var(--theme-success-100)' : 'var(--theme-elevation-50)',
                    color: isChildActive ? 'var(--theme-success-700)' : 'var(--theme-elevation-700)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: isChildActive ? 600 : 400,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  ↳ {child.name}
                </button>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}
