# Hướng Dẫn Sử Dụng Hệ Thống Quản Trị Nội Dung (CMS) — HTX Rau Túy Loan

Tài liệu này giới thiệu tổng quan và hướng dẫn chi tiết cách sử dụng các chức năng trong hệ thống quản trị nội dung của website **HTX Rau An Toàn Túy Loan**. Hệ thống được xây dựng trên nền tảng Payload CMS v3, giúp quản lý toàn bộ nội dung, danh mục nông sản VietGAP, đơn đặt hàng trực tuyến, chứng nhận và giao diện một cách linh hoạt.

---

## Mục Lục
1. [Đăng nhập & Bảng điều khiển (Dashboard)](#1-đăng-nhập--bảng-điều-khiển)
2. [Quản lý Bài viết & Tin tức (Articles)](#2-quản-lý-bài-viết--tin-tức)
3. [Quản lý Trang & Page Builder (Pages)](#3-quản-lý-trang--page-builder)
4. [Quản lý Nông Sản & Rau An Toàn (Products)](#4-quản-lý-nông-sản--rau-an-toàn)
5. [Quản lý Đơn Hàng & Xuất Phiếu (Orders)](#5-quản-lý-đơn-hàng--xuất-phiếu)
6. [Quản lý Chứng Nhận & Kiểm Định (Certificates)](#6-quản-lý-chứng-nhận--kiểm-định)
7. [Cấu hình Giao diện & Cài đặt chung (Settings)](#7-cấu-hình-giao-diện--cài-đặt-chung)
8. [Quản lý Media (Hình ảnh, Video, File)](#8-quản-lý-media)
9. [Các Block trong Bài viết & Trang](#9-các-block-thành-phần-trong-bài-viết--trang)
10. [Phân quyền & Vai trò Người dùng](#10-phân-quyền--vai-trò-người-dùng)

---

## 1. Đăng nhập & Bảng điều khiển
- **Đăng nhập:** Truy cập vào đường dẫn quản trị `/admin`. Nhập Email và Mật khẩu được cấp.
- **Bảng điều khiển (Dashboard):** Ngay sau khi đăng nhập, hệ thống hiển thị danh sách các mục quản lý ở thanh bên trái (Sidebar). Từ đây bạn có thể điều hướng đến bất kỳ module nào.

---

## 2. Quản lý Bài viết & Tin tức
Module này giúp bạn đăng tải các tin tức, bài viết kỹ thuật nông nghiệp, thông báo, quy trình chăm sóc rau.

### 2.1. Quản lý Chuyên mục (Categories)
- Vào mục **Chuyên mục** (Categories).
- Nhấn **Tạo mới** (Create New).
- Điền Tên chuyên mục và URL (Slug). Bạn có thể cấu hình cấp bậc (chuyên mục cha/con).

### 2.2. Đăng Bài viết mới (Articles)
- Vào mục **Bài viết** (Articles) -> **Tạo mới**.
- **Tiêu đề & URL:** Nhập tiêu đề bài viết. Hệ thống tự động tạo đường dẫn (Slug).
- **Ảnh đại diện:** Tải lên hoặc chọn ảnh bìa từ thư viện.
- **Nội dung (RichText Editor):** Sử dụng trình soạn thảo để nhập nội dung. Bạn có thể chèn các **Block** đặc biệt vào giữa bài viết (xem mục 9).
- **Cấu hình SEO:** Kéo xuống dưới cùng để điền Meta Title, Meta Description phục vụ tối ưu hóa công cụ tìm kiếm.
- Nhấn **Save / Publish** để lưu hoặc xuất bản bài viết.

---

## 3. Quản lý Trang & Page Builder
Tính năng mạnh mẽ giúp bạn tạo ra các trang giới thiệu, chính sách hoặc trang chủ bằng cách ghép các khối (Blocks) lại với nhau:
- Banner, Rich Text, Card Grid, Slider / Gallery...
- Sắp xếp thứ tự bằng cách kéo thả block.

---

## 4. Quản lý Nông Sản & Rau An Toàn
Dành riêng cho việc quản lý danh mục rau củ quả an toàn hiển thị tại `/san-pham`.
- **Thông tin sản phẩm:** Tên rau củ, tiêu chuẩn (VietGAP, Hữu cơ, OCOP), đơn vị tính (Kg, Bó, Túi...), giá bán, giá gốc (khuyến mãi).
- **Trạng thái:** Có sẵn (thu hoạch trong ngày), Đặt trước, Tạm hết hàng.
- **Hình ảnh & Mô tả:** Tải lên nhiều ảnh minh họa và bài viết giới thiệu nguồn gốc rau.

---

## 5. Quản lý Đơn Hàng & Xuất Phiếu
Quản lý các đơn đặt hàng từ website `/dat-hang`, điện thoại, Zalo:
- **Theo dõi trạng thái:** Mới -> Đã xác nhận -> Đang chuẩn bị -> Đang giao hàng -> Hoàn thành -> Đã hủy.
- **Xuất báo cáo Excel:** Xuất danh sách đơn hàng ra file Excel đầy đủ chi tiết.
- **In phiếu giao hàng:** In phiếu đóng gói và giao hàng nhanh chóng cho bộ phận shipper.
- **Thông báo tự động:** Tích hợp gửi thông báo đơn hàng trực tiếp qua Telegram Bot và Email quản trị.

---

## 6. Quản lý Chứng Nhận & Kiểm Định
- Lưu trữ chứng nhận VietGAP, OCOP, kết quả xét nghiệm mẫu đất, mẫu nước, dư lượng thuốc BVTV hiển thị tại `/chung-nhan`.
- Tải lên ảnh giấy chứng nhận hoặc file PDF để khách hàng tra cứu nguồn gốc minh bạch.

---

## 6. Cấu hình Giao diện & Cài đặt chung
Các cấu hình này tác động đến toàn bộ website (Global Settings).

- **Menu Chính (Main Menu):** Quản lý thanh điều hướng ở trên cùng website. Hỗ trợ tạo menu cha, menu con, thả xuống (dropdown).
- **Cài đặt Trang web (Site Settings):** 
  - Cấu hình Logo, Favicon.
  - Thông tin chân trang (Footer), Link Mạng xã hội.
  - Các tiện ích bên lề (Sidebar Widgets), Banner nổi bật.
- **Cài đặt Giao diện (Theme Settings):** Điều chỉnh màu sắc chủ đạo (Primary Color), kiểu chữ (Font Family) để website phù hợp với nhận diện thương hiệu.

---

## 7. Quản lý Media & Quy định kích thước hình ảnh
Nơi tập trung toàn bộ hình ảnh, video, tài liệu đã tải lên hệ thống.

### 7.1. Kích thước cắt ảnh tự động (Tối ưu tự động)
Khi bạn tải một hình ảnh lên, hệ thống sẽ tự động tạo ra các bản sao với kích thước được tối ưu hóa như sau:
- **Thumbnail (Ảnh thu nhỏ):** `400 x 300 px` - Được dùng chủ yếu ở danh sách bài viết, tin tức nổi bật.
- **Card (Ảnh thẻ dọc):** `768 x 1024 px` - Dùng cho giao diện di động hoặc danh sách dạng thẻ đứng.
- **Tablet (Ảnh máy tính bảng):** `1024 px (rộng)` - Tỷ lệ chiều cao tự động để giữ nguyên vóc dáng ảnh.

### 7.2. Quy định Kích thước Banner & Slider
Để website hiển thị đẹp và không bị méo hình, bạn cần chuẩn bị hình ảnh theo các kích thước khuyến nghị sau:

1. **Slider Trang chủ / Banner chính (Hero Slider - Full Width):**
   - **Tỷ lệ chuẩn (Aspect Ratio):** `16:9` (Tỷ lệ màn hình rộng chuẩn) hoặc `21:9` (Tỷ lệ siêu rộng/Cinematic).
   - **Kích thước khuyên dùng:** Rộng `1920px`, Cao `1080px` (nếu muốn tràn full màn hình) hoặc `1920px x 600px - 800px` (nếu chỉ muốn tràn chiều ngang).
   - **Nội dung:** Giữ nội dung chính (chữ, logo) ở vùng giữa ảnh (vùng an toàn) để khi xem trên điện thoại hoặc các màn hình có tỷ lệ khác không bị cắt mất chữ.

2. **Banner Cột bên (Sidebar Banner):**
   - **Kích thước khuyên dùng:** `300 x 400px` (Dạng chữ nhật đứng) hoặc `300 x 300px` (Vuông).
   - Dùng để đặt các banner quảng cáo dịch vụ nằm ở góc trái/phải của các trang chuyên mục.

3. **Banner dưới chân trang (Footer):**
   - **Kích thước khuyên dùng:** Rộng `1200px`, Cao `200px - 300px` (Dạng chữ nhật nằm ngang hẹp).

*Lưu ý: Hệ thống cho phép thiết lập "Chiều cao tùy chỉnh (Custom Height)" trong phần Cấu hình chung. Nếu bạn chỉnh chiều cao tùy chỉnh (ví dụ: 500px), mọi banner ở vị trí đó sẽ bị ép về cùng 1 chiều cao.*

---

## 8. Các Block (Thành phần) trong Bài viết & Trang
Khi soạn thảo nội dung (RichText Editor) cho bài viết tin tức, hoặc khi xây dựng cấu trúc Trang (Page Builder), bạn có thể chèn các khối (Block) đặc biệt bằng cách gõ `/` (dấu gạch chéo) hoặc nhấn biểu tượng dấu `+`.

### Các Block phổ biến nhất:
1. **PDF Block (Tài liệu PDF):** Nhúng trực tiếp file PDF để đọc trực tuyến ngay trên web. Có tuỳ chọn hiển thị **Ngang (Trình chiếu/Slide)** hoặc **Dọc (Văn bản/A4)**.
2. **Excel Table Block:** Tải lên file `.xlsx`. Hệ thống tự động đọc và vẽ ra bảng dữ liệu chuẩn, có phân trang, thanh tìm kiếm, và kèm luôn nút "Tải về file XLSX" tiện lợi.
3. **Video / TikTok Block:** Chỉ cần copy paste đường link YouTube, Facebook Video, hoặc TikTok. Hệ thống sẽ tự động nhúng video chuẩn Responsive.
4. **Gallery / Slider Block:** Tạo bộ sưu tập nhiều hình ảnh (Dạng lưới - Gallery) hoặc trượt ảnh (Slider).
5. **Callout Block (Hộp chú thích):** Tạo các hộp văn bản thông báo nổi bật để thu hút chú ý (Ví dụ: thông báo, lưu ý, cảnh báo).
6. **Columns Block (Chia cột):** Dùng để chia nội dung bài viết thành 2 hoặc 3 cột song song.
7. **File Downloads (Tải tài liệu):** Tạo ra một danh sách các tài liệu đính kèm với biểu tượng đẹp mắt để người dùng tải về.
8. **Related Articles (Bài viết liên quan):** Nhúng trực tiếp các bài viết, tin tức nổi bật khác vào giữa nội dung bài viết hiện tại.

---

## 10. Phân quyền & Vai trò Người dùng
Hệ thống được thiết kế với cơ chế phân quyền (Role-based Access Control) chặt chẽ, nhằm đảm bảo an toàn thông tin và quy trình kiểm duyệt bài viết rõ ràng.

### 10.1. Các nhóm quyền (Roles)
Hệ thống hiện tại phân chia người dùng thành các cấp độ sau:

1. **Quản trị viên (Admin):**
   - **Quyền hạn lớn nhất.** Có quyền xem, sửa, xóa mọi tính năng trên hệ thống.
   - Là người duy nhất có quyền quản lý Tài khoản (Users), phân quyền cho người khác, và thay đổi các Cấu hình cốt lõi (Cài đặt Giao diện, Site Settings).

2. **Kiểm duyệt viên (Moderator):**
   - Không được thay đổi cấu hình hệ thống hay quản lý người dùng.
   - Có toàn quyền xem, sửa, duyệt bài, và xóa các nội dung/bài viết/trang/vắc-xin trên toàn bộ hệ thống.
   - Thích hợp cho vị trí **Trưởng phòng truyền thông / Thư ký toà soạn**.

3. **Biên tập viên (Editor):**
   - Tương tự Moderator nhưng quyền hạn thường bị giới hạn theo từng *Chuyên mục (Department/Category)*.
   - Được phép xuất bản (Publish) bài viết ra công chúng.
   - Được phép quản lý tài liệu, tải file Media.

4. **Tác giả / Cộng tác viên (Author):**
   - Chỉ có quyền tạo bài viết mới và chỉnh sửa bài viết **do chính mình tạo ra**.
   - Không được phép sửa bài của người khác.
   - Các bài viết của Author thường chỉ lưu ở dạng `Bản nháp (Draft)` và cần phải chờ Editor/Moderator duyệt mới được hiển thị lên web.

5. **Người dùng bình thường (User):**
   - Chỉ được xem thông tin cá nhân. Không có quyền truy cập vào các chức năng quản trị nội dung.

### 10.2. Phân công theo Chuyên mục (Phòng ban)
Đối với các tài khoản cấp **Editor, Moderator, Author**, Quản trị viên có thể thiết lập giới hạn quyền truy cập theo **Chuyên mục (Departments)**. 
- *Ví dụ:* Một Author được gán vào chuyên mục "Tiêm chủng" sẽ chỉ thấy và viết bài thuộc chuyên mục này, không thể can thiệp vào các bài viết của phòng "Truyền nhiễm". Nếu để trống mục chuyên mục, tài khoản đó sẽ được viết bài ở tất cả chuyên mục.

---
*Tài liệu này được tự động tạo và cập nhật để bám sát với cấu trúc thực tế của hệ thống.*
