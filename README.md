# ⚡ EE Lab Inventory v2.0
> **Hệ thống Quản lý Linh Kiện Điện Tử, Sơ Đồ Hộp Kệ & Mạch Breadboard Thông Minh**  
> *Smart Electronic Component Inventory, Visual Drawer Box Designer & Real-time Pinout/Shop Engine*

![EE Lab Inventory Banner](https://img.shields.io/badge/EE%20Lab%20Inventory-v2.0-emerald?style=for-the-badge&logo=electron)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-amber?style=for-the-badge&logo=javascript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-sky?style=for-the-badge&logo=tailwindcss)
![Python Server](https://img.shields.io/badge/Python-Flask%20Companion-blue?style=for-the-badge&logo=python)

---

## 🌟 Giới thiệu tổng quan
**EE Lab Inventory v2.0** là giải pháp phần mềm quản lý kho linh kiện cá nhân dành riêng cho kỹ sư điện - điện tử, sinh viên kỹ thuật và maker DIY. 

Dự án giải quyết triệt để vấn đề muôn thuở trong phòng thí nghiệm: **"IC này cất ở ngăn kéo nào?", "Con này còn mấy con trong hộp, có đang cắm trên mạch nào không?", "Sơ đồ chân pinout ra sao?" và "Mua thêm ở shop nào đúng chân cắm DIP và giá rẻ nhất?"**.

Ứng dụng có thể **chạy hoàn toàn độc lập, offline trực tiếp trên trình duyệt** (`index.html`) hoặc kết hợp cùng **Companion Server ngầm nhẹ tênh** (`pinout_server.py`) để cào ảnh và giá thời gian thực.

---

## 🚀 Các Tính Năng Đột Phá

### 1. 🗄️ Trình Thiết Kế Sơ Đồ Hộp & Kệ Trực Quan (Visual Storage Designer)
* Tạo và quản lý không giới hạn số lượng hộp nhựa, khay phân loại, kệ ngăn kéo ngoài đời thực.
* Tự do chỉnh kích thước lưới: **Số hàng ngang × Số cột dọc** (A1, A2... F6).
* **Tính năng chia ngăn con linh hoạt**: Hỗ trợ chia 1 ô thành **2 ngăn nhỏ** (Trước/Sau hoặc Trái/Phải). Chỉ chia ở những ô bạn muốn, không bắt buộc toàn bộ hộp.
* **Ghép / Gộp ô**: Gộp nhiều ô liền kề thành 1 ô lớn cho các linh kiện dài (như board test, module dài, kẹp linh kiện).
* **Lọc nhanh 1 chạm**: Bấm trực tiếp vào bất kỳ ô nào trên sơ đồ để xem ngay các linh kiện đang nằm bên trong.

### 2. ⚡ Tự Nhận Diện IC, Mô Tả & Ảnh Pinout Nét Căng (Auto-Enrich)
* Tích hợp sẵn cơ sở tri thức IC phong phú:
  * **Họ 74xx Logic**: `7400`, `7402`, `7404`, `7408`, `7432`, `7447`, `7474`, `7486`, `74138`, `74161`, `74245`, `74595`...
  * **Họ CD40xx CMOS**: `CD4011`, `CD4017`, `CD4066`...
  * **IC Định thời & Analog/Op-Amp**: `NE555`, `LM358`, `LM324`, `TL072`, `TL084`, `LM393`, `LM386`...
  * **Driver / Mạch đệm**: `ULN2803`, `ULN2003`, `L293D`, `L298N`, `A4988`...
  * **IC Nguồn / Ổn áp**: `LM7805`, `7805`, `7812`, `LM317`, `AMS1117-3.3`...
  * **Cách ly quang & Giao tiếp**: `PC817`, `MAX232`, `MAX485`, `CH340`...
  * **Vi điều khiển**: `ESP32`, `ESP8266`, `STM32F103`, `ATmega328P`...
* Tự động điền **Chức năng ngắn gọn**, **Kiểu chân** (`DIP-14`, `DIP-16`, `TO-220`...) và **Ảnh sơ đồ chân (Pinout)** chuẩn vector SVG/PNG từ Wikimedia Commons ngay khi gõ tên chip.
* Hỗ trợ dán ảnh Pinout trực tiếp từ Clipboard bằng **Ctrl + V**.

### 3. 🛍️ So Sánh Giá & Link Mua 4 Shop Uy Tín (Price Comparison)
* Tự động liên kết và phân tích giá từ 4 shop linh kiện quen thuộc:
  1. **Điện tử Tuyết Nga**: Chuyên IC số logic, linh kiện cắm DIP/SMD Nhật Tảo.
  2. **HShop.vn**: Chuyên vi điều khiển (ESP32, STM32, Arduino), Module cảm biến chính hãng.
  3. **Linh kiện Caka**: IC tương tự, timer, op-amp, phụ kiện thực hành giá tốt.
  4. **Shopee**: Tổng hợp nhiều đại lý, so sánh giá rẻ & mã Freeship.
* **Bảo vệ đúng chuẩn Package (Kiểu chân)**: Tự động lọc và lưu ý đúng kiểu chân (ưu tiên chân cắm `DIP` hay chân dán `SMD/SOP`), cảnh báo nếu shop không có sẵn loại chân bạn cần để tránh mua nhầm.

### 4. 🪄 Auto Quét Kho 1 Chạm (Batch Auto-Enrich)
* Quét tự động toàn bộ kho chỉ bằng 1 nút bấm:
  * Tự bù **Mô tả chức năng**
  * Tự gắn **Ảnh sơ đồ chân Pinout**
  * Tự bổ sung **Kiểu chân (Package)**
  * Tự gán **Link đặt mua & Giá 4 Shop**
* **Cam kết an toàn tuyệt đối**: Hệ thống chỉ điền vào những ô còn trống. Bất kỳ thông tin hoặc link nào bạn **đã tự nhập tay trước đây sẽ được giữ nguyên 100%**.

### 5. 🔌 Quản Lý Cắm Mạch Breadboard & Dự Án
* Theo dõi chính xác linh kiện nào đang được cắm trên mạch nào (ví dụ: *Breadboard máy tính 8-bit*, *Mạch Lorenz*, *Đồng hồ Nixie*...).
* Nút chuyển kho nhanh:
  * `[ → Mạch ]`: Lấy 1 con từ hộp cắm lên mạch test.
  * `[ ← Hộp ]`: Rút 1 con từ mạch cất trả lại đúng ngăn hộp.
* Thanh lọc theo từng Dự án / Mạch đang chạy.

### 6. 🏷️ Tùy Chỉnh Phân Loại & Bộ Lọc Nâng Cao
* Tự do thêm, bớt, đổi tên các Tab phân loại linh kiện theo nhu cầu riêng.
* Bộ lọc đa năng: *Tất cả*, *Đang cắm mạch*, *Sắp hết hàng (Shopping list)*, *Ghim yêu thích (Favorite)*.

### 7. ☁️ Đồng Bộ Cloud & Backup An Toàn
* Tự động lưu tức thì vào `localStorage`.
* Hỗ trợ đồng bộ hóa 2 chiều qua **Cloud JSON URL** (dễ dàng dựng server riêng bằng Raspberry Pi, JSONBin hoặc n8n/Node.js).
* Xuất file backup (`.json`) và khôi phục dữ liệu toàn vẹn 100% chỉ trong 1 giây.

### 8. 🖥️ Companion Server Khay Hệ Thống (Windows System Tray)
* Server Python Flask chạy nền cực nhẹ (< 15MB RAM).
* Hiển thị biểu tượng vi mạch nhỏ xinh tại khay hệ thống (cạnh đồng hồ Windows).
* Tùy chọn 1-click để bật/tắt **Tự khởi động cùng Windows** êm ái mà không bị hiện cửa sổ đen (CMD).

---

## 📂 Cấu Trúc Thư Mục
```text
EE-Lab-Inventory/
├── index.html                     # Giao diện chính (SPA - Đầy đủ tính năng, Tailwind CSS)
├── pinout_server.py               # Companion Server (Flask, cào ảnh Pinout & giá 4 shop)
├── requirements.txt               # Danh sách thư viện Python cần thiết
├── run_server.bat                 # Khởi động nhanh server kèm auto-cài thư viện
├── bat_khoi_dong_cung_windows.bat # Cài đặt server tự chạy ngầm cùng Windows
├── tat_khoi_dong_cung_windows.bat # Gỡ bỏ tự khởi động cùng Windows
├── chay_an_khong_hien_cua_so.vbs  # Script chạy ngầm không hiện cửa sổ console
└── README.md                      # Tài liệu hướng dẫn sử dụng
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Sử Dụng

### Cách 1: Chạy trực tiếp (Không cần cài đặt gì)
1. Tải repository về máy hoặc giải nén.
2. Nhấp đúp vào file **`index.html`** để mở trực tiếp trên Chrome, Edge, Cốc Cốc, Firefox.
3. Toàn bộ tính năng thiết kế hộp, nhận diện IC, ảnh pinout SVG, phân loại, breadboard và so sánh link 4 shop đều hoạt động mượt mà ngay lập tức.

### Cách 2: Kích hoạt thêm Companion Server (Cào ảnh Pinout & Giá thời gian thực)
1. Đảm bảo máy tính đã cài đặt [Python](https://www.python.org/) (nhớ tick chọn *"Add Python to PATH"* khi cài).
2. Nhấp đúp vào file **`run_server.bat`**:
   * Hệ thống sẽ tự động cài các thư viện nhẹ (`flask`, `flask-cors`, `pystray`, `pillow`).
   * Server sẽ khởi chạy tại cổng `http://localhost:5000`.
3. Mở **`index.html`**, vào mục **Cài đặt** (biểu tượng bánh răng ở góc trên bên phải) và kiểm tra kết nối Server: `✓ Kết nối thành công`.

### Cách 3: Bật Server chạy ngầm vĩnh viễn cùng Windows
* Nhấp đúp file **`bat_khoi_dong_cung_windows.bat`**.
* Mỗi khi bật máy tính, server sẽ tự động chạy ngầm, xuất hiện icon chip nhỏ ở góc dưới bên phải màn hình.
* Khi muốn tắt tính năng này, chỉ cần nhấp đúp file **`tat_khoi_dong_cung_windows.bat`**.

---

## 📜 Giấy phép & Đóng góp
Dự án được phát hành dưới giấy phép mã nguồn mở. Mọi đóng góp (Pull Request, Issue báo lỗi, bổ sung thêm mã chip vào từ điển) đều được hoan nghênh nồng nhiệt!

