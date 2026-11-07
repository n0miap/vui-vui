import os
import sys

try:
    if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

import threading
import subprocess
import webbrowser
import urllib.request
import urllib.parse
import re
import html
import json
import logging
import socket
import atexit
import time
from datetime import datetime, timezone
from PIL import Image, ImageDraw

logging.getLogger('werkzeug').setLevel(logging.ERROR)

from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import pystray
from pystray import MenuItem as item, Menu

app = Flask(__name__)
CORS(app)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_HTML = os.path.join(SCRIPT_DIR, 'index.html')
STARTUP_DIR = os.path.join(os.environ.get('APPDATA', ''), r'Microsoft\Windows\Start Menu\Programs\Startup')
VBS_STARTUP_PATH = os.path.join(STARTUP_DIR, 'ee_lab_pinout_server.vbs')
CLOUDFLARED_BIN = os.path.join(SCRIPT_DIR, 'cloudflared.exe')
FIREBASE_URL = "https://nomiap-fe6e5-default-rtdb.asia-southeast1.firebasedatabase.app/ee_lab_v2.json"

CURRENT_TUNNEL_URL = ''
tunnel_process = None
tray_icon_ref = None

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 1))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

def sync_tunnel_to_firebase(url):
    try:
        payload = json.dumps({
            "tunnelUrl": url,
            "tunnelUpdatedAt": datetime.now(timezone.utc).isoformat()
        }).encode('utf-8')
        req = urllib.request.Request(
            FIREBASE_URL,
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='PATCH'
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            print(f"[+] Da cap nhat link HTTPS len Cloud: {url}")
    except Exception as e:
        print(f"[!] Khong the dong bo link HTTPS len Cloud: {e}")

def kill_existing_cloudflared():
    try:
        subprocess.run(['taskkill', '/F', '/IM', 'cloudflared.exe'],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

def cleanup_tunnel():
    global tunnel_process
    if tunnel_process:
        try:
            tunnel_process.terminate()
            tunnel_process.wait(timeout=2)
        except Exception:
            try:
                tunnel_process.kill()
            except Exception:
                pass
        tunnel_process = None

atexit.register(cleanup_tunnel)

TUNNEL_CONFIG_FILE = os.path.join(SCRIPT_DIR, 'tunnel_config.json')

def load_tunnel_config():
    if os.path.exists(TUNNEL_CONFIG_FILE):
        try:
            with open(TUNNEL_CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def run_tunnel_worker():
    global CURRENT_TUNNEL_URL, tunnel_process
    
    cfg = load_tunnel_config()
    fixed_url = cfg.get('fixedUrl', '').strip()
    cf_token = cfg.get('cloudflareToken', '').strip()

    if fixed_url and not cf_token:
        CURRENT_TUNNEL_URL = fixed_url
        print(f"[+] Su dung Fixed URL da cau hinh: {fixed_url}")
        sync_tunnel_to_firebase(fixed_url)
        update_tray_menu()
        return

    if not os.path.exists(CLOUDFLARED_BIN):
        print(f"[!] Khong tim thay cloudflared.exe tai: {CLOUDFLARED_BIN}")
        return

    kill_existing_cloudflared()
    url_regex = re.compile(r'https://[a-zA-Z0-9\-]+\.trycloudflare\.com')

    creationflags = 0
    if sys.platform == 'win32':
        creationflags = getattr(subprocess, 'CREATE_NO_WINDOW', 0x08000000)

    cmd = [CLOUDFLARED_BIN, 'tunnel', 'run', '--token', cf_token] if cf_token else [CLOUDFLARED_BIN, 'tunnel', '--url', 'http://127.0.0.1:5000']

    while True:
        try:
            print("[+] Dang khoi dong Cloudflare Tunnel chay ngam...")
            tunnel_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding='utf-8',
                errors='ignore',
                creationflags=creationflags
            )

            for line in iter(tunnel_process.stdout.readline, ''):
                if not line:
                    break
                m = url_regex.search(line)
                if m:
                    url = m.group(0).strip()
                    CURRENT_TUNNEL_URL = url
                    print(f"\n[CLOUDFLARE HTTPS SAN SANG]: {url}\n")
                    sync_tunnel_to_firebase(url)
                    update_tray_menu()

            tunnel_process.wait()
        except Exception as e:
            print(f"[!] Tunnel worker gap loi: {e}")

        time.sleep(5)

@app.route('/')
def serve_index():
    if os.path.exists(INDEX_HTML):
        return send_file(INDEX_HTML)
    return "EE Lab Server is running", 200

@app.route('/<path:filename>')
def serve_static(filename):
    full_path = os.path.join(SCRIPT_DIR, filename)
    if os.path.isfile(full_path):
        return send_from_directory(SCRIPT_DIR, filename)
    return jsonify({"error": "File not found"}), 404

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

# ================= 1.5 TRA CUU WIKIPEDIA TIENG VIET LOAT 7400 =================
WIKI_7400_CACHE_FILE = os.path.join(SCRIPT_DIR, 'wiki_7400_cache.json')
WIKI_7400_DATA = {}

def fetch_wiki_7400_from_web():
    """Cao bang danh sach IC loat 7400 truc tiep tu https://vi.wikipedia.org/wiki/Danh_sách_loạt_7400"""
    global WIKI_7400_DATA
    url = 'https://vi.wikipedia.org/wiki/Danh_s%C3%A1ch_lo%E1%BA%A1t_7400'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8'
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            html_text = resp.read().decode('utf-8', errors='ignore')
        
        pos = html_text.rfind('Danh_sách_IC')
        if pos == -1:
            pos = html_text.find('wikitable')
        if pos != -1:
            table_end = html_text.find('</table>', pos)
            table_html = html_text[pos:table_end] if table_end != -1 else html_text[pos:]
            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table_html, re.DOTALL)
            parsed = {}
            for r in rows:
                tds = re.findall(r'<td[^>]*>(.*?)</td>', r, re.DOTALL)
                if len(tds) >= 3:
                    code_raw = re.sub(r'<[^>]+>', '', tds[0]).strip()
                    count_raw = re.sub(r'<[^>]+>', '', tds[1]).strip()
                    desc_raw = re.sub(r'<[^>]+>', '', tds[2]).strip()
                    desc_clean = re.sub(r'\s+', ' ', desc_raw).strip()
                    ds_link = ''
                    if len(tds) >= 4:
                        m = re.search(r'href="(https?://[^"]+)"', tds[3])
                        if m:
                            ds_link = m.group(1)
                    if code_raw:
                        parsed[code_raw] = {
                            'desc': desc_clean,
                            'count': count_raw,
                            'datasheet': ds_link
                        }
            if parsed:
                WIKI_7400_DATA = parsed
                try:
                    with open(WIKI_7400_CACHE_FILE, 'w', encoding='utf-8') as f:
                        json.dump(parsed, f, ensure_ascii=False, indent=2)
                    print(f"[+] Da cap nhat thanh cong {len(parsed)} IC tu Wikipedia Loat 7400 Tieng Viet")
                except Exception as e:
                    print(f"[!] Loi luu cache wiki 7400: {e}")
                return parsed
    except Exception as e:
        print(f"[!] Khong the cao Wikipedia Loat 7400 tu web: {e}")
    return WIKI_7400_DATA

def load_wiki_7400_cache():
    global WIKI_7400_DATA
    if os.path.exists(WIKI_7400_CACHE_FILE):
        try:
            with open(WIKI_7400_CACHE_FILE, 'r', encoding='utf-8') as f:
                WIKI_7400_DATA = json.load(f)
            print(f"[+] Da tai {len(WIKI_7400_DATA)} IC tu cache Wikipedia Loat 7400")
            return
        except Exception:
            pass
    fetch_wiki_7400_from_web()

def normalize_74_candidates(raw_name):
    """
    Trich xuat cac ma ung vien tra cuu tren Wikipedia loat 7400 tu ten IC hoac so duoi
    VD: '74HC595' -> ['74595', '595']
        'SN74LS138N' -> ['74138', '138']
        '74HC04' -> ['7404', '04', '4']
        '595' -> ['74595', '595']
    """
    if not raw_name:
        return []
    clean = str(raw_name).strip().upper()
    clean = re.sub(r'\(.*?\)|\[.*?\]', '', clean)
    clean = re.sub(r'\b(DIP|SOP|SOIC|TSSOP|QFP|PDIP|CDIP)[\s\-_0-9]*\b', '', clean, flags=re.I)
    clean = re.sub(r'[\s\-_]', '', clean)
    stripped = re.sub(r'^(SN|MC|HD|DM|TC|HCF|HEF|MM|TI|GD|KS|UT|CD)', '', clean)

    candidates = []
    m = re.match(r'^(?:74|54)([A-Z]{0,4})?(\d{1,2}[A-Z]{1,2}\d{2,4}|\d{2,4})([A-Z]*)$', stripped)
    if m:
        num_part = m.group(2)
        candidates.append(f"74{num_part}")
        candidates.append(num_part)
        if len(num_part) == 1:
            candidates.append(f"740{num_part}")
        elif len(num_part) >= 3 and num_part.startswith('0'):
            candidates.append(f"74{num_part.lstrip('0')}")

    candidates.append(stripped)
    if not stripped.startswith('74'):
        candidates.append(f"74{stripped}")
        if len(stripped) == 1:
            candidates.append(f"740{stripped}")

    unique = []
    for c in candidates:
        if c and c not in unique:
            unique.append(c)
    return unique

def lookup_wiki_7400(name):
    if not WIKI_7400_DATA:
        load_wiki_7400_cache()
    candidates = normalize_74_candidates(name)
    for cand in candidates:
        if cand in WIKI_7400_DATA:
            res = dict(WIKI_7400_DATA[cand])
            res['code'] = cand
            return res
    return None

load_wiki_7400_cache()

# ================= 2. FLASK API ENDPOINTS =================
@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'message': 'EE Lab Pinout Server is running',
        'port': 5000,
        'tunnelUrl': CURRENT_TUNNEL_URL,
        'localIp': get_local_ip()
    })

