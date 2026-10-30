// =========================================================================
// MODULE: CLOUD SYNC & BACKUP (ĐỒNG BỘ CLOUD FIREBASE & SAO LƯU DỮ LIỆU)
// =========================================================================

    // ================= LƯU TRỮ & ĐỒNG BỘ CLOUD / PI 5 =================
    async function saveData() {
      localStorage.setItem('ee_inventory_parts', JSON.stringify(parts));
      localStorage.setItem('ee_inventory_boxes', JSON.stringify(boxes));
      localStorage.setItem('ee_inventory_categories', JSON.stringify(categories));
      localStorage.setItem('ee_inventory_projects', JSON.stringify(projects));
      if (cloudUrl) {
        try {
          updateSyncBadge('syncing');
          const payload = { version: 2, updatedAt: new Date().toISOString(), boxes, parts, categories, projects };
          await fetch(cloudUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          updateSyncBadge('synced');
        } catch (e) {
          updateSyncBadge('error');
        }
      }
    }

    async function pullFromCloud(silent = false) {
      if (!cloudUrl) return;
      try {
        updateSyncBadge('syncing');
        const res = await fetch(cloudUrl);
        const data = await res.json();
        if (data && data.tunnelUrl && typeof data.tunnelUrl === 'string' && data.tunnelUrl.startsWith('https://')) {
          const cloudTunnel = data.tunnelUrl.trim();
          const isRemote = window.location.protocol === 'https:' || !window.location.hostname.match(/^(localhost|127\.0\.0\.1)$/);
          if (isRemote || !pinoutServerUrl || pinoutServerUrl.includes('trycloudflare.com')) {
            if (pinoutServerUrl !== cloudTunnel) {
              console.log(`[Auto-Tunnel] Cập nhật Server Cào Ảnh từ Firebase: ${cloudTunnel}`);
              pinoutServerUrl = cloudTunnel;
              localStorage.setItem('ee_pinout_server_url', pinoutServerUrl);
              const sInput = document.getElementById('pinoutServerUrlInput');
              if (sInput) sInput.value = pinoutServerUrl;
            }
          }
        }
        if (data && Array.isArray(data.parts)) {
          // Bảo vệ chống mất dữ liệu: Nếu kho máy đang có nhiều hơn 5 món mà Cloud chỉ có ít hơn (ví dụ 4 món default)
          if (silent && parts.length > 5 && data.parts.length < parts.length) {
            console.warn(`[Cloud Sync] Kho trên máy (${parts.length}) nhiều hơn Cloud (${data.parts.length}). Tự động cập nhật kho máy lên Cloud.`);
            await saveData();
            updateSyncBadge('synced');
            return;
          }
          if (!silent && parts.length > data.parts.length) {
            const confirmed = confirm(`⚠️ CẢNH BÁO: Kho trên thiết bị này đang có ${parts.length} linh kiện, nhưng trên Cloud chỉ có ${data.parts.length} linh kiện.\n\nBạn có chắc chắn muốn TẢI TỪ CLOUD VỀ và ghi đè máy không?`);
            if (!confirmed) {
              updateSyncBadge('synced');
              return;
            }
          }
          
          // Tạo bản snapshot sao lưu cục bộ trước khi ghi đè
          try {
            localStorage.setItem('ee_inventory_auto_backup', JSON.stringify({
              savedAt: new Date().toISOString(),
              boxes, parts, categories, projects
            }));
          } catch (e) {}

          parts = data.parts;
          if (Array.isArray(data.boxes)) boxes = data.boxes;
          if (Array.isArray(data.categories)) categories = data.categories;
          if (Array.isArray(data.projects)) projects = data.projects;
          
          localStorage.setItem('ee_inventory_parts', JSON.stringify(parts));
          localStorage.setItem('ee_inventory_boxes', JSON.stringify(boxes));
          localStorage.setItem('ee_inventory_categories', JSON.stringify(categories));
          localStorage.setItem('ee_inventory_projects', JSON.stringify(projects));
          
          activePreviewBoxId = boxes[0]?.id || null;
          renderCategories();
          populateCategorySelect();
          populateProjectDatalist();
          renderProjectQuickChips();
          renderParts();
        } else if (Array.isArray(data)) {
          // Tương thích dữ liệu từ bản v1.0
          parts = data;
          localStorage.setItem('ee_inventory_parts', JSON.stringify(parts));
          renderParts();
        } else if (data === null) {
          await saveData();
        }
        updateSyncBadge('synced');
        if (!silent) {
          closeSettingsModal();
          alert(`Đã tải về và đồng bộ thành công ${parts.length} linh kiện và ${boxes.length} hộp từ Cloud!`);
        }
      } catch (e) {
        updateSyncBadge('error');
        if (!silent) alert('Không kết nối được với Cloud URL!');
      }
    }

    function restoreAutoBackup() {
      const bkpStr = localStorage.getItem('ee_inventory_auto_backup');
      if (!bkpStr) return alert('Chưa có bản lưu dự phòng nào trên máy này.');
      try {
        const bkp = JSON.parse(bkpStr);
        if (bkp && Array.isArray(bkp.parts)) {
          if (!confirm(`Bạn có muốn khôi phục lại bản lưu lúc ${new Date(bkp.savedAt || '').toLocaleString('vi-VN')} với ${bkp.parts.length} linh kiện không?`)) return;
          parts = bkp.parts;
          if (Array.isArray(bkp.boxes)) boxes = bkp.boxes;
          if (Array.isArray(bkp.categories)) categories = bkp.categories;
          if (Array.isArray(bkp.projects)) projects = bkp.projects;
          saveData();
          init();
          closeSettingsModal();
          alert(`Đã khôi phục thành công ${parts.length} linh kiện!`);
        }
      } catch (e) {
        alert('Lỗi đọc bản lưu dự phòng!');
      }
    }

    function updateSyncBadge(state) {
      const el = document.getElementById('syncStatus');
      if (!cloudUrl) {
        el.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Lưu trên máy (Local)`;
      } else if (state === 'syncing') {
        el.innerHTML = `<span class="w-2 h-2 rounded-full bg-sky-400 animate-ping inline-block"></span> Đang đồng bộ Cloud...`;
      } else if (state === 'error') {
        el.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Lỗi kết nối Cloud`;
      } else {
        el.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Đã đồng bộ Cloud`;
      }
    }

    function switchSettingsTab(tab = 'cloud') {
      const tabs = ['cloud', 'server', 'backup'];
      tabs.forEach(t => {
        const btn = document.getElementById('settingsTabBtn_' + t);
        const pane = document.getElementById('settingsTabPane_' + t);
        if (!btn || !pane) return;
        if (t === tab) {
          btn.className = 'px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 border-emerald-500 text-emerald-400 bg-slate-900 flex items-center gap-1.5 shrink-0';
          pane.classList.remove('hidden');
        } else {
          btn.className = 'px-3 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-1.5 shrink-0';
          pane.classList.add('hidden');
        }
      });
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function openSettingsModal(tab = 'cloud') {
      document.getElementById('cloudUrlInput').value = cloudUrl;
      const serverUrl = typeof pinoutServerUrl !== 'undefined' ? pinoutServerUrl : (localStorage.getItem('ee_pinout_server_url') || '');
      const sInput = document.getElementById('pinoutServerUrlInput');
      if (sInput) sInput.value = serverUrl;
      
      const badge = document.getElementById('currentServerTypeBadge');
      if (badge) {
        if (!serverUrl) {
          badge.textContent = 'Chưa thiết lập';
          badge.className = 'text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono';
        } else if (serverUrl.includes('localhost') || serverUrl.includes('127.0.0.1')) {
          badge.textContent = 'Laptop (Local)';
          badge.className = 'text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono';
        } else if (serverUrl.includes('trycloudflare.com')) {
          badge.textContent = 'Cloudflare HTTPS';
          badge.className = 'text-[10px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded font-mono';
        } else if (serverUrl.includes('ngrok')) {
          badge.textContent = 'Ngrok Static Domain';
          badge.className = 'text-[10px] text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded font-mono';
        } else {
          badge.textContent = 'Custom URL';
          badge.className = 'text-[10px] text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded font-mono';
        }
      }

      switchSettingsTab(tab);
      document.getElementById('settingsModal').classList.remove('hidden');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function closeSettingsModal() {
      document.getElementById('settingsModal').classList.add('hidden');
    }

    async function saveCloudConfig() {
      let url = document.getElementById('cloudUrlInput').value.trim();
      if (url && !url.endsWith('.json')) {
        url = url.replace(/\/$/, '') + '/ee_lab_v2.json';
      }
      cloudUrl = url;
      localStorage.setItem('ee_inventory_cloud_url', cloudUrl);
      if (cloudUrl) {
        // Kiểm tra an toàn trước khi đẩy: Nếu máy mới mở lần đầu (ít linh kiện) mà trên Cloud đã có kho đầy đủ
        try {
          updateSyncBadge('syncing');
          const res = await fetch(cloudUrl);
          const cloudData = await res.json();
          if (cloudData && Array.isArray(cloudData.parts) && cloudData.parts.length > parts.length) {
            // Máy mới (hoặc sau khi cài lại) -> Tự động kéo kho đầy đủ từ Cloud về thay vì đẩy 4 món rỗng lên đè!
            parts = cloudData.parts;
            if (Array.isArray(cloudData.boxes)) boxes = cloudData.boxes;
            if (Array.isArray(cloudData.categories)) categories = cloudData.categories;
            if (Array.isArray(cloudData.projects)) projects = cloudData.projects;
            
            localStorage.setItem('ee_inventory_parts', JSON.stringify(parts));
            localStorage.setItem('ee_inventory_boxes', JSON.stringify(boxes));
            localStorage.setItem('ee_inventory_categories', JSON.stringify(categories));
            localStorage.setItem('ee_inventory_projects', JSON.stringify(projects));
            
            activePreviewBoxId = boxes[0]?.id || null;
            renderCategories();
            populateCategorySelect();
            populateProjectDatalist();
            renderProjectQuickChips();
            renderParts();
            updateSyncBadge('synced');
            alert(`Đã kết nối Cloud thành công!\nThiết bị đã nhận diện và tải về toàn bộ kho gồm ${parts.length} linh kiện và ${boxes.length} hộp của bạn.`);
            closeSettingsModal();
            return;
          }
        } catch (e) {}
        
        await saveData();
        alert(`Đã lưu và đẩy cả ${boxes.length} Sơ đồ Hộp + ${parts.length} Linh kiện lên Cloud!`);
      } else {
        updateSyncBadge();
      }
      closeSettingsModal();
    }

    function copyCloudUrl() {
      let url = document.getElementById('cloudUrlInput').value.trim() || cloudUrl;
      if (!url) return alert('Chưa có đường link Cloud nào để copy!');
      if (!url.endsWith('.json')) {
        url = url.replace(/\/$/, '') + '/ee_lab_v2.json';
      }
      navigator.clipboard.writeText(url).then(() => {
        alert('Đã sao chép link Cloud:\n' + url + '\n\nHãy gửi link này qua điện thoại (Zalo/Tin nhắn) để dán vào cài đặt trên điện thoại nhé!');
      }).catch(() => {
        prompt('Hãy copy link Cloud dưới đây để gửi qua điện thoại:', url);
      });
    }

    function exportJSON() {
      const payload = { version: 2, exportedAt: new Date().toISOString(), boxes, parts, categories, projects };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ee-lab-v2-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
    }

    function importJSON(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported && Array.isArray(imported.parts)) {
            parts = imported.parts;
            if (Array.isArray(imported.boxes)) boxes = imported.boxes;
            if (Array.isArray(imported.categories)) categories = imported.categories;
            if (Array.isArray(imported.projects)) projects = imported.projects;
          } else if (Array.isArray(imported)) {
            parts = imported;
          } else {
            return alert('Cấu trúc file JSON không đúng!');
          }
          init();
          saveData();
          closeSettingsModal();
          alert(`Đã khôi phục thành công ${boxes.length} sơ đồ hộp, ${categories.length} phân loại, ${projects.length} dự án và ${parts.length} mã linh kiện!`);
        } catch (err) {
          alert('File JSON không hợp lệ!');
        }
      };
      reader.readAsText(file);
    }

