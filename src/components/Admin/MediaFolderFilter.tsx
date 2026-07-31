'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from '@payloadcms/ui';

interface Folder {
  id: number;
  name: string;
  parent?: { id: number; name: string } | null;
}

export function MediaFolderFilter() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Đọc folder đang lọc từ URL
  const currentFolderRaw = searchParams.get('where[folder][equals]') ?? searchParams.get('where[folder][in][0]');
  const currentFolder = currentFolderRaw ? parseInt(currentFolderRaw, 10) : null;

  useEffect(() => {
    fetch('/api/media-folders?limit=200&depth=1')
      .then((r) => r.json())
      .then((data) => setFolders(data.docs || []))
      .catch(() => {});
  }, []);

  const goToFolder = (folderId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());

    // Xoá toàn bộ filter folder cũ
    [...params.keys()].forEach((k) => {
      if (k.startsWith('where[folder]')) params.delete(k);
    });

    if (folderId !== null) {
      params.set('where[folder][equals]', String(folderId));
    }

    // Reset về trang đầu khi đổi thư mục
    params.set('page', '1');

    router.push(`?${params.toString()}`);
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
