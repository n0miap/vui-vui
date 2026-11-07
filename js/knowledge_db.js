// =========================================================================
// MODULE: KNOWLEDGE DATABASE & DICTIONARY MANAGER (TỪ ĐIỂN & DATABASE MÔ TẢ IC)
// Cho phép xem toàn bộ mô tả linh kiện có sẵn & tự thêm/sửa/xóa mô tả thủ công
// =========================================================================

let knowledgeSearchQuery = '';
let knowledgeSourceFilter = 'all'; // 'all' | 'custom' | 'analog' | 'logic74' | 'cmos40'
let knowledgeCategoryFilter = 'all';
let knowledgeDisplayLimit = 40;
let editingKnowledgeKey = null;
let editingKnowledgeIsOverride = false;

// Hàm bỏ dấu tiếng Việt để tìm kiếm siêu thông minh (VD: "khuech dai" -> "khuếch đại")
function removeKdbAccents(str) {
  if (!str) return '';
  str = String(str).toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  return str;
}

// 1. TẬP HỢP TOÀN BỘ LINH KIỆN TỪ CÁC NGUỒN TRONG HỆ THỐNG
function getAllKnowledgeEntries() {
  const result = [];
  const seenKeys = new Set();

  // NGUỒN 1: BỘ NHỚ CACHE CỦA NGƯỜI DÙNG & AI (localStorage + js/ai_cache.js)
  const runtimeCache = (typeof window.getAiRuntimeCache === 'function') 
    ? window.getAiRuntimeCache() 
    : (typeof _aiRuntimeCache !== 'undefined' ? _aiRuntimeCache : {});

  // Danh sách các entry từ cache (lọc trùng key phụ)
  const customEntries = [];
  const customProcessedRefs = new Set();

  for (const [key, val] of Object.entries(runtimeCache)) {
    if (!val || !val.desc) continue;
    if (customProcessedRefs.has(val)) continue;
    customProcessedRefs.add(val);

    const displayName = val.name || key;
    const cleanKey = (typeof cleanAiCacheKey === 'function') ? cleanAiCacheKey(displayName) : displayName.toUpperCase();
    
    seenKeys.add(cleanKey);
    seenKeys.add(displayName.toUpperCase());

    customEntries.push({
      key: cleanKey,
      rawKey: key,
      name: displayName,
      desc: val.desc || '',
      pkg: val.pkg || '',
      cat: val.cat || val.category || 'Chưa phân loại',
      subCat: val.subCat || val.subCategory || '',
      pinout: val.pinout || '',
      source: 'custom',
      sourceLabel: '⭐ Tự thêm / Cache',
      isCustom: true,
      savedAt: val.savedAt || ''
    });
  }

  // Sắp xếp các linh kiện người dùng tự thêm theo thời gian hoặc tên
  customEntries.sort((a, b) => a.name.localeCompare(b.name));
  result.push(...customEntries);

  // NGUỒN 2: TỪ ĐIỂN CÓ SẴN TRONG HỆ THỐNG (EXACT_IC_KNOWLEDGE: OP-AMP, TRANSISTOR, NGUỒN...)
  if (typeof EXACT_IC_KNOWLEDGE !== 'undefined' && EXACT_IC_KNOWLEDGE) {
    for (const [key, val] of Object.entries(EXACT_IC_KNOWLEDGE)) {
      if (!val || !val.desc) continue;
      const cleanKey = key.toUpperCase();
      const isOverridden = seenKeys.has(cleanKey);
      if (!isOverridden) {
        seenKeys.add(cleanKey);
        result.push({
          key: cleanKey,
          rawKey: key,
          name: key,
          desc: val.desc || '',
          pkg: val.pkg || '',
          cat: val.cat || 'Analog / Op-Amp',
          subCat: val.subCat || '',
          pinout: val.pinout || '',
          source: 'builtin',
          sourceLabel: 'Hệ thống',
          isCustom: false
        });
      }
    }
  }

  // NGUỒN 3: TỪ ĐIỂN IC SỐ HỌ 74 (LOGIC_74_MAP: 74HC/74LS)
  if (typeof LOGIC_74_MAP !== 'undefined' && LOGIC_74_MAP) {
    for (const [code, val] of Object.entries(LOGIC_74_MAP)) {
      if (!val || !val.desc) continue;
      const fullName = `74HC${code}`;
      const cleanKey = fullName.toUpperCase();
      const codeKey = `74${code}`.toUpperCase();
      if (!seenKeys.has(cleanKey) && !seenKeys.has(codeKey)) {
        seenKeys.add(cleanKey);
        let sub = '';
        if (typeof determineLogicSubcategory === 'function') {
          sub = determineLogicSubcategory(fullName, val.desc);
        }
        result.push({
          key: cleanKey,
          rawKey: code,
          name: fullName,
          code: code,
          desc: val.desc || '',
          pkg: val.pkg || 'DIP-14',
          cat: 'Logic IC',
          subCat: sub,
          pinout: val.pinout || '',
          source: 'logic74',
          sourceLabel: 'Logic Họ 74',
          isCustom: false
        });
      }
    }
  }

  return result;
}

