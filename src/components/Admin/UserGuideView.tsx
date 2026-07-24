import React from 'react'

export default function UserGuideView() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-body, system-ui, sans-serif)' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--theme-elevation-100)', paddingBottom: '1rem' }}>
        Hướng dẫn sử dụng hệ thống Quản trị (Admin)
      </h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--theme-elevation-800)' }}>1. Giới thiệu chung</h2>
        <p style={{ lineHeight: 1.6, color: 'var(--theme-elevation-600)' }}>
          Chào mừng bạn đến với hệ thống quản trị nội dung (CMS). Tại đây bạn có thể quản lý bài viết, văn bản, thông báo, các khối giao diện (widgets), và nhiều nội dung khác trên trang web chính.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--theme-elevation-800)' }}>2. Quản lý Bài viết (Tin tức)</h2>
        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '1rem', borderRadius: '8px' }}>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', lineHeight: 1.6, margin: 0, color: 'var(--theme-elevation-600)' }}>
            <li style={{ marginBottom: '0.5rem' }}>Truy cập mục <strong>Articles</strong> (Bài viết) ở thanh menu bên trái.</li>
            <li style={{ marginBottom: '0.5rem' }}>Bấm nút <strong>Create New</strong> (Tạo mới) ở góc trên bên phải để thêm một bài viết mới.</li>
            <li style={{ marginBottom: '0.5rem' }}>Bạn cần điền đủ <strong>Tiêu đề</strong>, tải lên <strong>Ảnh đại diện</strong>, chọn <strong>Chuyên mục</strong> (Categories), và soạn thảo nội dung.</li>
            <li><strong>Lưu ý:</strong> Vui lòng tối ưu ảnh (kích thước dung lượng nhỏ hơn 500KB) trước khi tải lên để đảm bảo tốc độ tải trang nhanh nhất cho người dùng.</li>
          </ul>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--theme-elevation-800)' }}>3. Quản lý Văn bản điều hành</h2>
        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '1rem', borderRadius: '8px' }}>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', lineHeight: 1.6, margin: 0, color: 'var(--theme-elevation-600)' }}>
            <li style={{ marginBottom: '0.5rem' }}>Truy cập mục <strong>Documents</strong> (Văn bản).</li>
            <li style={{ marginBottom: '0.5rem' }}>Bấm tạo mới và điền đầy đủ các trường thông tin: <strong>Số hiệu</strong>, <strong>Ký hiệu</strong>, <strong>Ngày ban hành</strong>, <strong>Cơ quan ban hành</strong>...</li>
            <li style={{ marginBottom: '0.5rem' }}>Tải file PDF gốc lên mục <strong>File đính kèm</strong> để người dân và cán bộ có thể xem hoặc tải về máy.</li>
            <li>Sau khi xuất bản, văn bản sẽ hiển thị ở chuyên trang tra cứu văn bản của Trung tâm.</li>
          </ul>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--theme-elevation-800)' }}>4. Cài đặt Giao diện trang chủ (Settings)</h2>
        <p style={{ lineHeight: 1.6, color: 'var(--theme-elevation-600)', marginBottom: '1rem' }}>
          Để thay đổi cấu trúc trang chủ, cập nhật Banner, cập nhật liên kết Footer hoặc điều chỉnh các chuyên mục tin tức hiển thị:
        </p>
        <div style={{ backgroundColor: 'var(--theme-elevation-50)', padding: '1rem', borderRadius: '8px' }}>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', lineHeight: 1.6, margin: 0, color: 'var(--theme-elevation-600)' }}>
            <li style={{ marginBottom: '0.5rem' }}>Truy cập phần <strong>Globals</strong> &gt; <strong>Site Settings</strong> ở thanh menu bên trái.</li>
            <li style={{ marginBottom: '0.5rem' }}>Mở tab tương ứng (General, Home Page Blocks, Header, Footer) để tiến hành chỉnh sửa.</li>
            <li>Sau khi thay đổi nội dung, bấm <strong>Save</strong>. Các thay đổi sẽ xuất hiện ngay lập tức trên giao diện trang chủ website.</li>
          </ul>
        </div>
      </section>
      
      <p style={{ 
        marginTop: '3rem', 
        fontSize: '0.9rem', 
        color: 'var(--theme-elevation-400)', 
        borderTop: '1px solid var(--theme-elevation-100)', 
        paddingTop: '1.5rem',
        textAlign: 'center' 
      }}>
        <em>Tài liệu hướng dẫn này có thể được tùy chỉnh và cập nhật thêm nội dung bởi đội ngũ quản trị. Nếu bạn cần bổ sung hướng dẫn cho các tính năng mới, vui lòng cập nhật trực tiếp trong mã nguồn hệ thống.</em>
      </p>
    </div>
  )
}
