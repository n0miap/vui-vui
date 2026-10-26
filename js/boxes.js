// =========================================================================
// MODULE: BOXES & STORAGE MAP (QUẢN LÝ SƠ ĐỒ HỘP & VẼ LƯỚI NGĂN CHỨA)
// =========================================================================

    // ================= QUẢN LÝ SƠ ĐỒ HỘP NHỰA TỰ DO =================
    let isQuickDivideMode = false;

    function getRowLabel(rIndex) {
      return String.fromCharCode(65 + rIndex); // 0 -> A, 1 -> B, 2 -> C...
    }

    function toggleQuickDivideMode() {
      isQuickDivideMode = !isQuickDivideMode;
      const btn = document.getElementById('btnQuickDivideMode');
      const banner = document.getElementById('quickDivideBanner');
      const txt = document.getElementById('txtQuickDivideMode');
      if (isQuickDivideMode) {
        if (btn) btn.className = 'text-xs text-slate-950 font-bold bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-md shadow-amber-950/40 ring-2 ring-amber-400/50';
        if (txt) txt.innerText = 'Đang sửa vách...';
        if (banner) banner.classList.remove('hidden');
      } else {
        if (btn) btn.className = 'text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition flex items-center gap-1';
        if (txt) txt.innerText = 'Sửa vách nhanh';
        if (banner) banner.classList.add('hidden');
      }
      renderVisualBoxGrid();
      lucide.createIcons();
    }

    function isCellDivided(box, cellCode) {
      if (!box) return false;
      const upper = cellCode.toUpperCase();
      if (Array.isArray(box.dividedCells)) {
        return box.dividedCells.includes(upper);
      }
      return parts.some(p => p.boxId === box.id && p.cell && p.cell.toUpperCase() === upper && (p.subCell === '1' || p.subCell === '2'));
    }

    function isMergedLeader(box, cellCode) {
      if (!box || !Array.isArray(box.mergedPairs)) return null;
      const upper = cellCode.toUpperCase();
      return box.mergedPairs.find(pair => pair[0].toUpperCase() === upper) || null;
    }

    function isMergedFollower(box, cellCode) {
      if (!box || !Array.isArray(box.mergedPairs)) return false;
      const upper = cellCode.toUpperCase();
      return box.mergedPairs.some(pair => pair[1].toUpperCase() === upper);
    }

    function openBoxesModal(boxId = null, highlightCell = null, highlightSubCell = null) {
      if (boxId) activePreviewBoxId = boxId;
      else if (!activePreviewBoxId && boxes.length > 0) activePreviewBoxId = boxes[0].id;
      activeHighlightCell = highlightCell;
      activeHighlightSubCell = highlightSubCell;

      renderBoxesList();
      renderVisualBoxGrid();
      document.getElementById('boxesModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeBoxesModal() {
      activeHighlightCell = null;
      activeHighlightSubCell = null;
      if (isQuickDivideMode) toggleQuickDivideMode();
      document.getElementById('boxesModal').classList.add('hidden');
    }

    function locateInBox(boxId, cell, subCell = '') {
      if (!boxId || !boxes.find(b => b.id === boxId)) {
        return alert('Linh kiện này chưa được gán vào sơ đồ hộp nào. Hãy bấm nút Sửa linh kiện -> Chọn Hộp & Ô trên lưới!');
      }
      openBoxesModal(boxId, cell, subCell);
    }

    function renderBoxesList() {
      const list = document.getElementById('boxesList');
      if (boxes.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500">Chưa có hộp nào. Hãy tạo ở khung bên trên.</p>`;
        return;
      }
      list.innerHTML = boxes.map(b => {
        const isSelected = b.id === activePreviewBoxId;
        const countParts = parts.filter(p => p.boxId === b.id).length;
        const dividedCount = (b.dividedCells || []).length;
        const mergedCount = (b.mergedPairs || []).length;
        return `
        <div onclick="selectPreviewBox('${b.id}')" class="p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${isSelected ? 'bg-amber-500/15 border-amber-500/50 text-white' : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:border-slate-600'}">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-xs">${b.name}</span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-amber-300">${b.rows}×${b.cols} (${b.rows * b.cols} ô)</span>
              ${dividedCount > 0 ? `<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">${dividedCount} ô chia ngăn</span>` : ''}
              ${mergedCount > 0 ? `<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">${mergedCount} ô đôi</span>` : ''}
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">${b.note || 'Đang chứa ' + countParts + ' mã linh kiện'}</p>
          </div>
          <div class="flex items-center gap-1" onclick="event.stopPropagation()">
            <button onclick="editBox('${b.id}')" class="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white" title="Sửa kích thước / tên hộp">
              <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="deleteBox('${b.id}')" class="p-1.5 rounded hover:bg-slate-700 text-rose-400" title="Xóa hộp">
              <i data-lucide="trash" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>`;
      }).join('');
      lucide.createIcons();
    }

    function selectPreviewBox(boxId) {
      activePreviewBoxId = boxId;
      activeHighlightCell = null;
      activeHighlightSubCell = null;
      renderBoxesList();
      renderVisualBoxGrid();
    }

    function renderVisualBoxGrid() {
      const container = document.getElementById('visualGridContainer');
      const badge = document.getElementById('previewHighlightBadge');
      const box = boxes.find(b => b.id === activePreviewBoxId);

      if (!box) {
        container.innerHTML = `<p class="text-xs text-slate-500">Hãy chọn hoặc tạo một hộp ở cột bên trái.</p>`;
        return;
      }

      const totalCells = box.rows * box.cols;
      const dividedCount = (box.dividedCells || []).length;
      const mergedCount = (box.mergedPairs || []).length;

      document.getElementById('previewBoxTitle').innerText = `${box.name} (${box.rows} hàng × ${box.cols} cột)`;
      document.getElementById('previewBoxSub').innerText = isQuickDivideMode 
        ? '⚡ Đang ở Chế độ Sửa Vách: Nhấp vào ô bất kỳ để chia đôi hoặc gộp lại' 
        : (box.note || `Có ${dividedCount} ô chia 2 ngăn, ${mergedCount} ô đôi, còn lại là ô đơn chuẩn`);

      if (activeHighlightCell) {
        let text = `Vị trí cần lấy: Ô ${activeHighlightCell}`;
        if (activeHighlightSubCell) text += ` (Ngăn ${activeHighlightSubCell})`;
        badge.innerText = text;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }

      let html = `<div class="grid gap-1.5 w-full" style="grid-template-columns: repeat(${box.cols}, minmax(58px, 1fr));">`;
      for (let r = 0; r < box.rows; r++) {
        for (let c = 1; c <= box.cols; c++) {
          const cellCode = `${getRowLabel(r)}${c}`;

          // Nếu ô này là ô phụ bị gộp vào ô trước đó (Merged Follower) thì bỏ qua
          if (isMergedFollower(box, cellCode)) {
            continue;
          }

          // Kiểm tra nếu là ô đôi ghép ngang (Merged Leader)
          const mergedPair = isMergedLeader(box, cellCode);
          if (mergedPair) {
            const pairCode = `${mergedPair[0]}+${mergedPair[1]}`;
            const pairParts = parts.filter(p => p.boxId === box.id && (p.cell.toUpperCase() === pairCode || p.cell.toUpperCase() === mergedPair[0] || p.cell.toUpperCase() === mergedPair[1]));
            const isTargetPair = activeHighlightCell && (activeHighlightCell.toUpperCase() === pairCode || activeHighlightCell.toUpperCase() === mergedPair[0] || activeHighlightCell.toUpperCase() === mergedPair[1]);

            html += `
            <div style="grid-column: span 2;" class="rounded-lg border overflow-hidden flex flex-col justify-between p-1.5 transition ${isTargetPair ? 'border-sky-400 ring-2 ring-sky-400/50 bg-sky-950/40' : 'border-sky-500/40 bg-slate-900/90'} min-h-[58px]">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold text-sky-300 flex items-center gap-1">
                  <i data-lucide="maximize-2" class="w-3 h-3 text-sky-400"></i> ${pairCode} (Ô đôi)
                </span>
                <button type="button" onclick="event.stopPropagation(); unmergeCells('${box.id}', '${mergedPair[0]}')" class="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 hover:bg-rose-600/80 text-slate-300 hover:text-white transition" title="Tách ô đôi ra lại thành 2 ô riêng lẻ">
                  Tách
                </button>
              </div>
              <button type="button" onclick="inspectCell('${box.id}', '${pairCode}')" class="text-left w-full mt-1">
                <span class="text-[10px] font-medium truncate block ${pairParts.length ? 'text-white' : 'text-slate-500'}">${pairParts[0]?.name || 'Trống'}</span>
                ${pairParts.length > 1 ? `<span class="text-[8px] text-slate-400">+${pairParts.length - 1} mã khác</span>` : ''}
              </button>
            </div>`;
            continue;
          }

          const isDivided = isCellDivided(box, cellCode);
          const isTargetCell = activeHighlightCell && activeHighlightCell.toUpperCase() === cellCode;

          if (isDivided) {
            // Ô CHIA ĐÔI (2 ngăn Trước / Sau)
            const parts1 = parts.filter(p => p.boxId === box.id && p.cell.toUpperCase() === cellCode && (p.subCell === '1' || !p.subCell));
            const parts2 = parts.filter(p => p.boxId === box.id && p.cell.toUpperCase() === cellCode && p.subCell === '2');
            const isTargetSub1 = isTargetCell && (activeHighlightSubCell === '1' || !activeHighlightSubCell);
            const isTargetSub2 = isTargetCell && (activeHighlightSubCell === '2' || !activeHighlightSubCell);

            if (isQuickDivideMode) {
              // Trong Chế độ Sửa Vách Nhanh: click vào ô là gộp lại thành ô đơn ngay
              html += `
              <div onclick="toggleDivideCell('${box.id}', '${cellCode}')" class="rounded-lg border-2 border-amber-400 bg-amber-500/10 p-1 flex flex-col justify-between min-h-[58px] cursor-pointer hover:bg-rose-500/20 hover:border-rose-400 transition group relative" title="Nhấp để GỘP ô ${cellCode} lại thành 1 ô đơn">
                <div class="flex items-center justify-between text-[9px] font-mono font-bold text-amber-300">
                  <span>${cellCode}</span>
                  <span class="text-[8px] bg-amber-500/20 px-1 rounded text-amber-200">2 ngăn</span>
                </div>
                <div class="text-[9px] text-center font-bold text-amber-300 group-hover:text-rose-300 flex items-center justify-center gap-0.5">
                  <i data-lucide="minimize-2" class="w-3 h-3"></i> Nhấp để gộp
                </div>
              </div>`;
            } else {
              // Chế độ xem & tương tác bình thường
              html += `
              <div class="rounded-lg border overflow-hidden flex flex-col min-h-[58px] transition ${isTargetCell ? 'border-emerald-400 ring-2 ring-emerald-400/50' : 'border-amber-500/40 bg-slate-900/90'}">
                <!-- Tiêu đề ô có nút Gộp lại nhanh -->
                <div class="flex items-center justify-between px-1.5 py-0.5 bg-slate-950/70 border-b border-slate-800">
                  <span onclick="inspectCell('${box.id}', '${cellCode}')" class="text-[9px] font-mono font-bold cursor-pointer hover:underline ${isTargetCell ? 'text-emerald-300' : 'text-amber-400'}">${cellCode}</span>
                  <button type="button" onclick="event.stopPropagation(); toggleDivideCell('${box.id}', '${cellCode}')" class="p-0.5 rounded hover:bg-slate-700 text-amber-400 hover:text-rose-400 transition" title="Gộp ô ${cellCode} lại thành 1 ô đơn">
                    <i data-lucide="minimize-2" class="w-2.5 h-2.5"></i>
                  </button>
                </div>
                <!-- Ngăn 1 (Trước / Trái) -->
                <button type="button" onclick="inspectCell('${box.id}', '${cellCode}', '1')" class="p-1 flex-1 flex items-center justify-between text-left transition w-full ${isTargetSub1 ? 'bg-emerald-500/30 font-bold cell-highlight' : parts1.length ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200' : 'hover:bg-slate-800/60 text-slate-500'}">
                  <div class="flex items-center gap-1 min-w-0">
                    <span class="text-[8px] font-mono font-bold px-1 rounded bg-slate-950 text-emerald-400">1</span>
                    <span class="text-[9px] truncate max-w-[42px] ${parts1.length ? 'text-white font-medium' : 'text-slate-500'}">${parts1[0]?.name || 'Trống'}</span>
                  </div>
                  ${parts1.length > 1 ? `<span class="text-[8px] px-1 rounded bg-slate-950 text-slate-300">+${parts1.length - 1}</span>` : ''}
                </button>
                <!-- Đường vách ngăn ở giữa -->
                <div class="border-t border-dashed border-amber-500/30"></div>
                <!-- Ngăn 2 (Sau / Phải) -->
                <button type="button" onclick="inspectCell('${box.id}', '${cellCode}', '2')" class="p-1 flex-1 flex items-center justify-between text-left transition w-full ${isTargetSub2 ? 'bg-emerald-500/30 font-bold cell-highlight' : parts2.length ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200' : 'hover:bg-slate-800/60 text-slate-500'}">
                  <div class="flex items-center gap-1 min-w-0">
                    <span class="text-[8px] font-mono font-bold px-1 rounded bg-slate-950 text-sky-400">2</span>
                    <span class="text-[9px] truncate max-w-[42px] ${parts2.length ? 'text-white font-medium' : 'text-slate-500'}">${parts2[0]?.name || 'Trống'}</span>
                  </div>
                  ${parts2.length > 1 ? `<span class="text-[8px] px-1 rounded bg-slate-950 text-slate-300">+${parts2.length - 1}</span>` : ''}
                </button>
              </div>`;
            }
          } else {
            // Ô ĐƠN CHUẨN (1 ngăn không chia)
            const cellParts = parts.filter(p => p.boxId === box.id && p.cell.toUpperCase() === cellCode);
            const isTarget = isTargetCell;
            const firstPartName = cellParts[0] ? cellParts[0].name : 'Trống';
            const moreCount = cellParts.length > 1 ? `+${cellParts.length - 1}` : '';

            if (isQuickDivideMode) {
              // Trong Chế độ Sửa Vách Nhanh: click vào ô là chia đôi ngay
              html += `
              <div onclick="toggleDivideCell('${box.id}', '${cellCode}')" class="rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/90 p-1 flex flex-col justify-between min-h-[58px] cursor-pointer hover:border-emerald-400 hover:bg-emerald-500/10 transition group" title="Nhấp để CHIA ĐÔI ô ${cellCode} thành 2 ngăn">
                <div class="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400 group-hover:text-emerald-300">
                  <span>${cellCode}</span>
                  <span class="text-[8px] bg-slate-800 px-1 rounded">1 ô</span>
                </div>
                <div class="text-[9px] text-center font-bold text-slate-500 group-hover:text-emerald-400 flex items-center justify-center gap-0.5">
                  <i data-lucide="scissors" class="w-3 h-3"></i> Nhấp để chia
                </div>
              </div>`;
            } else {
              // Chế độ xem & tương tác bình thường
              const cellStyle = isTarget
                ? 'bg-emerald-500/30 border-2 border-emerald-400 text-white cell-highlight'
                : cellParts.length > 0
                ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-400 text-slate-100'
                : 'bg-slate-900/70 hover:bg-slate-800 border border-slate-800 text-slate-500';

              html += `
              <div onclick="inspectCell('${box.id}', '${cellCode}')" class="p-1.5 rounded-lg flex flex-col justify-between items-start text-left min-h-[58px] transition cursor-pointer ${cellStyle}">
                <div class="w-full flex items-center justify-between">
                  <span class="text-[10px] font-mono font-bold ${isTarget ? 'text-emerald-300' : 'text-slate-400'}">${cellCode}</span>
                  <div class="flex items-center gap-1">
                    ${moreCount ? `<span class="text-[9px] px-1 rounded bg-slate-950 text-slate-300">${moreCount}</span>` : ''}
                    <button type="button" onclick="event.stopPropagation(); toggleDivideCell('${box.id}', '${cellCode}')" class="p-0.5 rounded hover:bg-slate-700 text-slate-500 hover:text-amber-400 transition" title="Chia đôi ô ${cellCode} thành 2 ngăn">
                      <i data-lucide="scissors" class="w-2.5 h-2.5"></i>
                    </button>
                  </div>
                </div>
                <span class="text-[10px] font-medium truncate w-full mt-1 ${cellParts.length ? 'text-white' : 'text-slate-600'}">${firstPartName}</span>
              </div>`;
            }
          }
        }
      }
      html += `</div>`;
      container.innerHTML = html;

      if (activeHighlightCell) {
        inspectCell(box.id, activeHighlightCell.toUpperCase(), activeHighlightSubCell);
      } else {
        document.getElementById('cellDetailPanel').innerHTML = `<p class="text-xs text-slate-400">Chạm vào một ô bất kỳ bên trên để xem chi tiết hoặc tùy chỉnh chia / ghép ô đó.</p>`;
      }
      lucide.createIcons();
    }

    function inspectCell(boxId, cellCode, targetSubCell = null) {
      activeHighlightCell = cellCode;
      activeHighlightSubCell = targetSubCell;
      const box = boxes.find(b => b.id === boxId);
      if (!box) return;

      const upperCode = cellCode.toUpperCase();
      const panel = document.getElementById('cellDetailPanel');

      // 1. Trường hợp ô đôi ghép ngang (Merged Pair)
      if (upperCode.includes('+') || isMergedLeader(box, upperCode)) {
        const leader = upperCode.includes('+') ? upperCode.split('+')[0] : upperCode;
        const pair = isMergedLeader(box, leader) || upperCode.split('+');
        const pairCode = `${pair[0]}+${pair[1]}`;
        const pairParts = parts.filter(p => p.boxId === boxId && (p.cell.toUpperCase() === pairCode || p.cell.toUpperCase() === pair[0] || p.cell.toUpperCase() === pair[1]));

        panel.innerHTML = `
          <div class="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2.5 flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-sky-300">${box.name} — Ô đôi ${pairCode}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium">Ô đôi ghép ngang (Rộng 2 ô)</span>
            </div>
            <button onclick="unmergeCells('${box.id}', '${pair[0]}')" class="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 transition">
              <i data-lucide="scissors" class="w-3.5 h-3.5"></i> Tách ô đôi thành 2 ô riêng (${pair[0]} & ${pair[1]})
            </button>
          </div>
          <div class="flex flex-col gap-1.5 mt-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-slate-400">Các linh kiện cất trong ô đôi này:</span>
              <button onclick="addPartToSpecificCell('${box.id}', '${pairCode}')" class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i> Bỏ linh kiện vào ô đôi
              </button>
            </div>
            ${pairParts.length === 0 ? '<p class="text-xs text-slate-500 py-2">Ô đôi này hiện đang trống.</p>' : pairParts.map(p => `
              <div class="flex items-center justify-between bg-slate-800/90 px-2.5 py-1.5 rounded-lg text-xs">
                <div>
                  <span class="font-bold text-white">${p.name}</span>
                  <span class="text-slate-400 ml-1">(${p.desc || p.category})</span>
                </div>
                <span class="font-mono font-bold text-emerald-400">Trong hộp: ${p.qty}</span>
              </div>
            `).join('')}
          </div>
        `;
        lucide.createIcons();
        return;
      }

      // 2. Trường hợp ô chia 2 ngăn
      const isDivided = isCellDivided(box, upperCode);
      if (isDivided) {
        const parts1 = parts.filter(p => p.boxId === boxId && p.cell.toUpperCase() === upperCode && (p.subCell === '1' || !p.subCell));
        const parts2 = parts.filter(p => p.boxId === boxId && p.cell.toUpperCase() === upperCode && p.subCell === '2');

        panel.innerHTML = `
          <div class="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2.5 flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-amber-300">${box.name} — Ô ${upperCode}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">Đang chia 2 ngăn</span>
            </div>
            <button onclick="toggleDivideCell('${box.id}', '${upperCode}')" class="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 transition">
              <i data-lucide="minimize-2" class="w-3.5 h-3.5"></i> Gộp lại thành 1 ô đơn
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <!-- NGĂN 1 -->
            <div class="bg-slate-800/80 border ${targetSubCell === '1' ? 'border-emerald-400 ring-1 ring-emerald-400/50' : 'border-slate-700/80'} rounded-xl p-2.5 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <i data-lucide="layers" class="w-3.5 h-3.5"></i> Ngăn 1 (Trước / Trái)
                  </span>
                  <button onclick="addPartToSpecificCell('${box.id}', '${upperCode}', '1')" class="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded-md font-medium transition flex items-center gap-1">
                    <i data-lucide="plus" class="w-3 h-3"></i> Thêm vào Ngăn 1
                  </button>
                </div>
                ${parts1.length === 0 ? '<p class="text-[11px] text-slate-500 py-1">Ngăn 1 đang trống.</p>' : `
                  <div class="flex flex-col gap-1.5">
                    ${parts1.map(p => `
                      <div class="flex items-center justify-between bg-slate-900/90 px-2.5 py-1.5 rounded-lg text-xs">
                        <div class="min-w-0">
                          <span class="font-bold text-white">${p.name}</span>
                          <span class="text-slate-400 text-[11px] ml-1 truncate">(${p.desc || p.category})</span>
                        </div>
                        <span class="font-mono font-bold text-emerald-400 ml-2 shrink-0">Trong hộp: ${p.qty}</span>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>

            <!-- NGĂN 2 -->
            <div class="bg-slate-800/80 border ${targetSubCell === '2' ? 'border-emerald-400 ring-1 ring-emerald-400/50' : 'border-slate-700/80'} rounded-xl p-2.5 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-sky-400 flex items-center gap-1">
                    <i data-lucide="layers" class="w-3.5 h-3.5"></i> Ngăn 2 (Sau / Phải)
                  </span>
                  <button onclick="addPartToSpecificCell('${box.id}', '${upperCode}', '2')" class="text-[11px] bg-sky-600 hover:bg-sky-500 text-white px-2 py-0.5 rounded-md font-medium transition flex items-center gap-1">
                    <i data-lucide="plus" class="w-3 h-3"></i> Thêm vào Ngăn 2
                  </button>
                </div>
                ${parts2.length === 0 ? '<p class="text-[11px] text-slate-500 py-1">Ngăn 2 đang trống.</p>' : `
                  <div class="flex flex-col gap-1.5">
                    ${parts2.map(p => `
                      <div class="flex items-center justify-between bg-slate-900/90 px-2.5 py-1.5 rounded-lg text-xs">
                        <div class="min-w-0">
                          <span class="font-bold text-white">${p.name}</span>
                          <span class="text-slate-400 text-[11px] ml-1 truncate">(${p.desc || p.category})</span>
                        </div>
                        <span class="font-mono font-bold text-sky-400 ml-2 shrink-0">Trong hộp: ${p.qty}</span>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
          </div>
        `;
      } else {
        // 3. Trường hợp ô đơn chuẩn (1 ngăn)
        const cellParts = parts.filter(p => p.boxId === boxId && p.cell.toUpperCase() === upperCode);
        const colNum = parseInt(upperCode.slice(1), 10);
        const canMergeRight = colNum < box.cols && !isMergedLeader(box, `${upperCode[0]}${colNum + 1}`) && !isMergedFollower(box, `${upperCode[0]}${colNum + 1}`);

        const listHtml = cellParts.length === 0
          ? `<p class="text-xs text-slate-400 mt-2">Ô <b>${upperCode}</b> hiện đang trống.</p>`
          : `<div class="flex flex-col gap-1.5 mt-2">
              ${cellParts.map(p => `
                <div class="flex items-center justify-between bg-slate-800/90 px-2.5 py-1.5 rounded-lg text-xs">
                  <div>
                    <span class="font-bold text-white">${p.name}</span>
                    <span class="text-slate-400 ml-1">(${p.desc || p.category})</span>
                  </div>
                  <span class="font-mono font-bold text-emerald-400">Trong hộp: ${p.qty}</span>
                </div>
              `).join('')}
            </div>`;

        panel.innerHTML = `
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-amber-300">${box.name} — Ô ${upperCode}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">Ô đơn chuẩn</span>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <button onclick="toggleDivideCell('${box.id}', '${upperCode}')" class="text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1" title="Chia ô này làm 2 ngăn (Trước/Sau)">
                <i data-lucide="scissors" class="w-3.5 h-3.5"></i> Chia đôi ô này
              </button>
              ${canMergeRight ? `
                <button onclick="mergeWithNextCell('${box.id}', '${upperCode}')" class="text-xs bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1" title="Ghép với ô bên phải thành 1 ô đôi">
                  <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i> Ghép với ô ${upperCode[0]}${colNum + 1}
                </button>
              ` : ''}
              <button onclick="addPartToSpecificCell('${box.id}', '${upperCode}')" class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i> Bỏ linh kiện vào ô ${upperCode}
              </button>
            </div>
          </div>
          ${listHtml}
        `;
      }
      lucide.createIcons();
    }

    function toggleDivideCell(boxId, cellCode) {
      const box = boxes.find(b => b.id === boxId);
      if (!box) return;
      if (!box.dividedCells) box.dividedCells = [];
      const upperCode = cellCode.toUpperCase();
      const idx = box.dividedCells.indexOf(upperCode);
      if (idx > -1) {
        // Gộp lại thành ô đơn (hủy chia ngăn)
        box.dividedCells.splice(idx, 1);
        parts.forEach(p => {
          if (p.boxId === boxId && p.cell.toUpperCase() === upperCode) {
            p.subCell = '';
            p.location = `${box.name} • ${upperCode}`;
          }
        });
      } else {
        // Chia đôi ô này
        if (box.mergedPairs) {
          box.mergedPairs = box.mergedPairs.filter(p => p[0] !== upperCode && p[1] !== upperCode);
        }
        box.dividedCells.push(upperCode);
        parts.forEach(p => {
          if (p.boxId === boxId && p.cell.toUpperCase() === upperCode) {
            if (!p.subCell) p.subCell = '1';
            p.location = `${box.name} • ${upperCode} (Ngăn 1)`;
          }
        });
      }
      saveData();
      renderVisualBoxGrid();
      renderBoxesList();
      inspectCell(boxId, upperCode);
      renderParts();
    }

    function resetAllToSingleCells() {
      const box = boxes.find(b => b.id === activePreviewBoxId);
      if (!box) return;
      if (!confirm(`Gộp tất cả các ô trong "${box.name}" về dạng ô đơn chuẩn (1 ngăn)?`)) return;
      box.dividedCells = [];
      box.mergedPairs = [];
      parts.forEach(p => {
        if (p.boxId === box.id) {
          p.subCell = '';
          if (p.cell.includes('+')) p.cell = p.cell.split('+')[0];
          p.location = `${box.name} • ${p.cell}`;
        }
      });
      saveData();
      renderVisualBoxGrid();
      renderBoxesList();
      renderParts();
      if (activeHighlightCell) inspectCell(box.id, activeHighlightCell);
    }

    function divideAllCells() {
      const box = boxes.find(b => b.id === activePreviewBoxId);
      if (!box) return;
      if (!confirm(`Chia đôi tất cả các ô trong "${box.name}" thành 2 ngăn (Trước / Sau)?`)) return;
      box.dividedCells = [];
      box.mergedPairs = [];
      for (let r = 0; r < box.rows; r++) {
        for (let c = 1; c <= box.cols; c++) {
          box.dividedCells.push(`${getRowLabel(r)}${c}`);
        }
      }
      parts.forEach(p => {
        if (p.boxId === box.id) {
          if (!p.subCell) p.subCell = '1';
          if (p.cell.includes('+')) p.cell = p.cell.split('+')[0];
          p.location = `${box.name} • ${p.cell} (Ngăn 1)`;
        }
      });
      saveData();
      renderVisualBoxGrid();
      renderBoxesList();
      renderParts();
      if (activeHighlightCell) inspectCell(box.id, activeHighlightCell);
    }

    function mergeWithNextCell(boxId, cellCode) {
      const box = boxes.find(b => b.id === boxId);
      if (!box) return;
      if (!box.mergedPairs) box.mergedPairs = [];
      const upper = cellCode.toUpperCase();
      const rowChar = upper[0];
      const colNum = parseInt(upper.slice(1), 10);
      if (colNum >= box.cols) {
        return alert('Không thể ghép ô ở mép ngoài cùng bên phải của hộp!');
      }
      const nextCell = `${rowChar}${colNum + 1}`;

      // Hủy chia vách nếu 1 trong 2 ô đang chia
      if (box.dividedCells) {
        box.dividedCells = box.dividedCells.filter(c => c !== upper && c !== nextCell);
      }

      if (isMergedLeader(box, nextCell) || isMergedFollower(box, nextCell)) {
        return alert(`Ô ${nextCell} đã được ghép với ô khác rồi!`);
      }

      box.mergedPairs.push([upper, nextCell]);

      parts.forEach(p => {
        if (p.boxId === boxId && (p.cell.toUpperCase() === upper || p.cell.toUpperCase() === nextCell)) {
          p.cell = `${upper}+${nextCell}`;
          p.subCell = '';
          p.location = `${box.name} • Ô đôi ${upper}+${nextCell}`;
        }
      });

      saveData();
      renderVisualBoxGrid();
      renderBoxesList();
      inspectCell(boxId, `${upper}+${nextCell}`);
      renderParts();
    }

    function unmergeCells(boxId, leaderCell) {
      const box = boxes.find(b => b.id === boxId);
      if (!box || !Array.isArray(box.mergedPairs)) return;
      const upper = leaderCell.toUpperCase().split('+')[0];
      const pair = isMergedLeader(box, upper);
      if (!pair) return;

      const [c1, c2] = pair;
      box.mergedPairs = box.mergedPairs.filter(p => p[0] !== c1);

      parts.forEach(p => {
        if (p.boxId === boxId && (p.cell.toUpperCase() === `${c1}+${c2}` || p.cell.toUpperCase() === c1)) {
          p.cell = c1;
          p.location = `${box.name} • ${c1}`;
        }
      });

      saveData();
      renderVisualBoxGrid();
      renderBoxesList();
      inspectCell(boxId, c1);
      renderParts();
    }

    function addPartToSpecificCell(boxId, cellCode, subCell = '') {
      closeBoxesModal();
      openPartModal(null, boxId, cellCode, subCell);
    }

    function saveBox(e) {
      e.preventDefault();
      const editId = document.getElementById('editBoxId').value;
      const existing = editId ? boxes.find(b => b.id === editId) : null;
      const newBox = {
        id: editId || ('box_' + Date.now()),
        name: document.getElementById('boxName').value.trim(),
        rows: Math.min(15, Math.max(1, Number(document.getElementById('boxRows').value))),
        cols: Math.min(15, Math.max(1, Number(document.getElementById('boxCols').value))),
        note: document.getElementById('boxNote').value.trim(),
        dividedCells: existing && Array.isArray(existing.dividedCells) ? existing.dividedCells : [],
        mergedPairs: existing && Array.isArray(existing.mergedPairs) ? existing.mergedPairs : []
      };

      if (editId) {
        const idx = boxes.findIndex(b => b.id === editId);
        if (idx > -1) boxes[idx] = newBox;
        // Cập nhật lại tên hiển thị cho các linh kiện thuộc hộp này
        parts.forEach(p => {
          if (p.boxId === editId) {
            let loc = `${newBox.name} • ${p.cell}`;
            if (p.subCell === '1') loc += ' (Ngăn 1)';
            else if (p.subCell === '2') loc += ' (Ngăn 2)';
            p.location = loc;
          }
        });
      } else {
        boxes.push(newBox);
        activePreviewBoxId = newBox.id;
      }

      resetBoxForm();
      saveData();
      renderBoxesList();
      renderVisualBoxGrid();
      renderParts();
    }

    function editBox(id) {
      const b = boxes.find(x => x.id === id);
      if (!b) return;
      document.getElementById('editBoxId').value = b.id;
      document.getElementById('boxName').value = b.name;
      document.getElementById('boxRows').value = b.rows;
      document.getElementById('boxCols').value = b.cols;
      document.getElementById('boxNote').value = b.note || '';
      document.getElementById('boxFormTitle').innerText = 'Sửa Hộp: ' + b.name;
      document.getElementById('btnCancelEditBox').classList.remove('hidden');
    }

    function resetBoxForm() {
      document.getElementById('editBoxId').value = '';
      document.getElementById('boxName').value = '';
      document.getElementById('boxRows').value = 4;
      document.getElementById('boxCols').value = 6;
      document.getElementById('boxNote').value = '';
      document.getElementById('boxFormTitle').innerText = 'Tạo Hộp / Kệ Mới';
      document.getElementById('btnCancelEditBox').classList.add('hidden');
    }

    function deleteBox(id) {
      if (!confirm('Xóa sơ đồ hộp này? (Các linh kiện bên trong vẫn được giữ nguyên trong kho)')) return;
      boxes = boxes.filter(b => b.id !== id);
      if (activePreviewBoxId === id) activePreviewBoxId = boxes[0]?.id || null;
      saveData();
      renderBoxesList();
      renderVisualBoxGrid();
      renderParts();
    }

    // ================= MODAL THÊM / SỬA LINH KIỆN + CHỌN Ô TRỰC QUAN =================
    function populateBoxSelect(selectedBoxId = '') {
      const sel = document.getElementById('partBoxId');
      sel.innerHTML = `<option value="">-- Tự gõ vị trí / Không dùng sơ đồ --</option>` +
        boxes.map(b => `<option value="${b.id}" ${b.id === selectedBoxId ? 'selected' : ''}>${b.name} (${b.rows}×${b.cols})</option>`).join('');
    }

    function renderPickerGrid() {
      const boxId = document.getElementById('partBoxId').value;
      const wrapper = document.getElementById('pickerGridWrapper');
      const grid = document.getElementById('pickerGrid');
      const currentCell = document.getElementById('partCell').value.trim().toUpperCase();
      const currentSubCell = document.getElementById('partSubCell').value;

      const box = boxes.find(b => b.id === boxId);
      if (!box) {
        wrapper.classList.add('hidden');
        return;
      }

      wrapper.classList.remove('hidden');
      let html = `<div class="grid gap-1" style="grid-template-columns: repeat(${box.cols}, minmax(46px, 1fr));">`;
      for (let r = 0; r < box.rows; r++) {
        for (let c = 1; c <= box.cols; c++) {
          const code = `${getRowLabel(r)}${c}`;

          // Kiểm tra ô phụ của ô đôi (bỏ qua)
          if (isMergedFollower(box, code)) {
            continue;
          }

          // Kiểm tra ô đôi ghép ngang
          const mergedPair = isMergedLeader(box, code);
          if (mergedPair) {
            const pairCode = `${mergedPair[0]}+${mergedPair[1]}`;
            const pairParts = parts.filter(p => p.boxId === box.id && (p.cell.toUpperCase() === pairCode || p.cell.toUpperCase() === mergedPair[0] || p.cell.toUpperCase() === mergedPair[1]));
            const isSelected = currentCell === pairCode || currentCell === mergedPair[0] || currentCell === mergedPair[1];
            const cls = isSelected
              ? 'bg-sky-600 text-white border-sky-400 font-bold'
              : pairParts.length > 0
              ? 'bg-slate-800 text-sky-300 border-sky-500/40 hover:border-sky-400'
              : 'bg-slate-900 text-slate-400 border-sky-900/50 hover:bg-slate-800';

            html += `<button type="button" style="grid-column: span 2;" onclick="pickCell('${pairCode}', '')" class="px-1.5 py-1 rounded border text-[10px] font-mono flex flex-col items-center ${cls}" title="${pairParts.map(x => x.name).join(', ') || 'Ô đôi trống'}">
              <span>${pairCode} (Ô đôi)</span>
              <span class="text-[8px] opacity-75 truncate max-w-[80px]">${pairParts[0]?.name || 'Trống'}</span>
            </button>`;
            continue;
          }

          const isDivided = isCellDivided(box, code);

          if (isDivided) {
            const parts1 = parts.filter(p => p.boxId === box.id && p.cell.toUpperCase() === code && (p.subCell === '1' || !p.subCell));
            const parts2 = parts.filter(p => p.boxId === box.id && p.cell.toUpperCase() === code && p.subCell === '2');
            const isSel1 = currentCell === code && currentSubCell === '1';
            const isSel2 = currentCell === code && currentSubCell === '2';

            html += `
            <div class="border rounded flex flex-col overflow-hidden text-[9px] font-mono ${currentCell === code ? 'border-amber-400' : 'border-slate-700 bg-slate-900'}">
              <div class="text-[8px] text-center bg-slate-950 text-amber-400 font-bold">${code}</div>
              <div class="flex">
                <button type="button" onclick="pickCell('${code}', '1')" class="flex-1 py-1 text-center transition ${isSel1 ? 'bg-emerald-600 text-white font-bold' : parts1.length ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:bg-slate-800'}" title="${parts1.map(x=>x.name).join(', ') || 'Ngăn 1 trống'}">
                  1
                </button>
                <div class="w-[1px] bg-slate-700"></div>
                <button type="button" onclick="pickCell('${code}', '2')" class="flex-1 py-1 text-center transition ${isSel2 ? 'bg-sky-600 text-white font-bold' : parts2.length ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:bg-slate-800'}" title="${parts2.map(x=>x.name).join(', ') || 'Ngăn 2 trống'}">
                  2
                </button>
              </div>
            </div>`;
          } else {
            const existing = parts.filter(p => p.boxId === box.id && p.cell.toUpperCase() === code);
            const isSelected = currentCell === code;
            const cls = isSelected
              ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
              : existing.length > 0
              ? 'bg-slate-800 text-amber-300 border-slate-700 hover:border-amber-400'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800';

            html += `<button type="button" onclick="pickCell('${code}', '')" class="px-1.5 py-1 rounded border text-[10px] font-mono flex flex-col items-center ${cls}" title="${existing.map(x => x.name).join(', ') || 'Ô trống'}">
              <span>${code}</span>
              <span class="text-[8px] opacity-75 truncate max-w-[38px]">${existing[0]?.name || 'Trống'}</span>
            </button>`;
          }
        }
      }
      html += `</div>`;
      grid.innerHTML = html;
      updateLocationTextFromGrid();
    }

    function pickCell(code, subCell = '') {
      document.getElementById('partCell').value = code;
      const boxId = document.getElementById('partBoxId').value;
      const box = boxes.find(b => b.id === boxId);

      if (subCell) {
        document.getElementById('partSubCell').value = subCell;
      } else if (box && isCellDivided(box, code)) {
        if (!document.getElementById('partSubCell').value) {
          document.getElementById('partSubCell').value = '1';
        }
      } else {
        document.getElementById('partSubCell').value = '';
      }
      updateLocationTextFromGrid();
      renderPickerGrid();
    }

    function updateLocationTextFromGrid() {
      const boxId = document.getElementById('partBoxId').value;
      const cell = document.getElementById('partCell').value.trim().toUpperCase();
      const subCell = document.getElementById('partSubCell').value;
      const box = boxes.find(b => b.id === boxId);
      if (box && cell) {
        let loc = `${box.name} • ${cell.includes('+') ? 'Ô đôi ' + cell : cell}`;
        if (subCell === '1') loc += ' (Ngăn 1)';
        else if (subCell === '2') loc += ' (Ngăn 2)';
        document.getElementById('partLocation').value = loc;
      }
    }