@app.route('/api/tunnel')
def get_tunnel():
    return jsonify({
        'status': 'ok',
        'tunnelUrl': CURRENT_TUNNEL_URL,
        'localIp': get_local_ip(),
        'port': 5000
    })

@app.route('/api/tunnel/config', methods=['GET', 'POST'])
def handle_tunnel_config():
    global CURRENT_TUNNEL_URL
    if request.method == 'POST':
        data = request.get_json() or {}
        try:
            with open(TUNNEL_CONFIG_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            if data.get('fixedUrl'):
                CURRENT_TUNNEL_URL = data['fixedUrl'].strip()
                sync_tunnel_to_firebase(CURRENT_TUNNEL_URL)
                update_tray_menu()
            return jsonify({'status': 'ok', 'config': data})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    else:
        return jsonify(load_tunnel_config())

@app.route('/api/pinout')
def get_pinout():
    name = request.args.get('name', '').strip()
    pkg = request.args.get('pkg', '').strip()
    if not name:
        return jsonify([])
    
    results = search_pinout_images(name, pkg)
    return jsonify(results)

@app.route('/api/wiki74')
def api_wiki_7400():
    q = request.args.get('name', '') or request.args.get('code', '')
    refresh = request.args.get('refresh', '') == '1'
    if refresh:
        data = fetch_wiki_7400_from_web()
        return jsonify({'status': 'ok', 'count': len(data)})
    if not q:
        return jsonify({'total': len(WIKI_7400_DATA), 'items': list(WIKI_7400_DATA.keys())[:50]})
    res = lookup_wiki_7400(q)
    if res:
        return jsonify({'found': True, **res})
    return jsonify({'found': False, 'message': 'Not found in Wikipedia 7400 list'})

@app.route('/api/desc')
def get_desc():
    name = request.args.get('name', '').strip()
    if not name:
        return jsonify({'desc': ''})
    
    # 0. TẦNG ƯU TIÊN 1: Tra cứu trực tiếp Wikipedia Tiếng Việt Loạt 7400 theo số đuôi (https://vi.wikipedia.org/wiki/Danh_sách_loạt_7400)
    w74 = lookup_wiki_7400(name)
    if w74 and w74.get('desc'):
        return jsonify({
            'desc': w74['desc'],
            'source': 'wiki_vi_7400',
            'code': w74.get('code', ''),
            'datasheet': w74.get('datasheet', ''),
            'count': w74.get('count', '')
        })

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    # 1. Thu Wikipedia Summary API
    for q_candidate in [name, re.sub(r'^(74|CD|SN74|MC74)[A-Z]+', r'\1', name), f"{name} integrated circuit"]:
        try:
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(q_candidate)}"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode('utf-8', errors='ignore'))
                extract = data.get('extract', '').strip()
                if extract:
                    # Lay cau dau tien
                    first_sent = extract.split('. ')[0].strip()
                    if first_sent and len(first_sent) < 180:
                        return jsonify({'desc': first_sent, 'source': 'wikipedia'})
        except Exception:
            pass

    # 2. Thu DuckDuckGo Instant Answer API
    try:
        ddg_url = f"https://api.duckduckgo.com/?q={urllib.parse.quote_plus(name + ' IC integrated circuit')}&format=json&no_html=1&skip_disambig=1"
        req = urllib.request.Request(ddg_url, headers=headers)
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode('utf-8', errors='ignore'))
            abstract = data.get('AbstractText', '').strip() or data.get('Heading', '').strip()
            if abstract:
                first_sent = abstract.split('. ')[0].strip()
                return jsonify({'desc': first_sent, 'source': 'duckduckgo'})
    except Exception:
        pass

    return jsonify({'desc': '', 'source': 'none'})

