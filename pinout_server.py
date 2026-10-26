import os
import sys
import threading
import webbrowser
import urllib.request
import urllib.parse
import re
import html
import json
import logging
from PIL import Image, ImageDraw

logging.getLogger('werkzeug').setLevel(logging.ERROR)

from flask import Flask, request, jsonify
from flask_cors import CORS
import pystray
from pystray import MenuItem as item, Menu

app = Flask(__name__)
CORS(app)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_HTML = os.path.join(SCRIPT_DIR, 'index.html')
STARTUP_DIR = os.path.join(os.environ.get('APPDATA', ''), r'Microsoft\Windows\Start Menu\Programs\Startup')
VBS_STARTUP_PATH = os.path.join(STARTUP_DIR, 'ee_lab_pinout_server.vbs')

def clean_image_url(url):
    if not url:
        return ''
    return url.strip().replace(' ', '%20')

# ================= 1. TIM ANH PINOUT (BING HD CDN + WIKIMEDIA) =================
def search_pinout_images(name, pkg=''):
    query = f"{name} {pkg} pinout diagram".strip()
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    
    # Engine 1: Bing Images (Su dung link CDN Microsoft HD - 100% khong bi chan, khong bi chet link)
    try:
        encoded_q = urllib.parse.quote_plus(query)
        url = f"https://www.bing.com/images/search?q={encoded_q}&FORM=HDRSC2"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            page = resp.read().decode('utf-8', errors='ignore')
        
        matches = re.findall(r'm="(\{[^"]+\})"', page)
        items = []
        for raw in matches:
            try:
                data = json.loads(html.unescape(raw))
                turl = data.get('turl', '')
                murl = clean_image_url(data.get('murl', ''))
                title = data.get('t', name)

                # Tao link anh HD truc tiep tu Microsoft CDN (800x800 ro net, khong bi Cloudflare chan)
                if turl and 'mm.bing.net' in turl:
                    base_turl = re.sub(r'&pid=.*', '', turl)
                    reliable_hd_url = f"{base_turl}&w=800&h=800&c=7&rs=1&p=0"
                    thumb_url = f"{base_turl}&w=200&h=200&c=7&rs=1&p=0"
                else:
                    reliable_hd_url = murl
                    thumb_url = turl or murl

                if reliable_hd_url and reliable_hd_url.startswith('http'):
                    items.append({
                        'link': reliable_hd_url,
                        'thumb': thumb_url,
                        'orig_link': murl,
                        'title': title
                    })
                if len(items) >= 6:
                    break
            except Exception:
                continue
                
        if items:
            return items
    except Exception as e:
        print(f"[!] Bing search error: {e}")

    # Engine 2: Wikimedia Commons (Fallback)
    try:
        wiki_q = urllib.parse.quote_plus(f"{name} pinout")
        wiki_url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={wiki_q}&gsrlimit=6&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=800&format=json"
        req = urllib.request.Request(wiki_url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8', errors='ignore'))
            
        items = []
        if 'query' in data and 'pages' in data['query']:
            for _, p in data['query']['pages'].items():
                if 'imageinfo' in p and p['imageinfo']:
                    info = p['imageinfo'][0]
                    img_url = clean_image_url(info.get('thumburl') or info.get('url'))
                    items.append({
                        'link': img_url,
                        'thumb': img_url,
                        'orig_link': clean_image_url(info.get('url')),
                        'title': p.get('title', name)
                    })
        if items:
            return items
    except Exception as e:
        print(f"[!] Wikimedia search error: {e}")

    return []

# ================= 2. FLASK API ENDPOINTS =================
@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'message': 'EE Lab Pinout Server is running',
        'port': 5000
    })

@app.route('/api/pinout')
def get_pinout():
    name = request.args.get('name', '').strip()
    pkg = request.args.get('pkg', '').strip()
    if not name:
        return jsonify([])
    
    results = search_pinout_images(name, pkg)
    return jsonify(results)

def start_flask():
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)

# ================= 3. SYSTEM TRAY (ICON GOC TASKBAR) =================
def create_chip_icon():
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([14, 14, 50, 50], radius=4, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
    draw.ellipse([18, 18, 22, 22], fill=(16, 185, 129))
    for y in (20, 30, 40):
        draw.rectangle([6, y, 14, y+3], fill=(245, 158, 11))
        draw.rectangle([50, y, 58, y+3], fill=(245, 158, 11))
    return img

def is_startup_enabled():
    return os.path.exists(VBS_STARTUP_PATH)

def toggle_startup(icon, item):
    pythonw = os.path.join(os.path.dirname(sys.executable), 'pythonw.exe')
    if not os.path.exists(pythonw):
        pythonw = 'pythonw'

    script_path = os.path.abspath(__file__)

    if is_startup_enabled():
        try:
            os.remove(VBS_STARTUP_PATH)
        except Exception:
            pass
    else:
        try:
            vbs_content = f'''Set WshShell = CreateObject("WScript.Shell")\r\nWshShell.Run """{pythonw}"" ""{script_path}""", 0, False\r\n'''
            with open(VBS_STARTUP_PATH, 'w', encoding='utf-8') as f:
                f.write(vbs_content)
        except Exception as e:
            print(f"[!] Khong the tao startup vbs: {e}")

def open_web(icon, item):
    if os.path.exists(INDEX_HTML):
        webbrowser.open(INDEX_HTML)
    else:
        webbrowser.open('http://localhost:5000/health')

def quit_server(icon, item):
    icon.stop()
    os._exit(0)

def main():
    flask_thread = threading.Thread(target=start_flask, daemon=True)
    flask_thread.start()

    icon_image = create_chip_icon()
    menu = Menu(
        item('🟢 EE Lab Pinout Server (Port 5000)', lambda: None, enabled=False),
        Menu.SEPARATOR,
        item('🌐 Mở Kho Linh Kiện (Web)', open_web, default=True),
        item('🚀 Tự chạy khi bật máy (Startup)', toggle_startup, checked=lambda item: is_startup_enabled()),
        Menu.SEPARATOR,
        item('❌ Thoát Server', quit_server)
    )

    tray_icon = pystray.Icon(
        "EELabPinoutServer",
        icon_image,
        "EE Lab Pinout Server (Đang chạy: Port 5000)",
        menu
    )

    tray_icon.run()

if __name__ == '__main__':
    main()
