// =========================================================================
// MODULE: 74XX ACHIEVEMENT & CROSS-REF MODAL (BẢNG THÀNH TÍCH IC HỌ 74)
// =========================================================================

    function openReplaceModal(partId) {
      const p = parts.find(x => x.id === partId);
      if (!p) return;
      currentReplacePartId = partId;

      document.getElementById('replaceModalTargetChip').innerText = `${p.name} ${p.package ? `(${p.package})` : ''}`;
      
      const inStockAlts = findInStockReplacements(p.name, p.id);
      const allEquivalents = getEquivalentChips(p.name);

      // Banner trạng thái của chip gốc
      const origBanner = document.getElementById('replaceModalOrigBanner');
      const isOut = Number(p.qty || 0) === 0;
      origBanner.innerHTML = `
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg ${isOut ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'} flex items-center justify-center font-bold">
            ${isOut ? '<i data-lucide="alert-triangle" class="w-4 h-4"></i>' : '<i data-lucide="check" class="w-4 h-4"></i>'}
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-white text-sm">${p.name}</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded font-mono ${isOut ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}">
                ${isOut ? 'HẾT HÀNG TRONG HỘP' : `Còn ${p.qty} con trong hộp`}
              </span>
            </div>
            <p class="text-slate-400 text-[11px] mt-0.5">Vị trí: ${p.location} • Đang cắm mạch: ${p.inUse || 0} con</p>
          </div>
        </div>
        <button onclick="openBuyModal('${p.id}')" class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition flex items-center gap-1 shrink-0 shadow-sm">
          <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i> Mua thêm
        </button>
      `;

      // Danh sách các IC thay thế
      const listEl = document.getElementById('replaceModalList');
      if (allEquivalents.length === 0) {
        listEl.innerHTML = `
          <div class="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 text-center text-xs text-slate-400">
            Chưa có dữ liệu IC thay thế tương đương cho mã này.<br>
            <span class="text-[11px] text-slate-500 mt-1 inline-block">Bạn có thể kiểm tra datasheet hoặc tìm mua trực tiếp từ 4 shop.</span>
          </div>
        `;
      } else {
        listEl.innerHTML = allEquivalents.map(eq => {
          const matchInStock = inStockAlts.find(m => {
            const sub = eq.name.split('/').map(s => s.trim().toUpperCase());
            const mClean = m.name.toUpperCase();
            return sub.some(s => mClean.includes(s.replace(/[^A-Z0-9]/g, '')) || s.replace(/[^A-Z0-9]/g, '').includes(mClean));
          });

          return `
          <div class="bg-slate-800/80 border ${matchInStock ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-700/80'} rounded-xl p-3 flex flex-col gap-2 transition">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-sm text-white font-mono">${eq.name}</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full ${eq.type.includes('Khuyên dùng') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700 text-slate-300'} font-medium">
                    ${eq.type}
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">${eq.compatibility}</span>
                </div>
                <p class="text-xs text-slate-300 mt-1 leading-relaxed">${eq.note}</p>
              </div>

              <!-- Nút hành động -->
              <div class="shrink-0 flex items-center gap-1.5">
                ${matchInStock ? `
                  <button onclick="closeReplaceModal(); locateInBox('${matchInStock.boxId}', '${matchInStock.cell}', '${matchInStock.subCell || ''}')" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition flex items-center gap-1 shadow-sm" title="Xem vị trí ô trên sơ đồ hộp">
                    <i data-lucide="grid" class="w-3.5 h-3.5"></i> Lấy tại ${matchInStock.location}
                  </button>
                ` : `
                  <button onclick="openBuyModalForExternal('${eq.name.split('/')[0].trim()}')" class="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs transition flex items-center gap-1" title="Tìm mua IC thay thế này từ 4 shop">
                    <i data-lucide="shopping-bag" class="w-3.5 h-3.5 text-rose-400"></i> Mua
                  </button>
                `}
              </div>
            </div>

            ${matchInStock ? `
              <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2.5 py-1 flex items-center justify-between text-[11px] text-emerald-300">
                <span class="flex items-center gap-1 font-semibold">
                  <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400"></i>
                  Sẵn có trong kho: <b>${matchInStock.name}</b> (${matchInStock.qty} con)
                </span>
                <span class="font-mono text-emerald-400">${matchInStock.location}</span>
              </div>
            ` : ''}
          </div>
          `;
        }).join('');
      }

      document.getElementById('replaceModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeReplaceModal() {
      document.getElementById('replaceModal').classList.add('hidden');
    }



    function renderLogicSubCategoryBar() {
      const bar = document.getElementById('logicSubCategoryBar');
      if (!bar) return;

      if (!isLogicCategory(currentCategory)) {
        bar.classList.add('hidden');
        return;
      }

      bar.classList.remove('hidden');

      const logicParts = parts.filter(p => isLogicCategory(p.category));
      const isAllActive = currentLogicSubCategory === 'Tất cả';

      let html = `
        <button type="button" onclick="setLogicSubCategory('Tất cả')" class="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${isAllActive ? 'bg-indigo-600 text-white shadow-sm font-semibold' : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'}">
          <span>Tất cả Logic IC</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isAllActive ? 'bg-indigo-800 text-white' : 'bg-slate-900 text-indigo-300'} font-mono">${logicParts.length}</span>
        </button>
      `;

      LOGIC_SUBCAT_LIST.forEach(sub => {
        const count = logicParts.filter(p => (p.subCategory || determineLogicSubcategory(p.name, p.desc)) === sub.id).length;
        const isActive = currentLogicSubCategory === sub.id;
        const escSub = sub.id.replace(/'/g, "\\'");

        html += `
          <button type="button" onclick="setLogicSubCategory('${escSub}')" title="${sub.desc}" class="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${isActive ? 'bg-indigo-600 text-white shadow-sm font-semibold' : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'}">
            <span>${sub.label}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-800 text-white' : 'bg-slate-900 text-indigo-300'} font-mono">${count}</span>
          </button>
        `;
      });

      html += `
        <button type="button" onclick="open74AchievementModal()" class="shrink-0 ml-auto px-2.5 py-1 rounded-lg text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-medium transition flex items-center gap-1" title="Xem bảng thành tích & tiến độ sưu tầm 74xx">
          <i data-lucide="award" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>Thành Tích 74xx</span>
        </button>
      `;

      bar.innerHTML = html;
      lucide.createIcons();
    }

    function setLogicSubCategory(subCat) {
      currentLogicSubCategory = subCat;
      renderLogicSubCategoryBar();
      renderParts();
    }

    function handleCategoryChange(chosenCat = null) {
      const cat = chosenCat || document.getElementById('partCategory')?.value;
      const subGroup = document.getElementById('partSubCategoryGroup');
      if (!subGroup) return;
      if (isLogicCategory(cat)) {
        subGroup.classList.remove('hidden');
        const nameVal = document.getElementById('partName')?.value;
        const descVal = document.getElementById('partDesc')?.value;
        const subSelect = document.getElementById('partSubCategory');
        if (subSelect && !subSelect.value && nameVal) {
          const autoSub = determineLogicSubcategory(nameVal, descVal);
          if (autoSub) subSelect.value = autoSub;
        }
      } else {
        subGroup.classList.add('hidden');
      }
    }



    // =========================================================================
    // FEATURE 2: BẢNG THÀNH TÍCH SƯU TẦM IC HỌ 74 (ACHIEVEMENT / POKEDEX GRID)
    // =========================================================================

    const STANDARD_74_CATALOG = [
      // --- 1. CỔNG LOGIC (GATES) ---
      { code: '00', name: '7400', subCat: 'Cổng Logic', title: 'Quad 2-Input NAND', desc: '4 cổng NAND 2 ngõ vào', pkg: 'DIP-14' },
      { code: '02', name: '7402', subCat: 'Cổng Logic', title: 'Quad 2-Input NOR', desc: '4 cổng NOR 2 ngõ vào', pkg: 'DIP-14' },
      { code: '04', name: '7404', subCat: 'Cổng Logic', title: 'Hex Inverter (NOT)', desc: '6 cổng đảo NOT độc lập', pkg: 'DIP-14' },
      { code: '08', name: '7408', subCat: 'Cổng Logic', title: 'Quad 2-Input AND', desc: '4 cổng AND 2 ngõ vào', pkg: 'DIP-14' },
      { code: '10', name: '7410', subCat: 'Cổng Logic', title: 'Triple 3-Input NAND', desc: '3 cổng NAND 3 ngõ vào', pkg: 'DIP-14' },
      { code: '11', name: '7411', subCat: 'Cổng Logic', title: 'Triple 3-Input AND', desc: '3 cổng AND 3 ngõ vào', pkg: 'DIP-14' },
      { code: '20', name: '7420', subCat: 'Cổng Logic', title: 'Dual 4-Input NAND', desc: '2 cổng NAND 4 ngõ vào', pkg: 'DIP-14' },
      { code: '21', name: '7421', subCat: 'Cổng Logic', title: 'Dual 4-Input AND', desc: '2 cổng AND 4 ngõ vào', pkg: 'DIP-14' },
      { code: '27', name: '7427', subCat: 'Cổng Logic', title: 'Triple 3-Input NOR', desc: '3 cổng NOR 3 ngõ vào', pkg: 'DIP-14' },
      { code: '30', name: '7430', subCat: 'Cổng Logic', title: '8-Input NAND Gate', desc: '1 cổng NAND 8 ngõ vào', pkg: 'DIP-14' },
      { code: '32', name: '7432', subCat: 'Cổng Logic', title: 'Quad 2-Input OR', desc: '4 cổng OR 2 ngõ vào', pkg: 'DIP-14' },
      { code: '86', name: '7486', subCat: 'Cổng Logic', title: 'Quad 2-Input XOR', desc: '4 cổng XOR 2 ngõ vào', pkg: 'DIP-14' },
      { code: '260', name: '74260', subCat: 'Cổng Logic', title: 'Dual 5-Input NOR', desc: '2 cổng NOR 5 ngõ vào', pkg: 'DIP-14' },

      // --- 2. BỘ NHỚ & CHỐT (FLIP-FLOPS & LATCHES) ---
      { code: '73', name: '7473', subCat: 'Bộ Nhớ & Chốt', title: 'Dual JK Flip-Flop', desc: 'JK Flip-Flop kép có Reset', pkg: 'DIP-14' },
      { code: '74', name: '7474', subCat: 'Bộ Nhớ & Chốt', title: 'Dual D-Type Flip-Flop', desc: 'D Flip-Flop kép có Set/Reset', pkg: 'DIP-14' },
      { code: '75', name: '7475', subCat: 'Bộ Nhớ & Chốt', title: 'Quad Bistable Latch', desc: '4 chốt dữ liệu D hai trạng thái', pkg: 'DIP-16' },
      { code: '76', name: '7476', subCat: 'Bộ Nhớ & Chốt', title: 'Dual JK Flip-Flop', desc: 'JK Flip-Flop kép có Preset & Clear', pkg: 'DIP-16' },
      { code: '107', name: '74107', subCat: 'Bộ Nhớ & Chốt', title: 'Dual JK Flip-Flop', desc: 'JK Flip-Flop kép ngõ vào Clear', pkg: 'DIP-14' },
      { code: '109', name: '74109', subCat: 'Bộ Nhớ & Chốt', title: 'Dual J-Not-K Flip-Flop', desc: 'J-Not-K Flip-Flop kích cạnh dương', pkg: 'DIP-16' },
      { code: '112', name: '74112', subCat: 'Bộ Nhớ & Chốt', title: 'Dual JK Flip-Flop', desc: 'JK Flip-Flop kích cạnh âm', pkg: 'DIP-16' },
      { code: '173', name: '74173', subCat: 'Bộ Nhớ & Chốt', title: '4-Bit D Register', desc: 'Thanh ghi 4 D-FF ngõ ra 3 trạng thái', pkg: 'DIP-16' },
      { code: '174', name: '74174', subCat: 'Bộ Nhớ & Chốt', title: 'Hex D Flip-Flop', desc: 'Thanh ghi 6 D-FF có Master Reset', pkg: 'DIP-16' },
      { code: '175', name: '74175', subCat: 'Bộ Nhớ & Chốt', title: 'Quad D Flip-Flop', desc: 'Thanh ghi 4 D-FF có ngõ ra bù đảo', pkg: 'DIP-16' },
      { code: '259', name: '74259', subCat: 'Bộ Nhớ & Chốt', title: '8-Bit Addressable Latch', desc: 'Chốt dữ liệu 8-bit định địa chỉ', pkg: 'DIP-16' },
      { code: '273', name: '74273', subCat: 'Bộ Nhớ & Chốt', title: 'Octal D Flip-Flop', desc: 'Thanh ghi 8 D-FF kích cạnh dương', pkg: 'DIP-20' },
      { code: '373', name: '74373', subCat: 'Bộ Nhớ & Chốt', title: 'Octal Transparent Latch', desc: 'Chốt 8-bit trong suốt 3 trạng thái', pkg: 'DIP-20' },
      { code: '374', name: '74374', subCat: 'Bộ Nhớ & Chốt', title: 'Octal D Flip-Flop (3S)', desc: 'Thanh ghi 8 D-FF ngõ ra 3 trạng thái', pkg: 'DIP-20' },
      { code: '377', name: '74377', subCat: 'Bộ Nhớ & Chốt', title: 'Octal D-FF with Enable', desc: 'Thanh ghi 8 D-FF có chân Clock Enable', pkg: 'DIP-20' },
      { code: '573', name: '74573', subCat: 'Bộ Nhớ & Chốt', title: 'Octal Latch Flow-thru', desc: 'Chốt 8-bit chân thẳng hàng dễ layout', pkg: 'DIP-20' },
      { code: '574', name: '74574', subCat: 'Bộ Nhớ & Chốt', title: 'Octal D-FF Flow-thru', desc: 'Thanh ghi 8 D-FF chân thẳng hàng', pkg: 'DIP-20' },

      // --- 3. BỘ ĐẾM & CHIA TẦN (COUNTERS & DIVIDERS) ---
      { code: '90', name: '7490', subCat: 'Bộ Đếm & Chia Tần', title: 'Decade Counter (÷10)', desc: 'Bộ đếm thập phân chia 10 bất đồng bộ', pkg: 'DIP-14' },
      { code: '92', name: '7492', subCat: 'Bộ Đếm & Chia Tần', title: 'Divide-by-12 Counter', desc: 'Bộ đếm chia 12 / chia 6', pkg: 'DIP-14' },
      { code: '93', name: '7493', subCat: 'Bộ Đếm & Chia Tần', title: '4-Bit Binary Counter', desc: 'Bộ đếm nhị phân 4-bit chia 16', pkg: 'DIP-14' },
      { code: '160', name: '74160', subCat: 'Bộ Đếm & Chia Tần', title: 'Sync BCD Counter', desc: 'Bộ đếm BCD đồng bộ nạp song song', pkg: 'DIP-16' },
      { code: '161', name: '74161', subCat: 'Bộ Đếm & Chia Tần', title: 'Sync 4-Bit Binary Counter', desc: 'Bộ đếm nhị phân 4-bit đồng bộ', pkg: 'DIP-16' },
      { code: '162', name: '74162', subCat: 'Bộ Đếm & Chia Tần', title: 'Sync BCD Counter', desc: 'Bộ đếm BCD đồng bộ xóa đồng bộ', pkg: 'DIP-16' },
      { code: '163', name: '74163', subCat: 'Bộ Đếm & Chia Tần', title: 'Sync Binary Counter', desc: 'Bộ đếm nhị phân 4-bit xóa đồng bộ', pkg: 'DIP-16' },
      { code: '190', name: '74190', subCat: 'Bộ Đếm & Chia Tần', title: 'Sync Up/Down BCD', desc: 'Bộ đếm lên/xuống BCD đồng bộ', pkg: 'DIP-16' },
      { code: '191', name: '74191', subCat: 'Bộ Đếm & Chia Tần', title: 'Sync Up/Down Binary', desc: 'Bộ đếm lên/xuống nhị phân đồng bộ', pkg: 'DIP-16' },
      { code: '192', name: '74192', subCat: 'Bộ Đếm & Chia Tần', title: 'Dual-Clock Up/Down BCD', desc: 'Đếm lên/xuống BCD 2 chân clock', pkg: 'DIP-16' },
      { code: '193', name: '74193', subCat: 'Bộ Đếm & Chia Tần', title: 'Dual-Clock Up/Down Bin', desc: 'Đếm lên/xuống nhị phân 2 chân clock', pkg: 'DIP-16' },
      { code: '390', name: '74390', subCat: 'Bộ Đếm & Chia Tần', title: 'Dual Decade Counter', desc: 'Bộ đếm thập phân kép (2 trong 1)', pkg: 'DIP-16' },
      { code: '393', name: '74393', subCat: 'Bộ Đếm & Chia Tần', title: 'Dual 4-Bit Binary Counter', desc: 'Bộ đếm nhị phân kép 4-bit độc lập', pkg: 'DIP-14' },
      { code: '4017', name: '74HC4017', subCat: 'Bộ Đếm & Chia Tần', title: 'Decade Counter 10 Out', desc: 'Bộ đếm 10 ngõ ra dạng giải mã', pkg: 'DIP-16' },
      { code: '4020', name: '74HC4020', subCat: 'Bộ Đếm & Chia Tần', title: '14-Stage Ripple Counter', desc: 'Bộ đếm gợn nhị phân 14 tầng', pkg: 'DIP-16' },
      { code: '4040', name: '74HC4040', subCat: 'Bộ Đếm & Chia Tần', title: '12-Stage Ripple Counter', desc: 'Bộ đếm gợn nhị phân 12 tầng', pkg: 'DIP-16' },

      // --- 4. THANH GHI DỊCH (SHIFT REGISTERS) ---
      { code: '164', name: '74164', subCat: 'Thanh Ghi Dịch', title: '8-Bit SIPO Shift Reg', desc: 'Dịch nối tiếp sang song song 8-bit', pkg: 'DIP-14' },
      { code: '165', name: '74165', subCat: 'Thanh Ghi Dịch', title: '8-Bit PISO Shift Reg', desc: 'Dịch song song sang nối tiếp 8-bit', pkg: 'DIP-16' },
      { code: '166', name: '74166', subCat: 'Thanh Ghi Dịch', title: '8-Bit PISO Synchronous', desc: 'Dịch song song sang nối tiếp đồng bộ', pkg: 'DIP-16' },
      { code: '194', name: '74194', subCat: 'Thanh Ghi Dịch', title: '4-Bit Universal Shift Reg', desc: 'Thanh ghi dịch đa năng 2 chiều 4-bit', pkg: 'DIP-16' },
      { code: '299', name: '74299', subCat: 'Thanh Ghi Dịch', title: '8-Bit Universal Shift Reg', desc: 'Thanh ghi dịch đa năng 8-bit 3S', pkg: 'DIP-20' },
      { code: '595', name: '74595', subCat: 'Thanh Ghi Dịch', title: '8-Bit SIPO with Latch (3S)', desc: 'Thanh ghi dịch 8-bit có chốt 3 trạng thái', pkg: 'DIP-16' },
      { code: '597', name: '74597', subCat: 'Thanh Ghi Dịch', title: '8-Bit PISO with Latch', desc: 'Thanh ghi dịch 8-bit có chốt đầu vào', pkg: 'DIP-16' },

      // --- 5. BỘ CHỌN KÊNH & GIẢI MÃ (MULTIPLEXERS & DECODERS) ---
      { code: '42', name: '7442', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD-to-Decimal Decoder', desc: 'Giải mã BCD sang thập phân 10 đường', pkg: 'DIP-16' },
      { code: '47', name: '7447', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to 7-Segment (Anode)', desc: 'Giải mã BCD sang LED 7 đoạn Anode chung', pkg: 'DIP-16' },
      { code: '48', name: '7448', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to 7-Segment (Cathode)', desc: 'Giải mã BCD sang LED 7 đoạn Cathode chung', pkg: 'DIP-16' },
      { code: '138', name: '74138', subCat: 'Bộ Chọn & Giải Mã', title: '3-to-8 Line Decoder/Demux', desc: 'Giải mã 3-sang-8 đường / Demultiplexer', pkg: 'DIP-16' },
      { code: '139', name: '74139', subCat: 'Bộ Chọn & Giải Mã', title: 'Dual 2-to-4 Line Decoder', desc: 'Bộ giải mã 2-sang-4 kép', pkg: 'DIP-16' },
      { code: '147', name: '74147', subCat: 'Bộ Chọn & Giải Mã', title: '10-to-4 Priority Encoder', desc: 'Bộ mã hóa ưu tiên 10-sang-4 BCD', pkg: 'DIP-16' },
      { code: '148', name: '74148', subCat: 'Bộ Chọn & Giải Mã', title: '8-to-3 Priority Encoder', desc: 'Bộ mã hóa ưu tiên 8-sang-3 đường', pkg: 'DIP-16' },
      { code: '151', name: '74151', subCat: 'Bộ Chọn & Giải Mã', title: '8-to-1 Multiplexer', desc: 'Bộ chọn dữ liệu / dồn kênh 8-sang-1', pkg: 'DIP-16' },
      { code: '153', name: '74153', subCat: 'Bộ Chọn & Giải Mã', title: 'Dual 4-to-1 Multiplexer', desc: 'Bộ dồn kênh 4-sang-1 kép', pkg: 'DIP-16' },
      { code: '154', name: '74154', subCat: 'Bộ Chọn & Giải Mã', title: '4-to-16 Line Decoder', desc: 'Giải mã 4-sang-16 đường / Demux', pkg: 'DIP-24' },
      { code: '157', name: '74157', subCat: 'Bộ Chọn & Giải Mã', title: 'Quad 2-to-1 MUX (Non-inv)', desc: 'Bộ chọn 2-sang-1 4-kênh không đảo', pkg: 'DIP-16' },
      { code: '251', name: '74251', subCat: 'Bộ Chọn & Giải Mã', title: '8-to-1 MUX 3-State', desc: 'Bộ chọn 8-sang-1 ngõ ra 3 trạng thái', pkg: 'DIP-16' },
      { code: '257', name: '74257', subCat: 'Bộ Chọn & Giải Mã', title: 'Quad 2-to-1 MUX 3-State', desc: 'Bộ chọn 2-sang-1 4-kênh 3 trạng thái', pkg: 'DIP-16' },

      // --- 6. BỘ ĐỆM & THU PHÁT BUS (BUFFERS & TRANSCEIVERS) ---
      { code: '06', name: '7406', subCat: 'Bộ Đệm & Bus', title: 'Hex Inverting Buffer (OC)', desc: '6 bộ đệm đảo cực thu hở áp cao 30V', pkg: 'DIP-14' },
      { code: '07', name: '7407', subCat: 'Bộ Đệm & Bus', title: 'Hex Buffer (OC 30V)', desc: '6 bộ đệm không đảo cực thu hở 30V', pkg: 'DIP-14' },
      { code: '125', name: '74125', subCat: 'Bộ Đệm & Bus', title: 'Quad 3-State Buffer (Low)', desc: '4 bộ đệm 3 trạng thái kích mức thấp', pkg: 'DIP-14' },
      { code: '126', name: '74126', subCat: 'Bộ Đệm & Bus', title: 'Quad 3-State Buffer (High)', desc: '4 bộ đệm 3 trạng thái kích mức cao', pkg: 'DIP-14' },
      { code: '240', name: '74240', subCat: 'Bộ Đệm & Bus', title: 'Octal Inverting Buffer 3S', desc: 'Bộ đệm Bus 8 đường đảo 3 trạng thái', pkg: 'DIP-20' },
      { code: '241', name: '74241', subCat: 'Bộ Đệm & Bus', title: 'Octal Buffer/Line Driver', desc: 'Bộ đệm Bus 8 đường 3 trạng thái', pkg: 'DIP-20' },
      { code: '244', name: '74244', subCat: 'Bộ Đệm & Bus', title: 'Octal Buffer/Line Driver', desc: 'Bộ đệm Bus 8 đường không đảo 3S', pkg: 'DIP-20' },
      { code: '245', name: '74245', subCat: 'Bộ Đệm & Bus', title: 'Octal Bus Transceiver', desc: 'Bộ thu phát Bus 8-bit 2 chiều', pkg: 'DIP-20' },
      { code: '541', name: '74541', subCat: 'Bộ Đệm & Bus', title: 'Octal Buffer Flow-Through', desc: 'Bộ đệm Bus 8 đường chân thẳng hàng', pkg: 'DIP-20' },
      { code: '640', name: '74640', subCat: 'Bộ Đệm & Bus', title: 'Octal Transceiver Inverting', desc: 'Bộ thu phát Bus 8-bit đảo 2 chiều', pkg: 'DIP-20' },
      { code: '645', name: '74645', subCat: 'Bộ Đệm & Bus', title: 'Octal Bus Transceiver', desc: 'Bộ thu phát Bus 8-bit không đảo 2 chiều', pkg: 'DIP-20' },

      // --- 7. SỐ HỌC & SO SÁNH (ARITHMETIC & COMPARATORS) ---
      { code: '83', name: '7483', subCat: 'Số Học & So Sánh', title: '4-Bit Binary Full Adder', desc: 'Bộ cộng nhị phân 4-bit có nhớ', pkg: 'DIP-16' },
      { code: '85', name: '7485', subCat: 'Số Học & So Sánh', title: '4-Bit Magnitude Comparator', desc: 'Bộ so sánh độ lớn nhị phân 4-bit', pkg: 'DIP-16' },
      { code: '181', name: '74181', subCat: 'Số Học & So Sánh', title: '4-Bit ALU Processor', desc: 'Khối số học logic ALU 4-bit', pkg: 'DIP-24' },
      { code: '280', name: '74280', subCat: 'Số Học & So Sánh', title: '9-Bit Parity Generator', desc: 'Bộ kiểm tra / tạo bit chẵn lẻ 9-bit', pkg: 'DIP-14' },
      { code: '283', name: '74283', subCat: 'Số Học & So Sánh', title: '4-Bit Fast Full Adder', desc: 'Bộ cộng nhị phân 4-bit tốc độ cao', pkg: 'DIP-16' },
      { code: '688', name: '74688', subCat: 'Số Học & So Sánh', title: '8-Bit Identity Comparator', desc: 'Bộ so sánh đẳng thức (bằng nhau) 8-bit', pkg: 'DIP-20' },

      // --- 8. SCHMITT TRIGGER & TẠO XUNG (PULSE & SCHMITT) ---
      { code: '13', name: '7413', subCat: 'Schmitt & Tạo Xung', title: 'Dual 4-NAND Schmitt Trigger', desc: '2 cổng NAND 4 ngõ vào kích Schmitt', pkg: 'DIP-14' },
      { code: '14', name: '7414', subCat: 'Schmitt & Tạo Xung', title: 'Hex Schmitt Inverter', desc: '6 cổng đảo Schmitt Trigger lọc nhiễu', pkg: 'DIP-14' },
      { code: '121', name: '74121', subCat: 'Schmitt & Tạo Xung', title: 'Monostable Multivibrator', desc: 'Bộ tạo xung đơn ổn (One-Shot Timer)', pkg: 'DIP-14' },
      { code: '122', name: '74122', subCat: 'Schmitt & Tạo Xung', title: 'Retriggerable Monostable', desc: 'Bộ tạo xung đơn ổn kích lại được có Clear', pkg: 'DIP-14' },
      { code: '123', name: '74123', subCat: 'Schmitt & Tạo Xung', title: 'Dual Retriggerable Monostable', desc: 'Bộ tạo xung đơn ổn kép kích lại được', pkg: 'DIP-16' },
      { code: '132', name: '74132', subCat: 'Schmitt & Tạo Xung', title: 'Quad 2-NAND Schmitt', desc: '4 cổng NAND 2 ngõ vào Schmitt Trigger', pkg: 'DIP-14' },
      { code: '221', name: '74221', subCat: 'Schmitt & Tạo Xung', title: 'Dual Monostable Schmitt', desc: 'Bộ tạo xung đơn ổn kép ngõ vào Schmitt', pkg: 'DIP-16' }
    ];

    let currentAchievStatusFilter = 'all';
    let currentAchievSubCatFilter = 'Tất cả';

    function open74AchievementModal() {
      render74Achievement();
      document.getElementById('achievement74Modal').classList.remove('hidden');
      lucide.createIcons();
    }

    function close74AchievementModal() {
      document.getElementById('achievement74Modal').classList.add('hidden');
    }

    function set74AchievementStatusFilter(status) {
      currentAchievStatusFilter = status;
      ['all', 'owned', 'missing'].forEach(s => {
        const btn = document.getElementById('achievFilterBtn_' + s);
        if (!btn) return;
        if (s === status) {
          btn.className = 'px-3 py-1 rounded-lg text-xs font-semibold transition bg-indigo-600 text-white shadow-sm';
        } else {
          btn.className = 'px-3 py-1 rounded-lg text-xs font-medium transition bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700';
        }
      });
      render74AchievementGrid();
    }

    function set74AchievementSubCatFilter(subCat) {
      currentAchievSubCatFilter = subCat;
      render74AchievementSubCatTabs();
      render74AchievementGrid();
    }

    function render74Achievement() {
      let ownedChipsCount = 0;
      let totalOwnedQuantity = 0;

      STANDARD_74_CATALOG.forEach(item => {
        const matches = getPartsMatching74Code(item.code);
        const qtySum = matches.reduce((s, p) => s + Number(p.qty || 0) + Number(p.inUse || 0), 0);
        if (qtySum > 0) {
          ownedChipsCount++;
          totalOwnedQuantity += qtySum;
        }
      });

      const totalCatalog = STANDARD_74_CATALOG.length;
      const percent = Math.round((ownedChipsCount / totalCatalog) * 100);

      document.getElementById('achievementProgressPercent').innerText = `${percent}%`;
      document.getElementById('achievementProgressBar').style.width = `${percent}%`;
      document.getElementById('achievementOwnedCount').innerText = ownedChipsCount;
      document.getElementById('achievementTotalCatalogCount').innerText = totalCatalog;
      document.getElementById('achievementTotalQuantity').innerText = totalOwnedQuantity;
      document.getElementById('achievementStatLit').innerText = `${ownedChipsCount} IC`;
      document.getElementById('achievementStatDimmed').innerText = `${totalCatalog - ownedChipsCount} IC`;

      let rankTitle = 'Tập Sự Breadboard 🥉';
      if (ownedChipsCount >= 45) rankTitle = 'Huyền Thoại 74xx IC Master 👑';
      else if (ownedChipsCount >= 30) rankTitle = 'Kỹ Sư Kiến Trúc Máy Tính 💎';
      else if (ownedChipsCount >= 20) rankTitle = 'Chuyên Gia Họ 74 🥇';
      else if (ownedChipsCount >= 10) rankTitle = 'Thợ Mạch Số TTL 🥈';
      else if (ownedChipsCount >= 3) rankTitle = 'Học Viên Mạch Số 🥉';

      document.getElementById('achievementRankText').innerText = rankTitle;
      document.getElementById('achievBadgeOwned').innerText = ownedChipsCount;
      document.getElementById('achievBadgeMissing').innerText = totalCatalog - ownedChipsCount;

      render74AchievementSubCatTabs();
      render74AchievementGrid();
      update74AchievementHeaderBadge();
    }

    function update74AchievementHeaderBadge() {
      const badge = document.getElementById('header74Badge');
      const badgeMobile = document.getElementById('header74BadgeMobile');
      if (!badge && !badgeMobile) return;
      let ownedCount = 0;
      STANDARD_74_CATALOG.forEach(item => {
        const matches = getPartsMatching74Code(item.code);
        const qty = matches.reduce((s, p) => s + Number(p.qty || 0) + Number(p.inUse || 0), 0);
        if (qty > 0) ownedCount++;
      });
      const pct = Math.round((ownedCount / STANDARD_74_CATALOG.length) * 100);
      const txt = `${pct}% (${ownedCount})`;
      const cls = pct > 0 
        ? 'text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold'
        : 'text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono';

      if (badge) {
        badge.innerText = txt;
        badge.className = cls;
      }
      if (badgeMobile) {
        badgeMobile.innerText = txt;
        badgeMobile.className = cls;
      }
    }

    function render74AchievementSubCatTabs() {
      const container = document.getElementById('achievSubCatFilterBar');
      if (!container) return;

      const allActive = currentAchievSubCatFilter === 'Tất cả';
      let html = `
        <button type="button" onclick="set74AchievementSubCatFilter('Tất cả')" class="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium transition ${allActive ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/80'}">
          Tất cả chức năng
        </button>
      `;

      LOGIC_SUBCAT_LIST.forEach(sub => {
        const isActive = currentAchievSubCatFilter === sub.id;
        const esc = sub.id.replace(/'/g, "\\'");
        html += `
          <button type="button" onclick="set74AchievementSubCatFilter('${esc}')" class="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium transition ${isActive ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/80'}">
            ${sub.label}
          </button>
        `;
      });

      container.innerHTML = html;
    }

    function render74AchievementGrid() {
      const grid = document.getElementById('achievement74Grid');
      if (!grid) return;

      const filtered = STANDARD_74_CATALOG.filter(item => {
        const matches = getPartsMatching74Code(item.code);
        const qtySum = matches.reduce((s, p) => s + Number(p.qty || 0) + Number(p.inUse || 0), 0);
        const isOwned = qtySum > 0;

        if (currentAchievStatusFilter === 'owned' && !isOwned) return false;
        if (currentAchievStatusFilter === 'missing' && isOwned) return false;
        if (currentAchievSubCatFilter !== 'Tất cả' && item.subCat !== currentAchievSubCatFilter) return false;

        return true;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full py-12 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
            Không có IC họ 74 nào phù hợp với bộ lọc đã chọn.
          </div>
        `;
        return;
      }

      grid.innerHTML = filtered.map(item => {
        const matches = getPartsMatching74Code(item.code);
        const inBox = matches.reduce((s, p) => s + Number(p.qty || 0), 0);
        const inUse = matches.reduce((s, p) => s + Number(p.inUse || 0), 0);
        const totalQty = inBox + inUse;
        const isOwned = totalQty > 0;

        if (isOwned) {
          return `
          <div class="bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/60 rounded-xl p-3 flex flex-col justify-between shadow-lg shadow-emerald-950/30 hover:border-emerald-400 transition relative overflow-hidden group">
            <div class="absolute -top-3 -right-3 w-16 h-16 bg-emerald-500/15 blur-xl rounded-full pointer-events-none"></div>

            <div>
              <div class="flex items-center justify-between gap-1 mb-1.5">
                <span class="text-xs font-mono font-bold text-white bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/80">74xx${item.code}</span>
                <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ${totalQty} con
                </span>
              </div>
              <h4 class="font-bold text-sm text-emerald-300 truncate" title="${item.title}">${item.title}</h4>
              <p class="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">${item.desc}</p>

              <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-[10px]">
                ${matches.map(m => `
                  <div class="flex items-center justify-between text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded">
                    <span class="font-mono text-emerald-200 font-semibold truncate">${m.name}</span>
                    <span class="text-slate-300 shrink-0 ml-1">x${Number(m.qty) + Number(m.inUse || 0)}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span class="text-[10px] text-indigo-300 bg-indigo-950/40 px-1.5 py-0.2 rounded border border-indigo-900/60">${item.subCat}</span>
              <button onclick="filterPartsBy74Code('${item.code}')" class="text-emerald-400 hover:text-emerald-200 underline font-medium text-xs">
                Xem trong kho →
              </button>
            </div>
          </div>
          `;
        } else {
          return `
          <div class="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between opacity-75 hover:opacity-100 hover:border-slate-700 transition group">
            <div>
              <div class="flex items-center justify-between gap-1 mb-1.5">
                <span class="text-xs font-mono font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">74xx${item.code}</span>
                <span class="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/50">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                  Chưa có
                </span>
              </div>
              <h4 class="font-bold text-sm text-slate-300 truncate" title="${item.title}">${item.title}</h4>
              <p class="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">${item.desc}</p>
            </div>

            <div class="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span class="text-[10px] text-slate-500 font-mono">${item.pkg}</span>
              <div class="flex items-center gap-1.5">
                <button onclick="quickAdd74ToInventory('${item.code}', '${item.name}', '${item.desc.replace(/'/g, "\\'")}', '${item.pkg}', '${item.subCat}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 text-[10px] font-medium transition flex items-center gap-1" title="Thêm linh kiện này vào kho">
                  <i data-lucide="plus" class="w-3 h-3"></i> Thêm
                </button>
                <button onclick="openBuyModalForExternal('${item.name}')" class="px-2 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[10px] font-medium transition flex items-center gap-1" title="Tìm mua từ 4 shop">
                  <i data-lucide="shopping-bag" class="w-3 h-3 text-rose-400"></i> Mua
                </button>
              </div>
            </div>
          </div>
          `;
        }
      }).join('');

      lucide.createIcons();
    }

    function filterPartsBy74Code(code) {
      close74AchievementModal();
      const targetLogicCat = categories.find(c => isLogicCategory(c)) || 'Logic IC';
      setCategory(targetLogicCat);
      const input = document.getElementById('searchInput');
      if (input) {
        input.value = `74xx` + code;
      }
      renderParts();
    }

    function quickAdd74ToInventory(code, name, desc, pkg, subCat) {
      const chipPref = prompt(`Thêm IC họ 74 vào kho:\nBạn muốn thêm mã nào? (Ví dụ: 74LS${code}, 74HC${code}, 74HCT${code}):`, `74LS${code}`);
      if (!chipPref) return;

      const newId = 'p_74_' + Date.now();
      const targetLogicCat = categories.find(c => isLogicCategory(c)) || 'Logic IC';
      const newPart = {
        id: newId,
        name: chipPref.trim().toUpperCase(),
        package: pkg || 'DIP-14',
        category: targetLogicCat,
        subCategory: subCat || 'Cổng Logic',
        desc: desc,
        qty: 5,
        inUse: 0,
        minQty: 2,
        project: '',
        boxId: boxes[0]?.id || '',
        cell: 'A1',
        subCell: '',
        location: boxes[0]?.name ? `${boxes[0].name} • Ô A1` : 'Chưa xếp ô',
        pinout: LOGIC_74_MAP[code]?.pinout || '',
        buyShops: generateShopLinksForPart(chipPref.trim().toUpperCase(), pkg || 'DIP-14')
      };

      parts.push(newPart);
      saveData();
      renderParts();
      render74Achievement();
      alert(`Đã thêm thành công "${newPart.name}" vào kho!`);
    }