# ================= 2.1 BỘ NHỚ CACHE & PROXY AI OVERVIEW (CHATGPT / LUNA 6.0) =================
AI_CACHE_FILE = os.path.join(SCRIPT_DIR, 'js', 'ai_cache.js')

def load_ai_cache_dict():
    """Doc du lieu cache tu file js/ai_cache.js"""
    if not os.path.exists(AI_CACHE_FILE):
        return {}
    try:
        with open(AI_CACHE_FILE, 'r', encoding='utf-8') as f:
            raw = f.read()
        m = re.search(r'const\s+AI_CACHE\s*=\s*(\{[\s\S]*?\});', raw)
        if m:
            return json.loads(m.group(1))
    except Exception as e:
        print(f"[!] Khong the doc ai_cache.js: {e}")
    return {}

def save_ai_cache_dict(cache_dict):
    """Ghi vinh vien du lieu cache vao file js/ai_cache.js"""
    try:
        os.makedirs(os.path.dirname(AI_CACHE_FILE), exist_ok=True)
        json_str = json.dumps(cache_dict, ensure_ascii=False, indent=2)
        content_to_write = f"""// =========================================================================\n// AI COMPONENT KNOWLEDGE CACHE (BỘ NHỚ LINH KIỆN ĐÃ TỪNG TRA CỨU AI)\n// Tự động lưu trữ vĩnh viễn trên máy - Tra cứu lại tốn 0 token, 0ms!\n// =========================================================================\n\nconst AI_CACHE = {json_str};\n\nif (typeof window !== 'undefined') {{\n  window.AI_CACHE = AI_CACHE;\n}}\n"""
        with open(AI_CACHE_FILE, 'w', encoding='utf-8') as f:
            f.write(content_to_write)
        print(f"[+] Da cap nhat ai_cache.js thanh cong ({len(cache_dict)} linh kien)")
        return True
    except Exception as e:
        print(f"[!] Loi ghi ai_cache.js: {e}")
        return False