// 2. MỞ VÀ ĐÓNG MODAL
function openKnowledgeModal(prefillName = '') {
  const modal = document.getElementById('knowledgeModal');
  if (!modal) return;

  // Điền dropdown phân loại trong form
  populateKdbCategorySelect();

  // Reset form
  cancelEditKnowledgeItem();

  // Nếu người dùng truyền vào mã cần tìm / cần thêm
  const trimmedName = String(prefillName || '').trim();
  if (trimmedName) {
    const nameInput = document.getElementById('kdbFormName');
    if (nameInput) nameInput.value = trimmedName;

    const searchInput = document.getElementById('kdbSearchInput');
    if (searchInput) searchInput.value = trimmedName;
    knowledgeSearchQuery = trimmedName;
  } else {
    const searchInput = document.getElementById('kdbSearchInput');
    if (searchInput) searchInput.value = knowledgeSearchQuery;
  }

  knowledgeDisplayLimit = 40;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  renderKnowledgeList();
  if (window.lucide) lucide.createIcons();
}

function closeKnowledgeModal() {
  const modal = document.getElementById('knowledgeModal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
  cancelEditKnowledgeItem();
}

function populateKdbCategorySelect() {
  const select = document.getElementById('kdbFormCat');
  const filterSelect = document.getElementById('kdbCatFilterSelect');
  if (!select) return;

  const currentCats = (typeof categories !== 'undefined' && Array.isArray(categories))
    ? categories
    : ['Logic IC', 'Analog / Op-Amp', 'MCU / Board', 'Cảm biến / Module', 'Công suất', 'Điện trở', 'Tụ điện', 'Diode / Transistor', 'Thụ động / Khác'];

  // Form Category Select
  const currentVal = select.value;
  select.innerHTML = currentCats.map(c => `<option value="${c}">${c}</option>`).join('');
  if (currentVal && currentCats.includes(currentVal)) {
    select.value = currentVal;
  }

  // Filter Category Select
  if (filterSelect) {
    const prevFilter = filterSelect.value || 'all';
    filterSelect.innerHTML = `<option value="all">Tất cả danh mục (${currentCats.length})</option>` +
      currentCats.map(c => `<option value="${c}">${c}</option>`).join('');
    if (prevFilter) filterSelect.value = prevFilter;
  }
}

// 3. LỌC VÀ RENDER DANH SÁCH LINH KIỆN
function setKnowledgeSourceFilter(source) {
  knowledgeSourceFilter = source;
  knowledgeDisplayLimit = 40;

  // Cập nhật giao diện tab buttons
  const tabs = ['all', 'custom', 'analog', 'logic74'];
  tabs.forEach(t => {
    const btn = document.getElementById(`kdbTabBtn_${t}`);
    if (btn) {
      if (t === source) {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 text-white shadow-sm transition shrink-0';
      } else {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition shrink-0';
      }
    }
  });

  renderKnowledgeList();
}

function setKnowledgeCategoryFilter(cat) {
  knowledgeCategoryFilter = cat;
  knowledgeDisplayLimit = 40;
  renderKnowledgeList();
}

function setKnowledgeSearch(query) {
  knowledgeSearchQuery = String(query || '').trim();
  knowledgeDisplayLimit = 40;
  renderKnowledgeList();
}

function clearKnowledgeSearch() {
  const input = document.getElementById('kdbSearchInput');
  if (input) input.value = '';
  knowledgeSearchQuery = '';
  knowledgeDisplayLimit = 40;
  renderKnowledgeList();
}

function loadMoreKnowledge() {
  knowledgeDisplayLimit += 40;
  renderKnowledgeList();
}

function renderKnowledgeList() {
  const container = document.getElementById('kdbListContainer');
  const countBadge = document.getElementById('kdbTotalCountBadge');
  const customCountBadge = document.getElementById('kdbCustomCountBadge');
  const statusEl = document.getElementById('kdbFilterStatusText');
  const emptyBox = document.getElementById('kdbEmptyState');
  const loadMoreBtn = document.getElementById('kdbLoadMoreBtn');

  if (!container) return;

  const allEntries = getAllKnowledgeEntries();
  const totalCount = allEntries.length;
  const customCount = allEntries.filter(x => x.isCustom).length;

  if (countBadge) countBadge.textContent = `${totalCount} linh kiện`;
  if (customCountBadge) customCountBadge.textContent = `${customCount}`;

  // Cập nhật số đếm trên các nút tab
  const tabCustomBtn = document.getElementById('kdbTabBtn_custom');
  if (tabCustomBtn) {
    tabCustomBtn.innerHTML = `⭐ Tự thêm & Cache (${customCount})`;
  }

  // TIẾN HÀNH LỌC
  const qClean = removeKdbAccents(knowledgeSearchQuery);
  const qUpper = knowledgeSearchQuery.toUpperCase();

  const filtered = allEntries.filter(item => {
    // 1. Lọc theo nguồn (Source filter)
    if (knowledgeSourceFilter === 'custom' && !item.isCustom) return false;
    if (knowledgeSourceFilter === 'analog' && item.source !== 'builtin') {
      const isAnalogCat = item.cat.toLowerCase().includes('analog') || item.cat.toLowerCase().includes('công suất') || item.cat.toLowerCase().includes('diode');
      if (!isAnalogCat) return false;
    }
    if (knowledgeSourceFilter === 'logic74' && item.source !== 'logic74' && !item.name.startsWith('74')) return false;

    // 2. Lọc theo danh mục (Category filter)
    if (knowledgeCategoryFilter !== 'all' && item.cat !== knowledgeCategoryFilter) {
      return false;
    }

    // 3. Lọc theo từ khóa tìm kiếm (Search query)
    if (qClean) {
      const nameClean = removeKdbAccents(item.name);
      const descClean = removeKdbAccents(item.desc);
      const pkgClean = removeKdbAccents(item.pkg);
      const catClean = removeKdbAccents(item.cat);
      const subClean = removeKdbAccents(item.subCat);

      const matchName = nameClean.includes(qClean) || item.name.toUpperCase().includes(qUpper);
      const matchDesc = descClean.includes(qClean);
      const matchPkg = pkgClean.includes(qClean);
      const matchCat = catClean.includes(qClean) || subClean.includes(qClean);
      const matchCode = item.code && item.code.includes(knowledgeSearchQuery);

      if (!matchName && !matchDesc && !matchPkg && !matchCat && !matchCode) {
        return false;
      }
    }

    return true;
  });

  // Hiển thị trạng thái bộ lọc
  if (statusEl) {
    if (knowledgeSearchQuery || knowledgeSourceFilter !== 'all' || knowledgeCategoryFilter !== 'all') {
      statusEl.innerHTML = `Tìm thấy <b class="text-cyan-300 font-mono">${filtered.length}</b> / ${totalCount} linh kiện phù hợp`;
    } else {
      statusEl.innerHTML = `Tổng cộng <b class="text-slate-200 font-mono">${totalCount}</b> linh kiện đã có sẵn mô tả trong database`;
    }
  }

  // Nếu không tìm thấy kết quả nào
  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyBox) {
      emptyBox.classList.remove('hidden');
      const emptyQuerySpan = document.getElementById('kdbEmptyQueryText');
      if (emptyQuerySpan) {
        emptyQuerySpan.textContent = knowledgeSearchQuery ? `"${knowledgeSearchQuery}"` : '';
      }
    }
    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
    return;
  }

  if (emptyBox) emptyBox.classList.add('hidden');

  // Cắt trang để render mượt mà
  const displayed = filtered.slice(0, knowledgeDisplayLimit);

  // Tạo HTML các thẻ linh kiện
  container.innerHTML = displayed.map(item => {
    let sourceBadge = '';
    let cardBorderClass = 'border-slate-800 hover:border-slate-700 bg-slate-900/80';

    if (item.isCustom) {
      sourceBadge = '<span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">⭐ Tự thêm</span>';
      cardBorderClass = 'border-amber-500/40 hover:border-amber-400 bg-amber-950/15 shadow-sm';
    } else if (item.source === 'logic74') {
      sourceBadge = '<span class="text-[10px] px-1.5 py-0.5 rounded font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Họ 74xx</span>';
    } else {
      sourceBadge = '<span class="text-[10px] px-1.5 py-0.5 rounded font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">Hệ thống</span>';
    }

    const safeName = escapeHtmlKdb(item.name);
    const safeDesc = escapeHtmlKdb(item.desc);
    const safePkg = escapeHtmlKdb(item.pkg);
    const safeCat = escapeHtmlKdb(item.cat);
    const safePinout = item.pinout ? escapeHtmlKdb(item.pinout) : '';

    return `
      <div class="${cardBorderClass} rounded-xl p-3 flex flex-col justify-between transition group">
        <div>
          <!-- Header thẻ -->
          <div class="flex items-start justify-between gap-1.5 mb-1.5">
            <div class="flex items-center gap-1.5 flex-wrap min-w-0">
              <span class="font-bold font-mono text-sm ${item.isCustom ? 'text-amber-300' : 'text-emerald-400'} truncate">${safeName}</span>
              ${sourceBadge}
              ${safePkg ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">${safePkg}</span>` : ''}
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700/80 text-slate-400 shrink-0 truncate max-w-[140px]">${safeCat}</span>
          </div>

          <!-- Nội dung mô tả -->
          <p class="text-xs text-slate-300 leading-relaxed mb-2 line-clamp-3" title="${safeDesc}">${safeDesc}</p>

          <!-- Ảnh sơ đồ chân (nếu có) -->
          ${safePinout ? `
            <div class="flex items-center gap-1.5 text-[10px] text-cyan-400 mb-2">
              <i data-lucide="image" class="w-3 h-3 text-cyan-400 shrink-0"></i>
              <a href="${safePinout}" target="_blank" rel="noopener noreferrer" class="hover:underline truncate max-w-[240px]">
                Xem sơ đồ chân (Pinout)
              </a>
            </div>
          ` : ''}
        </div>

        <!-- Footer nút thao tác -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-1.5 text-xs mt-1">
          <div class="flex items-center gap-1">
            ${item.isCustom ? `
              <button type="button" onclick="editKnowledgeItem('${escapeJsKdb(item.name)}')" class="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-medium flex items-center gap-1 transition" title="Chỉnh sửa mô tả linh kiện này">
                <i data-lucide="edit-2" class="w-3 h-3"></i> Sửa
              </button>
              <button type="button" onclick="deleteKnowledgeItem('${escapeJsKdb(item.name)}')" class="px-2 py-1 rounded-md bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-[11px] font-medium flex items-center gap-1 transition" title="Xóa khỏi Database">
                <i data-lucide="trash-2" class="w-3 h-3"></i> Xóa
              </button>
            ` : `
              <button type="button" onclick="editKnowledgeItem('${escapeJsKdb(item.name)}', true)" class="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-[11px] font-medium flex items-center gap-1 transition" title="Chỉnh sửa & Ghi đè mô tả này">
                <i data-lucide="copy" class="w-3 h-3"></i> Tùy chỉnh
              </button>
            `}
          </div>

          <button type="button" onclick="quickAddPartFromKnowledge('${escapeJsKdb(item.name)}')" class="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1 transition ml-auto" title="Thêm linh kiện này vào danh sách kho">
            <i data-lucide="plus" class="w-3 h-3"></i> Thêm vào kho
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Nút xem thêm
  if (loadMoreBtn) {
    if (filtered.length > knowledgeDisplayLimit) {
      loadMoreBtn.classList.remove('hidden');
      loadMoreBtn.innerHTML = `<i data-lucide="arrow-down" class="w-3.5 h-3.5"></i> Xem thêm 40 linh kiện nữa (Còn ${filtered.length - knowledgeDisplayLimit} linh kiện)`;
    } else {
      loadMoreBtn.classList.add('hidden');
    }
  }

  if (window.lucide) lucide.createIcons();
}

