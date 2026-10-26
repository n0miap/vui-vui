# ⚡ EE Lab Inventory v2.1
> **Hệ thống Quản lý Linh Kiện Điện Tử, Sơ Đồ Hộp Kệ, Mạch Breadboard & Tra Cứu IC Tương Đương Thông Minh**  
> *Smart Electronic Component Inventory, Visual Drawer Box Designer, Project BoM Kitting & IC Cross-Reference Engine*

![EE Lab Inventory Banner](https://img.shields.io/badge/EE%20Lab%20Inventory-v2.1-emerald?style=for-the-badge&logo=electron)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-amber?style=for-the-badge&logo=javascript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-sky?style=for-the-badge&logo=tailwindcss)
![Python Server](https://img.shields.io/badge/Python-Flask%20Companion-blue?style=for-the-badge&logo=python)

---

## 🌟 Giới thiệu tổng quan
**EE Lab Inventory v2.1** là giải pháp phần mềm quản lý kho linh kiện cá nhân toàn diện dành riêng cho kỹ sư điện - điện tử, sinh viên kỹ thuật và maker DIY. 

Dự án giải quyết triệt để các vấn đề muôn thuở trong phòng thí nghiệm và bàn làm việc:
* **"IC này đang cất ở ô nào, ngăn nào trong hộp nhựa?"**
* **"Con này hết hàng rồi, có con nào cắm thay thế trực tiếp (drop-in) được ngay không?"**
* **"Mạch breadboard này cần những con gì, trong kho có đủ không, làm sao gom đồ và rút về hộp nhanh nhất?"**
* **"Sơ đồ chân pinout ra sao?"**
* **"Mua thêm ở đâu đúng kiểu chân DIP cắm lỗ và giá rẻ nhất giữa Tuyết Nga, HShop, Caka, Shopee?"**

Ứng dụng có thể **chạy hoàn toàn độc lập, offline trực tiếp trên trình duyệt** (`index.html`) hoặc kết hợp cùng **Companion Server ngầm nhẹ tênh** (`pinout_server.py`) để cào ảnh và giá thời gian thực.

---

## 🚀 Các Tính Năng Đột Phá

### 1. 🗄️ Trình Thiết Kế Sơ Đồ Hộp & Kệ Trực Quan (Visual Storage Designer)
* Tạo và quản lý không giới hạn số lượng hộp nhựa, khay phân loại, kệ ngăn kéo ngoài đời thực.
* Tự do chỉnh kích thước lưới: **Số hàng ngang × Số cột dọc** (A1, A2... F6).
* **Tính năng chia ngăn con linh hoạt**: Hỗ trợ chia 1 ô thành **2 ngăn nhỏ** (Trước/Sau hoặc Trái/Phải). Chỉ chia ở những ô bạn muốn, không bắt buộc toàn bộ hộp.
* **Ghép / Gộp ô**: Gộp nhiều ô liền kề thành 1 ô lớn cho các linh kiện dài (như board test, module dài, kẹp linh kiện).
* **Lọc nhanh 1 chạm**: Bấm trực tiếp vào bất kỳ ô nào trên sơ đồ để xem ngay các linh kiện đang nằm bên trong.

### 2. ⚡ Tra Cứu IC Thay Thế Tương Đương (Cross-Reference / Drop-in Replacement)
* Tự động phân tích và gợi ý các mã IC có thể **thay thế trực tiếp pin-to-pin (Drop-in)** khi một linh kiện hết hàng hoặc sắp hết:
  * **Họ 74xx Logic**: Tự động nhận diện và hoán đổi tương thích giữa các họ con: `74LS` (TTL), `74HCT` (TTL-CMOS khuyên dùng nhất), `74HC` (CMOS 2V-6V siêu tiết kiệm), `74ALS`, `74F` (Tốc độ cao), nâng cấp cổng đảo có Schmitt Trigger (`7414`, `74132`)...
  * **Họ CD4000 CMOS**: `CD4017`, `CD4011`, `CD4001`, `CD4069`, `CD4066`...
  * **Op-Amp & Comparator 8 chân**: `LM358`, `NE5532` (Hi-Fi), `TL072` / `TL082` (JFET), `RC4558`, `MCP6002` (Rail-to-Rail 3.3V/5V), `LM324`, `LM393`, `LM339`...
  * **Timer 555**: `NE555`, `LM555`, `ICM7555` (CMOS siêu tiết kiệm dòng), `TLC555`...
  * **IC Nguồn / Ổn áp**: `LM7805`, `L7805CV`, `KA7805`, `LM2940-5.0` (LDO sụt áp thấp), `LM317`, `AMS1117-3.3`...
  * **Driver & Opto**: `ULN2003`, `ULN2803`, `L293D`, `SN754410`, `PC817`, `EL817`, `LTV-817`, `PS2501-1`...
  * **Transistor & MOSFET**: `2N3904` vs `2N2222` vs `BC547`, `IRFZ44N` vs `IRF3205` vs `IRLB8721` (Logic-level kích trực tiếp từ MCU)...
* **Đối chiếu thời gian thực với kho thực tế**: Nếu IC thay thế **đang có sẵn trong hộp** của bạn, hệ thống lập tức báo xanh `[ Có sẵn thay thế: 74HC04 (4 con tại Hộp 1 • Ô A2) ]` giúp bạn lấy ngay mà không mất công tra cứu datasheet!
* Nếu trong kho chưa có, hỗ trợ nút **[ 🛒 Tìm mua ]** 1 chạm qua 4 shop.

### 3. 📋 Bảng Kê Linh Kiện BoM & Gom Đồ Dự Án (Project BoM & Kitting)
* Bảng thống kê linh kiện chi tiết (Bill of Materials) cho từng mạch / breadboard dự án:
  * Thống kê tổng số loại linh kiện, số con đang cắm trên mạch, số con còn sẵn trong hộp, số con còn thiếu.
  * Tự động hiển thị trạng thái từng linh kiện (Đủ hàng, Đã cắm hết, Hết hàng, hoặc Có IC thay thế).
* **Thao tác 1-Click Gom đồ lên mạch (`Gom tất cả lên mạch`)**: Tự động lấy tất cả các linh kiện có sẵn trong hộp cắm lên breadboard chỉ trong 1 giây.
* **Thao tác 1-Click Rút đồ về hộp (`Rút hết về hộp`)**: Khi tháo mạch thử nghiệm, 1 click trả toàn bộ linh kiện về lại đúng từng ngăn hộp lưu trữ mà không sợ thất lạc.
* **Xuất & In ấn BoM đa dạng**:
  * **Copy BoM**: Định dạng bảng text/markdown sạch đẹp dán vào ghi chú hoặc báo cáo lab.
  * **Xuất CSV**: Tải file Excel có UTF-8 tiếng Việt hoàn chỉnh.
  * **In BoM**: Mở trang in tối ưu với ô checkbox kiểm đếm thực tế trên bàn thí nghiệm.

### 4. 🧩 Sub-catalog Phân Loại Sâu Chức Năng Logic IC (8 Nhóm Chức Năng)
* Không còn tình trạng dồn hàng chục con IC số vào chung một danh mục "Logic IC" hỗn loạn.
* Tự động phân loại sâu và lọc theo **8 nhóm chức năng chuyên biệt**:
  1. 🔲 **Cổng Logic**: NAND, NOR, AND, OR, NOT, XOR, XNOR (`7400`, `7402`, `7404`, `7408`, `7432`, `7486`, `CD4011`...).
  2. 💾 **Bộ Nhớ & Chốt**: D-Flip-Flop, JK-Flip-Flop, D-Latch, SRAM, EEPROM (`7474`, `7476`, `74373`, `74573`, `28C64`, `62256`, `24C32`...).
  3. ⏱️ **Bộ Đếm & Chia Tần**: Binary Counter, Decade/BCD Counter, Ripple Counter (`7490`, `74161`, `74390`, `74393`, `CD4017`, `CD4020`, `CD4040`...).
  4. 🔄 **Thanh Ghi Dịch**: Shift Register SIPO / PISO (`74595`, `74164`, `74165`, `74194`, `CD4094`...).
  5. 🔀 **Bộ Chọn & Giải Mã**: MUX 8-to-1, Demux, 3-to-8 Decoder, BCD sang LED 7 đoạn (`74138`, `74139`, `74151`, `74153`, `7447`, `CD4051`...).
  6. 🚦 **Bộ Đệm & Bus Driver**: Octal Buffer, Bus Transceiver 2 chiều (`74244`, `74245`, `74541`, `MAX232`, `MAX485`...).
  7. 🧮 **Số Học & So Sánh**: Khối tính toán ALU (`74181`), Bộ cộng Full Adder (`7483`, `74283`), So sánh độ lớn 4-bit (`7485`), 8-bit (`74688`).
  8. ⚡ **Schmitt Trigger & Tạo Xung**: Cổng đảo Schmitt Trigger chống nhiễu (`7414`, `74132`), Đơn ổn Monostable (`74123`), Timer `555`.
* **Tự động nhận diện 100%**: Khi gõ tên chip hoặc chạy Quét kho, hệ thống tự động gán Sub-catalog mà không cần người dùng chọn tay.
* Tương thích hoàn toàn với bất kỳ tên phân loại tùy chỉnh nào (VD: `Logic IC`, `Logic IC (74HC, CD40...)`).

### 5. 🏆 Bảng Thành Tích Sưu Tầm IC Họ 74 (74xx Achievement / Pokedex Grid)
* Giao diện lưới sưu tầm trực quan phong cách "Pokedex" dành riêng cho dân nghiện IC số và kiến trúc máy tính 8-bit / Ben Eater:
  * Tổng hợp sẵn danh mục chuẩn **68 mã IC họ 74 kinh điển** (7400 đến 74688) thuộc đầy đủ các họ logic `74HC`, `74HCT`, `74LS`, `74ALS`, `74F`.
  * **Hệ thống đèn LED trạng thái trực quan**:
    * 🟢 **Đèn xanh phát sáng (`X con`)**: Linh kiện đã có trong kho, liệt kê chi tiết từng mã thực tế bạn đang sở hữu (ví dụ `74LS04` 5 con, `74HC04` 2 con) kèm nút bấm 1-chạm nhảy thẳng vào kho.
    * ⚪ **Đèn xám mờ (`Chưa có`)**: Linh kiện còn thiếu trong bộ sưu tập, kèm nút **[+ Thêm]** nhanh vào kho hoặc **[🛒 Mua]** để tìm giá tốt từ 4 shop.
  * **Hệ thống cấp bậc & Danh hiệu (Rank Titles)**: Tự động tính toán phần trăm hoàn thành bộ sưu tập từ *Tập sự Breadboard (0%)* → *Thợ Mạch Số* → *Chuyên Gia Logic 74xx* → *Huyền Thoại 74xx IC Master (100%)*.
  * Hỗ trợ thanh lọc nhanh: *Tất cả*, *Đã có trong kho*, *Chưa có*, và lọc chéo theo từng Sub-catalog chức năng.

### 6. 🛍️ So Sánh Giá & Link Mua 4 Shop Uy Tín (Price Comparison)
* Tự động liên kết và phân tích giá từ 4 shop linh kiện quen thuộc:
  1. **Điện tử Tuyết Nga**: Chuyên IC số logic, linh kiện cắm DIP/SMD Nhật Tảo.
  2. **HShop.vn**: Chuyên vi điều khiển (ESP32, STM32, Arduino), Module cảm biến chính hãng.
  3. **Linh kiện Caka**: IC tương tự, timer, op-amp, phụ kiện thực hành giá tốt.
  4. **Shopee**: Tổng hợp nhiều đại lý, so sánh giá rẻ & mã Freeship.
* **Bảo vệ đúng chuẩn Package (Kiểu chân)**: Tự động lọc và lưu ý đúng kiểu chân (ưu tiên chân cắm `DIP` hay chân dán `SMD/SOP`), cảnh báo nếu shop không có sẵn loại chân bạn cần để tránh mua nhầm.

### 7. 🪄 Auto Quét Kho 1 Chạm (Batch Auto-Enrich)
* Quét tự động toàn bộ kho chỉ bằng 1 nút bấm:
  * Tự bù **Mô tả chức năng**
  * Tự gắn **Ảnh sơ đồ chân Pinout**
  * Tự bổ sung **Kiểu chân (Package)**
  * Tự gán **Link đặt mua & Giá 4 Shop**
  * Tự phân loại sâu **Sub-catalog Logic IC** cho các chip số
* **Cam kết an toàn tuyệt đối**: Hệ thống chỉ điền vào những ô còn trống. Bất kỳ thông tin hoặc link nào bạn **đã tự nhập tay trước đây sẽ được giữ nguyên 100%**.

### 8. ⚡ Tự Nhận Diện IC, Mô Tả & Ảnh Pinout Nét Căng (Auto-Enrich)
* Nhận diện tức thì hàng trăm mã linh kiện điện tử thông dụng.
* Tự động điền chức năng ngắn gọn, kiểu chân và ảnh Pinout vector chuẩn từ Wikimedia Commons ngay khi gõ tên chip.
* Hỗ trợ dán ảnh Pinout trực tiếp từ Clipboard bằng **Ctrl + V**.

### 9. 🏷️ Tùy Chỉnh Phân Loại & Bộ Lọc Nâng Cao
* Tự do thêm, bớt, đổi tên các Tab phân loại linh kiện theo nhu cầu riêng.
* Tách / chuyển linh kiện hàng loạt giữa các phân loại linh hoạt.
* Bộ lọc đa năng: *Tất cả*, *Đang cắm mạch*, *Sắp hết hàng (Shopping list)*, *Ghim yêu thích (Favorite)*.

### 10. ☁️ Đồng Bộ Cloud & Backup An Toàn
* Tự động lưu tức thì vào `localStorage`.
* Hỗ trợ đồng bộ hóa 2 chiều qua **Cloud JSON URL** (dễ dàng dựng server riêng bằng Raspberry Pi, JSONBin hoặc n8n/Node.js).
* Xuất file backup (`.json`) và khôi phục dữ liệu toàn vẹn 100% chỉ trong 1 giây.

### 11. 🖥️ Companion Server Khay Hệ Thống (Windows System Tray)
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

