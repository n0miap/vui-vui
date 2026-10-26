// =========================================================================
// MODULE: MAIN APP CONTROLLER (ĐIỀU KHIỂN CHÍNH, RENDER KHO & FORM LINH KIỆN)
// =========================================================================

    function init() {
      // Đảm bảo categories là mảng hợp lệ, loại bỏ trùng lặp và bao gồm các phân loại đang có của parts
      if (!Array.isArray(categories) || categories.length === 0) {
        categories = [...DEFAULT_CATEGORIES];
      }
      categories = Array.from(new Set(categories.map(c => (c || '').trim()).filter(Boolean)));
      const existingPartCats = parts.map(p => p.category).filter(Boolean);
      existingPartCats.forEach(cat => {
        const trimmed = cat.trim();
        if (trimmed && !categories.includes(trimmed)) categories.push(trimmed);
      });
      categories = Array.from(new Set(categories.map(c => (c || '').trim()).filter(Boolean)));

      // Đảm bảo projects là mảng hợp lệ và thu thập các project từ parts nếu có
      if (!Array.isArray(projects) || projects.length === 0) {
        projects = [...DEFAULT_PROJECTS];
      }
      const existingProjectNames = Array.from(new Set(parts.map(p => p.project).filter(Boolean)));
      existingProjectNames.forEach(name => {
        if (!projects.some(pr => pr.name.toLowerCase() === name.toLowerCase())) {
          projects.push({ id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), name, note: '' });
        }
      });

      // Đảm bảo dữ liệu cũ có đầy đủ các trường mới
      boxes = boxes.map(b => ({
        ...b,
        dividedCells: Array.isArray(b.dividedCells) ? b.dividedCells : [],
        mergedPairs: Array.isArray(b.mergedPairs) ? b.mergedPairs : []
      }));

      parts = parts.map(p => {
        let cleanCell = p.cell || '';
        let cleanSubCell = p.subCell || '';
        if (cleanCell.includes('-')) {
          const arr = cleanCell.split('-');
          cleanCell = arr[0];
          if (!cleanSubCell && arr[1]) cleanSubCell = arr[1];
        }
        return {
          pinout: p.pinout ? p.pinout.trim().replace(/ /g, '%20') : '',
          inUse: Number(p.inUse || 0),
          minQty: p.minQty !== undefined ? Number(p.minQty) : 2,
          project: p.project || '',
          boxId: p.boxId || '',
          cell: cleanCell,
          subCell: cleanSubCell,
          favorite: !!p.favorite,
          datasheet: p.datasheet || '',
          buyUrl: p.buyUrl || '',
          category: p.category || categories[0] || 'Thụ động / Khác',
          ...p,
          cell: cleanCell,
          subCell: cleanSubCell,
          favorite: !!p.favorite,
          buyShops: p.buyShops || generateShopLinksForPart(p.name, p.package || ''),
          minPrice: p.minPrice || getMinPriceString(p.buyShops || generateShopLinksForPart(p.name, p.package || ''))
        };
      });

      activePreviewBoxId = boxes[0]?.id || null;
      setViewMode('all');
      renderCategories();
      populateCategorySelect();
      populateProjectDatalist();
      renderProjectQuickChips();
      renderParts();
      updateSyncBadge();
      if (cloudUrl) pullFromCloud(true);
    }

    // CHUYỂN TAB CHẾ ĐỘ XEM (TẤT CẢ / ĐÃ GHIM / ĐANG CẮM MẠCH / CẦN MUA)
    function setViewMode(mode) {
      currentViewMode = mode;
      if (mode !== 'inuse') {
        selectedInUseProject = 'all';
      }
      ['all', 'favorite', 'inuse', 'shopping'].forEach(m => {
        const btn = document.getElementById('tabMode_' + m);
        if (!btn) return;
        if (m === mode) {
          btn.className = 'whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition bg-emerald-600 text-white shadow flex items-center justify-center gap-1';
        } else {
          btn.className = 'whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition text-slate-400 hover:text-white flex items-center justify-center gap-1';
        }
      });
      renderParts();
    }

    function renderCategories() {
      const container = document.getElementById('categoryTabs');
      if (!container) return;
      const allTabs = ['Tất cả', ...categories];
      const tabsHtml = allTabs.map(cat => {
        const active = cat === currentCategory 
          ? 'bg-slate-200 text-slate-900 border-white font-semibold' 
          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200';
        const escaped = cat.replace(/'/g, "\\'");
        return `<button onclick="setCategory('${escaped}')" class="whitespace-nowrap px-3 py-1 rounded-lg text-xs border transition ${active}">${cat}</button>`;
      }).join('');

      const manageBtn = `
        <button onclick="openCategoriesModal()" class="shrink-0 px-2.5 py-1 rounded-lg text-xs border border-dashed border-slate-700 hover:border-emerald-500/60 text-slate-400 hover:text-emerald-300 transition flex items-center gap-1 bg-slate-900/60" title="Quản lý & Thêm bớt phân loại">
          <i data-lucide="sliders" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span>Quản lý phân loại</span>
        </button>
      `;

      container.innerHTML = tabsHtml + manageBtn;
      renderLogicSubCategoryBar();
      lucide.createIcons();
    }

    function setCategory(cat) {
      currentCategory = cat;
      if (!isLogicCategory(cat)) {
        currentLogicSubCategory = 'Tất cả';
      }
      renderCategories();
      renderParts();
    }



    // ================= QUẢN LÝ DANH MỤC PHÂN LOẠI & TÁCH LINH KIỆN =================
    let currentSplittingCategory = null;

    function openCategoriesModal() {
      cancelSplitCategory();
      const input = document.getElementById('newCategoryInput');
      if (input) input.value = '';
      renderCategoriesList();
      document.getElementById('categoriesModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeCategoriesModal() {
      cancelSplitCategory();
      document.getElementById('categoriesModal').classList.add('hidden');
    }

    function renderCategoriesList() {
      const list = document.getElementById('categoriesList');
      const badge = document.getElementById('categoriesCountBadge');
      if (badge) badge.innerText = `${categories.length} phân loại`;

      if (categories.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500 py-3 text-center">Chưa có phân loại nào. Hãy thêm ở ô trên.</p>`;
        return;
      }

      list.innerHTML = categories.map((cat, idx) => {
        const count = parts.filter(p => p.category === cat).length;
        const isFirst = idx === 0;
        const isLast = idx === categories.length - 1;
        const escaped = cat.replace(/'/g, "\\'");

        return `
        <div class="p-2.5 rounded-xl border border-slate-800 bg-slate-800/60 hover:border-slate-700 transition flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <!-- Nút di chuyển thứ tự -->
            <div class="flex flex-col gap-0.5 shrink-0">
              <button onclick="moveCategory(${idx}, -1)" ${isFirst ? 'disabled class="opacity-20 cursor-not-allowed"' : 'class="hover:text-amber-400 text-slate-400"'} title="Chuyển lên trước">
                <i data-lucide="chevron-up" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="moveCategory(${idx}, 1)" ${isLast ? 'disabled class="opacity-20 cursor-not-allowed"' : 'class="hover:text-amber-400 text-slate-400"'} title="Chuyển xuống sau">
                <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
              </button>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-bold text-xs text-white truncate">${cat}</span>
                <span class="text-[10px] font-mono px-1.5 py-0.2 rounded ${count > 0 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-slate-900 text-slate-500'}">
                  ${count} linh kiện
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1 shrink-0">
            <button onclick="openSplitCategory('${escaped}')" class="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition flex items-center gap-1" title="Tách các linh kiện trong nhóm này sang nhóm khác">
              <i data-lucide="scissors" class="w-3 h-3"></i> Tách bớt
            </button>
            <button onclick="renameCategory('${escaped}')" class="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition" title="Đổi tên phân loại này">
              <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="deleteCategory('${escaped}')" class="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition" title="Xóa phân loại này">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>`;
      }).join('');
      lucide.createIcons();
    }

    function addCategory(e) {
      if (e) e.preventDefault();
      const input = document.getElementById('newCategoryInput');
      const val = input.value.trim();
      if (!val) return;
      if (categories.some(c => c.toLowerCase() === val.toLowerCase())) {
        return alert(`Phân loại "${val}" đã có trong danh sách rồi!`);
      }
      categories.push(val);
      input.value = '';
      saveData();
      renderCategories();
      renderCategoriesList();
      populateCategorySelect(val);
    }

    function renameCategory(oldName) {
      const newName = prompt(`Nhập tên mới cho phân loại "${oldName}":`, oldName);
      if (!newName) return;
      const trimmed = newName.trim();
      if (!trimmed || trimmed === oldName) return;
      if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase() && c !== oldName)) {
        return alert(`Phân loại "${trimmed}" đã tồn tại!`);
      }
      const idx = categories.indexOf(oldName);
      if (idx > -1) {
        categories[idx] = trimmed;
      }
      let count = 0;
      parts.forEach(p => {
        if (p.category === oldName) {
          p.category = trimmed;
          count++;
        }
      });
      if (currentCategory === oldName) currentCategory = trimmed;
      saveData();
      renderCategories();
      renderCategoriesList();
      renderParts();
      populateCategorySelect(trimmed);
      alert(`Đã đổi tên thành "${trimmed}" và cập nhật ${count} linh kiện!`);
    }

    function deleteCategory(catName) {
      if (categories.length <= 1) {
        return alert('Bạn cần giữ lại ít nhất 1 phân loại!');
      }
      const affected = parts.filter(p => p.category === catName);
      if (affected.length > 0) {
        const others = categories.filter(c => c !== catName);
        const target = prompt(
          `Phân loại "${catName}" hiện đang có ${affected.length} linh kiện.\n` +
          `Nhập tên phân loại muốn chuyển các linh kiện này sang:\n(Gợi ý: ${others.join(', ')})`,
          others[0]
        );
        if (target === null) return;
        const targetTrimmed = target.trim();
        if (!targetTrimmed) return alert('Tên phân loại không hợp lệ.');
        if (!categories.includes(targetTrimmed)) {
          categories.push(targetTrimmed);
        }
        affected.forEach(p => p.category = targetTrimmed);
      }
      categories = categories.filter(c => c !== catName);
      if (currentCategory === catName) currentCategory = 'Tất cả';
      saveData();
      renderCategories();
      renderCategoriesList();
      renderParts();
      populateCategorySelect();
    }

    function moveCategory(idx, dir) {
      const targetIdx = idx + dir;
      if (targetIdx < 0 || targetIdx >= categories.length) return;
      const tmp = categories[idx];
      categories[idx] = categories[targetIdx];
      categories[targetIdx] = tmp;
      saveData();
      renderCategories();
      renderCategoriesList();
    }

    function resetCategoriesToDefault() {
      if (!confirm('Khôi phục danh sách phân loại về mặc định chuẩn? (Linh kiện của bạn vẫn được giữ nguyên)')) return;
      const partCats = parts.map(p => p.category).filter(Boolean);
      categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...partCats]));
      saveData();
      renderCategories();
      renderCategoriesList();
      populateCategorySelect();
    }

    // TÁCH / CHIA BỚT LINH KIỆN TỪ 1 NHÓM
    function openSplitCategory(sourceCat) {
      currentSplittingCategory = sourceCat;
      const panel = document.getElementById('splitCategoryPanel');
      document.getElementById('splitSourceCatName').innerText = sourceCat;
      
      const targetSelect = document.getElementById('splitTargetCatSelect');
      const otherCats = categories.filter(c => c !== sourceCat);
      targetSelect.innerHTML = otherCats.map(c => `<option value="${c}">${c}</option>`).join('') +
        `<option value="__NEW__">+ Tạo nhóm phân loại mới...</option>`;
      document.getElementById('splitTargetCatNew').value = '';

      const catParts = parts.filter(p => p.category === sourceCat);
      const listEl = document.getElementById('splitPartsList');

      if (catParts.length === 0) {
        listEl.innerHTML = `<p class="text-xs text-slate-500 py-3 text-center">Nhóm "${sourceCat}" hiện không có linh kiện nào.</p>`;
      } else {
        listEl.innerHTML = catParts.map(p => `
          <label class="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-200 cursor-pointer border border-transparent hover:border-slate-700 transition">
            <div class="flex items-center gap-2 min-w-0">
              <input type="checkbox" name="splitPartItem" value="${p.id}" class="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 cursor-pointer shrink-0">
              <span class="font-bold text-white">${p.name}</span>
              <span class="text-slate-400 text-[11px] truncate">(${p.desc || p.package || 'Không mô tả'})</span>
            </div>
            <span class="text-[10px] font-mono text-emerald-400 shrink-0 ml-2">x${p.qty}</span>
          </label>
        `).join('');
      }

      panel.classList.remove('hidden');
      document.getElementById('categoriesModalBody').scrollTop = 0;
      lucide.createIcons();
    }

    function cancelSplitCategory() {
      currentSplittingCategory = null;
      const panel = document.getElementById('splitCategoryPanel');
      if (panel) panel.classList.add('hidden');
    }

    function handleSplitTargetChange() {
      const select = document.getElementById('splitTargetCatSelect');
      const newInput = document.getElementById('splitTargetCatNew');
      if (select.value === '__NEW__') {
        newInput.focus();
      }
    }

    let isAllSplitSelected = false;
    function toggleSelectAllSplitParts() {
      isAllSplitSelected = !isAllSplitSelected;
      const cbs = document.querySelectorAll('input[name="splitPartItem"]');
      cbs.forEach(cb => cb.checked = isAllSplitSelected);
      const btn = document.getElementById('btnSelectAllSplit');
      if (btn) btn.innerText = isAllSplitSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả';
    }

    function executeSplitCategory() {
      if (!currentSplittingCategory) return;
      const select = document.getElementById('splitTargetCatSelect');
      const newInput = document.getElementById('splitTargetCatNew');
      let targetCat = newInput.value.trim();

      if (!targetCat) {
        if (select.value === '__NEW__') {
          return alert('Hãy nhập tên nhóm phân loại mới cần tạo!');
        }
        targetCat = select.value;
      }

      if (!targetCat) return alert('Vui lòng chọn hoặc nhập nhóm đích!');
      if (targetCat === currentSplittingCategory) {
        return alert('Nhóm đích phải khác nhóm nguồn!');
      }

      const checkedBoxes = Array.from(document.querySelectorAll('input[name="splitPartItem"]:checked'));
      if (checkedBoxes.length === 0) {
        return alert('Hãy tích chọn ít nhất 1 linh kiện bạn muốn chuyển sang nhóm mới!');
      }

      if (!categories.includes(targetCat)) {
        categories.push(targetCat);
      }

      const ids = checkedBoxes.map(cb => cb.value);
      parts.forEach(p => {
        if (ids.includes(p.id)) {
          p.category = targetCat;
        }
      });

      saveData();
      renderCategories();
      renderCategoriesList();
      renderParts();
      populateCategorySelect();
      cancelSplitCategory();
      alert(`Đã chuyển thành công ${ids.length} linh kiện sang nhóm "${targetCat}"!`);
    }

    function populateCategorySelect(selectedCategory = '') {
      const sel = document.getElementById('partCategory');
      if (!sel) return;
      // Loại bỏ trùng lặp trong categories
      categories = Array.from(new Set(categories.map(c => (c || '').trim()).filter(Boolean)));
      let target = selectedCategory;
      if (!target && currentCategory !== 'Tất cả') target = currentCategory;
      if (!target && categories.length > 0) target = categories[0];

      // Tìm phân loại khớp tốt nhất (ưu tiên nhóm Logic IC nếu target là Logic IC)
      const matched = findCategoryMatch(target);
      if (matched && categories.includes(matched)) target = matched;

      let opts = categories.map(cat => `<option value="${cat}" ${cat === target ? 'selected' : ''}>${cat}</option>`).join('');
      if (target && !categories.includes(target)) {
        opts = `<option value="${target}" selected>${target}</option>` + opts;
      }
      sel.innerHTML = opts;
    }



    function toggleFavorite(id, event) {
      if (event) event.stopPropagation();
      const p = parts.find(x => x.id === id);
      if (!p) return;
      p.favorite = !p.favorite;
      saveData();
      renderParts();
    }

    // RENDER DANH SÁCH LINH KIỆN
    function renderParts() {
      const query = document.getElementById('searchInput').value.toLowerCase().trim();
      const grid = document.getElementById('partsGrid');

      // Cập nhật thống kê
      const totalInBox = parts.reduce((s, p) => s + Number(p.qty || 0), 0);
      const totalInUse = parts.reduce((s, p) => s + Number(p.inUse || 0), 0);
      const inUseItemsCount = parts.filter(p => Number(p.inUse) > 0).length;
      const shoppingCount = parts.filter(p => (Number(p.qty) + Number(p.inUse || 0)) <= Number(p.minQty ?? 2)).length;
      const favoriteCount = parts.filter(p => !!p.favorite).length;

      document.getElementById('statTotalTypes').innerText = parts.length;
      document.getElementById('statInBox').innerText = totalInBox;
      document.getElementById('statInUse').innerText = totalInUse;
      document.getElementById('statBoxes').innerText = boxes.length;
      document.getElementById('badgeInUse').innerText = inUseItemsCount;
      document.getElementById('badgeShopping').innerText = shoppingCount;
      const badgeFav = document.getElementById('badgeFavorite');
      if (badgeFav) badgeFav.innerText = favoriteCount;

      renderInUseProjectFilterBar();
      update74AchievementHeaderBadge();

      const filtered = parts.filter(p => {
        const matchCat = currentCategory === 'Tất cả' || p.category === currentCategory;
        let matchSubCat = true;
        if (isLogicCategory(currentCategory) && currentLogicSubCategory && currentLogicSubCategory !== 'Tất cả') {
          const actualSub = p.subCategory || determineLogicSubcategory(p.name, p.desc);
          matchSubCat = (actualSub === currentLogicSubCategory);
        }
        let matchMode = true;
        if (currentViewMode === 'all') matchMode = true;
        else if (currentViewMode === 'favorite') matchMode = !!p.favorite;
        else if (currentViewMode === 'inuse') {
          if (Number(p.inUse) <= 0) matchMode = false;
          else if (!selectedInUseProject || selectedInUseProject === 'all') matchMode = true;
          else if (selectedInUseProject === '__unassigned__') matchMode = !p.project;
          else matchMode = p.project && p.project.toLowerCase() === selectedInUseProject.toLowerCase();
        } else if (currentViewMode === 'shopping') {
          matchMode = (Number(p.qty) + Number(p.inUse || 0)) <= Number(p.minQty ?? 2);
        }
        let match74Search = false;
        if (query) {
          const q74 = query.match(/^74(?:xx)?(\d{2,4})$/i);
          if (q74) {
            match74Search = isMatching74Code(p.name, q74[1]);
          }
        }
        const matchSearch = match74Search ||
                            p.name.toLowerCase().includes(query) ||
                            (p.desc && p.desc.toLowerCase().includes(query)) ||
                            (p.location && p.location.toLowerCase().includes(query)) ||
                            (p.project && p.project.toLowerCase().includes(query)) ||
                            (p.package && p.package.toLowerCase().includes(query));
        return matchCat && matchSubCat && matchMode && matchSearch;
      });

      // Ưu tiên hiển thị linh kiện Ghim (Favorite) lên đầu danh sách
      filtered.sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return 0;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 text-sm bg-slate-900/40 rounded-2xl border border-slate-800/80">
          Không có linh kiện nào trong mục này.
        </div>`;
        return;
      }

      grid.innerHTML = filtered.map(p => {
        const total = Number(p.qty) + Number(p.inUse || 0);
        const needBuy = total <= Number(p.minQty ?? 2);
        const isOutBox = Number(p.qty) === 0;
        const qtyBadge = isOutBox ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                       : needBuy ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                       : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

        const inStockAlts = (isOutBox || needBuy) ? findInStockReplacements(p.name, p.id) : [];

        const cardBorder = p.favorite 
          ? 'border-amber-500/60 shadow-md shadow-amber-950/20' 
          : needBuy 
          ? 'border-rose-500/40' 
          : 'border-slate-700/80';

        return `
        <div class="bg-slate-800/75 border ${cardBorder} rounded-2xl p-3.5 flex flex-col justify-between gap-3 hover:border-slate-600 transition">
          <div>
            <!-- Hàng tên, nút ghim & nút sửa -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h3 class="font-bold text-base text-white tracking-wide truncate">${p.name}</h3>
                  ${p.favorite ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-medium"><i data-lucide="star" class="w-2.5 h-2.5 fill-amber-300"></i>Ghim</span>` : ''}
                  ${p.package ? `<span class="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">${p.package}</span>` : ''}
                  ${isLogicCategory(p.category) ? `<span class="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">${p.subCategory || determineLogicSubcategory(p.name, p.desc)}</span>` : ''}
                  ${needBuy ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">Sắp hết</span>` : ''}
                </div>
                <p class="text-xs text-slate-400 mt-0.5 line-clamp-1">${p.desc || p.category}</p>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button onclick="toggleFavorite('${p.id}', event)" class="p-1 rounded-lg hover:bg-slate-700/80 transition ${p.favorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}" title="${p.favorite ? 'Bỏ ghim' : 'Ghim linh kiện lên đầu'}">
                  <i data-lucide="star" class="w-4 h-4 ${p.favorite ? 'fill-amber-400' : ''}"></i>
                </button>
                <button onclick="openPartModal('${p.id}')" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/80 transition" title="Chỉnh sửa">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
              </div>
            </div>

            <!-- Nút bấm mở Sơ Đồ Hộp Nhựa (hỗ trợ ngăn con) -->
            <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
              <button onclick="locateInBox('${p.boxId}', '${p.cell}', '${p.subCell || ''}')" class="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 px-2.5 py-1 rounded-lg transition max-w-full" title="Bấm để xem vị trí ô trên sơ đồ hộp">
                <i data-lucide="grid" class="w-3.5 h-3.5 shrink-0"></i>
                <span class="truncate max-w-[150px] sm:max-w-none">${p.location}</span>
                ${p.subCell ? `<span class="px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-200 text-[10px] font-mono font-semibold shrink-0">Ngăn ${p.subCell}</span>` : ''}
              </button>
              ${p.datasheet ? `<a href="${p.datasheet}" target="_blank" class="text-[11px] px-2 py-1 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-sky-300 flex items-center gap-1"><i data-lucide="file-text" class="w-3 h-3"></i>PDF</a>` : ''}
              <button onclick="openBuyModal('${p.id}')" class="text-[11px] px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition" title="So sánh giá & Đặt mua từ 4 shop: Tuyết Nga, HShop, Caka, Shopee">
                <i data-lucide="shopping-bag" class="w-3 h-3 text-rose-400"></i>
                <span>Mua</span>
                ${p.minPrice ? `<span class="text-[10px] text-amber-300 font-mono font-bold ml-0.5">(${p.minPrice})</span>` : ''}
              </button>
              <button onclick="openReplaceModal('${p.id}')" class="text-[11px] px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition" title="Tra cứu IC thay thế tương đương & đối chiếu kho">
                <i data-lucide="git-compare" class="w-3 h-3 text-emerald-400"></i>
                <span>Thay thế</span>
              </button>
            </div>

            ${inStockAlts.length > 0 ? `
              <div class="mt-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] text-emerald-300">
                <span class="flex items-center gap-1.5 truncate">
                  <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i>
                  <span class="truncate">Sẵn có thay thế: <b>${inStockAlts[0].name}</b> (${inStockAlts[0].qty} con)</span>
                </span>
                <button onclick="openReplaceModal('${p.id}')" class="text-[11px] text-emerald-400 hover:text-emerald-200 underline font-medium ml-1 shrink-0">Xem</button>
              </div>
            ` : ''}

            <!-- Trạng thái Đang cắm trên mạch (Breadboard) -->
            <div class="mt-2.5 bg-slate-900/70 border border-slate-800 rounded-xl p-2 flex items-center justify-between text-xs">
              <div class="flex items-center gap-1.5 min-w-0">
                <i data-lucide="zap" class="w-3.5 h-3.5 ${p.inUse > 0 ? 'text-sky-400' : 'text-slate-600'} shrink-0"></i>
                <div class="truncate">
                  <span class="${p.inUse > 0 ? 'text-sky-300 font-medium' : 'text-slate-500'}">Cắm mạch: ${p.inUse || 0}</span>
                  ${p.project ? `<span class="text-slate-400 text-[11px] block truncate" title="${p.project}">• ${p.project}</span>` : ''}
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0 ml-2">
                <button onclick="moveStock('${p.id}', 'to_board')" class="px-2 py-1 rounded bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-[11px] font-medium transition active:scale-95" title="Lấy 1 con từ hộp cắm lên mạch">
                  → Mạch
                </button>
                ${p.inUse > 0 ? `
                <button onclick="moveStock('${p.id}', 'to_box')" class="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition active:scale-95" title="Rút 1 con từ mạch cất lại vào hộp">
                  ← Hộp
                </button>` : ''}
              </div>
            </div>
          </div>

          <!-- Cụm nút Pinout & Tăng giảm số lượng Trong Hộp -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-700/60">
            <button onclick="openPinoutModal('${p.id}')" class="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-200 transition active:scale-95">
              <i data-lucide="cpu" class="w-3.5 h-3.5 text-emerald-400"></i>
              Pinout & Note
            </button>

            <div class="flex items-center gap-1.5">
              <span class="text-[11px] text-slate-400 mr-0.5">Trong hộp:</span>
              <button onclick="changeQty('${p.id}', -1)" class="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-slate-700 hover:bg-rose-600/80 active:scale-95 text-white font-bold flex items-center justify-center transition text-sm sm:text-xs" aria-label="Giảm 1">-</button>
              <span class="min-w-[40px] text-center font-mono font-bold text-sm py-0.5 px-2 rounded-lg border ${qtyBadge}">${p.qty}</span>
              <button onclick="changeQty('${p.id}', 1)" class="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-slate-700 hover:bg-emerald-600/80 active:scale-95 text-white font-bold flex items-center justify-center transition text-sm sm:text-xs" aria-label="Tăng 1">+</button>
            </div>
          </div>
        </div>`;
      }).join('');

      lucide.createIcons();
    }

    // THAO TÁC SỐ LƯỢNG TRONG HỘP & CẮM MẠCH
    function changeQty(id, delta) {
      const p = parts.find(x => x.id === id);
      if (!p) return;
      p.qty = Math.max(0, Number(p.qty) + delta);
      saveData();
      renderParts();
    }

    function moveStock(id, direction) {
      const p = parts.find(x => x.id === id);
      if (!p) return;
      if (direction === 'to_board') {
        if (Number(p.qty) <= 0) return alert('Trong hộp đã hết linh kiện này để lấy ra cắm mạch!');
        if (!p.project) {
          const proj = prompt('Bạn đang cắm linh kiện này lên mạch / breadboard nào? (Có thể bỏ trống):', '');
          if (proj !== null) p.project = proj.trim();
        }
        p.qty = Number(p.qty) - 1;
        p.inUse = Number(p.inUse || 0) + 1;
      } else {
        if (Number(p.inUse) <= 0) return;
        p.inUse = Number(p.inUse) - 1;
        p.qty = Number(p.qty) + 1;
        if (p.inUse === 0) p.project = '';
      }
      saveData();
      renderParts();
    }



    function openPartModal(id = null, presetBoxId = null, presetCell = null, presetSubCell = null) {
      const btnDel = document.getElementById('btnDeletePart');
      if (id) {
        const p = parts.find(x => x.id === id);
        document.getElementById('modalFormTitle').innerText = 'Chỉnh Sửa Linh Kiện';
        document.getElementById('partId').value = p.id;
        document.getElementById('partName').value = p.name;
        document.getElementById('partPackage').value = p.package || '';
        document.getElementById('partFavorite').checked = !!p.favorite;
        document.getElementById('partQty').value = p.qty;
        document.getElementById('partInUse').value = p.inUse || 0;
        document.getElementById('partMinQty').value = p.minQty ?? 2;
        document.getElementById('partProject').value = p.project || '';
        const editCatVal = p.category || (categories[0] || '');
        populateCategorySelect(editCatVal);
        handleCategoryChange(editCatVal);
        const subSelect = document.getElementById('partSubCategory');
        if (subSelect) {
          subSelect.value = p.subCategory || (isLogicCategory(editCatVal) ? determineLogicSubcategory(p.name, p.desc) : '');
        }
        document.getElementById('partDesc').value = p.desc || '';
        populateProjectDatalist();
        renderProjectQuickChips();
        const autoBadge = document.getElementById('descAutoBadge');
        if (autoBadge) autoBadge.classList.add('hidden');
        populateBoxSelect(p.boxId || '');
        document.getElementById('partCell').value = p.cell || '';
        document.getElementById('partSubCell').value = p.subCell || '';
        document.getElementById('partLocation').value = p.location || '';
        document.getElementById('partPinout').value = p.pinout || '';
        if (p.pinout) showPinoutPreview(p.pinout);
        else hidePinoutPreview();
        const pinoutResults = document.getElementById('pinoutAutoResults');
        if (pinoutResults) pinoutResults.classList.add('hidden');
        document.getElementById('partDatasheet').value = p.datasheet || '';
        document.getElementById('partBuyUrl').value = p.buyUrl || '';
        document.getElementById('partNotes').value = p.notes || '';
        btnDel.classList.remove('hidden');
      } else {
        document.getElementById('modalFormTitle').innerText = 'Thêm Linh Kiện Mới';
        document.getElementById('partId').value = '';
        document.getElementById('partName').value = '';
        document.getElementById('partPackage').value = '';
        document.getElementById('partFavorite').checked = false;
        document.getElementById('partQty').value = 5;
        document.getElementById('partInUse').value = 0;
        document.getElementById('partMinQty').value = 2;
        document.getElementById('partProject').value = '';
        document.getElementById('partDesc').value = '';
        const newCatVal = currentCategory !== 'Tất cả' ? currentCategory : (categories[0] || '');
        populateCategorySelect(newCatVal);
        handleCategoryChange(newCatVal);
        const newSubSelect = document.getElementById('partSubCategory');
        if (newSubSelect) newSubSelect.value = '';
        populateProjectDatalist();
        renderProjectQuickChips();
        const autoBadge = document.getElementById('descAutoBadge');
        if (autoBadge) autoBadge.classList.add('hidden');
        const defaultBox = presetBoxId || boxes[0]?.id || '';
        populateBoxSelect(defaultBox);
        document.getElementById('partCell').value = presetCell || 'A1';
        document.getElementById('partSubCell').value = presetSubCell || '';
        document.getElementById('partPinout').value = '';
        hidePinoutPreview();
        const pinoutResults = document.getElementById('pinoutAutoResults');
        if (pinoutResults) pinoutResults.classList.add('hidden');
        document.getElementById('partDatasheet').value = '';
        document.getElementById('partBuyUrl').value = '';
        document.getElementById('partNotes').value = '';
        btnDel.classList.add('hidden');
      }
      renderPickerGrid();
      updateLocationTextFromGrid();
      document.getElementById('partModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closePartModal() {
      document.getElementById('partModal').classList.add('hidden');
    }

    function savePart(e) {
      e.preventDefault();
      const id = document.getElementById('partId').value;
      const boxId = document.getElementById('partBoxId').value;
      const cell = document.getElementById('partCell').value.trim().toUpperCase();
      const subCell = document.getElementById('partSubCell').value;
      const favorite = document.getElementById('partFavorite').checked;

      // Nếu chọn subCell 1 hoặc 2, đảm bảo box.dividedCells có cell này
      if (boxId && cell && (subCell === '1' || subCell === '2')) {
        const targetBox = boxes.find(b => b.id === boxId);
        if (targetBox) {
          if (!targetBox.dividedCells) targetBox.dividedCells = [];
          if (!targetBox.dividedCells.includes(cell)) {
            targetBox.dividedCells.push(cell);
          }
        }
      }

      const newPart = {
        id: id || ('p_' + Date.now()),
        name: document.getElementById('partName').value.trim(),
        package: document.getElementById('partPackage').value.trim(),
        favorite: favorite,
        qty: Number(document.getElementById('partQty').value),
        inUse: Number(document.getElementById('partInUse').value || 0),
        minQty: Number(document.getElementById('partMinQty').value || 0),
        project: document.getElementById('partProject').value.trim(),
        category: document.getElementById('partCategory').value.trim() || (categories[0] || 'Thụ động / Khác'),
        subCategory: isLogicCategory(document.getElementById('partCategory').value.trim())
          ? (document.getElementById('partSubCategory')?.value || determineLogicSubcategory(document.getElementById('partName').value.trim(), document.getElementById('partDesc').value.trim()))
          : '',
        desc: document.getElementById('partDesc').value.trim(),
        boxId: boxId,
        cell: cell,
        subCell: subCell,
        location: document.getElementById('partLocation').value.trim(),
        pinout: document.getElementById('partPinout').value.trim(),
        datasheet: document.getElementById('partDatasheet').value.trim(),
        buyUrl: document.getElementById('partBuyUrl').value.trim(),
        notes: document.getElementById('partNotes').value.trim()
      };

      const existing = id ? parts.find(x => x.id === id) : null;
      let buyShops = existing?.buyShops || null;
      let minPrice = existing?.minPrice || null;
      if (!buyShops || (existing && existing.package !== newPart.package)) {
        buyShops = generateShopLinksForPart(newPart.name, newPart.package);
        minPrice = getMinPriceString(buyShops);
      }
      if (!newPart.buyUrl && buyShops) {
        newPart.buyUrl = buyShops.tuyetnga?.available ? buyShops.tuyetnga.url : (buyShops.caka?.available ? buyShops.caka.url : buyShops.shopee?.url);
      }
      newPart.buyShops = buyShops;
      newPart.minPrice = minPrice;

      if (newPart.project && !projects.some(pr => pr.name.toLowerCase() === newPart.project.toLowerCase())) {
        projects.push({ id: 'proj_' + Date.now(), name: newPart.project, note: '' });
      }

      if (id) {
        const idx = parts.findIndex(x => x.id === id);
        if (idx > -1) parts[idx] = newPart;
      } else {
        parts.unshift(newPart);
      }

      saveData();
      renderParts();
      closePartModal();
    }

    function deleteCurrentPart() {
      const id = document.getElementById('partId').value;
      if (!confirm('Xóa linh kiện này khỏi kho?')) return;
      parts = parts.filter(x => x.id !== id);
      saveData();
      renderParts();
      closePartModal();
    }

    function searchGoogle(type) {
      const name = document.getElementById('partName').value.trim();
      if (!name) return alert('Nhập mã linh kiện trước đã bạn ơi!');
      if (type === 'pinout') {
        window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(name + ' pinout')}`, '_blank');
      } else {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(name + ' datasheet pdf')}`, '_blank');
      }
    }




    init();
    setupPinoutClipboardPaste();
  