def save_single_ai_cache_entry(name, data_item):
    if not name or not data_item:
        return
    clean_key = str(name).strip().upper()
    current = load_ai_cache_dict()
    current[clean_key] = {
        'name': data_item.get('name', clean_key).strip(),
        'desc': data_item.get('desc', '').strip(),
        'pkg': data_item.get('pkg', '').strip(),
        'cat': data_item.get('category', data_item.get('cat', '')).strip(),
        'subCat': data_item.get('subCategory', data_item.get('subCat', '')).strip(),
        'pinout': data_item.get('pinout', '').strip(),
        'savedAt': data_item.get('savedAt', '')
    }
    save_ai_cache_dict(current)

@app.route('/api/ai/cache', methods=['GET'])
def api_get_ai_cache():
    return jsonify(load_ai_cache_dict())

@app.route('/api/ai/cache/save', methods=['POST'])
def api_save_ai_cache():
    data = request.get_json(silent=True) or {}
    name = data.get('name', '').strip()
    if name:
        save_single_ai_cache_entry(name, data)
        return jsonify({'ok': True, 'saved': name})
    elif 'cache' in data and isinstance(data['cache'], dict):
        save_ai_cache_dict(data['cache'])
        return jsonify({'ok': True, 'count': len(data['cache'])})
    return jsonify({'ok': False, 'message': 'Thiếu dữ liệu cache'}), 400

