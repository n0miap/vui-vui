// =========================================================================
// MODULE: PROJECTS, BREADBOARD & BOM (DỰ ÁN & BẢNG KÊ LINH KIỆN BOM)
// =========================================================================

    // ================= QUẢN LÝ DỰ ÁN & BREADBOARD =================
    function populateProjectDatalist() {
      const datalist = document.getElementById('projectDatalist');
      if (!datalist) return;
      datalist.innerHTML = projects.map(p => `<option value="${p.name}">`).join('');
    }

    function renderProjectQuickChips() {
      const container = document.getElementById('quickProjectChips');
      if (!container) return;
      if (projects.length === 0) {
        container.innerHTML = '';
        return;
      }
      container.innerHTML = `
        <span class="text-[10px] text-slate-500 self-center">Chọn nhanh:</span>` +
        projects.slice(0, 5).map(p => `
          <button type="button" onclick="selectQuickProject('${p.name.replace(/'/g, "\\'")}')" class="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition flex items-center gap-1">
            <i data-lucide="plus" class="w-2.5 h-2.5"></i> ${p.name}
          </button>
        `).join('');
      lucide.createIcons();
    }

    function selectQuickProject(projectName) {
      document.getElementById('partProject').value = projectName;
      const inUseInput = document.getElementById('partInUse');
      if (Number(inUseInput.value) <= 0) {
        inUseInput.value = 1;
      }
    }

    function handleProjectFocus() {
      populateProjectDatalist();
    }

    function handleProjectInput() {
      const projVal = document.getElementById('partProject').value.trim();
      const inUseInput = document.getElementById('partInUse');
      if (projVal && Number(inUseInput.value) <= 0) {
        inUseInput.value = 1;
      }
    }

    function openProjectsModal() {
      renderProjectsList();
      document.getElementById('projectsModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeProjectsModal() {
      document.getElementById('projectsModal').classList.add('hidden');
    }

    function renderProjectsList() {
      const list = document.getElementById('projectsList');
      const badge = document.getElementById('projectsCountBadge');
      if (badge) badge.innerText = `${projects.length} dự án`;

      if (projects.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500 py-4 text-center">Chưa có dự án nào. Hãy nhập ở khung bên trên để tạo.</p>`;
        return;
      }

      let html = projects.map(proj => {
        const inUseParts = parts.filter(p => p.project && p.project.toLowerCase() === proj.name.toLowerCase() && Number(p.inUse) > 0);
        const totalChips = inUseParts.reduce((s, p) => s + Number(p.inUse || 0), 0);
        const escaped = proj.name.replace(/'/g, "\\'");

        return `
        <div class="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3 flex flex-col gap-2.5 hover:border-slate-600 transition">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-sm text-sky-300">${proj.name}</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full ${inUseParts.length > 0 ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-slate-900 text-slate-500'}">
                  ${inUseParts.length} loại IC • ${totalChips} con đang cắm
                </span>
              </div>
              ${proj.note ? `<p class="text-[11px] text-slate-400 mt-0.5">${proj.note}</p>` : ''}
            </div>

            <div class="flex items-center gap-1.5 flex-wrap">
              <button onclick="openBomModal('${escaped}')" class="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-medium transition flex items-center gap-1" title="Bảng kê linh kiện BoM & Gom đồ dự án">
                <i data-lucide="clipboard-list" class="w-3.5 h-3.5"></i> Bảng BoM
              </button>
              ${inUseParts.length > 0 ? `
                <button onclick="returnPartsFromProject('${escaped}')" class="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition flex items-center gap-1" title="Đã tháo mạch: Thu hồi toàn bộ linh kiện này về hộp">
                  <i data-lucide="package-check" class="w-3.5 h-3.5"></i> Rút hết về hộp
                </button>
              ` : ''}
              <button onclick="filterPartsByProject('${escaped}')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1" title="Lọc các linh kiện của dự án này trên kho">
                <i data-lucide="search" class="w-3.5 h-3.5"></i> Lọc trên kho
              </button>
              <button onclick="renameProject('${escaped}')" class="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition" title="Đổi tên dự án này">
                <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="deleteProject('${escaped}')" class="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition" title="Xóa dự án này">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>

          <!-- Danh sách các linh kiện đang cắm trên breadboard này -->
          <div class="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2 flex flex-col gap-1.5">
            ${inUseParts.length === 0 ? '<p class="text-[11px] text-slate-500 py-0.5">Hiện không có linh kiện nào đang cắm trên mạch này.</p>' : inUseParts.map(p => `
              <div class="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-800/60">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="font-bold text-white">${p.name}</span>
                  ${p.package ? `<span class="text-[10px] font-mono text-slate-400">(${p.package})</span>` : ''}
                  <span class="text-slate-400 text-[11px] truncate hidden sm:inline">• ${p.desc || p.category}</span>
                </div>
                <div class="flex items-center gap-2 shrink-0 ml-2">
                  <span class="text-[10px] text-slate-400">${p.location || 'Chưa xếp ô'}</span>
                  <span class="font-mono font-bold text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/60">
                    Đang cắm: ${p.inUse}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
      }).join('');

      // Kiểm tra xem có linh kiện nào có inUse > 0 nhưng chưa gán Project không
      const unassignedInUse = parts.filter(p => Number(p.inUse) > 0 && !p.project);
      if (unassignedInUse.length > 0) {
        html += `
        <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex flex-col gap-2 mt-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <i data-lucide="alert-circle" class="w-4 h-4"></i> Linh kiện đang cắm chưa đặt tên dự án (${unassignedInUse.length} loại)
            </span>
            <button onclick="promptAssignUnassignedProject()" class="text-xs text-amber-300 hover:underline">Gán nhanh vào dự án</button>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${unassignedInUse.map(p => `<span class="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-amber-200 border border-amber-500/20 font-mono">${p.name} (x${p.inUse})</span>`).join('')}
          </div>
        </div>`;
      }

      list.innerHTML = html;
      lucide.createIcons();
    }

    function addProject(e) {
      if (e) e.preventDefault();
      const nameInput = document.getElementById('newProjectName');
      const noteInput = document.getElementById('newProjectNote');
      const name = nameInput.value.trim();
      const note = noteInput.value.trim();
      if (!name) return;
      if (projects.some(pr => pr.name.toLowerCase() === name.toLowerCase())) {
        return alert(`Dự án "${name}" đã có trong danh sách rồi!`);
      }
      projects.push({
        id: 'proj_' + Date.now(),
        name: name,
        note: note
      });
      nameInput.value = '';
      noteInput.value = '';
      saveData();
      renderProjectsList();
      populateProjectDatalist();
      renderProjectQuickChips();
    }

    function renameProject(oldName) {
      const newName = prompt(`Nhập tên mới cho dự án "${oldName}":`, oldName);
      if (!newName) return;
      const trimmed = newName.trim();
      if (!trimmed || trimmed === oldName) return;
      if (projects.some(pr => pr.name.toLowerCase() === trimmed.toLowerCase() && pr.name !== oldName)) {
        return alert(`Dự án "${trimmed}" đã tồn tại!`);
      }
      const pObj = projects.find(pr => pr.name === oldName);
      if (pObj) pObj.name = trimmed;

      let count = 0;
      parts.forEach(p => {
        if (p.project && p.project.toLowerCase() === oldName.toLowerCase()) {
          p.project = trimmed;
          count++;
        }
      });
      saveData();
      renderProjectsList();
      populateProjectDatalist();
      renderProjectQuickChips();
      renderParts();
      alert(`Đã đổi tên thành "${trimmed}" và cập nhật ${count} linh kiện!`);
    }

    function deleteProject(projName) {
      if (!confirm(`Xóa dự án "${projName}"? (Các linh kiện cắm trên mạch vẫn được giữ nguyên)`)) return;
      projects = projects.filter(pr => pr.name !== projName);
      parts.forEach(p => {
        if (p.project && p.project.toLowerCase() === projName.toLowerCase()) {
          p.project = '';
        }
      });
      saveData();
      renderProjectsList();
      populateProjectDatalist();
      renderProjectQuickChips();
      renderParts();
    }

    function returnPartsFromProject(projName) {
      const affected = parts.filter(p => p.project && p.project.toLowerCase() === projName.toLowerCase() && Number(p.inUse) > 0);
      if (affected.length === 0) return alert('Dự án này hiện không có linh kiện nào đang cắm!');
      
      const count = affected.reduce((s, p) => s + Number(p.inUse || 0), 0);
      if (!confirm(`Xác nhận đã tháo mạch "${projName}"?\nToàn bộ ${count} con IC / linh kiện đang cắm sẽ được rút về hộp (Đang cắm = 0).`)) return;

      affected.forEach(p => {
        p.inUse = 0;
      });
      saveData();
      renderProjectsList();
      renderParts();
      alert(`Đã thu hồi thành công ${count} linh kiện của dự án "${projName}" về hộp!`);
    }

    function filterPartsByProject(projName) {
      selectedInUseProject = projName || 'all';
      closeProjectsModal();
      setViewMode('inuse');
      const search = document.getElementById('searchInput');
      if (search && search.value === projName) {
        search.value = '';
      }
      renderParts();
    }

    function viewAllInUseParts() {
      selectedInUseProject = 'all';
      closeProjectsModal();
      setViewMode('inuse');
      const search = document.getElementById('searchInput');
      if (search) search.value = '';
      renderParts();
    }

    function renderInUseProjectFilterBar() {
      const bar = document.getElementById('inUseProjectFilterBar');
      const chips = document.getElementById('inUseProjectChips');
      if (!bar || !chips) return;
      if (currentViewMode !== 'inuse') {
        bar.classList.add('hidden');
        return;
      }
      bar.classList.remove('hidden');

      const allInUseParts = parts.filter(p => Number(p.inUse) > 0);
      const isAllActive = !selectedInUseProject || selectedInUseProject === 'all';

      let html = `
        <button type="button" onclick="filterPartsByProject('all')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${isAllActive ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}">
          <span>Tất cả mạch</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isAllActive ? 'bg-sky-700 text-white' : 'bg-slate-900 text-sky-300'} font-mono">${allInUseParts.length}</span>
        </button>
      `;

      projects.forEach(pr => {
        const pList = allInUseParts.filter(p => p.project && p.project.toLowerCase() === pr.name.toLowerCase());
        const isAct = selectedInUseProject && selectedInUseProject.toLowerCase() === pr.name.toLowerCase();
        const esc = pr.name.replace(/'/g, "\\'");
        html += `
          <button type="button" onclick="filterPartsByProject('${esc}')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${isAct ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}">
            <span>${pr.name}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isAct ? 'bg-sky-700 text-white' : 'bg-slate-900 text-sky-300'} font-mono">${pList.length}</span>
          </button>
        `;
      });

      const unassignedList = allInUseParts.filter(p => !p.project);
      if (unassignedList.length > 0) {
        const isAct = selectedInUseProject === '__unassigned__';
        html += `
          <button type="button" onclick="filterPartsByProject('__unassigned__')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${isAct ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'}">
            <i data-lucide="alert-circle" class="w-3 h-3"></i>
            <span>Chưa gán</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-300 font-mono">${unassignedList.length}</span>
          </button>
        `;
      }

      if (selectedInUseProject && selectedInUseProject !== 'all' && selectedInUseProject !== '__unassigned__') {
        const escProj = selectedInUseProject.replace(/'/g, "\\'");
        html += `
          <button type="button" onclick="openBomModal('${escProj}')" class="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-medium transition flex items-center gap-1 shrink-0 ml-auto" title="Xem bảng BoM của dự án này">
            <i data-lucide="clipboard-list" class="w-3.5 h-3.5"></i> Bảng BoM
          </button>
        `;
      }

      chips.innerHTML = html;
      lucide.createIcons();
    }

    function promptAssignUnassignedProject() {
      const unassigned = parts.filter(p => Number(p.inUse) > 0 && !p.project);
      if (unassigned.length === 0) return;
      const targetProj = prompt('Nhập tên Dự án muốn gán cho các linh kiện chưa có dự án:\n(Gợi ý: ' + projects.map(p=>p.name).join(', ') + ')', projects[0]?.name || 'Breadboard mới');
      if (!targetProj || !targetProj.trim()) return;
      const tName = targetProj.trim();
      if (!projects.some(pr => pr.name.toLowerCase() === tName.toLowerCase())) {
        projects.push({ id: 'proj_' + Date.now(), name: tName, note: '' });
      }
      unassigned.forEach(p => p.project = tName);
      saveData();
      renderProjectsList();
      populateProjectDatalist();
      renderProjectQuickChips();
      renderParts();
    }



    // =========================================================================
    // FEATURE 2: BẢNG KÊ LINH KIỆN BOM & GOM ĐỒ DỰ ÁN (PROJECT KITTING)
    // =========================================================================

    let currentBomProjectName = null;

    function openBomModal(projectName) {
      if (!projectName) {
        if (projects.length > 0) projectName = projects[0].name;
        else {
          alert('Chưa có dự án nào! Bạn hãy tạo dự án mới trước nhé.');
          return openProjectsModal();
        }
      }

      currentBomProjectName = projectName;
      renderBomTable(projectName);
      document.getElementById('bomModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeBomModal() {
      document.getElementById('bomModal').classList.add('hidden');
    }

    function renderBomTable(projectName) {
      const proj = projects.find(x => x.name.toLowerCase() === projectName.toLowerCase()) || { name: projectName, note: '' };
      document.getElementById('bomModalProjectName').innerText = `Dự án: ${proj.name}`;
      document.getElementById('bomModalProjectNote').innerText = proj.note || 'Bảng kê linh kiện (Bill of Materials), kiểm tra tồn kho & gom đồ lên mạch';

      const projParts = parts.filter(p => p.project && p.project.toLowerCase() === projectName.toLowerCase());

      const totalTypes = projParts.length;
      const totalInUse = projParts.reduce((s, p) => s + Number(p.inUse || 0), 0);
      const totalInBox = projParts.reduce((s, p) => s + Number(p.qty || 0), 0);
      const missingCount = projParts.filter(p => Number(p.qty || 0) === 0 && Number(p.inUse || 0) === 0).length;

      document.getElementById('bomStatTotalTypes').innerText = totalTypes;
      document.getElementById('bomStatInUse').innerText = totalInUse;
      document.getElementById('bomStatInBox').innerText = totalInBox;
      document.getElementById('bomStatMissing').innerText = missingCount;

      const badge = document.getElementById('bomModalStatusBadge');
      if (projParts.length === 0) {
        badge.className = 'text-xs px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-400 border border-slate-700';
        badge.innerText = 'Chưa có linh kiện';
      } else if (missingCount > 0) {
        badge.className = 'text-xs px-2 py-0.5 rounded-full font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30';
        badge.innerText = `Thiếu ${missingCount} loại`;
      } else if (totalInBox === 0 && totalInUse > 0) {
        badge.className = 'text-xs px-2 py-0.5 rounded-full font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30';
        badge.innerText = 'Đã cắm hết lên mạch';
      } else {
        badge.className = 'text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
        badge.innerText = 'Sẵn sàng gom đồ';
      }

      const tbody = document.getElementById('bomTableBody');
      if (projParts.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-8 text-slate-500">
              <i data-lucide="package-search" class="w-8 h-8 mx-auto mb-2 text-slate-600"></i>
              Dự án này chưa có linh kiện nào trong danh sách BoM.<br>
              <span class="text-xs text-slate-400 mt-1 inline-block">Hãy chọn linh kiện ở ô bên dưới để thêm vào dự án!</span>
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = projParts.map(p => {
          const inUse = Number(p.inUse || 0);
          const inBox = Number(p.qty || 0);
          const isOut = inBox === 0;
          const alts = isOut ? findInStockReplacements(p.name, p.id) : [];

          let statusCol = '';
          if (inUse > 0 && inBox > 0) {
            statusCol = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Đủ (Cắm ${inUse} + Dư ${inBox})
            </span>`;
          } else if (inUse > 0 && inBox === 0) {
            statusCol = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Đã cắm hết (${inUse})
            </span>`;
          } else if (inUse === 0 && inBox > 0) {
            statusCol = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Chờ gom lên (${inBox})
            </span>`;
          } else {
            if (alts.length > 0) {
              statusCol = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-medium" title="Có ${alts[0].name} sẵn trong kho">
                ⚡ Có IC thay thế (${alts[0].name})
              </span>`;
            } else if (!p.boxId || p.location === 'Chưa có trong kho') {
              statusCol = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Chưa có trong kho (Cần: ${p.minQty || 1})
              </span>`;
            } else {
              statusCol = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-medium">
                🔴 Hết hàng
              </span>`;
            }
          }

          const hasBox = !!p.boxId;
          const locCellHtml = hasBox ? `
            <button onclick="closeBomModal(); locateInBox('${p.boxId}', '${p.cell}', '${p.subCell || ''}')" class="text-amber-300 hover:underline flex items-center gap-1 text-[11px]" title="Bấm để xem ô cất">
              <i data-lucide="map-pin" class="w-3 h-3 text-amber-400"></i>
              <span class="truncate max-w-[120px]">${p.location || 'Chưa xếp ô'}</span>
            </button>
          ` : `
            <button onclick="closeBomModal(); openPartModal('${p.id}')" class="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1 transition" title="Bấm để xếp linh kiện này vào hộp">
              <i data-lucide="package-plus" class="w-3 h-3 text-amber-400"></i> Xếp vào hộp
            </button>
          `;

          return `
          <tr class="hover:bg-slate-800/40 transition">
            <td class="py-2.5 px-3">
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-white font-mono">${p.name}</span>
                ${p.package ? `<span class="text-[10px] font-mono text-slate-400">(${p.package})</span>` : ''}
              </div>
              <p class="text-[11px] text-slate-400 truncate max-w-[200px]">${p.desc || p.category}</p>
            </td>
            <td class="py-2.5 px-2">
              ${locCellHtml}
            </td>
            <td class="py-2.5 px-2 text-center">
              <div class="inline-flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                <button onclick="moveBomPartStock('${p.id}', 'to_box')" class="w-5 h-5 rounded hover:bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs" title="Rút 1 con về hộp">-</button>
                <span class="font-mono font-bold text-xs px-1 text-sky-400 min-w-[20px]">${inUse}</span>
                <button onclick="moveBomPartStock('${p.id}', 'to_board')" class="w-5 h-5 rounded hover:bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs" title="Cắm thêm 1 con lên mạch">+</button>
              </div>
            </td>
            <td class="py-2.5 px-2 text-center font-mono font-bold ${inBox > 0 ? 'text-emerald-400' : 'text-rose-400'}">
              ${inBox}
            </td>
            <td class="py-2.5 px-2 text-center">
              ${statusCol}
            </td>
            <td class="py-2.5 px-3 text-right">
              <div class="inline-flex items-center gap-1">
                ${isOut ? `
                  <button onclick="openReplaceModal('${p.id}')" class="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition" title="Tra cứu IC thay thế">
                    <i data-lucide="git-compare" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="openBuyModal('${p.id}')" class="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition" title="Mua từ 4 Shop">
                    <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
                  </button>
                ` : ''}
                ${!hasBox ? `
                  <button onclick="closeBomModal(); openPartModal('${p.id}')" class="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition" title="Xếp linh kiện này vào hộp">
                    <i data-lucide="box" class="w-3.5 h-3.5"></i>
                  </button>
                ` : ''}
                <button onclick="removePartFromBomProject('${p.id}')" class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition" title="Gỡ linh kiện khỏi dự án này">
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          </tr>
          `;
        }).join('');
      }

      renderBomQuickAddSelect();
      lucide.createIcons();
    }

    function switchBomAddTab(tab) {
      const stockBtn = document.getElementById('tabBomAddFromStock');
      const customBtn = document.getElementById('tabBomAddCustom');
      const stockPanel = document.getElementById('bomAddStockPanel');
      const customPanel = document.getElementById('bomAddCustomPanel');
      if (!stockBtn || !customBtn || !stockPanel || !customPanel) return;

      if (tab === 'stock') {
        stockBtn.className = 'px-2.5 py-1 rounded-md text-[11px] font-medium transition bg-sky-600 text-white';
        customBtn.className = 'px-2.5 py-1 rounded-md text-[11px] font-medium transition text-slate-400 hover:text-white';
        stockPanel.classList.remove('hidden');
        customPanel.classList.add('hidden');
      } else {
        customBtn.className = 'px-2.5 py-1 rounded-md text-[11px] font-medium transition bg-sky-600 text-white';
        stockBtn.className = 'px-2.5 py-1 rounded-md text-[11px] font-medium transition text-slate-400 hover:text-white';
        customPanel.classList.remove('hidden');
        stockPanel.classList.add('hidden');
        setTimeout(() => {
          const input = document.getElementById('bomCustomPartName');
          if (input) input.focus();
        }, 50);
      }
    }

    async function addCustomPartToBom() {
      const nameInput = document.getElementById('bomCustomPartName');
      const pkgInput = document.getElementById('bomCustomPartPkg');
      const qtyInput = document.getElementById('bomCustomPartQty');

      if (!nameInput || !nameInput.value.trim() || !currentBomProjectName) {
        return alert('Vui lòng nhập tên IC / linh kiện!');
      }

      const rawName = nameInput.value.trim();
      const pkg = pkgInput ? pkgInput.value.trim() : '';
      const neededQty = qtyInput ? Math.max(1, parseInt(qtyInput.value) || 1) : 1;

      // Kiểm tra xem linh kiện này đã tồn tại trong parts chưa
      let existing = parts.find(p => p.name.toLowerCase() === rawName.toLowerCase());
      if (existing) {
        existing.project = currentBomProjectName;
        existing.minQty = Math.max(existing.minQty || 0, neededQty);
      } else {
        let autoCat = detectSmartCategory(rawName, pkg);
        let autoDesc = '';
        const knowledge = lookupComponentKnowledge(rawName);
        if (knowledge) {
          if (knowledge.desc) autoDesc = knowledge.desc;
          if (knowledge.cat) autoCat = knowledge.cat;
        }

        const newPart = {
          id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: rawName,
          category: autoCat,
          package: pkg || (knowledge ? knowledge.pkg : ''),
          project: currentBomProjectName,
          location: 'Chưa có trong kho',
          boxId: '',
          cell: '',
          subCell: '',
          qty: 0,
          inUse: 0,
          minQty: neededQty,
          desc: autoDesc || `Linh kiện cần dùng cho dự án ${currentBomProjectName}`,
          pinout: (knowledge && knowledge.pinout) ? knowledge.pinout : '',
          datasheet: '',
          buyUrl: '',
          notes: `Linh kiện dự án ${currentBomProjectName} (Cần: ${neededQty})`,
          favorite: false
        };

        parts.unshift(newPart);

        if (!categories.includes(autoCat)) {
          categories.push(autoCat);
        }
      }

      // Reset form
      nameInput.value = '';
      if (pkgInput) pkgInput.value = '';
      if (qtyInput) qtyInput.value = '1';

      saveData();
      renderBomTable(currentBomProjectName);
      renderParts();

      // Tự động tìm pinout/mô tả nếu có server
      try {
        enrichSinglePartData(existing || parts[0]);
      } catch(e) {}
    }

    function renderBomQuickAddSelect() {
      const select = document.getElementById('bomAddPartSelect');
      if (!select || !currentBomProjectName) return;

      const availableParts = parts.filter(p => !p.project || p.project.toLowerCase() !== currentBomProjectName.toLowerCase());
      if (availableParts.length === 0) {
        select.innerHTML = '<option value="">(Tất cả linh kiện đã ở trong dự án này)</option>';
        return;
      }

      select.innerHTML = '<option value="">-- Chọn linh kiện từ kho để thêm vào --</option>' +
        availableParts.map(p => `
          <option value="${p.id}">
            ${p.name} ${p.package ? `(${p.package})` : ''} - Trong hộp: ${p.qty} con [${p.location || 'Chưa xếp ô'}]
          </option>
        `).join('');
    }

    function addSelectedPartToBom() {
      const select = document.getElementById('bomAddPartSelect');
      if (!select || !select.value || !currentBomProjectName) {
        return alert('Vui lòng chọn 1 linh kiện từ danh sách để thêm vào dự án!');
      }

      const p = parts.find(x => x.id === select.value);
      if (!p) return;

      p.project = currentBomProjectName;
      if (Number(p.inUse || 0) <= 0 && Number(p.qty || 0) > 0) {
        p.inUse = 1;
        p.qty = Number(p.qty) - 1;
      }

      saveData();
      renderBomTable(currentBomProjectName);
      renderParts();
    }

    function removePartFromBomProject(partId) {
      const p = parts.find(x => x.id === partId);
      if (!p) return;
      if (!confirm(`Bạn có chắc muốn gỡ "${p.name}" khỏi dự án "${currentBomProjectName}"? (Số linh kiện đang cắm sẽ được trả về hộp)`)) return;

      p.qty = Number(p.qty || 0) + Number(p.inUse || 0);
      p.inUse = 0;
      p.project = '';
      saveData();
      renderBomTable(currentBomProjectName);
      renderParts();
    }

    function moveBomPartStock(partId, direction) {
      const p = parts.find(x => x.id === partId);
      if (!p) return;

      if (direction === 'to_board') {
        if (Number(p.qty || 0) <= 0) return alert('Trong hộp đã hết linh kiện này để cắm thêm lên mạch!');
        p.qty = Number(p.qty) - 1;
        p.inUse = Number(p.inUse || 0) + 1;
      } else {
        if (Number(p.inUse || 0) <= 0) return;
        p.inUse = Number(p.inUse) - 1;
        p.qty = Number(p.qty || 0) + 1;
      }

      saveData();
      renderBomTable(currentBomProjectName);
      renderParts();
    }

    function kitAllProjectParts() {
      if (!currentBomProjectName) return;
      const projParts = parts.filter(p => p.project && p.project.toLowerCase() === currentBomProjectName.toLowerCase());
      if (projParts.length === 0) return alert('Dự án này chưa có linh kiện nào để gom!');

      let transferredCount = 0;
      projParts.forEach(p => {
        if (Number(p.qty || 0) > 0 && Number(p.inUse || 0) === 0) {
          p.inUse = 1;
          p.qty = Number(p.qty) - 1;
          transferredCount++;
        }
      });

      saveData();
      renderBomTable(currentBomProjectName);
      renderParts();
      alert(`Đã gom nhanh ${transferredCount} linh kiện có sẵn trong hộp lên mạch!`);
    }

    function returnAllProjectPartsFromBom() {
      if (!currentBomProjectName) return;
      if (!confirm(`Bạn có chắc chắn muốn rút toàn bộ linh kiện của dự án "${currentBomProjectName}" về cất lại vào các hộp?`)) return;

      const projParts = parts.filter(p => p.project && p.project.toLowerCase() === currentBomProjectName.toLowerCase());
      let returnedCount = 0;

      projParts.forEach(p => {
        const inUse = Number(p.inUse || 0);
        if (inUse > 0) {
          p.qty = Number(p.qty || 0) + inUse;
          p.inUse = 0;
          returnedCount += inUse;
        }
      });

      saveData();
      renderBomTable(currentBomProjectName);
      renderParts();
      alert(`Đã thu hồi an toàn ${returnedCount} linh kiện từ mạch về các ngăn hộp!`);
    }

    function copyBomText() {
      if (!currentBomProjectName) return;
      const projParts = parts.filter(p => p.project && p.project.toLowerCase() === currentBomProjectName.toLowerCase());
      if (projParts.length === 0) return alert('Dự án chưa có linh kiện nào để sao chép!');

      let text = `BẢNG KÊ LINH KIỆN (BOM) - DỰ ÁN: ${currentBomProjectName.toUpperCase()}\n`;
      text += `Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}\n`;
      text += `------------------------------------------------------------\n`;
      text += `STT | Tên Linh Kiện | Kiểu Chân | Đang Cắm | Trong Hộp | Vị Trí Cất\n`;
      text += `------------------------------------------------------------\n`;

      projParts.forEach((p, idx) => {
        text += `${idx + 1}. ${(p.name || '').padEnd(12)} | ${(p.package || 'N/A').padEnd(8)} | Cắm: ${String(p.inUse || 0).padEnd(4)} | Hộp: ${String(p.qty || 0).padEnd(4)} | ${p.location || 'Chưa xếp ô'}\n`;
      });
      text += `------------------------------------------------------------\n`;
      text += `Tổng cộng: ${projParts.length} loại linh kiện.\n`;

      navigator.clipboard.writeText(text).then(() => {
        alert('Đã sao chép Bảng kê BoM vào Clipboard thành công!');
      }).catch(() => {
        prompt('Copy bảng BoM tại đây:', text);
      });
    }

    function exportBomCSV() {
      if (!currentBomProjectName) return;
      const projParts = parts.filter(p => p.project && p.project.toLowerCase() === currentBomProjectName.toLowerCase());
      if (projParts.length === 0) return alert('Dự án chưa có linh kiện nào để xuất!');

      let csvContent = '\uFEFF'; // UTF-8 BOM cho Microsoft Excel nhận tiếng Việt
      csvContent += 'STT,Tên Linh Kiện,Kiểu Chân (Package),Mô Tả,Đang Cắm Trên Mạch,Sẵn Có Trong Hộp,Vị Trí Cất,Trạng Thái\n';

      projParts.forEach((p, idx) => {
        const inUse = Number(p.inUse || 0);
        const inBox = Number(p.qty || 0);
        const status = inBox === 0 ? (inUse > 0 ? 'Đã cắm hết' : 'Hết hàng') : 'Đủ dùng';

        const row = [
          idx + 1,
          `"${(p.name || '').replace(/"/g, '""')}"`,
          `"${(p.package || '').replace(/"/g, '""')}"`,
          `"${(p.desc || p.category || '').replace(/"/g, '""')}"`,
          inUse,
          inBox,
          `"${(p.location || '').replace(/"/g, '""')}"`,
          `"${status}"`
        ];
        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BoM_${currentBomProjectName.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function printBomTable() {
      if (!currentBomProjectName) return;
      const projParts = parts.filter(p => p.project && p.project.toLowerCase() === currentBomProjectName.toLowerCase());
      if (projParts.length === 0) return alert('Dự án chưa có linh kiện nào để in!');

      const printWin = window.open('', '_blank');
      if (!printWin) return alert('Vui lòng cho phép mở popup để in bảng BoM!');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Bảng Kê BoM - ${currentBomProjectName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h2 { margin-bottom: 4px; }
            p { color: #555; margin-top: 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
            th { background-color: #f4f4f4; font-weight: bold; }
            .text-center { text-align: center; }
            .checkbox { width: 16px; height: 16px; border: 1px solid #666; display: inline-block; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h2>BẢNG KÊ LINH KIỆN (BoM) - DỰ ÁN: ${currentBomProjectName}</h2>
              <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')} • EE Lab Inventory</p>
            </div>
            <button onclick="window.print()" style="padding: 8px 16px; cursor: pointer; font-weight: bold;">In Ngay</button>
          </div>
          <table>
            <thead>
              <tr>
                <th class="text-center" style="width: 30px;">#</th>
                <th>Tên Linh Kiện</th>
                <th>Kiểu Chân</th>
                <th>Vị Trí Cất</th>
                <th class="text-center">Đang Cắm</th>
                <th class="text-center">Trong Hộp</th>
                <th class="text-center" style="width: 60px;">Đã Lấy</th>
              </tr>
            </thead>
            <tbody>
              ${projParts.map((p, i) => `
                <tr>
                  <td class="text-center">${i + 1}</td>
                  <td><b>${p.name}</b><br><small style="color:#666;">${p.desc || p.category}</small></td>
                  <td>${p.package || '-'}</td>
                  <td>${p.location || 'Chưa xếp ô'}</td>
                  <td class="text-center">${p.inUse || 0}</td>
                  <td class="text-center">${p.qty || 0}</td>
                  <td class="text-center"><div class="checkbox"></div></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
    }

