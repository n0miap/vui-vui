// =========================================================================
// AI OVERVIEW SERVICE FOR EE LAB INVENTORY (OPENAI / CHATGPT / LUNA 6.0)
// TẦNG 2: TỰ ĐỘNG TÓM TẮT CHỨC NĂNG LINH KIỆN & LƯU BỘ NHỚ CACHE (0 TOKEN)
// =========================================================================

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_OPENAI_MODEL = 'luna-6.0';

// ================= 1. QUẢN LÝ BỘ NHỚ ĐỆM (AI KNOWLEDGE CACHE) =================
// Dữ liệu được nạp từ js/ai_cache.js + localStorage và tự động đồng bộ
let _aiRuntimeCache = {};

function initAiCache() {
  _aiRuntimeCache = {};

  // 1. Nạp từ file tĩnh js/ai_cache.js (nếu có)
  if (typeof window !== 'undefined' && window.AI_CACHE && typeof window.AI_CACHE === 'object') {
    for (const [k, v] of Object.entries(window.AI_CACHE)) {
      if (v && v.desc) {
        _aiRuntimeCache[k.toUpperCase()] = v;
      }
    }
  }

  // 2. Gộp thêm dữ liệu từ localStorage (những linh kiện vừa tra cứu trên trình duyệt)
  try {
    const localSaved = JSON.parse(localStorage.getItem('ee_ai_cache') || '{}');
    if (localSaved && typeof localSaved === 'object') {
      for (const [k, v] of Object.entries(localSaved)) {
        if (v && v.desc) {
          _aiRuntimeCache[k.toUpperCase()] = v;
        }
      }
    }
  } catch(e) {
    console.warn('[AI Cache] Lỗi đọc cache từ localStorage:', e);
  }

  // Cố gắng kéo thêm từ Python server nếu đang kết nối localhost
  fetchCacheFromServer();
}

async function fetchCacheFromServer() {
  const serverUrl = getActiveServerUrl();
  if (!serverUrl && serverUrl !== '') return;
  try {
    const res = await fetch(`${serverUrl}/api/ai/cache`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const serverCache = await res.json();
      if (serverCache && typeof serverCache === 'object') {
        let added = 0;
        for (const [k, v] of Object.entries(serverCache)) {
          const upper = k.toUpperCase();
          if (!_aiRuntimeCache[upper]) {
            _aiRuntimeCache[upper] = v;
            added++;
          }
        }
        if (added > 0) updateAiSettingsUI();
      }
    }
  } catch(e) {}
}

function cleanAiCacheKey(rawName) {
  if (!rawName) return '';
  return String(rawName).trim().toUpperCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/(?:DIP|SOP|SOIC|TSSOP|QFP|QFN|PDIP|CDIP)[\s\-_0-9]*/gi, '')
    .replace(/[\s\-_]/g, '');
}

function lookupAiCache(rawName) {
  if (!rawName) return null;
  const key = cleanAiCacheKey(rawName);
  if (!key) return null;

  // 1. Khớp chính xác
  if (_aiRuntimeCache[key]) return _aiRuntimeCache[key];

  // Khớp theo tên viết hoa gốc
  const upper = String(rawName).trim().toUpperCase();
  if (_aiRuntimeCache[upper]) return _aiRuntimeCache[upper];

  // 2. Thử bỏ tiền tố nhà sản xuất (SN, MC, HD, DM...)
  const stripped = key.replace(/^(?:SN|MC|HD|DM|TC|HCF|HEF|MM|TI)/i, '');
  if (_aiRuntimeCache[stripped]) return _aiRuntimeCache[stripped];

  // 3. Thử bỏ hậu tố đóng gói / phân loại (VD: LM358N -> LM358, NE555P -> NE555)
  const noSuffix = key.replace(/(?:[NPD]|CN|CP|DR|CDR|IDR|EP|IP|AP|DT|PW)$/i, '');
  if (_aiRuntimeCache[noSuffix]) return _aiRuntimeCache[noSuffix];

  return null;
}

