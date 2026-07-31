'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function BulkUploadView() {
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'uploading' | 'success' | 'error'>>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Fetch available folders
    fetch('/api/media-folders?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data && data.docs) {
          setFolders(data.docs);
        }
      })
      .catch(err => console.error('Failed to fetch folders:', err));
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    const initialStatus: any = {};
    const initialProgress: any = {};
    acceptedFiles.forEach(f => {
      initialStatus[f.name] = 'pending';
      initialProgress[f.name] = 0;
    });
    setUploadStatus(prev => ({ ...prev, ...initialStatus }));
    setUploadProgress(prev => ({ ...prev, ...initialProgress }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
    setUploadStatus(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const uploadFiles = async () => {
    setIsUploading(true);
    for (const file of files) {
      if (uploadStatus[file.name] === 'success') continue;
      
      setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }));
      setUploadProgress(prev => ({ ...prev, [file.name]: 20 }));

      const formData = new FormData();
      formData.append('file', file);
      if (selectedFolder) {
        formData.append('_payload', JSON.stringify({ folder: parseInt(selectedFolder, 10) }));
      }

      try {
        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }));
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } else {
          setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
        }
      } catch (error) {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
      }
    }
    setIsUploading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Tải nhiều ảnh cùng lúc</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Chọn thư mục đích (Tùy chọn):</label>
        <select 
          value={selectedFolder} 
          onChange={(e) => setSelectedFolder(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
        >
          <option value="">-- Thư mục gốc --</option>
          {folders.map(folder => (
            <option key={folder.id} value={folder.id}>{folder.name}</option>
          ))}
        </select>
      </div>

      <div 
        {...getRootProps()} 
        style={{
          border: `2px dashed ${isDragActive ? '#0070f3' : '#ccc'}`,
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: isDragActive ? 'rgba(0,112,243,0.05)' : '#fafafa',
          cursor: 'pointer',
          marginBottom: '30px'
        }}
      >
        <input {...getInputProps()} />
        <p style={{ margin: 0, fontSize: '16px', color: '#666' }}>
          {isDragActive ? 'Thả file vào đây...' : 'Kéo thả nhiều file hoặc click để chọn file'}
        </p>
      </div>

      {files.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px' }}>Danh sách file ({files.length}):</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {files.map(file => (
              <li key={file.name} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '10px', 
                borderBottom: '1px solid #eee',
                backgroundColor: '#fff'
              }}>
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '15px' }}>
                  <span style={{ fontWeight: 500 }}>{file.name}</span>
                  <span style={{ color: '#888', fontSize: '12px', marginLeft: '10px' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                
                <div style={{ width: '150px', marginRight: '15px' }}>
                  {uploadStatus[file.name] === 'uploading' && (
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress[file.name]}%`, height: '100%', backgroundColor: '#0070f3' }} />
                    </div>
                  )}
                  {uploadStatus[file.name] === 'success' && <span style={{ color: 'green', fontSize: '14px' }}>✓ Thành công</span>}
                  {uploadStatus[file.name] === 'error' && <span style={{ color: 'red', fontSize: '14px' }}>✗ Lỗi</span>}
                  {uploadStatus[file.name] === 'pending' && <span style={{ color: '#888', fontSize: '14px' }}>Chờ tải...</span>}
                </div>

                <button 
                  onClick={() => removeFile(file.name)}
                  disabled={isUploading}
                  style={{
                    background: 'none', border: 'none', color: 'red', cursor: isUploading ? 'not-allowed' : 'pointer', fontSize: '18px'
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <button 
          onClick={uploadFiles}
          disabled={isUploading}
          style={{
            backgroundColor: isUploading ? '#ccc' : '#000',
            color: '#fff',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {isUploading ? 'Đang tải lên...' : 'Tải lên tất cả'}
        </button>
      )}
    </div>
  );
}