@app.route('/api/ai/cache/delete', methods=['POST'])
def api_delete_ai_cache():
    data = request.get_json(silent=True) or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'ok': False, 'message': 'Thiếu tên linh kiện'}), 400
    clean_key = str(name).strip().upper()
    current = load_ai_cache_dict()
    deleted = False
    if clean_key in current:
        del current[clean_key]
        deleted = True
    alt_key = re.sub(r'[\s\-_]', '', clean_key)
    if alt_key in current:
        del current[alt_key]
        deleted = True
    if deleted:
        save_ai_cache_dict(current)
        return jsonify({'ok': True, 'deleted': clean_key})
    return jsonify({'ok': False, 'message': 'Không tìm thấy'}), 404


@app.route('/api/ai/overview', methods=['POST'])
def api_ai_overview():
    data = request.get_json(silent=True) or {}
    name = data.get('name', '').strip()
    api_key = data.get('apiKey', '').strip()

    if not name:
        return jsonify({'ok': False, 'message': 'Chưa có tên linh kiện'}), 400

    clean_key = name.upper()
    existing_cache = load_ai_cache_dict()
    if clean_key in existing_cache:
        c = existing_cache[clean_key]
        print(f"[+] Cache HIT cho {clean_key} (0 token)")
        return jsonify({
            'ok': True,
            'desc': c.get('desc', ''),
            'pkg': c.get('pkg', ''),
            'category': c.get('cat', ''),
            'subCategory': c.get('subCat', ''),
            'modelUsed': 'Bộ nhớ cache nội bộ (0 token)',
            'cached': True,
            'provider': 'openai'
        })

    # Prompt sieu ngan toi uu token cho Luna 6.0 / ChatGPT
    prompt = f'Mã: "{name}". JSON: {{"desc":"<chức năng tiếng Việt <=60 ký tự>","pkg":"<kiểu chân>","cat":"<Logic IC|Analog / Op-Amp|MCU / Board|Cảm biến / Module|Công suất|Điện trở|Tụ điện|Diode / Transistor|Thụ động / Khác>","sub":"<nhóm con nếu có>"}}'

    base_url = data.get('baseUrl', 'https://api.openai.com/v1').strip().rstrip('/')
    model = data.get('model', 'luna-6.0').strip() or 'luna-6.0'
    endpoint = f"{base_url}/chat/completions"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "Kỹ sư điện tử. Trả JSON thuần túy."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 120
    }
    headers = {
        "Content-Type": "application/json"
    }
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    try:
        req = urllib.request.Request(
            endpoint,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers
        )
        with urllib.request.urlopen(req, timeout=35) as resp:
            res_data = json.loads(resp.read().decode('utf-8', errors='ignore'))
            raw_text = res_data.get('choices', [{}])[0].get('message', {}).get('content', '')
            clean_json = re.sub(r'```json|```', '', raw_text).strip()
            m_json = re.search(r'(\{[\s\S]*?\})', clean_json)
            if m_json:
                clean_json = m_json.group(1)
            parsed = json.loads(clean_json)

            res_obj = {
                'ok': True,
                'desc': parsed.get('desc', ''),
                'pkg': parsed.get('pkg', ''),
                'category': parsed.get('cat', parsed.get('category', '')),
                'subCategory': parsed.get('sub', parsed.get('subCategory', '')),
                'modelUsed': model,
                'cached': False,
                'provider': 'openai'
            }

            # Luu ngay vao ai_cache.js de lan sau khong can hoi lai
            if res_obj['desc']:
                save_single_ai_cache_entry(name, res_obj)

            return jsonify(res_obj)
    except Exception as e:
        err_body = getattr(e, 'read', lambda: b'')().decode('utf-8', errors='ignore')
        return jsonify({'ok': False, 'message': err_body or str(e)}), 500