async function saveToAiCache(rawName, data) {
  if (!rawName || !data || !data.desc) return null;
  const key = cleanAiCacheKey(rawName);
  const rawUpper = String(rawName).trim().toUpperCase();
  const entry = {
    name: (data.name || rawName).trim(),
    desc: data.desc.trim(),
    pkg: (data.pkg || '').trim(),
    cat: (data.category || data.cat || '').trim(),
    subCat: (data.subCategory || data.subCat || '').trim(),
    pinout: (data.pinout || '').trim(),
    source: data.source || 'manual',
    savedAt: data.savedAt || new Date().toISOString()
  };

  _aiRuntimeCache[key] = entry;
  if (rawUpper && rawUpper !== key) {
    _aiRuntimeCache[rawUpper] = entry;
  }

  // 1. Lưu vào localStorage
  try {
    const localSaved = JSON.parse(localStorage.getItem('ee_ai_cache') || '{}');
    localSaved[key] = entry;
    if (rawUpper && rawUpper !== key) {
      localSaved[rawUpper] = entry;
    }
    localStorage.setItem('ee_ai_cache', JSON.stringify(localSaved));
  } catch(e) {}

  // 2. Gửi về Python server để ghi vĩnh viễn vào file js/ai_cache.js trên ổ cứng
  const serverUrl = getActiveServerUrl();
  if (serverUrl !== null) {
    try {
      fetch(`${serverUrl}/api/ai/cache/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: key,
          desc: entry.desc,
          pkg: entry.pkg,
          category: entry.cat,
          subCategory: entry.subCat,
          pinout: entry.pinout
        }),
        signal: AbortSignal.timeout(5000)
      }).catch(() => {});
    } catch(err) {}
  }

  updateAiSettingsUI();
  if (typeof updateKnowledgeDbUI === 'function') {
    updateKnowledgeDbUI();
  }
  return entry;
}

async function deleteFromAiCache(rawName) {
  if (!rawName) return false;
  const key = cleanAiCacheKey(rawName);
  const rawUpper = String(rawName).trim().toUpperCase();

  delete _aiRuntimeCache[key];
  if (rawUpper && _aiRuntimeCache[rawUpper]) {
    delete _aiRuntimeCache[rawUpper];
  }

  // 1. Xóa trong localStorage
  try {
    const localSaved = JSON.parse(localStorage.getItem('ee_ai_cache') || '{}');
    delete localSaved[key];
    if (rawUpper) delete localSaved[rawUpper];
    localStorage.setItem('ee_ai_cache', JSON.stringify(localSaved));
  } catch(e) {}

  // 2. Gửi về server
  const serverUrl = getActiveServerUrl();
  if (serverUrl !== null) {
    try {
      fetch(`${serverUrl}/api/ai/cache/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: key }),
        signal: AbortSignal.timeout(5000)
      }).catch(() => {
        // Fallback lưu toàn bộ dictionary cache
        fetch(`${serverUrl}/api/ai/cache/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cache: _aiRuntimeCache })
        }).catch(() => {});
      });
    } catch(err) {}
  }

  updateAiSettingsUI();
  if (typeof updateKnowledgeDbUI === 'function') {
    updateKnowledgeDbUI();
  }
  return true;
}

function clearAiCache() {
  if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ bộ nhớ đệm (cache) linh kiện đã lưu không?')) return;
  localStorage.removeItem('ee_ai_cache');
  _aiRuntimeCache = {};
  if (typeof window !== 'undefined' && window.AI_CACHE) {
    for (const [k, v] of Object.entries(window.AI_CACHE)) {
      _aiRuntimeCache[k.toUpperCase()] = v;
    }
  }
  updateAiSettingsUI();
  if (typeof updateKnowledgeDbUI === 'function') {
    updateKnowledgeDbUI();
  }
  alert('Đã làm trống bộ nhớ đệm trên trình duyệt.');
}

function exportAiCacheToFile() {
  const jsonStr = JSON.stringify(_aiRuntimeCache, null, 2);
  const jsContent = `// =========================================================================\n// AI COMPONENT KNOWLEDGE CACHE (BỘ NHỚ LINH KIỆN ĐÃ TỪNG TRA CỨU AI)\n// Tự động lưu trữ vĩnh viễn trên máy - Tra cứu lại tốn 0 token, 0ms!\n// =========================================================================\n\nconst AI_CACHE = ${jsonStr};\n\nif (typeof window !== 'undefined') {\n  window.AI_CACHE = AI_CACHE;\n}\n`;
  const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ai_cache.js';
  a.click();
}

// ================= 2. CẤU HÌNH OPENAI / CHATGPT / LUNA 6.0 =================
function getOpenAiApiKey() {
  return (localStorage.getItem('ee_openai_api_key') || '').trim();
}

function setOpenAiApiKey(key) {
  if (key) {
    localStorage.setItem('ee_openai_api_key', key.trim());
  } else {
    localStorage.removeItem('ee_openai_api_key');
  }
}

function getOpenAiBaseUrl() {
  return (localStorage.getItem('ee_openai_base_url') || DEFAULT_OPENAI_BASE_URL).trim();
}

function setOpenAiBaseUrl(url) {
  localStorage.setItem('ee_openai_base_url', (url || DEFAULT_OPENAI_BASE_URL).trim());
}

function getOpenAiModel() {
  return (localStorage.getItem('ee_openai_model') || DEFAULT_OPENAI_MODEL).trim();
}

function setOpenAiModel(model) {
  localStorage.setItem('ee_openai_model', (model || DEFAULT_OPENAI_MODEL).trim());
}

function getActiveServerUrl() {
  if (typeof pinoutServerUrl !== 'undefined' && pinoutServerUrl) {
    return pinoutServerUrl;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '';
  }
  return null;
}

// PROMPT SIÊU NGẮN TỐI ƯU HÓA TOKEN (TIẾT KIỆM >70% TOKEN CHO LUNA 6.0 / CHATGPT)
function getAiComponentPrompt(rawName) {
  return `Mã: "${rawName}". JSON: {"desc":"<chức năng tiếng Việt <=60 ký tự>","pkg":"<kiểu chân>","cat":"<Logic IC|Analog / Op-Amp|MCU / Board|Cảm biến / Module|Công suất|Điện trở|Tụ điện|Diode / Transistor|Thụ động / Khác>","sub":"<nhóm con nếu có>"}`;
}

// TRÍCH XUẤT JSON AN TOÀN
function parseAiJsonResponse(rawText) {
  if (!rawText) return null;
  try {
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch(e) {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch(err2) {}
    }
  }
  return null;
}

// ================= 3. GỌI OPENAI / CHATGPT / LUNA 6.0 =================
async function fetchOpenAiOverview(rawName) {
  if (!rawName) return { ok: false, error: 'NO_NAME', message: 'Chưa có tên linh kiện' };

  // BƯỚC 1: KIỂM TRA BỘ NHỚ CACHE TRƯỚC TIÊN (0 TOKEN, 0MS!)
  const cached = lookupAiCache(rawName);
  if (cached && cached.desc) {
    console.log(`[AI Cache] Tìm thấy trong bộ nhớ cache cho "${rawName}" (0 token)`);
    return {
      ok: true,
      desc: cached.desc,
      pkg: cached.pkg || '',
      category: cached.cat || cached.category || '',
      subCategory: cached.subCat || cached.subCategory || '',
      modelUsed: 'Bộ nhớ cache nội bộ (0 token)',
      cached: true,
      provider: 'openai'
    };
  }

  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    return { ok: false, error: 'NO_KEY', message: 'Chưa cài đặt ChatGPT / Luna 6.0 API Key' };
  }

  const baseUrl = getOpenAiBaseUrl();
  const model = getOpenAiModel() || DEFAULT_OPENAI_MODEL;
  const prompt = getAiComponentPrompt(rawName);

  // BƯỚC 2: Thử qua Python server nếu có (Bypass CORS, tự lưu file ai_cache.js)
  const serverUrl = getActiveServerUrl();
  if (serverUrl !== null) {
    try {
      const pRes = await fetch(`${serverUrl}/api/ai/overview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'openai',
          name: rawName,
          apiKey: apiKey,
          baseUrl: baseUrl,
          model: model
        }),
        signal: AbortSignal.timeout(35000)
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData && pData.ok) {
          // Lưu vào cache trình duyệt
          saveToAiCache(rawName, pData);
          return pData;
        }
      }
    } catch(e) {
      console.warn('Proxy qua Python server không phản hồi, gọi trực tiếp endpoint:', e);
    }
  }

  // BƯỚC 3: Gọi trực tiếp endpoint OpenAI / Luna từ trình duyệt
  let endpoint = baseUrl.trim().replace(/\/+$/, '');
  if (!endpoint.endsWith('/chat/completions')) {
    endpoint += '/chat/completions';
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: "Kỹ sư điện tử. Trả JSON thuần túy." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 120
      }),
      signal: AbortSignal.timeout(35000)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
      return { ok: false, error: 'API_ERROR', message: errMsg, modelUsed: model };
    }

    const data = await res.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    const parsed = parseAiJsonResponse(rawContent);

    if (!parsed) {
      return { ok: false, error: 'JSON_PARSE', message: 'Không thể đọc định dạng JSON từ AI', rawContent, modelUsed: model };
    }

    const result = {
      ok: true,
      desc: parsed.desc || '',
      pkg: parsed.pkg || '',
      category: parsed.cat || parsed.category || '',
      subCategory: parsed.sub || parsed.subCategory || '',
      modelUsed: model,
      cached: false,
      provider: 'openai'
    };

    // Tự động lưu vào bộ nhớ cache vĩnh viễn
    if (result.desc) {
      saveToAiCache(rawName, result);
    }

    return result;
  } catch(err) {
    return { ok: false, error: 'FETCH_ERROR', message: err.message || 'Lỗi kết nối tới endpoint ChatGPT / Luna' };
  }
}

// HÀM ĐIỀU PHỐI CHÍNH
async function fetchAiComponentOverview(rawName) {
  return await fetchOpenAiOverview(rawName);
}

// ================= 4. GIAO DIỆN CÀI ĐẶT AI =================
function updateAiSettingsUI() {
  const openAiKeyInput = document.getElementById('openaiApiKeyInput');
  const openAiBaseUrlInput = document.getElementById('openaiBaseUrlInput');
  const openAiModelInput = document.getElementById('openaiModelInput');
  const openAiKeyBadge = document.getElementById('openaiKeyStatusBadge');
  const openAiKey = getOpenAiApiKey();

  if (openAiKeyInput) openAiKeyInput.value = openAiKey;
  if (openAiBaseUrlInput) openAiBaseUrlInput.value = getOpenAiBaseUrl();
  if (openAiModelInput) openAiModelInput.value = getOpenAiModel();

  if (openAiKeyBadge) {
    if (openAiKey) {
      openAiKeyBadge.textContent = 'Đã cài key ✓';
      openAiKeyBadge.className = 'text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-medium';
    } else {
      openAiKeyBadge.textContent = 'Chưa cài key';
      openAiKeyBadge.className = 'text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono';
    }
  }

  // Cập nhật số lượng linh kiện trong cache
  const cacheCountEl = document.getElementById('aiCacheCountBadge');
  if (cacheCountEl) {
    const count = Object.keys(_aiRuntimeCache).length;
    cacheCountEl.textContent = `${count} linh kiện`;
  }

  if (window.lucide) lucide.createIcons();
}

function saveOpenAiConfig() {
  const keyInput = document.getElementById('openaiApiKeyInput');
  const baseUrlInput = document.getElementById('openaiBaseUrlInput');
  const modelInput = document.getElementById('openaiModelInput');

  const key = (keyInput ? keyInput.value : '').trim();
  const baseUrl = (baseUrlInput ? baseUrlInput.value : '').trim() || DEFAULT_OPENAI_BASE_URL;
  const model = (modelInput ? modelInput.value : '').trim() || DEFAULT_OPENAI_MODEL;

  setOpenAiApiKey(key);
  setOpenAiBaseUrl(baseUrl);
  setOpenAiModel(model);
  updateAiSettingsUI();

  const testBox = document.getElementById('openaiTestResult');
  if (testBox) {
    testBox.classList.remove('hidden');
    if (key) {
      testBox.innerHTML = `<span class="text-emerald-400 font-semibold">✓ Đã lưu cấu hình Luna 6.0 (${model}). Bấm "Thử nghiệm AI" để kiểm tra!</span>`;
    } else {
      testBox.innerHTML = `<span class="text-amber-400">Đã lưu. Vui lòng dán API Key để sử dụng tính năng tóm tắt.</span>`;
    }
  }
}

function clearOpenAiConfig() {
  setOpenAiApiKey('');
  updateAiSettingsUI();
  const testBox = document.getElementById('openaiTestResult');
  if (testBox) {
    testBox.classList.remove('hidden');
    testBox.innerHTML = `<span class="text-slate-400">Đã xóa key Luna 6.0 / OpenAI.</span>`;
  }
}

function setQuickOpenAiModel(modelName) {
  const input = document.getElementById('openaiModelInput');
  if (input) input.value = modelName;
  setOpenAiModel(modelName);
}

function toggleOpenAiKeyVisibility() {
  const input = document.getElementById('openaiApiKeyInput');
  const icon = document.getElementById('openaiKeyEyeIcon');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  if (icon) icon.setAttribute('data-lucide', input.type === 'password' ? 'eye' : 'eye-off');
  if (window.lucide) lucide.createIcons();
}

async function testOpenAiConnection() {
  saveOpenAiConfig();
  const key = getOpenAiApiKey();
  const testBox = document.getElementById('openaiTestResult');
  const btn = document.getElementById('btnTestOpenAi');

  if (!key) {
    if (testBox) {
      testBox.classList.remove('hidden');
      testBox.innerHTML = `<span class="text-rose-400 font-medium">Vui lòng dán API Key vào ô trước khi thử nghiệm!</span>`;
    }
    return;
  }

  const model = getOpenAiModel() || 'luna-6.0';

  if (testBox) {
    testBox.classList.remove('hidden');
    testBox.innerHTML = `<span class="text-emerald-300 flex items-center gap-1.5"><i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> Đang test gọi model ${model} (phân tích chip "LM358")...</span>`;
    if (window.lucide) lucide.createIcons();
  }
  if (btn) btn.disabled = true;

  const result = await fetchOpenAiOverview('LM358');
  if (btn) btn.disabled = false;

  if (testBox) {
    if (result.ok) {
      testBox.innerHTML = `
        <div class="text-emerald-400 font-semibold mb-1 flex items-center gap-1">
          <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i> Thành công! (${result.modelUsed}) ${result.cached ? '<span class="text-amber-400 font-mono text-[10px] ml-1">[Lấy từ Cache - 0 token]</span>' : ''}
        </div>
        <div class="text-[11px] text-slate-300">
          • <b>Mô tả:</b> ${result.desc}<br>
          • <b>Package:</b> ${result.pkg}<br>
          • <b>Phân loại:</b> ${result.category} &gt; ${result.subCategory || 'N/A'}
        </div>
      `;
    } else {
      testBox.innerHTML = `
        <div class="text-rose-400 font-semibold mb-1 flex items-center gap-1">
          <i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-rose-400"></i> Lỗi kết nối (${model}):
        </div>
        <div class="text-[11px] text-rose-300">${result.message}</div>
      `;
    }
    if (window.lucide) lucide.createIcons();
  }
}

// ================= 5. BẤM NÚT "AI OVERVIEW" TRONG MODAL =================
async function askAiForDesc(manualClick = true) {
  const nameInput = document.getElementById('partName');
  const descInput = document.getElementById('partDesc');
  const pkgInput = document.getElementById('partPackage');
  const catSelect = document.getElementById('partCategory');
  const subSelect = document.getElementById('partSubCategory');
  const badge = document.getElementById('descAutoBadge');
  const rawName = nameInput ? nameInput.value.trim() : '';

  if (!rawName) {
    if (manualClick) {
      alert('Vui lòng nhập Tên / Mã linh kiện trước khi dùng AI!');
      if (nameInput) nameInput.focus();
    }
    return;
  }

  // Kiểm tra trước nếu đã có trong cache
  const cached = lookupAiCache(rawName);
  const hasKey = !!getOpenAiApiKey();

  if (!cached && !hasKey) {
    if (manualClick) {
      openSettingsModal('ai');
      alert('Chưa cài đặt API Key cho ChatGPT / Luna 6.0! Hãy dán key của bạn để kích hoạt AI Overview nhé.');
    } else if (badge) {
      badge.innerHTML = `<i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-400"></i> <span>Chưa có trong DB. <button type="button" onclick="openSettingsModal('ai')" class="text-emerald-300 underline font-semibold hover:text-white">Cài đặt API Key AI</button> để tự tóm tắt</span>`;
      badge.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }
    return;
  }

  const modelName = getOpenAiModel() || 'Luna 6.0';
  if (badge) {
    badge.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 text-emerald-400 animate-spin"></i> <span>✨ ${cached ? 'Đang đọc từ bộ nhớ cache...' : `${modelName} đang phân tích "${rawName}"...`}</span>`;
    badge.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  const aiRes = await fetchAiComponentOverview(rawName);

  if (aiRes.ok && aiRes.desc) {
    if (descInput) descInput.value = aiRes.desc;
    if (pkgInput && (!pkgInput.value || manualClick) && aiRes.pkg) {
      pkgInput.value = aiRes.pkg;
    }
    if (aiRes.category && catSelect) {
      const matched = typeof findCategoryMatch === 'function' ? findCategoryMatch(aiRes.category) : aiRes.category;
      if (matched) catSelect.value = matched;
    }
    if (typeof handleCategoryChange === 'function') handleCategoryChange();

    if (subSelect && !subSelect.value && aiRes.subCategory) {
      subSelect.value = aiRes.subCategory;
    }

    if (badge) {
      const cacheNote = aiRes.cached ? ' [Bộ nhớ cache - 0 token]' : '';
      badge.innerHTML = `<i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-400"></i> <span>✨ AI (${aiRes.modelUsed || modelName}${cacheNote}): <b>${rawName}</b> • ${aiRes.desc}</span>`;
      badge.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }

    // Auto fetch pinout image if empty
    const pinoutInput = document.getElementById('partPinout');
    if (pinoutInput && !pinoutInput.value.trim() && typeof autoFetchPinout === 'function') {
      autoFetchPinout(true);
    }
  } else {
    if (badge) {
      badge.innerHTML = `<i data-lucide="alert-circle" class="w-3.5 h-3.5 text-amber-400"></i> <span>${aiRes.message || 'AI không nhận diện được mã này'}</span>`;
      badge.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }
  }
}

// Khởi chạy nạp cache ngay khi file js được load
if (typeof window !== 'undefined') {
  window.getAiRuntimeCache = () => _aiRuntimeCache;
  window.saveToAiCache = saveToAiCache;
  window.deleteFromAiCache = deleteFromAiCache;
  window.lookupAiCache = lookupAiCache;
  window.cleanAiCacheKey = cleanAiCacheKey;
  window.exportAiCacheToFile = exportAiCacheToFile;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAiCache);
  } else {
    initAiCache();
  }
}
