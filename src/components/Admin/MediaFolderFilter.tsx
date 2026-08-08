'use client';

import React, { useEffect, useState } from 'react';
import { useListQuery } from '@payloadcms/ui';

interface Folder {
  id: number;
  name: string;
  parent?: { id: number; name: string } | null;
}

export default function MediaFolderFilter() {
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
        /* Chuyển đổi bảng danh sách thành dạng Lưới (Grid) */
        .collection-list table.payload-table {
          display: block;
        }
        .collection-list table.payload-table thead {
          display: none; /* Ẩn tiêu đề cột */
        }
        .collection-list table.payload-table tbody {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          padding: 8px 0;
        }
        .collection-list table.payload-table tr {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--theme-elevation-150);
          border-radius: 12px;
          padding: 12px;
          position: relative;
          background: var(--theme-elevation-50);
          transition: all 0.2s;
        }
        .collection-list table.payload-table tr:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: var(--theme-elevation-200);
        }
        .collection-list table.payload-table td {
          display: block;
          border: none !important;
          padding: 4px 0 !important;
        }
        
        /* Checkbox ở góc trên trái */
        .collection-list table.payload-table td.cell-_select {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          background: rgba(255,255,255,0.8);
          border-radius: 4px;
        }

        /* Hình ảnh và tên file (cột filename) */
        .collection-list table.payload-table td.cell-filename {
          width: 100% !important;
        }
        .collection-list table.payload-table td.cell-filename > div {
          display: flex !important;
          flex-direction: column;
          align-items: stretch !important;
          gap: 8px !important;
        }
        
        /* Ảnh vuông */
        .collection-list table.payload-table td .thumbnail,
        .collection-list table.payload-table td [class*="thumbnail"],
        .collection-list table.payload-table td .file-thumbnail {
          width: 100% !important;
          height: 160px !important;
          max-width: none !important;
          max-height: none !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .collection-list table.payload-table td .thumbnail img,
        .collection-list table.payload-table td [class*="thumbnail"] img,
        .collection-list table.payload-table td img {
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
          max-height: none !important;
          object-fit: cover !important;
        }

        /* Ẩn các cột phụ để lưới nhìn gọn gàng */
        .collection-list table.payload-table td:not(.cell-_select):not(.cell-filename) {
          display: none !important;
        }
        
        /* Căn giữa tên file */
        .collection-list table.payload-table td.cell-filename a {
          text-align: center;
          font-weight: 500;
          word-break: break-word;
          font-size: 13px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