# ================= 3. TIM KIEM SAN PHAM & GIA 4 SHOP (TUYET NGA, HSHOP, CAKA, SHOPEE) =================
def search_shop_products(name, pkg=''):
    results = {}
    clean_pkg = (pkg or '').strip()
    query_exact = f"{name} {clean_pkg}".strip() if clean_pkg else name.strip()
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    }
    
    req_pkg_type = 'dip' if re.search(r'\bdip\b', clean_pkg, re.I) else ('smd' if re.search(r'\b(smd|sop|soic|qfp)\b', clean_pkg, re.I) else None)
    
    # 1. DIEN TU TUYET NGA
    tn_search_url = f"https://dientutuyetnga.com/tim-kiem?q={urllib.parse.quote(query_exact)}"
    try:
        req = urllib.request.Request(tn_search_url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            html_text = resp.read().decode('utf-8', errors='ignore')
            
        pro_links = re.findall(r'<a[^>]+href="(/[^"]*)"[^>]*title="([^"]+)"', html_text) or \
                    re.findall(r'<h[34][^>]*>\s*<a[^>]+href="(/[^"]*)"[^>]*>([^<]+)</a>', html_text)
        prices = re.findall(r'(\d{1,3}(?:\.\d{3})+)\s*[₫đĐ]', html_text)
        
        found_item = None
        for idx, (p_url, p_title) in enumerate(pro_links):
            p_title_clean = p_title.strip()
            if not p_url.startswith('http'):
                p_url = 'https://dientutuyetnga.com' + p_url
            
            if name.lower() in p_title_clean.lower() or name.replace('-', '').lower() in p_title_clean.replace('-', '').lower():
                pkg_match = True
                if req_pkg_type == 'dip' and re.search(r'\b(sop|smd|soic)\b', p_title_clean, re.I):
                    pkg_match = False
                elif req_pkg_type == 'smd' and re.search(r'\bdip\b', p_title_clean, re.I):
                    pkg_match = False
                    
                p_price = prices[idx] + '₫' if idx < len(prices) else None
                found_item = {
                    'name': 'Điện tử Tuyết Nga',
                    'title': p_title_clean,
                    'url': p_url,
                    'price': p_price,
                    'available': True,
                    'pkgMatch': pkg_match
                }
                if pkg_match:
                    break
                    
        if found_item and (found_item['pkgMatch'] or not req_pkg_type):
            results['tuyetnga'] = found_item
        else:
            results['tuyetnga'] = {
                'name': 'Điện tử Tuyết Nga',
                'url': tn_search_url,
                'price': None,
                'available': False,
                'pkgMatch': False
            }
    except Exception:
        results['tuyetnga'] = {
            'name': 'Điện tử Tuyết Nga',
            'url': tn_search_url,
            'price': None,
            'available': False,
            'pkgMatch': False
        }

    # 2. HSHOP.VN
    hs_search_url = f"https://hshop.vn/search?q={urllib.parse.quote(query_exact)}"
    try:
        req = urllib.request.Request(hs_search_url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            html_text = resp.read().decode('utf-8', errors='ignore')
            
        pro_links = re.findall(r'<a[^>]+href="(/products/[^"]*)"[^>]*>([^<]+)</a>', html_text) or \
                    re.findall(r'<h3[^>]*>\s*<a[^>]+href="(/products/[^"]*)"[^>]*title="([^"]+)"', html_text)
        prices = re.findall(r'(\d{1,3}(?:\.\d{3})+)\s*[₫đĐ]', html_text)
        
        found_item = None
        for idx, (p_url, p_title) in enumerate(pro_links):
            p_title_clean = p_title.strip()
            if not p_url.startswith('http'):
                p_url = 'https://hshop.vn' + p_url
            if name.lower() in p_title_clean.lower() or name.replace('-', '').lower() in p_title_clean.replace('-', '').lower():
                pkg_match = True
                if req_pkg_type == 'dip' and re.search(r'\b(sop|smd|soic)\b', p_title_clean, re.I):
                    pkg_match = False
                elif req_pkg_type == 'smd' and re.search(r'\bdip\b', p_title_clean, re.I):
                    pkg_match = False
                    
                p_price = prices[idx] + '₫' if idx < len(prices) else None
                found_item = {
                    'name': 'HShop.vn',
                    'title': p_title_clean,
                    'url': p_url,
                    'price': p_price,
                    'available': True,
                    'pkgMatch': pkg_match
                }
                if pkg_match:
                    break
                    
        if found_item and (found_item['pkgMatch'] or not req_pkg_type):
            results['hshop'] = found_item
        else:
            results['hshop'] = {
                'name': 'HShop.vn',
                'url': hs_search_url,
                'price': None,
                'available': False,
                'pkgMatch': False
            }
    except Exception:
        results['hshop'] = {
            'name': 'HShop.vn',
            'url': hs_search_url,
            'price': None,
            'available': False,
            'pkgMatch': False
        }

    # 3. LINH KIEN CAKA
    ck_search_url = f"https://caka.vn/search?query={urllib.parse.quote(query_exact)}"
    try:
        req = urllib.request.Request(ck_search_url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            html_text = resp.read().decode('utf-8', errors='ignore')
            
        pro_links = re.findall(r'<a[^>]+href="(/[^"]*)"[^>]*class="[^"]*product[^"]*"[^>]*title="([^"]+)"', html_text) or \
                    re.findall(r'<h[234][^>]*>\s*<a[^>]+href="(/[^"]*)"[^>]*>([^<]+)</a>', html_text)
        prices = re.findall(r'(\d{1,3}(?:\.\d{3})+)\s*[₫đĐ]', html_text)
        
        found_item = None
        for idx, (p_url, p_title) in enumerate(pro_links):
            p_title_clean = p_title.strip()
            if not p_url.startswith('http'):
                p_url = 'https://caka.vn' + p_url
            if name.lower() in p_title_clean.lower() or name.replace('-', '').lower() in p_title_clean.replace('-', '').lower():
                pkg_match = True
                if req_pkg_type == 'dip' and re.search(r'\b(sop|smd|soic)\b', p_title_clean, re.I):
                    pkg_match = False
                elif req_pkg_type == 'smd' and re.search(r'\bdip\b', p_title_clean, re.I):
                    pkg_match = False
                    
                p_price = prices[idx] + '₫' if idx < len(prices) else None
                found_item = {
                    'name': 'Linh kiện Caka',
                    'title': p_title_clean,
                    'url': p_url,
                    'price': p_price,
                    'available': True,
                    'pkgMatch': pkg_match
                }
                if pkg_match:
                    break
                    
        if found_item and (found_item['pkgMatch'] or not req_pkg_type):
            results['caka'] = found_item
        else:
            results['caka'] = {
                'name': 'Linh kiện Caka',
                'url': ck_search_url,
                'price': None,
                'available': False,
                'pkgMatch': False
            }
    except Exception:
        results['caka'] = {
            'name': 'Linh kiện Caka',
            'url': ck_search_url,
            'price': None,
            'available': False,
            'pkgMatch': False
        }

    # 4. SHOPEE
    shopee_q = urllib.parse.quote(query_exact)
    results['shopee'] = {
        'name': 'Shopee',
        'title': f"Tìm kiếm {query_exact} trên Shopee",
        'url': f"https://shopee.vn/search?keyword={shopee_q}",
        'price': 'Nhiều mức giá',
        'available': True,
        'pkgMatch': True
    }
    
    return results

@app.route('/api/shops')
def get_shops():
    name = request.args.get('name', '').strip()
    pkg = request.args.get('pkg', '').strip()
    if not name:
        return jsonify({})
    results = search_shop_products(name, pkg)
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

def copy_tunnel_url_to_clipboard(icon, item):
    if CURRENT_TUNNEL_URL:
        try:
            subprocess.run('clip', input=CURRENT_TUNNEL_URL.encode('utf-16le'), check=True)
            print(f"[+] Da copy link HTTPS vao Clipboard: {CURRENT_TUNNEL_URL}")
        except Exception as e:
            print(f"[!] Loi copy: {e}")

def build_tray_menu():
    local_ip = get_local_ip()
    tunnel_display = f"🌐 HTTPS ĐT: {CURRENT_TUNNEL_URL}" if CURRENT_TUNNEL_URL else "🌐 HTTPS ĐT: Đang tạo link..."

    return Menu(
        item('🟢 EE Lab Server (Port 5000)', lambda: None, enabled=False),
        item(f'📱 ĐT Wi-Fi: http://{local_ip}:5000', lambda: None, enabled=False),
        item(tunnel_display, lambda: None, enabled=False),
        item('📋 Copy link HTTPS cho ĐT', copy_tunnel_url_to_clipboard, enabled=bool(CURRENT_TUNNEL_URL)),
        Menu.SEPARATOR,
        item('🌐 Mở Kho Linh Kiện (Web)', open_web, default=True),
        item('🚀 Tự chạy khi bật máy (Startup)', toggle_startup, checked=lambda item: is_startup_enabled()),
        Menu.SEPARATOR,
        item('❌ Thoát Server', quit_server)
    )

def update_tray_menu():
    global tray_icon_ref
    if tray_icon_ref:
        try:
            tray_icon_ref.menu = build_tray_menu()
            if CURRENT_TUNNEL_URL:
                tray_icon_ref.title = f"EE Lab Server | HTTPS: {CURRENT_TUNNEL_URL}"
        except Exception:
            pass

def open_web(icon, item):
    webbrowser.open('http://localhost:5000')

def quit_server(icon, item):
    cleanup_tunnel()
    icon.stop()
    os._exit(0)

def main():
    global tray_icon_ref
    local_ip = get_local_ip()
    print("=" * 60)
    print("  EE LAB PINOUT & INVENTORY SERVER (DANG CHAY)")
    print("=" * 60)
    print(f"  [+] May tinh Laptop:    http://localhost:5000")
    print(f"  [+] Dien thoai (Wi-Fi): http://{local_ip}:5000")
    print("  (Server & Cloudflare Tunnel tu dong chay ngam cung Windows)")
    print("=" * 60)

    # 1. Chạy Flask Server trên port 5000
    flask_thread = threading.Thread(target=start_flask, daemon=True)
    flask_thread.start()

    # 2. Khởi động Cloudflare Tunnel ngầm và tự đẩy link lên Cloud
    tunnel_thread = threading.Thread(target=run_tunnel_worker, daemon=True)
    tunnel_thread.start()

    # 3. Tạo icon khay hệ thống (System Tray)
    icon_image = create_chip_icon()
    tray_icon_ref = pystray.Icon(
        "EELabPinoutServer",
        icon_image,
        f"EE Lab Server (Port 5000 | Wi-Fi: {local_ip}:5000)",
        build_tray_menu()
    )

    tray_icon_ref.run()

if __name__ == '__main__':
    main()