// 4. LƯU MÔ TẢ MỚI HOẶC CHỈNH SỬA VÀO DATABASE
async function saveKnowledgeForm(event) {
  if (event) event.preventDefault();

  const nameInput = document.getElementById('kdbFormName');
  const descInput = document.getElementById('kdbFormDesc');
  const pkgInput = document.getElementById('kdbFormPkg');
  const catInput = document.getElementById('kdbFormCat');
  const subInput = document.getElementById('kdbFormSubCat');
  const pinoutInput = document.getElementById('kdbFormPinout');

  const rawName = nameInput ? nameInput.value.trim() : '';
  const desc = descInput ? descInput.value.trim() : '';

  if (!rawName) {
    showKdbToast('Vui lòng nhập Tên / Mã linh kiện!', 'error');
    if (nameInput) nameInput.focus();
    return;
  }

  if (!desc) {
    showKdbToast('Vui lòng nhập Mô tả chức năng linh kiện!', 'error');
    if (descInput) descInput.focus();
    return;
  }

  const pkg = pkgInput ? pkgInput.value.trim() : '';
  const cat = catInput ? catInput.value.trim() : 'Logic IC';
  const subCat = subInput ? subInput.value.trim() : '';
  const pinout = pinoutInput ? pinoutInput.value.trim() : '';

  const entryData = {
    name: rawName,
    desc: desc,
    pkg: pkg,
    category: cat,
    subCategory: subCat,
    pinout: pinout,
    source: 'manual',
    savedAt: new Date().toISOString()
  };

  // Lưu vào Cache nội bộ và gửi lên Python server ghi file js/ai_cache.js
  if (typeof saveToAiCache === 'function') {
    await saveToAiCache(rawName, entryData);
  } else {
    // Fallback nếu hàm chưa nạp
    try {
      const local = JSON.parse(localStorage.getItem('ee_ai_cache') || '{}');
      local[rawName.toUpperCase()] = entryData;
      localStorage.setItem('ee_ai_cache', JSON.stringify(local));
    } catch(e) {}
  }

  showKdbToast(`✓ Đã lưu thành công mô tả cho "${rawName}" vào Database!`, 'success');

  // Reset form
  cancelEditKnowledgeItem();

  // Reset tìm kiếm và chuyển sang tab Custom để thấy ngay con vừa lưu
  setKnowledgeSourceFilter('custom');
}

