// =========================================================================
// MODULE: PINOUT & COMPONENT INTELLIGENCE (SƠ ĐỒ CHÂN & CÀO ẢNH SERVER)
// =========================================================================

    function handlePartNameInput() {
      const nameInput = document.getElementById('partName');
      const descInput = document.getElementById('partDesc');
      const pinoutInput = document.getElementById('partPinout');
      const badge = document.getElementById('descAutoBadge');
      const rawName = nameInput.value.trim();
      if (!rawName) {
        if (badge) badge.classList.add('hidden');
        return;
      }
      const local = lookupComponentKnowledge(rawName);
      if (local) {
        if (!descInput.value || descInput.value === lastAutoFilledDesc) {
          descInput.value = local.desc;
          lastAutoFilledDesc = local.desc;
        }
        const pkgInput = document.getElementById('partPackage');
        if (pkgInput && !pkgInput.value && local.pkg) {
          pkgInput.value = local.pkg;
        }
        if (local.cat) {
          const catSelect = document.getElementById('partCategory');
          if (catSelect) {
            const matched = findCategoryMatch(local.cat);
            if (matched) catSelect.value = matched;
          }
        }
        handleCategoryChange();
        if (isLogicCategory(document.getElementById('partCategory')?.value)) {
          const autoSub = determineLogicSubcategory(rawName, descInput.value);
          const subSelect = document.getElementById('partSubCategory');
          if (subSelect && autoSub) subSelect.value = autoSub;
        }
        let pinoutAdded = false;
        if (local.pinout && pinoutInput && !pinoutInput.value.trim()) {
          selectPinoutThumb(local.pinout);
          pinoutAdded = true;
        }
        if (badge) {
          badge.innerHTML = `<i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i> <span>Tự nhận diện: ${local.desc}${pinoutAdded ? ' • Đã gắn ảnh Pinout ✓' : ''}</span>`;
          badge.classList.remove('hidden');
          lucide.createIcons();
        }
      } else {
        if (badge) badge.classList.add('hidden');
      }
    }

    function handlePartNameBlur() {
      const nameInput = document.getElementById('partName');
      const descInput = document.getElementById('partDesc');
      const pinoutInput = document.getElementById('partPinout');
      const buyInput = document.getElementById('partBuyUrl');
      const pkgInput = document.getElementById('partPackage');
      if (!descInput.value.trim()) {
        autoSuggestDesc(false);
      } else if (!pinoutInput.value.trim()) {
        autoFetchPinout(true);
      }

      if (nameInput && nameInput.value.trim() && buyInput && !buyInput.value.trim()) {
        const shops = generateShopLinksForPart(nameInput.value.trim(), pkgInput?.value || '');
        if (shops) {
          const autoLink = shops.tuyetnga?.available ? shops.tuyetnga.url : (shops.caka?.available ? shops.caka.url : shops.shopee?.url);
          if (autoLink) buyInput.value = autoLink;
        }
      }
    }

    async function autoSuggestDesc(manualClick = false) {
      const nameInput = document.getElementById('partName');
      const descInput = document.getElementById('partDesc');
      const pinoutInput = document.getElementById('partPinout');
      const badge = document.getElementById('descAutoBadge');
      const rawName = nameInput.value.trim();
      if (!rawName) {
        if (manualClick) alert('Hãy nhập Tên / Mã linh kiện trước đã bạn ơi!');
        return;
      }

      const local = lookupComponentKnowledge(rawName);
      if (local) {
        if (!descInput.value || manualClick) descInput.value = local.desc;
        const pkgInput = document.getElementById('partPackage');
        if (pkgInput && (!pkgInput.value || manualClick)) pkgInput.value = local.pkg || '';
        if (local.cat) {
          const catSelect = document.getElementById('partCategory');
          if (catSelect) {
            const matched = findCategoryMatch(local.cat);
            if (matched) catSelect.value = matched;
          }
        }
        handleCategoryChange();
        if (isLogicCategory(document.getElementById('partCategory')?.value)) {
          const autoSub = determineLogicSubcategory(rawName, descInput.value);
          const subSelect = document.getElementById('partSubCategory');
          if (subSelect && autoSub) subSelect.value = autoSub;
        }
        let pinoutAdded = false;
        if (local.pinout && pinoutInput && !pinoutInput.value.trim()) {
          selectPinoutThumb(local.pinout);
          pinoutAdded = true;
        } else if (pinoutInput && !pinoutInput.value.trim()) {
          autoFetchPinout(true);
        }
        if (badge) {
          badge.innerHTML = `<i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i> <span>Tự điền: ${local.desc}${pinoutAdded ? ' • Đã gắn ảnh Pinout ✓' : ''}</span>`;
          badge.classList.remove('hidden');
          lucide.createIcons();
        }
        return;
      }

      if (badge) {
        badge.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 text-amber-400 animate-spin"></i> <span>Đang tìm mô tả trực tuyến...</span>`;
        badge.classList.remove('hidden');
        lucide.createIcons();
      }

      try {
        let foundDesc = '';
        if (pinoutServerUrl) {
          try {
            const sRes = await fetch(`${pinoutServerUrl}/api/desc?name=${encodeURIComponent(rawName)}`, { signal: AbortSignal.timeout(2500) });
            if (sRes.ok) {
              const sData = await sRes.json();
              if (sData && sData.desc) foundDesc = sData.desc;
            }
          } catch(e) {}
        }

        if (!foundDesc) {
          const wikiQueries = [rawName, `${rawName} integrated circuit`, rawName.replace(/([0-9]+)/, ' $1')];
          for (const q of wikiQueries) {
            try {
              const wRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(3000) });
              if (wRes.ok) {
                const wData = await wRes.json();
                if (wData.extract) {
                  const s = wData.extract.split('. ')[0].trim();
                  if (s && s.length < 160) {
                    foundDesc = s;
                    break;
                  }
                }
              }
            } catch(e) {}
          }
        }

        if (foundDesc) {
          descInput.value = foundDesc;
          if (isLogicCategory(document.getElementById('partCategory')?.value)) {
            const autoSub = determineLogicSubcategory(rawName, foundDesc);
            const subSelect = document.getElementById('partSubCategory');
            if (subSelect && autoSub && !subSelect.value) subSelect.value = autoSub;
          }
          if (badge) {
            badge.innerHTML = `<i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i> <span>Đã tìm thấy mô tả từ Wikipedia</span>`;
            lucide.createIcons();
          }
          if (pinoutInput && !pinoutInput.value.trim()) {
            autoFetchPinout(true);
          }
        } else if (manualClick) {
          if (badge) {
            badge.innerHTML = `<i data-lucide="info" class="w-3.5 h-3.5 text-amber-400"></i> <span>Chưa tìm thấy mô tả tự động, bạn có thể tự nhập ngắn gọn nhé</span>`;
            lucide.createIcons();
          }
        }
      } catch (err) {
        if (badge && manualClick) badge.classList.add('hidden');
      }
    }

    // TOGGLE FAVORITE / GHIM LINH KIỆN


    // ================= MODAL PINOUT & DATASHEET =================
    function openPinoutModal(id) {
      const p = parts.find(x => x.id === id);
      if (!p) return;
      document.getElementById('pinoutTitle').innerText = p.name;
      document.getElementById('pinoutSub').innerText = `${p.package || 'N/A'} • ${p.location}`;
      document.getElementById('pinoutNotes').innerText = p.notes || 'Chưa có ghi chú kỹ thuật cho linh kiện này.';

      const imgContainer = document.getElementById('pinoutImgContainer');
      const noImg = document.getElementById('pinoutNoImg');
      const img = document.getElementById('pinoutImg');
      const fallback = document.getElementById('pinoutImgFallback');
      if (fallback) fallback.classList.add('hidden');
      if (img) { img.classList.remove('hidden'); delete img.dataset.retried; }

      if (p.pinout) {
        const cleanUrl = p.pinout.trim().replace(/ /g, '%20');
        img.src = cleanUrl;
        imgContainer.classList.remove('hidden');
        noImg.classList.add('hidden');
        const directLink = document.getElementById('pinoutDirectLink');
        if (directLink) directLink.href = cleanUrl;
        const editBtn = document.getElementById('pinoutEditBtn');
        if (editBtn) editBtn.onclick = () => { closePinoutModal(); openPartModal(p.id); };
      } else {
        imgContainer.classList.add('hidden');
        noImg.classList.remove('hidden');
        document.getElementById('googlePinoutLink').href = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(p.name + ' pinout')}`;
      }

      const actions = document.getElementById('pinoutActionLinks');
      actions.innerHTML = `
        ${p.datasheet ? `<a href="${p.datasheet}" target="_blank" class="flex-1 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"><i data-lucide="file-text" class="w-4 h-4"></i> Mở Datasheet PDF</a>` : ''}
        <a href="https://www.google.com/search?q=${encodeURIComponent(p.name + ' datasheet pdf')}" target="_blank" class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"><i data-lucide="search" class="w-4 h-4"></i> Tra Google Datasheet</a>
      `;

      document.getElementById('pinoutModal').classList.remove('hidden');
      lucide.createIcons();
    }

    async function handlePinoutImgError(img) {
      if (img.dataset.retried) {
        img.classList.add('hidden');
        const fallback = document.getElementById('pinoutImgFallback');
        if (fallback) fallback.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
      }
      img.dataset.retried = "true";

      const titleEl = document.getElementById('pinoutTitle');
      const partName = titleEl ? titleEl.innerText.trim() : '';
      if (partName && pinoutServerUrl) {
        try {
          const res = await fetch(`${pinoutServerUrl}/api/pinout?name=${encodeURIComponent(partName)}`);
          if (res.ok) {
            const items = await res.json();
            if (Array.isArray(items) && items.length > 0) {
              const newUrl = items[0].link;
              img.src = newUrl;
              const curPart = parts.find(x => x.name.toLowerCase() === partName.toLowerCase());
              if (curPart) {
                curPart.pinout = newUrl;
                saveData();
              }
              const directLink = document.getElementById('pinoutDirectLink');
              if (directLink) directLink.href = newUrl;
              return;
            }
          }
        } catch (e) {
          console.log('Self-heal error:', e);
        }
      }

      img.classList.add('hidden');
      const fallback = document.getElementById('pinoutImgFallback');
      if (fallback) fallback.classList.remove('hidden');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function closePinoutModal() {
      document.getElementById('pinoutModal').classList.add('hidden');
    }



    // ================= SERVER CÀO ẢNH PINOUT (LOCAL / PI 5) =================
    let defaultServerUrl = 'http://localhost:5000';
    if (window.location.protocol.startsWith('http') && window.location.port === '5000') {
      defaultServerUrl = window.location.origin;
    }
    let pinoutServerUrl = localStorage.getItem('ee_pinout_server_url') || defaultServerUrl;

    function savePinoutServerConfig() {
      let url = document.getElementById('pinoutServerUrlInput').value.trim();
      if (!url) url = 'http://localhost:5000';
      url = url.replace(/\/$/, '');
      pinoutServerUrl = url;
      localStorage.setItem('ee_pinout_server_url', pinoutServerUrl);
      testPinoutServerConnection();
    }

    async function testPinoutServerConnection() {
      const statusEl = document.getElementById('pinoutServerStatus');
      statusEl.textContent = 'Đang kiểm tra kết nối tới ' + pinoutServerUrl + '...';
      statusEl.className = 'text-[11px] text-center mt-1.5 text-sky-400 font-medium';
      try {
        const res = await fetch(pinoutServerUrl + '/health', { method: 'GET' });
        if (res.ok) {
          statusEl.textContent = '✓ Kết nối thành công! Server đang hoạt động tốt.';
          statusEl.className = 'text-[11px] text-center mt-1.5 text-emerald-400 font-medium';
        } else {
          statusEl.textContent = '⚠ Server phản hồi mã lỗi: ' + res.status;
          statusEl.className = 'text-[11px] text-center mt-1.5 text-amber-400 font-medium';
        }
      } catch (err) {
        statusEl.textContent = '✕ Chưa kết nối được. Hãy chắc chắn đã chạy file run_server.bat trên máy!';
        statusEl.className = 'text-[11px] text-center mt-1.5 text-rose-400 font-medium';
      }
    }

    async function fetchPinoutImageForPart(name, pkg = '') {
      if (!name) return null;
      const local = lookupComponentKnowledge(name);
      if (local && local.pinout) return local.pinout;

      if (pinoutServerUrl) {
        try {
          const res = await fetch(`${pinoutServerUrl}/api/pinout?name=${encodeURIComponent(name)}&pkg=${encodeURIComponent(pkg)}`, { signal: AbortSignal.timeout(3000) });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0 && data[0].link) {
              return data[0].link;
            }
          }
        } catch(e) {}
      }

      try {
        const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(name + ' pinout')}&gsrlimit=4&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=500&format=json&origin=*`;
        const res = await fetch(wikiUrl, { signal: AbortSignal.timeout(3000) });
        const data = await res.json();
        if (data && data.query && data.query.pages) {
          for (const pageId in data.query.pages) {
            const p = data.query.pages[pageId];
            if (p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url) {
              return p.imageinfo[0].url;
            }
          }
        }
      } catch(e) {}

      return null;
    }

    async function fetchDescForPart(name) {
      if (!name) return null;
      const local = lookupComponentKnowledge(name);
      if (local && local.desc) return { desc: local.desc, pkg: local.pkg, cat: local.cat };

      if (pinoutServerUrl) {
        try {
          const sRes = await fetch(`${pinoutServerUrl}/api/desc?name=${encodeURIComponent(name)}`, { signal: AbortSignal.timeout(2500) });
          if (sRes.ok) {
            const sData = await sRes.json();
            if (sData && sData.desc) return { desc: sData.desc, pkg: '', cat: '' };
          }
        } catch(e) {}
      }

      const wikiQueries = [name, `${name} integrated circuit`, name.replace(/([0-9]+)/, ' $1')];
      for (const q of wikiQueries) {
        try {
          const wRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(3000) });
          if (wRes.ok) {
            const wData = await wRes.json();
            if (wData.extract) {
              const s = wData.extract.split('. ')[0].trim();
              if (s && s.length < 160) return { desc: s, pkg: '', cat: '' };
            }
          }
        } catch(e) {}
      }
      return null;
    }

    async function autoFetchPinout(silent = false) {
      const name = document.getElementById('partName').value.trim();
      const pkg = document.getElementById('partPackage').value.trim();
      const pinoutInput = document.getElementById('partPinout');

      if (silent && pinoutInput && pinoutInput.value.trim()) return;

      if (!name) {
        if (!silent) {
          alert('Nhập mã linh kiện trước đã bạn ơi!');
          document.getElementById('partName').focus();
        }
        return;
      }

      // 1. Kiểm tra từ điển có sẵn link pinout chuẩn nét không
      const local = lookupComponentKnowledge(name);
      if (local && local.pinout) {
        if (!pinoutInput.value.trim() || !silent) {
          selectPinoutThumb(local.pinout);
          const badge = document.getElementById('descAutoBadge');
          if (badge && !badge.classList.contains('hidden') && !badge.innerHTML.includes('Pinout')) {
            badge.innerHTML += ` <span class="text-sky-300 font-semibold">• Đã gắn ảnh Pinout ✓</span>`;
          }
        }
        return;
      }

      const btn = document.getElementById('btnAutoPinout');
      const resultsBox = document.getElementById('pinoutAutoResults');
      const thumbsList = document.getElementById('pinoutThumbsList');
      const statusEl = document.getElementById('pinoutResultStatus');

      if (!silent) {
        btn.innerHTML = '<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> Đang tìm...';
        btn.disabled = true;
        resultsBox.classList.remove('hidden');
        thumbsList.innerHTML = '<p class="col-span-4 text-[11px] text-slate-400 text-center py-3 flex items-center justify-center gap-1.5"><i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin text-amber-400"></i> Đang cào ảnh pinout...</p>';
        statusEl.textContent = '';
        lucide.createIcons();
      }

      let items = [];
      let sourceName = '';

      // 1. Thử gọi Python Local Server (Laptop / Pi 5)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`${pinoutServerUrl}/api/pinout?name=${encodeURIComponent(name)}&pkg=${encodeURIComponent(pkg)}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            items = data;
            sourceName = 'Local Server (Toàn mạng)';
          }
        }
      } catch (e) {
        console.log('Local Server offline, chuyển sang Wikimedia...');
      }

      // 2. Fallback sang Wikimedia Commons nếu server chưa bật
      if (items.length === 0) {
        try {
          const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(name + ' pinout')}&gsrlimit=6&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=400&format=json&origin=*`;
          const res = await fetch(wikiUrl);
          const data = await res.json();
          if (data && data.query && data.query.pages) {
            for (const pageId in data.query.pages) {
              const p = data.query.pages[pageId];
              if (p.imageinfo && p.imageinfo[0]) {
                items.push({
                  link: p.imageinfo[0].url,
                  thumb: p.imageinfo[0].thumburl || p.imageinfo[0].url,
                  title: p.title
                });
              }
            }
            if (items.length > 0) sourceName = 'Wikimedia Commons';
          }
        } catch (e) {
          console.log('Wikimedia error:', e);
        }
      }

      // 3. Hiển thị ảnh
      if (items.length > 0) {
        if (!pinoutInput.value.trim()) {
          selectPinoutThumb(items[0].link);
          const badge = document.getElementById('descAutoBadge');
          if (badge && !badge.classList.contains('hidden') && !badge.innerHTML.includes('Pinout')) {
            badge.innerHTML += ` <span class="text-sky-300 font-semibold">• Đã gắn ảnh Pinout ✓</span>`;
          }
        }

        if (!silent) {
          statusEl.innerHTML = `<span class="text-emerald-400 font-medium">✓ Tìm thấy ${items.length} ảnh (${sourceName}):</span>`;
          thumbsList.innerHTML = items.map((item, idx) => `
            <button type="button" onclick="selectPinoutThumb(${JSON.stringify(item.link).replace(/"/g, '&quot;')})"
              class="relative group rounded-lg overflow-hidden border-2 border-slate-700 hover:border-amber-400 transition bg-white"
              title="${item.title || 'Pinout'}">
              <img src="${item.thumb || item.link}" alt="pinout ${idx+1}"
                class="w-full h-16 object-contain"
                onerror="this.parentElement.style.display='none'">
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span class="text-[10px] text-white font-bold">Chọn</span>
              </div>
            </button>
          `).join('');
        }
      } else if (!silent) {
        statusEl.innerHTML = `<span class="text-amber-400">Chưa tìm thấy ảnh tự động:</span>`;
        thumbsList.innerHTML = `<div class="col-span-4 p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs leading-relaxed">
          <p class="font-bold text-amber-300 mb-1 flex items-center gap-1">💡 Mẹo cào ảnh cực nhạy:</p>
          1. <b>Bật server local:</b> Nhấp đúp vào file <code>run_server.bat</code> trong thư mục để cào ảnh DuckDuckGo/Google không giới hạn.<br>
          2. <b>Dán trực tiếp (Ctrl + V):</b> Bấm nút <i>"Google"</i> kế bên để xem ảnh &rarr; Chuột phải <i>"Sao chép hình ảnh"</i> &rarr; Bấm vào ô Pinout rồi ấn <b>Ctrl + V</b> là ảnh tự dán vào luôn!
        </div>`;
      }

      if (!silent) {
        btn.innerHTML = '<i data-lucide="sparkles" class="w-3 h-3"></i> Auto tìm ảnh';
        btn.disabled = false;
        lucide.createIcons();
      }
    }

    function selectPinoutThumb(imgUrl) {
      const cleanUrl = imgUrl ? imgUrl.trim().replace(/ /g, '%20') : '';
      document.getElementById('partPinout').value = cleanUrl;
      document.getElementById('pinoutAutoResults').classList.add('hidden');
      showPinoutPreview(imgUrl);
    }

    function onPinoutInputChange() {
      const val = document.getElementById('partPinout').value.trim();
      document.getElementById('pinoutAutoResults').classList.add('hidden');
      if (val) showPinoutPreview(val);
      else hidePinoutPreview();
    }

    function showPinoutPreview(url) {
      const preview = document.getElementById('pinoutMiniPreview');
      document.getElementById('pinoutMiniImg').src = url;
      document.getElementById('pinoutMiniUrl').textContent = url;
      preview.classList.remove('hidden');
    }

    function hidePinoutPreview() {
      document.getElementById('pinoutMiniPreview').classList.add('hidden');
    }

    function clearPinout() {
      document.getElementById('partPinout').value = '';
      hidePinoutPreview();
      document.getElementById('pinoutAutoResults').classList.add('hidden');
    }

    // Hỗ trợ Ctrl + V dán ảnh trực tiếp từ clipboard vào ô Pinout
    function setupPinoutClipboardPaste() {
      const pinoutInput = document.getElementById('partPinout');
      if (!pinoutInput) return;
      pinoutInput.addEventListener('paste', (e) => {
        const items = (e.clipboardData || window.clipboardData)?.items;
        if (!items) return;
        for (const item of items) {
          if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64Url = event.target.result;
              pinoutInput.value = base64Url;
              showPinoutPreview(base64Url);
              document.getElementById('pinoutAutoResults').classList.add('hidden');
            };
            reader.readAsDataURL(blob);
            break;
          }
        }
      });
    }

