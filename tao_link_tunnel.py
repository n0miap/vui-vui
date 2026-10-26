import os
import sys
import re
import urllib.request
import subprocess
import time

try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CLOUDFLARED_EXE = os.path.join(SCRIPT_DIR, "cloudflared.exe")
DOWNLOAD_URL = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"

def download_cloudflared():
    print("[1/2] Đang tải công cụ Cloudflare Tunnel (cloudflared.exe)...")
    print("      (Chỉ cần tải 1 lần duy nhất, kích thước ~30MB, xin chờ giây lát)")
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(DOWNLOAD_URL, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response, open(CLOUDFLARED_EXE, 'wb') as out_file:
            total_size = int(response.getheader('Content-Length', 0))
            downloaded = 0
            block_size = 64 * 1024
            while True:
                buffer = response.read(block_size)
                if not buffer:
                    break
                downloaded += len(buffer)
                out_file.write(buffer)
                if total_size > 0:
                    percent = int(downloaded * 100 / total_size)
                    mb = downloaded / (1024 * 1024)
                    print(f"\r      -> Đã tải: {mb:.1f} MB ({percent}%)", end='', flush=True)
        print("\n[✓] Tải thành công cloudflared.exe!")
    except Exception as e:
        print(f"\n[!] Lỗi khi tải tự động: {e}")
        print("    Bạn có thể tải file thủ công từ:")
        print(f"    {DOWNLOAD_URL}")
        print(f"    rồi đổi tên thành 'cloudflared.exe' và đặt vào: {SCRIPT_DIR}")
        input("\nNhấn Enter để thoát...")
        sys.exit(1)

def run_tunnel():
    if not os.path.exists(CLOUDFLARED_EXE):
        download_cloudflared()
        
    print("\n[2/2] Đang khởi tạo đường hầm HTTPS tới cổng 5000 của Laptop...")
    
    cmd = [CLOUDFLARED_EXE, "tunnel", "--url", "http://localhost:5000"]
    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding='utf-8',
            errors='ignore'
        )
    except Exception as e:
        print(f"[!] Không thể chạy cloudflared: {e}")
        input("\nNhấn Enter để thoát...")
        return

    tunnel_url = None
    print("      Đang chờ Cloudflare cấp tên miền HTTPS...")
    
    while True:
        line = proc.stdout.readline()
        if not line:
            break
        
        # Look for trycloudflare.com
        m = re.search(r'(https://[a-zA-Z0-9\-]+\.trycloudflare\.com)', line)
        if m and not tunnel_url:
            tunnel_url = m.group(1)
            print("\n" + "=" * 65)
            print("  🎉 LINK HTTPS CỦA BẠN ĐÃ SẴN SÀNG:")
            print(f"  👉 {tunnel_url}")
            print("=" * 65)
            print("  📱 HƯỚNG DẪN KẾT NỐI TỪ ĐIỆN THOẠI:")
            print("  1. Mở Kho Linh Kiện trên Điện Thoại (web GitHub Pages).")
            print("  2. Bấm vào nút Cài đặt Cloud (hình đám mây trên góc).")
            print("  3. Dán link trên vào ô 'Địa chỉ Server Pinout' và bấm 'Lưu'.")
            print("  4. Bấm 'Kiểm tra kết nối' -> Báo màu xanh là thành công!")
            print("=" * 65)
            print("  (Giữ cửa sổ này mở trong suốt quá trình cào ảnh nhé!)\n")
        elif not tunnel_url:
            # Print startup log if informative
            if "error" in line.lower() or "retrying" in line.lower():
                print("      " + line.strip())

    proc.wait()

if __name__ == "__main__":
    try:
        run_tunnel()
    except KeyboardInterrupt:
        print("\nĐã dừng đường hầm Cloudflare Tunnel.")