// 5. CHỈNH SỬA / GHI ĐÈ MÔ TẢ CÓ SẴN
function editKnowledgeItem(targetName, isOverride = false) {
  const allEntries = getAllKnowledgeEntries();
  const item = allEntries.find(x => x.name.toUpperCase() === targetName.toUpperCase() || x.key === targetName.toUpperCase());
  if (!item) return;

  editingKnowledgeKey = item.name;
  editingKnowledgeIsOverride = isOverride;

  const nameInput = document.getElementById('kdbFormName');
  const descInput = document.getElementById('kdbFormDesc');
  const pkgInput = document.getElementById('kdbFormPkg');
  const catInput = document.getElementById('kdbFormCat');
  const subInput = document.getElementById('kdbFormSubCat');
  const pinoutInput = document.getElementById('kdbFormPinout');

  if (nameInput) {
    nameInput.value = item.name;
    // Khi sửa linh kiện tự thêm thì khóa tên, khi ghi đè linh kiện hệ thống thì giữ nguyên
    nameInput.readOnly = !isOverride;
  }
  if (descInput) descInput.value = item.desc || '';
  if (pkgInput) pkgInput.value = item.pkg || '';
  if (catInput && item.cat) catInput.value = item.cat;
  if (subInput) subInput.value = item.subCat || '';
  if (pinoutInput) pinoutInput.value = item.pinout || '';

  // Đổi tiêu đề form & nút bấm
  const titleEl = document.getElementById('kdbFormTitle');
  const submitBtn = document.getElementById('kdbFormSubmitBtn');
  const cancelBtn = document.getElementById('kdbFormCancelBtn');

  if (titleEl) {
    titleEl.innerHTML = isOverride 
      ? `✏️ Tùy chỉnh & Ghi đè mô tả hệ thống: <b class="text-cyan-300 font-mono">${item.name}</b>`
      : `✏️ Chỉnh sửa mô tả đã lưu: <b class="text-amber-300 font-mono">${item.name}</b>`;
  }
  if (submitBtn) {
    submitBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i> Cập nhật mô tả`;
  }
  if (cancelBtn) {
    cancelBtn.classList.remove('hidden');
  }

  // Cuộn mượt form vào tầm mắt và focus ô mô tả
  const formBox = document.getElementById('kdbFormBox');
  if (formBox) {
    formBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (descInput) descInput.focus();

  if (window.lucide) lucide.createIcons();
}

function cancelEditKnowledgeItem() {
  editingKnowledgeKey = null;
  editingKnowledgeIsOverride = false;

  const form = document.getElementById('kdbAddForm');
  if (form) form.reset();

  const nameInput = document.getElementById('kdbFormName');
  if (nameInput) nameInput.readOnly = false;

  const titleEl = document.getElementById('kdbFormTitle');
  const submitBtn = document.getElementById('kdbFormSubmitBtn');
  const cancelBtn = document.getElementById('kdbFormCancelBtn');

  if (titleEl) {
    titleEl.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4 text-cyan-400 inline mr-1"></i> Thêm mô tả linh kiện mới vào Database`;
  }
  if (submitBtn) {
    submitBtn.innerHTML = `<i data-lucide="save" class="w-3.5 h-3.5"></i> Lưu vào Database`;
  }
  if (cancelBtn) {
    cancelBtn.classList.add('hidden');
  }

  if (window.lucide) lucide.createIcons();
}

// 6. XÓA MÔ TẢ KHỎI DATABASE
async function deleteKnowledgeItem(targetName) {
  if (!confirm(`Bạn có chắc chắn muốn xóa mô tả của "${targetName}" khỏi Database không?\n(Sau khi xóa, khi nhập linh kiện này hệ thống sẽ không tự điền nữa)`)) {
    return;
  }

  if (typeof deleteFromAiCache === 'function') {
    await deleteFromAiCache(targetName);
  } else {
    try {
      const local = JSON.parse(localStorage.getItem('ee_ai_cache') || '{}');
      delete local[targetName.toUpperCase()];
      localStorage.setItem('ee_ai_cache', JSON.stringify(local));
    } catch(e) {}
  }

  showKdbToast(`Đã xóa "${targetName}" khỏi Database!`, 'info');
  renderKnowledgeList();
}

// 7. NHẤN NÚT "THÊM VÀO KHO" TỪ DATABASE
function quickAddPartFromKnowledge(targetName) {
  const allEntries = getAllKnowledgeEntries();
  const item = allEntries.find(x => x.name.toUpperCase() === targetName.toUpperCase() || x.key === targetName.toUpperCase());
  if (!item) return;

  closeKnowledgeModal();

  if (typeof openPartModal === 'function') {
    openPartModal();

    const nameInput = document.getElementById('partName');
    const descInput = document.getElementById('partDesc');
    const pkgInput = document.getElementById('partPackage');
    const catInput = document.getElementById('partCategory');
    const pinoutInput = document.getElementById('partPinout');

    if (nameInput) {
      nameInput.value = item.name;
    }
    if (descInput) {
      descInput.value = item.desc || '';
    }
    if (pkgInput && item.pkg) {
      pkgInput.value = item.pkg;
    }
    if (catInput && item.cat) {
      const matched = typeof findCategoryMatch === 'function' ? findCategoryMatch(item.cat) : item.cat;
      if (matched) catInput.value = matched;
      if (typeof handleCategoryChange === 'function') handleCategoryChange();
    }
    if (pinoutInput && item.pinout) {
      if (typeof selectPinoutThumb === 'function') {
        selectPinoutThumb(item.pinout);
      } else {
        pinoutInput.value = item.pinout;
      }
    }

    const locInput = document.getElementById('partLocation');
    if (locInput) locInput.focus();
  }
}

// 8. TÍNH NĂNG GỌI AI ĐIỀN NHANH VÀO FORM NẾU NGƯỜI DÙNG MUỐN
async function fetchAiForKnowledgeForm() {
  const nameInput = document.getElementById('kdbFormName');
  const descInput = document.getElementById('kdbFormDesc');
  const pkgInput = document.getElementById('kdbFormPkg');
  const catInput = document.getElementById('kdbFormCat');
  const subInput = document.getElementById('kdbFormSubCat');
  const aiBtn = document.getElementById('btnKdbAiSuggest');

  const rawName = nameInput ? nameInput.value.trim() : '';
  if (!rawName) {
    showKdbToast('Vui lòng nhập Mã linh kiện trước khi gọi AI gợi ý!', 'error');
    if (nameInput) nameInput.focus();
    return;
  }

  if (typeof fetchAiComponentOverview !== 'function') {
    showKdbToast('Chức năng AI Overview chưa sẵn sàng.', 'error');
    return;
  }

  const prevText = aiBtn ? aiBtn.innerHTML : '';
  if (aiBtn) {
    aiBtn.disabled = true;
    aiBtn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> Đang hỏi AI...`;
    if (window.lucide) lucide.createIcons();
  }

  try {
    const aiRes = await fetchAiComponentOverview(rawName);
    if (aiRes && aiRes.ok && aiRes.desc) {
      if (descInput) descInput.value = aiRes.desc;
      if (pkgInput && aiRes.pkg) pkgInput.value = aiRes.pkg;
      if (catInput && aiRes.category) {
        const matched = typeof findCategoryMatch === 'function' ? findCategoryMatch(aiRes.category) : aiRes.category;
        if (matched) catInput.value = matched;
      }
      if (subInput && aiRes.subCategory) subInput.value = aiRes.subCategory;
      showKdbToast(`✨ AI đã gợi ý mô tả cho "${rawName}"! Hãy kiểm tra và bấm "Lưu vào Database".`, 'success');
    } else {
      showKdbToast(aiRes.message || 'AI không phản hồi mã này. Bạn có thể tự gõ mô tả tay vào ô nhé!', 'error');
    }
  } catch(err) {
    showKdbToast('Lỗi khi gọi AI: ' + err.message, 'error');
  } finally {
    if (aiBtn) {
      aiBtn.disabled = false;
      aiBtn.innerHTML = prevText;
      if (window.lucide) lucide.createIcons();
    }
  }
}

// 9. THÔNG BÁO TOAST TRONG MODAL
let _kdbToastTimeout = null;
function showKdbToast(msg, type = 'info') {
  const toast = document.getElementById('kdbToast');
  if (!toast) return;

  clearTimeout(_kdbToastTimeout);

  let borderCol = 'border-cyan-500/40 bg-slate-900 text-cyan-300';
  let icon = 'info';

  if (type === 'success') {
    borderCol = 'border-emerald-500/50 bg-emerald-950/90 text-emerald-300';
    icon = 'check-circle';
  } else if (type === 'error') {
    borderCol = 'border-rose-500/50 bg-rose-950/90 text-rose-300';
    icon = 'alert-triangle';
  }

  toast.className = `fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-xl text-xs font-medium transition-all duration-300 transform translate-y-0 opacity-100 ${borderCol}`;
  toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i> <span>${msg}</span>`;

  if (window.lucide) lucide.createIcons();

  _kdbToastTimeout = setTimeout(() => {
    toast.className = 'hidden';
  }, 4000);
}

// 10. NHẬP FILE DATABASE CACHE TỪ JSON
function importKnowledgeCache(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const text = e.target.result;
      let importedData = null;

      // Xử lý cả file .json thuần hoặc file .js (ai_cache.js)
      try {
        importedData = JSON.parse(text);
      } catch(err1) {
        const m = text.match(/const\s+AI_CACHE\s*=\s*(\{[\s\S]*?\});/);
        if (m) {
          importedData = JSON.parse(m[1]);
        }
      }

      if (!importedData || typeof importedData !== 'object') {
        alert('File không hợp lệ hoặc không có dữ liệu linh kiện.');
        return;
      }

      let count = 0;
      for (const [k, v] of Object.entries(importedData)) {
        if (v && v.desc) {
          await saveToAiCache(k, v);
          count++;
        }
      }

      showKdbToast(`✓ Đã nạp thành công ${count} linh kiện vào Database!`, 'success');
      renderKnowledgeList();
    } catch(err) {
      alert('Lỗi đọc file: ' + err.message);
    }
  };
  reader.readAsText(file, 'utf-8');
}

// Helper tránh lỗi HTML Injection
function escapeHtmlKdb(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsKdb(str) {
  if (!str) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// Đồng bộ UI khi có thay đổi từ AI hoặc module khác
function updateKnowledgeDbUI() {
  const modal = document.getElementById('knowledgeModal');
  if (modal && !modal.classList.contains('hidden')) {
    renderKnowledgeList();
  }
}

// Gắn các hàm ra window để truy cập từ HTML onclick
if (typeof window !== 'undefined') {
  window.openKnowledgeModal = openKnowledgeModal;
  window.closeKnowledgeModal = closeKnowledgeModal;
  window.setKnowledgeSourceFilter = setKnowledgeSourceFilter;
  window.setKnowledgeCategoryFilter = setKnowledgeCategoryFilter;
  window.setKnowledgeSearch = setKnowledgeSearch;
  window.clearKnowledgeSearch = clearKnowledgeSearch;
  window.loadMoreKnowledge = loadMoreKnowledge;
  window.saveKnowledgeForm = saveKnowledgeForm;
  window.editKnowledgeItem = editKnowledgeItem;
  window.cancelEditKnowledgeItem = cancelEditKnowledgeItem;
  window.deleteKnowledgeItem = deleteKnowledgeItem;
  window.quickAddPartFromKnowledge = quickAddPartFromKnowledge;
  window.fetchAiForKnowledgeForm = fetchAiForKnowledgeForm;
  window.importKnowledgeCache = importKnowledgeCache;
  window.updateKnowledgeDbUI = updateKnowledgeDbUI;
}
