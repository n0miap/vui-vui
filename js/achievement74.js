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

      // --- CỔNG LOGIC ---
      { code: '00', name: '7400', subCat: 'Cổng Logic', title: 'Quad 2-Input NAND', desc: '4 cổng NAND 2 ngõ vào', pkg: 'DIP-14' },
      { code: '01', name: '7401', subCat: 'Cổng Logic', title: 'quad 2-input NAND gate with open co...', desc: 'quad 2-input NAND gate with open collector outputs', pkg: 'DIP-14' },
      { code: '02', name: '7402', subCat: 'Cổng Logic', title: 'Quad 2-Input NOR', desc: '4 cổng NOR 2 ngõ vào', pkg: 'DIP-14' },
      { code: '03', name: '7403', subCat: 'Cổng Logic', title: 'quad 2-input NAND gate with open co...', desc: 'quad 2-input NAND gate with open collector outputs', pkg: 'DIP-14' },
      { code: '04', name: '7404', subCat: 'Cổng Logic', title: 'Hex Inverter (NOT)', desc: '6 cổng đảo NOT độc lập', pkg: 'DIP-14' },
      { code: '05', name: '7405', subCat: 'Cổng Logic', title: 'hex inverter with open collector ou...', desc: 'hex inverter with open collector outputs', pkg: 'DIP-14' },
      { code: '08', name: '7408', subCat: 'Cổng Logic', title: 'Quad 2-Input AND', desc: '4 cổng AND 2 ngõ vào', pkg: 'DIP-14' },
      { code: '09', name: '7409', subCat: 'Cổng Logic', title: 'quad 2-input AND gate with open col...', desc: 'quad 2-input AND gate with open collector outputs', pkg: 'DIP-14' },
      { code: '10', name: '7410', subCat: 'Cổng Logic', title: 'Triple 3-Input NAND', desc: '3 cổng NAND 3 ngõ vào', pkg: 'DIP-14' },
      { code: '11', name: '7411', subCat: 'Cổng Logic', title: 'Triple 3-Input AND', desc: '3 cổng AND 3 ngõ vào', pkg: 'DIP-14' },
      { code: '12', name: '7412', subCat: 'Cổng Logic', title: 'triple 3-input NAND gate with open ...', desc: 'triple 3-input NAND gate with open collector outputs', pkg: 'DIP-14' },
      { code: '15', name: '7415', subCat: 'Cổng Logic', title: 'triple 3-input AND gate with open c...', desc: 'triple 3-input AND gate with open collector outputs', pkg: 'DIP-14' },
      { code: '20', name: '7420', subCat: 'Cổng Logic', title: 'Dual 4-Input NAND', desc: '2 cổng NAND 4 ngõ vào', pkg: 'DIP-14' },
      { code: '21', name: '7421', subCat: 'Cổng Logic', title: 'Dual 4-Input AND', desc: '2 cổng AND 4 ngõ vào', pkg: 'DIP-14' },
      { code: '22', name: '7422', subCat: 'Cổng Logic', title: 'dual 4-input NAND gate with open co...', desc: 'dual 4-input NAND gate with open collector outputs', pkg: 'DIP-14' },
      { code: '23', name: '7423', subCat: 'Cổng Logic', title: 'expandable dual 4-input NOR gate wi...', desc: 'expandable dual 4-input NOR gate with strobe', pkg: 'DIP-14' },
      { code: '25', name: '7425', subCat: 'Cổng Logic', title: 'dual 4-input NOR gate with strobe', desc: 'dual 4-input NOR gate with strobe', pkg: 'DIP-14' },
      { code: '26', name: '7426', subCat: 'Cổng Logic', title: 'quad 2-input NAND gate with 15 V op...', desc: 'quad 2-input NAND gate with 15 V open collector outputs', pkg: 'DIP-14' },
      { code: '27', name: '7427', subCat: 'Cổng Logic', title: 'Triple 3-Input NOR', desc: '3 cổng NOR 3 ngõ vào', pkg: 'DIP-14' },
      { code: '30', name: '7430', subCat: 'Cổng Logic', title: '8-Input NAND Gate', desc: '1 cổng NAND 8 ngõ vào', pkg: 'DIP-14' },
      { code: '31', name: '7431', subCat: 'Cổng Logic', title: 'hex delay elements', desc: 'hex delay elements', pkg: 'DIP-14' },
      { code: '32', name: '7432', subCat: 'Cổng Logic', title: 'Quad 2-Input OR', desc: '4 cổng OR 2 ngõ vào', pkg: 'DIP-14' },
      { code: '34', name: '7434', subCat: 'Cổng Logic', title: 'hex noninverters', desc: 'hex noninverters', pkg: 'DIP-14' },
      { code: '35', name: '7435', subCat: 'Cổng Logic', title: 'hex noninverters with open-collecto...', desc: 'hex noninverters with open-collector outputs', pkg: 'DIP-14' },
      { code: '36', name: '7436', subCat: 'Cổng Logic', title: 'quad 2-input NOR gate', desc: 'quad 2-input NOR gate (different pinout than 7402)', pkg: 'DIP-14' },
      { code: '50', name: '7450', subCat: 'Cổng Logic', title: 'dual 2-wide 2-input AND-OR-invert g...', desc: 'dual 2-wide 2-input AND-OR-invert gate (one gate expandable)', pkg: 'DIP-14' },
      { code: '51', name: '7451', subCat: 'Cổng Logic', title: 'dual 2-wide 2-input AND-OR-invert g...', desc: 'dual 2-wide 2-input AND-OR-invert gate', pkg: 'DIP-14' },
      { code: '52', name: '7452', subCat: 'Cổng Logic', title: 'expandable 4-wide 2-input AND-OR ga...', desc: 'expandable 4-wide 2-input AND-OR gate', pkg: 'DIP-14' },
      { code: '53', name: '7453', subCat: 'Cổng Logic', title: 'expandable 4-wide 2-input AND-OR-in...', desc: 'expandable 4-wide 2-input AND-OR-invert gate', pkg: 'DIP-14' },
      { code: '54', name: '7454', subCat: 'Cổng Logic', title: '3-2-2-3-input AND-OR-invert gate', desc: '3-2-2-3-input AND-OR-invert gate', pkg: 'DIP-14' },
      { code: '55', name: '7455', subCat: 'Cổng Logic', title: '2-wide 4-input AND-OR-invert gate', desc: '2-wide 4-input AND-OR-invert gate (74H version is expandable)', pkg: 'DIP-14' },
      { code: '58', name: '7458', subCat: 'Cổng Logic', title: '2-input &amp; 3-input AND-OR gate', desc: '2-input &amp; 3-input AND-OR gate', pkg: 'DIP-14' },
      { code: '59', name: '7459', subCat: 'Cổng Logic', title: '2-input &amp; 3-input AND-OR-invert...', desc: '2-input &amp; 3-input AND-OR-invert gate', pkg: 'DIP-14' },
      { code: '60', name: '7460', subCat: 'Cổng Logic', title: 'dual 4-input expander', desc: 'dual 4-input expander', pkg: 'DIP-14' },
      { code: '61', name: '7461', subCat: 'Cổng Logic', title: 'triple 3-input expander', desc: 'triple 3-input expander', pkg: 'DIP-14' },
      { code: '62', name: '7462', subCat: 'Cổng Logic', title: '3-2-2-3-input AND-OR expander', desc: '3-2-2-3-input AND-OR expander', pkg: 'DIP-14' },
      { code: '63', name: '7463', subCat: 'Cổng Logic', title: 'hex current sensing interface gates', desc: 'hex current sensing interface gates', pkg: 'DIP-14' },
      { code: '64', name: '7464', subCat: 'Cổng Logic', title: '4-2-3-2-input AND-OR-invert gate', desc: '4-2-3-2-input AND-OR-invert gate', pkg: 'DIP-14' },
      { code: '65', name: '7465', subCat: 'Cổng Logic', title: '4-2-3-2 input AND-OR-invert gate wi...', desc: '4-2-3-2 input AND-OR-invert gate with open collector output', pkg: 'DIP-14' },
      { code: '81', name: '7481', subCat: 'Cổng Logic', title: '16-bit random access memory', desc: '16-bit random access memory', pkg: 'DIP-16' },
      { code: '84', name: '7484', subCat: 'Cổng Logic', title: '16-bit random access memory', desc: '16-bit random access memory', pkg: 'DIP-16' },
      { code: '86', name: '7486', subCat: 'Cổng Logic', title: 'Quad 2-Input XOR', desc: '4 cổng XOR 2 ngõ vào', pkg: 'DIP-14' },
      { code: '87', name: '7487', subCat: 'Cổng Logic', title: '4-bit true/complement/zero/one elem...', desc: '4-bit true/complement/zero/one element', pkg: 'DIP-16' },
      { code: '88', name: '7488', subCat: 'Cổng Logic', title: '256-bit read-only memory', desc: '256-bit read-only memory', pkg: 'DIP-14' },
      { code: '89', name: '7489', subCat: 'Cổng Logic', title: '64-bit random access memory', desc: '64-bit random access memory', pkg: 'DIP-16' },
      { code: '120', name: '74120', subCat: 'Cổng Logic', title: 'dual pulse synchronizer/drivers', desc: 'dual pulse synchronizer/drivers', pkg: 'DIP-14' },
      { code: '133', name: '74133', subCat: 'Cổng Logic', title: '13-input NAND gate', desc: '13-input NAND gate', pkg: 'DIP-14' },
      { code: '134', name: '74134', subCat: 'Cổng Logic', title: '12-input NAND gate with three-state...', desc: '12-input NAND gate with three-state output', pkg: 'DIP-14' },
      { code: '135', name: '74135', subCat: 'Cổng Logic', title: 'quad exclusive-or/NOR gate', desc: 'quad exclusive-or/NOR gate', pkg: 'DIP-14' },
      { code: '136', name: '74136', subCat: 'Cổng Logic', title: 'quad 2-input XOR gate with open col...', desc: 'quad 2-input XOR gate with open collector outputs', pkg: 'DIP-14' },
      { code: '182', name: '74182', subCat: 'Cổng Logic', title: 'lookahead carry generator', desc: 'lookahead carry generator', pkg: 'DIP-14' },
      { code: '184', name: '74184', subCat: 'Cổng Logic', title: 'BCD to binary converter', desc: 'BCD to binary converter', pkg: 'DIP-16' },
      { code: '185', name: '74185', subCat: 'Cổng Logic', title: '6-bit binary to BCD converter', desc: '6-bit binary to BCD converter', pkg: 'DIP-16' },
      { code: '186', name: '74186', subCat: 'Cổng Logic', title: '512-bit', desc: '512-bit (64x8) read-only memory with open collector outputs', pkg: 'DIP-14' },
      { code: '187', name: '74187', subCat: 'Cổng Logic', title: '1024-bit', desc: '1024-bit (256x4) read only memory with open collector outputs', pkg: 'DIP-24' },
      { code: '188', name: '74188', subCat: 'Cổng Logic', title: '256-bit', desc: '256-bit (32x8) programmable read-only memory with open collector outputs', pkg: 'DIP-14' },
      { code: '189', name: '74189', subCat: 'Cổng Logic', title: '64-bit', desc: '64-bit (16x4) RAM with inverting three-state outputs', pkg: 'DIP-16' },
      { code: '200', name: '74200', subCat: 'Cổng Logic', title: '256-bit ram with three-state output...', desc: '256-bit ram with three-state outputs', pkg: 'DIP-14' },
      { code: '201', name: '74201', subCat: 'Cổng Logic', title: '256-bit', desc: '256-bit (256x1) ram with three-state outputs', pkg: 'DIP-14' },
      { code: '206', name: '74206', subCat: 'Cổng Logic', title: '256-bit ram with open collector out...', desc: '256-bit ram with open collector outputs', pkg: 'DIP-14' },
      { code: '209', name: '74209', subCat: 'Cổng Logic', title: '1024-bit', desc: '1024-bit (1024x1) ram with three-state output', pkg: 'DIP-24' },
      { code: '219', name: '74219', subCat: 'Cổng Logic', title: '64-bit', desc: '64-bit (16x4) RAM with noninverting three-state outputs', pkg: 'DIP-16' },
      { code: '260', name: '74260', subCat: 'Cổng Logic', title: 'Dual 5-Input NOR', desc: '2 cổng NOR 5 ngõ vào', pkg: 'DIP-14' },
      { code: '264', name: '74264', subCat: 'Cổng Logic', title: 'look ahead carry generator', desc: 'look ahead carry generator', pkg: 'DIP-14' },
      { code: '265', name: '74265', subCat: 'Cổng Logic', title: 'quad complementary output elements', desc: 'quad complementary output elements', pkg: 'DIP-14' },
      { code: '266', name: '74266', subCat: 'Cổng Logic', title: 'quad 2-input XNOR gate with open co...', desc: 'quad 2-input XNOR gate with open collector outputs', pkg: 'DIP-14' },
      { code: '270', name: '74270', subCat: 'Cổng Logic', title: '2048-bit', desc: '2048-bit (512x4) read only memory with open collector outputs', pkg: 'DIP-20' },
      { code: '271', name: '74271', subCat: 'Cổng Logic', title: '2048-bit', desc: '2048-bit (256x8) read only memory with open collector outputs', pkg: 'DIP-20' },
      { code: '275', name: '74275', subCat: 'Cổng Logic', title: '7-bit slice Wallace tree', desc: '7-bit slice Wallace tree', pkg: 'DIP-14' },
      { code: '281', name: '74281', subCat: 'Cổng Logic', title: '4-bit parallel binary accumulator', desc: '4-bit parallel binary accumulator', pkg: 'DIP-16' },
      { code: '282', name: '74282', subCat: 'Cổng Logic', title: 'look-ahead carry generator with sel...', desc: 'look-ahead carry generator with selectable carry inputs', pkg: 'DIP-14' },
      { code: '287', name: '74287', subCat: 'Cổng Logic', title: '1024-bit', desc: '1024-bit (256x4) programmable read-only memory with three-state outputs', pkg: 'DIP-24' },
      { code: '288', name: '74288', subCat: 'Cổng Logic', title: '256-bit', desc: '256-bit (32x8) programmable read-only memory with three-state outputs', pkg: 'DIP-14' },
      { code: '289', name: '74289', subCat: 'Cổng Logic', title: '64-bit', desc: '64-bit (16x4) RAM with open collector outputs', pkg: 'DIP-16' },
      { code: '297', name: '74297', subCat: 'Cổng Logic', title: 'digital phase-locked loop filter', desc: 'digital phase-locked loop filter', pkg: 'DIP-14' },
      { code: '301', name: '74301', subCat: 'Cổng Logic', title: '256-bit', desc: '256-bit (256x1) random access memory with open collector output', pkg: 'DIP-14' },
      { code: '309', name: '74309', subCat: 'Cổng Logic', title: '1024-bit', desc: '1024-bit (1024x1) random access memory with open collector output', pkg: 'DIP-24' },
      { code: '314', name: '74314', subCat: 'Cổng Logic', title: '1024-bit random access memory', desc: '1024-bit random access memory', pkg: 'DIP-24' },
      { code: '319', name: '74319', subCat: 'Cổng Logic', title: '64-bit random access memories 16x4 ...', desc: '64-bit random access memories 16x4 open collector outputs', pkg: 'DIP-16' },
      { code: '350', name: '74350', subCat: 'Cổng Logic', title: '4-bit shifter with three-state outp...', desc: '4-bit shifter with three-state outputs', pkg: 'DIP-16' },
      { code: '361', name: '74361', subCat: 'Cổng Logic', title: 'bubble memory function timing gener...', desc: 'bubble memory function timing generator', pkg: 'DIP-14' },
      { code: '362', name: '74362', subCat: 'Cổng Logic', title: 'four-phase clock generator/driver', desc: 'four-phase clock generator/driver', pkg: 'DIP-14' },
      { code: '370', name: '74370', subCat: 'Cổng Logic', title: '2048-bit', desc: '2048-bit (512x4) read-only memory with three-state outputs', pkg: 'DIP-20' },
      { code: '371', name: '74371', subCat: 'Cổng Logic', title: '2048-bit', desc: '2048-bit (256x8) read-only memory with three-state outputs', pkg: 'DIP-20' },
      { code: '386', name: '74386', subCat: 'Cổng Logic', title: 'quad 2-input XOR gate', desc: 'quad 2-input XOR gate', pkg: 'DIP-14' },
      { code: '387', name: '74387', subCat: 'Cổng Logic', title: '1024-bit', desc: '1024-bit (256x4) programmable read-only memory with open collector outputs', pkg: 'DIP-24' },
      { code: '424', name: '74424', subCat: 'Cổng Logic', title: 'two-phase clock generator/driver', desc: 'two-phase clock generator/driver', pkg: 'DIP-14' },
      { code: '425', name: '74425', subCat: 'Cổng Logic', title: 'quad gates with three-state outputs...', desc: 'quad gates with three-state outputs and active low enables', pkg: 'DIP-14' },
      { code: '426', name: '74426', subCat: 'Cổng Logic', title: 'quad gates with three-state outputs...', desc: 'quad gates with three-state outputs and active high enables', pkg: 'DIP-14' },
      { code: '428', name: '74428', subCat: 'Cổng Logic', title: 'system controller for 8080a', desc: 'system controller for 8080a', pkg: 'DIP-14' },
      { code: '438', name: '74438', subCat: 'Cổng Logic', title: 'system controller for 8080a', desc: 'system controller for 8080a', pkg: 'DIP-14' },
      { code: '460', name: '74460', subCat: 'Cổng Logic', title: 'bus transfer switch', desc: 'bus transfer switch', pkg: 'DIP-14' },
      { code: '462', name: '74462', subCat: 'Cổng Logic', title: 'fiber-optic link transmitter', desc: 'fiber-optic link transmitter', pkg: 'DIP-14' },
      { code: '463', name: '74463', subCat: 'Cổng Logic', title: 'fiber-optic link receiver', desc: 'fiber-optic link receiver', pkg: 'DIP-14' },
      { code: '470', name: '74470', subCat: 'Cổng Logic', title: '2048-bit', desc: '2048-bit (256x8) programmable read-only memory with open collector outputs', pkg: 'DIP-20' },
      { code: '471', name: '74471', subCat: 'Cổng Logic', title: '2048-bit', desc: '2048-bit (256x8) programmable read-only memory with three-state outputs', pkg: 'DIP-20' },
      { code: '472', name: '74472', subCat: 'Cổng Logic', title: 'programmable read-only memory with ...', desc: 'programmable read-only memory with open collector outputs', pkg: 'DIP-14' },
      { code: '473', name: '74473', subCat: 'Cổng Logic', title: 'programmable read-only memory with ...', desc: 'programmable read-only memory with three-state outputs', pkg: 'DIP-14' },
      { code: '474', name: '74474', subCat: 'Cổng Logic', title: 'programmable read-only memory with ...', desc: 'programmable read-only memory with open collector outputs', pkg: 'DIP-14' },
      { code: '475', name: '74475', subCat: 'Cổng Logic', title: 'programmable read-only memory with ...', desc: 'programmable read-only memory with three-state outputs', pkg: 'DIP-14' },
      { code: '481', name: '74481', subCat: 'Cổng Logic', title: '4-bit slice cascadable processor el...', desc: '4-bit slice cascadable processor elements', pkg: 'DIP-16' },
      { code: '482', name: '74482', subCat: 'Cổng Logic', title: '4-bit slice expandable control elem...', desc: '4-bit slice expandable control elements', pkg: 'DIP-16' },
      { code: '484', name: '74484', subCat: 'Cổng Logic', title: 'BCD-to-binary converter', desc: 'BCD-to-binary converter', pkg: 'DIP-16' },
      { code: '485', name: '74485', subCat: 'Cổng Logic', title: 'binary-to-BCD converter', desc: 'binary-to-BCD converter', pkg: 'DIP-16' },
      { code: '600', name: '74600', subCat: 'Cổng Logic', title: 'dynamic memory refresh controller', desc: 'dynamic memory refresh controller, transparent and burst modes, for 4K or 16K drams', pkg: 'DIP-14' },
      { code: '601', name: '74601', subCat: 'Cổng Logic', title: 'dynamic memory refresh controller', desc: 'dynamic memory refresh controller, transparent and burst modes, for 64K drams', pkg: 'DIP-14' },
      { code: '602', name: '74602', subCat: 'Cổng Logic', title: 'dynamic memory refresh controller', desc: 'dynamic memory refresh controller, cycle steal and burst modes, for 4K or 16K drams', pkg: 'DIP-14' },
      { code: '603', name: '74603', subCat: 'Cổng Logic', title: 'dynamic memory refresh controller', desc: 'dynamic memory refresh controller, cycle steal and burst modes, for 64K drams', pkg: 'DIP-14' },
      { code: '608', name: '74608', subCat: 'Cổng Logic', title: 'memory cycle controller', desc: 'memory cycle controller', pkg: 'DIP-14' },
      { code: '612', name: '74612', subCat: 'Cổng Logic', title: 'memory mapper', desc: 'memory mapper, three-state outputs', pkg: 'DIP-14' },
      { code: '613', name: '74613', subCat: 'Cổng Logic', title: 'memory mapper', desc: 'memory mapper, open collector outputs', pkg: 'DIP-14' },
      { code: '630', name: '74630', subCat: 'Cổng Logic', title: '16-bit error detection and correcti...', desc: '16-bit error detection and correction (EDAC) with three-state outputs', pkg: 'DIP-16' },
      { code: '631', name: '74631', subCat: 'Cổng Logic', title: '16-bit error detection and correcti...', desc: '16-bit error detection and correction with open collector outputs', pkg: 'DIP-16' },
      { code: '632', name: '74632', subCat: 'Cổng Logic', title: '32-bit parallel error detection and...', desc: '32-bit parallel error detection and correction, three-state outputs, byte-write', pkg: 'DIP-14' },
      { code: '633', name: '74633', subCat: 'Cổng Logic', title: '32-bit parallel error detection and...', desc: '32-bit parallel error detection and correction, open-collector outputs, byte-write', pkg: 'DIP-14' },
      { code: '634', name: '74634', subCat: 'Cổng Logic', title: '32-bit parallel error detection and...', desc: '32-bit parallel error detection and correction, three-state outputs', pkg: 'DIP-14' },
      { code: '635', name: '74635', subCat: 'Cổng Logic', title: '32-bit parallel error detection and...', desc: '32-bit parallel error detection and correction, open-collector outputs', pkg: 'DIP-14' },
      { code: '681', name: '74681', subCat: 'Cổng Logic', title: '4-bit parallel binary accumulator', desc: '4-bit parallel binary accumulator', pkg: 'DIP-16' },
      { code: '790', name: '74790', subCat: 'Cổng Logic', title: 'error detection and correction', desc: 'error detection and correction (EDAC)', pkg: 'DIP-14' },
      { code: '804', name: '74804', subCat: 'Cổng Logic', title: 'hex 2-input NAND drivers', desc: 'hex 2-input NAND drivers', pkg: 'DIP-14' },
      { code: '805', name: '74805', subCat: 'Cổng Logic', title: 'hex 2-input NOR drivers', desc: 'hex 2-input NOR drivers', pkg: 'DIP-14' },
      { code: '808', name: '74808', subCat: 'Cổng Logic', title: 'hex 2-input AND drivers', desc: 'hex 2-input AND drivers', pkg: 'DIP-14' },
      { code: '832', name: '74832', subCat: 'Cổng Logic', title: 'hex 2-input OR drivers', desc: 'hex 2-input OR drivers', pkg: 'DIP-14' },
      { code: '882', name: '74882', subCat: 'Cổng Logic', title: '32-bit lookahead carry generator', desc: '32-bit lookahead carry generator', pkg: 'DIP-14' },
      { code: '888', name: '74888', subCat: 'Cổng Logic', title: '8-bit slice processor', desc: '8-bit slice processor', pkg: 'DIP-20' },
      { code: '908', name: '74908', subCat: 'Cổng Logic', title: 'dual CMOS 30 V relay driver', desc: 'dual CMOS 30 V relay driver', pkg: 'DIP-14' },
      { code: '910', name: '74910', subCat: 'Cổng Logic', title: '256x1 CMOS static RAM', desc: '256x1 CMOS static RAM', pkg: 'DIP-14' },
      { code: '911', name: '74911', subCat: 'Cổng Logic', title: '4-digit expandable display controll...', desc: '4-digit expandable display controller', pkg: 'DIP-14' },
      { code: '912', name: '74912', subCat: 'Cổng Logic', title: '6-digit BCD display controller and ...', desc: '6-digit BCD display controller and driver', pkg: 'DIP-16' },
      { code: '917', name: '74917', subCat: 'Cổng Logic', title: '6-digit hex display controller and ...', desc: '6-digit hex display controller and driver', pkg: 'DIP-14' },
      { code: '918', name: '74918', subCat: 'Cổng Logic', title: 'dual CMOS 30 V relay driver', desc: 'dual CMOS 30 V relay driver', pkg: 'DIP-14' },
      { code: '920', name: '74920', subCat: 'Cổng Logic', title: '256x4 CMOS static RAM', desc: '256x4 CMOS static RAM', pkg: 'DIP-14' },
      { code: '921', name: '74921', subCat: 'Cổng Logic', title: '256x4 CMOS static RAM', desc: '256x4 CMOS static RAM', pkg: 'DIP-14' },
      { code: '929', name: '74929', subCat: 'Cổng Logic', title: '1024x1 CMOS static RAM', desc: '1024x1 CMOS static RAM', pkg: 'DIP-14' },
      { code: '930', name: '74930', subCat: 'Cổng Logic', title: '1024x1 CMOS static RAM', desc: '1024x1 CMOS static RAM', pkg: 'DIP-14' },
      { code: '934', name: '74934', subCat: 'Cổng Logic', title: '=ADC0829 ADC', desc: '=ADC0829 ADC, see corresponding NSC datasheet', pkg: 'DIP-14' },
      { code: '935', name: '74935', subCat: 'Cổng Logic', title: '3.5-digit digital voltmeter', desc: '3.5-digit digital voltmeter (DVM) support chip for multiplexed 7-segment displays', pkg: 'DIP-14' },
      { code: '936', name: '74936', subCat: 'Cổng Logic', title: '3.75-digit digital voltmeter', desc: '3.75-digit digital voltmeter (DVM) support chip for multiplexed 7-segment displays', pkg: 'DIP-14' },
      { code: '937', name: '74937', subCat: 'Cổng Logic', title: '=ADC3511 ADC', desc: '=ADC3511 ADC, see corresponding NSC datasheet', pkg: 'DIP-14' },
      { code: '938', name: '74938', subCat: 'Cổng Logic', title: '=ADC3711 ADC', desc: '=ADC3711 ADC, see corresponding NSC datasheet', pkg: 'DIP-14' },
      { code: '948', name: '74948', subCat: 'Cổng Logic', title: '=ADC0816 ADC', desc: '=ADC0816 ADC, see corresponding NSC datasheet', pkg: 'DIP-14' },
      { code: '949', name: '74949', subCat: 'Cổng Logic', title: '=ADC0808 ADC', desc: '=ADC0808 ADC, see corresponding NSC datasheet', pkg: 'DIP-14' },
      { code: '2960', name: '742960', subCat: 'Cổng Logic', title: 'error detection and correction', desc: 'error detection and correction (EDAC)', pkg: 'DIP-14' },
      { code: '2968', name: '742968', subCat: 'Cổng Logic', title: 'dynamic memory controller', desc: 'dynamic memory controller', pkg: 'DIP-14' },
      { code: '2969', name: '742969', subCat: 'Cổng Logic', title: 'memory timing controller for use wi...', desc: 'memory timing controller for use with EDAC', pkg: 'DIP-14' },
      { code: '2970', name: '742970', subCat: 'Cổng Logic', title: 'memory timing controller for use wi...', desc: 'memory timing controller for use without EDAC', pkg: 'DIP-14' },
      { code: '4002', name: '744002', subCat: 'Cổng Logic', title: 'dual 4-input NOR gate', desc: 'dual 4-input NOR gate', pkg: 'DIP-14' },
      { code: '4016', name: '744016', subCat: 'Cổng Logic', title: 'quad bilateral switch', desc: 'quad bilateral switch', pkg: 'DIP-14' },
      { code: '4066', name: '744066', subCat: 'Cổng Logic', title: 'quad bilateral switches', desc: 'quad bilateral switches', pkg: 'DIP-14' },
      { code: '4075', name: '744075', subCat: 'Cổng Logic', title: 'triple 3-input OR gate', desc: 'triple 3-input OR gate', pkg: 'DIP-14' },
      { code: '4078', name: '744078', subCat: 'Cổng Logic', title: '8-input OR/NOR gate', desc: '8-input OR/NOR gate', pkg: 'DIP-14' },
      { code: '4316', name: '744316', subCat: 'Cổng Logic', title: 'quad analog switch', desc: 'quad analog switch', pkg: 'DIP-14' },
      { code: '7266', name: '747266', subCat: 'Cổng Logic', title: 'quad 2-input XNOR gate', desc: 'quad 2-input XNOR gate', pkg: 'DIP-14' },

      // --- BỘ NHỚ & CHỐT ---
      { code: '70', name: '7470', subCat: 'Bộ Nhớ & Chốt', title: 'AND-gated positive edge triggered J...', desc: 'AND-gated positive edge triggered J-K flip-flop with preset and clear', pkg: 'DIP-14' },
      { code: '72', name: '7472', subCat: 'Bộ Nhớ & Chốt', title: 'AND gated J-K master-slave flip-flo...', desc: 'AND gated J-K master-slave flip-flop with preset and clear', pkg: 'DIP-14' },
      { code: '73', name: '7473', subCat: 'Bộ Nhớ & Chốt', title: 'Dual JK Flip-Flop', desc: 'JK Flip-Flop kép có Reset', pkg: 'DIP-14' },
      { code: '74', name: '7474', subCat: 'Bộ Nhớ & Chốt', title: 'Dual D-Type Flip-Flop', desc: 'D Flip-Flop kép có Set/Reset', pkg: 'DIP-14' },
      { code: '75', name: '7475', subCat: 'Bộ Nhớ & Chốt', title: 'Quad Bistable Latch', desc: '4 chốt dữ liệu D hai trạng thái', pkg: 'DIP-16' },
      { code: '76', name: '7476', subCat: 'Bộ Nhớ & Chốt', title: 'Dual JK Flip-Flop', desc: 'JK Flip-Flop kép có Preset & Clear', pkg: 'DIP-16' },
      { code: '77', name: '7477', subCat: 'Bộ Nhớ & Chốt', title: '4-bit bistable latch', desc: '4-bit bistable latch', pkg: 'DIP-16' },
      { code: '79', name: '7479', subCat: 'Bộ Nhớ & Chốt', title: 'dual D flip-flop', desc: 'dual D flip-flop', pkg: 'DIP-14' },
      { code: '98', name: '7498', subCat: 'Bộ Nhớ & Chốt', title: '4-bit data selector/storage registe...', desc: '4-bit data selector/storage register', pkg: 'DIP-16' },
      { code: '100', name: '74100', subCat: 'Bộ Nhớ & Chốt', title: 'dual 4-bit bistable latch', desc: 'dual 4-bit bistable latch', pkg: 'DIP-16' },
      { code: '101', name: '74101', subCat: 'Bộ Nhớ & Chốt', title: 'AND-OR-gated J-K negative-edge-trig...', desc: 'AND-OR-gated J-K negative-edge-triggered flip-flop with preset', pkg: 'DIP-14' },
      { code: '102', name: '74102', subCat: 'Bộ Nhớ & Chốt', title: 'AND-gated J-K negative-edge-trigger...', desc: 'AND-gated J-K negative-edge-triggered flip-flop with preset and clear', pkg: 'DIP-14' },
      { code: '103', name: '74103', subCat: 'Bộ Nhớ & Chốt', title: 'dual J-K negative-edge-triggered fl...', desc: 'dual J-K negative-edge-triggered flip-flop with clear', pkg: 'DIP-14' },
      { code: '104', name: '74104', subCat: 'Bộ Nhớ & Chốt', title: 'J-K master-slave flip-flop', desc: 'J-K master-slave flip-flop', pkg: 'DIP-14' },
      { code: '105', name: '74105', subCat: 'Bộ Nhớ & Chốt', title: 'J-K master-slave flip-flop', desc: 'J-K master-slave flip-flop', pkg: 'DIP-14' },
      { code: '106', name: '74106', subCat: 'Bộ Nhớ & Chốt', title: 'dual J-K negative-edge-triggered fl...', desc: 'dual J-K negative-edge-triggered flip-flop with preset and clear', pkg: 'DIP-14' },
      { code: '107', name: '74107', subCat: 'Bộ Nhớ & Chốt', title: 'Dual JK Flip-Flop', desc: 'JK Flip-Flop kép ngõ vào Clear', pkg: 'DIP-14' },
      { code: '108', name: '74108', subCat: 'Bộ Nhớ & Chốt', title: 'dual J-K negative-edge-triggered fl...', desc: 'dual J-K negative-edge-triggered flip-flop with preset, common clear, and common clock', pkg: 'DIP-14' },
      { code: '109', name: '74109', subCat: 'Bộ Nhớ & Chốt', title: 'Dual J-Not-K Flip-Flop', desc: 'J-Not-K Flip-Flop kích cạnh dương', pkg: 'DIP-16' },
      { code: '110', name: '74110', subCat: 'Bộ Nhớ & Chốt', title: 'AND-gated J-K master-slave flip-flo...', desc: 'AND-gated J-K master-slave flip-flop with data lockout', pkg: 'DIP-14' },
      { code: '111', name: '74111', subCat: 'Bộ Nhớ & Chốt', title: 'dual J-K master-slave flip-flop wit...', desc: 'dual J-K master-slave flip-flop with data lockout', pkg: 'DIP-14' },
      { code: '112', name: '74112', subCat: 'Bộ Nhớ & Chốt', title: 'Dual JK Flip-Flop', desc: 'JK Flip-Flop kích cạnh âm', pkg: 'DIP-16' },
      { code: '113', name: '74113', subCat: 'Bộ Nhớ & Chốt', title: 'dual J-K negative-edge-triggered fl...', desc: 'dual J-K negative-edge-triggered flip-flop with preset', pkg: 'DIP-14' },
      { code: '114', name: '74114', subCat: 'Bộ Nhớ & Chốt', title: 'dual J-K negative-edge-triggered fl...', desc: 'dual J-K negative-edge-triggered flip-flop with preset, common clock and clear', pkg: 'DIP-14' },
      { code: '116', name: '74116', subCat: 'Bộ Nhớ & Chốt', title: 'dual 4-bit latch with clear', desc: 'dual 4-bit latch with clear', pkg: 'DIP-16' },
      { code: '118', name: '74118', subCat: 'Bộ Nhớ & Chốt', title: 'hex set/reset latch', desc: 'hex set/reset latch', pkg: 'DIP-14' },
      { code: '119', name: '74119', subCat: 'Bộ Nhớ & Chốt', title: 'hex set/reset latch', desc: 'hex set/reset latch', pkg: 'DIP-14' },
      { code: '170', name: '74170', subCat: 'Bộ Nhớ & Chốt', title: '4 by 4 register file with open coll...', desc: '4 by 4 register file with open collector outputs', pkg: 'DIP-14' },
      { code: '171', name: '74171', subCat: 'Bộ Nhớ & Chốt', title: 'quad D-type flip-flops with clear', desc: 'quad D-type flip-flops with clear', pkg: 'DIP-14' },
      { code: '172', name: '74172', subCat: 'Bộ Nhớ & Chốt', title: '16-bit multiple port register file ...', desc: '16-bit multiple port register file with three-state outputs', pkg: 'DIP-16' },
      { code: '173', name: '74173', subCat: 'Bộ Nhớ & Chốt', title: '4-Bit D Register', desc: 'Thanh ghi 4 D-FF ngõ ra 3 trạng thái', pkg: 'DIP-16' },
      { code: '174', name: '74174', subCat: 'Bộ Nhớ & Chốt', title: 'Hex D Flip-Flop', desc: 'Thanh ghi 6 D-FF có Master Reset', pkg: 'DIP-16' },
      { code: '175', name: '74175', subCat: 'Bộ Nhớ & Chốt', title: 'Quad D Flip-Flop', desc: 'Thanh ghi 4 D-FF có ngõ ra bù đảo', pkg: 'DIP-16' },
      { code: '222', name: '74222', subCat: 'Bộ Nhớ & Chốt', title: '16 by 4 synchronous FIFO memory wit...', desc: '16 by 4 synchronous FIFO memory with three-state outputs', pkg: 'DIP-14' },
      { code: '224', name: '74224', subCat: 'Bộ Nhớ & Chốt', title: '16 by 4 synchronous FIFO memory wit...', desc: '16 by 4 synchronous FIFO memory with three-state outputs', pkg: 'DIP-14' },
      { code: '225', name: '74225', subCat: 'Bộ Nhớ & Chốt', title: 'asynchronous 16x5 FIFO memory', desc: 'asynchronous 16x5 FIFO memory', pkg: 'DIP-14' },
      { code: '227', name: '74227', subCat: 'Bộ Nhớ & Chốt', title: '64-bit fifo memories 16x4', desc: '64-bit fifo memories 16x4', pkg: 'DIP-16' },
      { code: '228', name: '74228', subCat: 'Bộ Nhớ & Chốt', title: '64-bit fifo memories 16x4 open-coll...', desc: '64-bit fifo memories 16x4 open-collector outputs', pkg: 'DIP-16' },
      { code: '255', name: '74255', subCat: 'Bộ Nhớ & Chốt', title: 'dual 4-bit addressable latch', desc: 'dual 4-bit addressable latch', pkg: 'DIP-16' },
      { code: '256', name: '74256', subCat: 'Bộ Nhớ & Chốt', title: 'dual 4-bit addressable latch', desc: 'dual 4-bit addressable latch', pkg: 'DIP-16' },
      { code: '259', name: '74259', subCat: 'Bộ Nhớ & Chốt', title: '8-Bit Addressable Latch', desc: 'Chốt dữ liệu 8-bit định địa chỉ', pkg: 'DIP-16' },
      { code: '268', name: '74268', subCat: 'Bộ Nhớ & Chốt', title: 'hex d-type latches three-state outp...', desc: 'hex d-type latches three-state outputs, common output control, common enable', pkg: 'DIP-14' },
      { code: '273', name: '74273', subCat: 'Bộ Nhớ & Chốt', title: 'Octal D Flip-Flop', desc: 'Thanh ghi 8 D-FF kích cạnh dương', pkg: 'DIP-20' },
      { code: '276', name: '74276', subCat: 'Bộ Nhớ & Chốt', title: 'quad J-Not-K edge-triggered flip-fl...', desc: 'quad J-Not-K edge-triggered flip-flops with separate clocks, common preset and clear', pkg: 'DIP-14' },
      { code: '278', name: '74278', subCat: 'Bộ Nhớ & Chốt', title: '4-bit cascadeable priority register...', desc: '4-bit cascadeable priority registers with latched data inputs', pkg: 'DIP-16' },
      { code: '279', name: '74279', subCat: 'Bộ Nhớ & Chốt', title: 'quad set-reset latch', desc: 'quad set-reset latch', pkg: 'DIP-14' },
      { code: '295', name: '74295', subCat: 'Bộ Nhớ & Chốt', title: '4-bit bidirectional register with t...', desc: '4-bit bidirectional register with three-state outputs', pkg: 'DIP-16' },
      { code: '323', name: '74323', subCat: 'Bộ Nhớ & Chốt', title: '8-bit bidirectional universal shift...', desc: '8-bit bidirectional universal shift/storage register with three-state outputs', pkg: 'DIP-20' },
      { code: '363', name: '74363', subCat: 'Bộ Nhớ & Chốt', title: 'octal three-state D-latches', desc: 'octal three-state D-latches', pkg: 'DIP-20' },
      { code: '373', name: '74373', subCat: 'Bộ Nhớ & Chốt', title: 'Octal Transparent Latch', desc: 'Chốt 8-bit trong suốt 3 trạng thái', pkg: 'DIP-20' },
      { code: '374', name: '74374', subCat: 'Bộ Nhớ & Chốt', title: 'Octal D Flip-Flop (3S)', desc: 'Thanh ghi 8 D-FF ngõ ra 3 trạng thái', pkg: 'DIP-20' },
      { code: '375', name: '74375', subCat: 'Bộ Nhớ & Chốt', title: 'quad bistable latch', desc: 'quad bistable latch', pkg: 'DIP-14' },
      { code: '376', name: '74376', subCat: 'Bộ Nhớ & Chốt', title: 'quad J-Not-K flip-flop with common ...', desc: 'quad J-Not-K flip-flop with common clock and common clear', pkg: 'DIP-14' },
      { code: '377', name: '74377', subCat: 'Bộ Nhớ & Chốt', title: 'Octal D-FF with Enable', desc: 'Thanh ghi 8 D-FF có chân Clock Enable', pkg: 'DIP-20' },
      { code: '378', name: '74378', subCat: 'Bộ Nhớ & Chốt', title: '6-bit register with clock enable', desc: '6-bit register with clock enable', pkg: 'DIP-14' },
      { code: '379', name: '74379', subCat: 'Bộ Nhớ & Chốt', title: '4-bit register with clock enable an...', desc: '4-bit register with clock enable and complementary outputs', pkg: 'DIP-16' },
      { code: '380', name: '74380', subCat: 'Bộ Nhớ & Chốt', title: '8-bit multifunction register', desc: '8-bit multifunction register', pkg: 'DIP-20' },
      { code: '388', name: '74388', subCat: 'Bộ Nhớ & Chốt', title: '4-bit register with standard and th...', desc: '4-bit register with standard and three-state outputs', pkg: 'DIP-16' },
      { code: '396', name: '74396', subCat: 'Bộ Nhớ & Chốt', title: 'octal storage registers', desc: 'octal storage registers, parallel access', pkg: 'DIP-20' },
      { code: '531', name: '74531', subCat: 'Bộ Nhớ & Chốt', title: 'octal transparent latch with 32 ma ...', desc: 'octal transparent latch with 32 ma three-state outputs', pkg: 'DIP-20' },
      { code: '532', name: '74532', subCat: 'Bộ Nhớ & Chốt', title: 'octal register with 32 ma three-sta...', desc: 'octal register with 32 ma three-state outputs', pkg: 'DIP-20' },
      { code: '533', name: '74533', subCat: 'Bộ Nhớ & Chốt', title: 'octal transparent latch with invert...', desc: 'octal transparent latch with inverting three-state outputs', pkg: 'DIP-20' },
      { code: '534', name: '74534', subCat: 'Bộ Nhớ & Chốt', title: 'octal register with inverting three...', desc: 'octal register with inverting three-state outputs', pkg: 'DIP-20' },
      { code: '535', name: '74535', subCat: 'Bộ Nhớ & Chốt', title: 'octal transparent latch with invert...', desc: 'octal transparent latch with inverting three-state outputs', pkg: 'DIP-20' },
      { code: '536', name: '74536', subCat: 'Bộ Nhớ & Chốt', title: 'octal register with inverting 32 ma...', desc: 'octal register with inverting 32 ma three-state outputs', pkg: 'DIP-20' },
      { code: '563', name: '74563', subCat: 'Bộ Nhớ & Chốt', title: '8-bit D-type transparent latch with...', desc: '8-bit D-type transparent latch with inverting three-state outputs', pkg: 'DIP-20' },
      { code: '564', name: '74564', subCat: 'Bộ Nhớ & Chốt', title: '8-bit D-type edge-triggered registe...', desc: '8-bit D-type edge-triggered register with inverting three-state outputs', pkg: 'DIP-20' },
      { code: '573', name: '74573', subCat: 'Bộ Nhớ & Chốt', title: 'Octal Latch Flow-thru', desc: 'Chốt 8-bit chân thẳng hàng dễ layout', pkg: 'DIP-20' },
      { code: '574', name: '74574', subCat: 'Bộ Nhớ & Chốt', title: 'Octal D-FF Flow-thru', desc: 'Thanh ghi 8 D-FF chân thẳng hàng', pkg: 'DIP-20' },
      { code: '575', name: '74575', subCat: 'Bộ Nhớ & Chốt', title: 'octal D-type flip-flop with synchro...', desc: 'octal D-type flip-flop with synchronous clear, three-state outputs', pkg: 'DIP-20' },
      { code: '576', name: '74576', subCat: 'Bộ Nhớ & Chốt', title: 'octal D-type flip-flop with inverti...', desc: 'octal D-type flip-flop with inverting three-state outputs', pkg: 'DIP-20' },
      { code: '577', name: '74577', subCat: 'Bộ Nhớ & Chốt', title: 'octal D-type flip-flop with synchro...', desc: 'octal D-type flip-flop with synchronous clear, inverting three-state outputs', pkg: 'DIP-20' },
      { code: '605', name: '74605', subCat: 'Bộ Nhớ & Chốt', title: 'latch', desc: 'latch, high-speed, with open collector outputs', pkg: 'DIP-14' },
      { code: '610', name: '74610', subCat: 'Bộ Nhớ & Chốt', title: 'memory mapper', desc: 'memory mapper, latched, three-state outputs', pkg: 'DIP-14' },
      { code: '611', name: '74611', subCat: 'Bộ Nhớ & Chốt', title: 'memory mapper', desc: 'memory mapper, latched, open collector outputs', pkg: 'DIP-14' },
      { code: '670', name: '74670', subCat: 'Bộ Nhớ & Chốt', title: '4 by 4 register file with three-sta...', desc: '4 by 4 register file with three-state outputs', pkg: 'DIP-14' },
      { code: '794', name: '74794', subCat: 'Bộ Nhớ & Chốt', title: '8-bit register with readback', desc: '8-bit register with readback', pkg: 'DIP-20' },
      { code: '822', name: '74822', subCat: 'Bộ Nhớ & Chốt', title: '10-bit bus interface flip-flop with...', desc: '10-bit bus interface flip-flop with three-state outputs', pkg: 'DIP-14' },
      { code: '873', name: '74873', subCat: 'Bộ Nhớ & Chốt', title: 'octal transparent latch', desc: 'octal transparent latch', pkg: 'DIP-20' },
      { code: '874', name: '74874', subCat: 'Bộ Nhớ & Chốt', title: 'octal D-type flip-flop', desc: 'octal D-type flip-flop', pkg: 'DIP-20' },
      { code: '876', name: '74876', subCat: 'Bộ Nhớ & Chốt', title: 'octal D-type flip-flop with inverti...', desc: 'octal D-type flip-flop with inverting outputs', pkg: 'DIP-20' },
      { code: '878', name: '74878', subCat: 'Bộ Nhớ & Chốt', title: 'dual 4-bit D-type flip-flop with sy...', desc: 'dual 4-bit D-type flip-flop with synchronous clear, noninverting three-state outputs', pkg: 'DIP-16' },
      { code: '879', name: '74879', subCat: 'Bộ Nhớ & Chốt', title: 'dual 4-bit D-type flip-flop with sy...', desc: 'dual 4-bit D-type flip-flop with synchronous clear, inverting three-state outputs', pkg: 'DIP-16' },
      { code: '880', name: '74880', subCat: 'Bộ Nhớ & Chốt', title: 'octal transparent latch with invert...', desc: 'octal transparent latch with inverting outputs', pkg: 'DIP-20' },
      { code: '905', name: '74905', subCat: 'Bộ Nhớ & Chốt', title: '12-bit successive approximation reg...', desc: '12-bit successive approximation register', pkg: 'DIP-14' },

      // --- BỘ ĐẾM & CHIA TẦN ---
      { code: '56', name: '7456', subCat: 'Bộ Đếm & Chia Tần', title: '50:1 frequency divider', desc: '50:1 frequency divider', pkg: 'DIP-14' },
      { code: '57', name: '7457', subCat: 'Bộ Đếm & Chia Tần', title: '60:1 frequency divider', desc: '60:1 frequency divider', pkg: 'DIP-14' },
      { code: '68', name: '7468', subCat: 'Bộ Đếm & Chia Tần', title: 'dual 4-bit decade counters', desc: 'dual 4-bit decade counters', pkg: 'DIP-16' },
      { code: '69', name: '7469', subCat: 'Bộ Đếm & Chia Tần', title: 'dual 4-bit binary counters', desc: 'dual 4-bit binary counters', pkg: 'DIP-16' },
      { code: '90', name: '7490', subCat: 'Bộ Đếm & Chia Tần', title: 'Decade Counter (÷10)', desc: 'Bộ đếm thập phân chia 10 bất đồng bộ', pkg: 'DIP-14' },
      { code: '92', name: '7492', subCat: 'Bộ Đếm & Chia Tần', title: 'Divide-by-12 Counter', desc: 'Bộ đếm chia 12 / chia 6', pkg: 'DIP-14' },
      { code: '93', name: '7493', subCat: 'Bộ Đếm & Chia Tần', title: '4-Bit Binary Counter', desc: 'Bộ đếm nhị phân 4-bit chia 16', pkg: 'DIP-14' },
      { code: '142', name: '74142', subCat: 'Bộ Đếm & Chia Tần', title: 'decade counter/latch/decoder/driver...', desc: 'decade counter/latch/decoder/driver for Nixie tubes', pkg: 'DIP-16' },
      { code: '143', name: '74143', subCat: 'Bộ Đếm & Chia Tần', title: 'decade counter/latch/decoder/7-segm...', desc: 'decade counter/latch/decoder/7-segment driver, 15 ma constant current', pkg: 'DIP-16' },
      { code: '144', name: '74144', subCat: 'Bộ Đếm & Chia Tần', title: 'decade counter/latch/decoder/7-segm...', desc: 'decade counter/latch/decoder/7-segment driver, 15 V open collector outputs', pkg: 'DIP-16' },
      { code: '160', name: '74160', subCat: 'Bộ Đếm & Chia Tần', title: 'Sync BCD Counter', desc: 'Bộ đếm BCD đồng bộ nạp song song', pkg: 'DIP-16' },
      { code: '161', name: '74161', subCat: 'Bộ Đếm & Chia Tần', title: 'Sync 4-Bit Binary Counter', desc: 'Bộ đếm nhị phân 4-bit đồng bộ', pkg: 'DIP-16' },
      { code: '162', name: '74162', subCat: 'Bộ Đếm & Chia Tần', title: 'Sync BCD Counter', desc: 'Bộ đếm BCD đồng bộ xóa đồng bộ', pkg: 'DIP-16' },
      { code: '163', name: '74163', subCat: 'Bộ Đếm & Chia Tần', title: 'Sync Binary Counter', desc: 'Bộ đếm nhị phân 4-bit xóa đồng bộ', pkg: 'DIP-16' },
      { code: '168', name: '74168', subCat: 'Bộ Đếm & Chia Tần', title: 'synchronous 4-bit up/down decade co...', desc: 'synchronous 4-bit up/down decade counter', pkg: 'DIP-16' },
      { code: '169', name: '74169', subCat: 'Bộ Đếm & Chia Tần', title: 'synchronous 4-bit up/down binary co...', desc: 'synchronous 4-bit up/down binary counter', pkg: 'DIP-16' },
      { code: '176', name: '74176', subCat: 'Bộ Đếm & Chia Tần', title: 'presettable decade', desc: 'presettable decade (bi-quinary) counter/latch', pkg: 'DIP-14' },
      { code: '177', name: '74177', subCat: 'Bộ Đếm & Chia Tần', title: 'presettable binary counter/latch', desc: 'presettable binary counter/latch', pkg: 'DIP-14' },
      { code: '190', name: '74190', subCat: 'Bộ Đếm & Chia Tần', title: 'Sync Up/Down BCD', desc: 'Bộ đếm lên/xuống BCD đồng bộ', pkg: 'DIP-16' },
      { code: '191', name: '74191', subCat: 'Bộ Đếm & Chia Tần', title: 'Sync Up/Down Binary', desc: 'Bộ đếm lên/xuống nhị phân đồng bộ', pkg: 'DIP-16' },
      { code: '192', name: '74192', subCat: 'Bộ Đếm & Chia Tần', title: 'Dual-Clock Up/Down BCD', desc: 'Đếm lên/xuống BCD 2 chân clock', pkg: 'DIP-16' },
      { code: '193', name: '74193', subCat: 'Bộ Đếm & Chia Tần', title: 'Dual-Clock Up/Down Bin', desc: 'Đếm lên/xuống nhị phân 2 chân clock', pkg: 'DIP-16' },
      { code: '196', name: '74196', subCat: 'Bộ Đếm & Chia Tần', title: 'presettable decade counter/latch', desc: 'presettable decade counter/latch', pkg: 'DIP-14' },
      { code: '197', name: '74197', subCat: 'Bộ Đếm & Chia Tần', title: 'presettable binary counter/latch', desc: 'presettable binary counter/latch', pkg: 'DIP-14' },
      { code: '290', name: '74290', subCat: 'Bộ Đếm & Chia Tần', title: 'decade counter', desc: 'decade counter (separate divide-by-2 and divide-by-5 sections)', pkg: 'DIP-14' },
      { code: '292', name: '74292', subCat: 'Bộ Đếm & Chia Tần', title: 'programmable frequency divider/digi...', desc: 'programmable frequency divider/digital timer', pkg: 'DIP-14' },
      { code: '293', name: '74293', subCat: 'Bộ Đếm & Chia Tần', title: '4-bit binary counter', desc: '4-bit binary counter (separate divide-by-2 and divide-by-8 sections)', pkg: 'DIP-16' },
      { code: '294', name: '74294', subCat: 'Bộ Đếm & Chia Tần', title: 'programmable frequency divider/digi...', desc: 'programmable frequency divider/digital timer', pkg: 'DIP-14' },
      { code: '390', name: '74390', subCat: 'Bộ Đếm & Chia Tần', title: 'Dual Decade Counter', desc: 'Bộ đếm thập phân kép (2 trong 1)', pkg: 'DIP-16' },
      { code: '393', name: '74393', subCat: 'Bộ Đếm & Chia Tần', title: 'Dual 4-Bit Binary Counter', desc: 'Bộ đếm nhị phân kép 4-bit độc lập', pkg: 'DIP-14' },
      { code: '452', name: '74452', subCat: 'Bộ Đếm & Chia Tần', title: 'dual decade counter', desc: 'dual decade counter, synchronous', pkg: 'DIP-14' },
      { code: '454', name: '74454', subCat: 'Bộ Đếm & Chia Tần', title: 'dual decade up/down counter', desc: 'dual decade up/down counter, synchronous, preset input', pkg: 'DIP-14' },
      { code: '455', name: '74455', subCat: 'Bộ Đếm & Chia Tần', title: 'dual binary up/down counter', desc: 'dual binary up/down counter, synchronous, preset input', pkg: 'DIP-14' },
      { code: '461', name: '74461', subCat: 'Bộ Đếm & Chia Tần', title: '8-bit presettable binary counter wi...', desc: '8-bit presettable binary counter with three-state outputs', pkg: 'DIP-20' },
      { code: '469', name: '74469', subCat: 'Bộ Đếm & Chia Tần', title: '8-bit synchronous up/down counter w...', desc: '8-bit synchronous up/down counter with parallel load and hold capability', pkg: 'DIP-20' },
      { code: '490', name: '74490', subCat: 'Bộ Đếm & Chia Tần', title: 'dual decade counter', desc: 'dual decade counter', pkg: 'DIP-14' },
      { code: '491', name: '74491', subCat: 'Bộ Đếm & Chia Tần', title: '10-bit binary up/down counter with ...', desc: '10-bit binary up/down counter with limited preset and three-state outputs', pkg: 'DIP-14' },
      { code: '508', name: '74508', subCat: 'Bộ Đếm & Chia Tần', title: '8-bit multiplier/divider', desc: '8-bit multiplier/divider', pkg: 'DIP-20' },
      { code: '560', name: '74560', subCat: 'Bộ Đếm & Chia Tần', title: '4-bit decade counter with three-sta...', desc: '4-bit decade counter with three-state outputs', pkg: 'DIP-16' },
      { code: '561', name: '74561', subCat: 'Bộ Đếm & Chia Tần', title: '4-bit binary counter with three-sta...', desc: '4-bit binary counter with three-state outputs', pkg: 'DIP-16' },
      { code: '568', name: '74568', subCat: 'Bộ Đếm & Chia Tần', title: 'decade up/down counter with three-s...', desc: 'decade up/down counter with three-state outputs', pkg: 'DIP-14' },
      { code: '569', name: '74569', subCat: 'Bộ Đếm & Chia Tần', title: 'binary up/down counter with three-s...', desc: 'binary up/down counter with three-state outputs', pkg: 'DIP-14' },
      { code: '590', name: '74590', subCat: 'Bộ Đếm & Chia Tần', title: '8-bit binary counter with output re...', desc: '8-bit binary counter with output registers and three-state outputs', pkg: 'DIP-20' },
      { code: '591', name: '74591', subCat: 'Bộ Đếm & Chia Tần', title: '8-bit binary counters with output r...', desc: '8-bit binary counters with output registers, open-collector outputs', pkg: 'DIP-20' },
      { code: '592', name: '74592', subCat: 'Bộ Đếm & Chia Tần', title: '8-bit binary counter with input reg...', desc: '8-bit binary counter with input registers', pkg: 'DIP-20' },
      { code: '593', name: '74593', subCat: 'Bộ Đếm & Chia Tần', title: '8-bit binary counter with input reg...', desc: '8-bit binary counter with input registers and three-state outputs', pkg: 'DIP-20' },
      { code: '668', name: '74668', subCat: 'Bộ Đếm & Chia Tần', title: 'synchronous 4-bit decade up/down co...', desc: 'synchronous 4-bit decade up/down counter', pkg: 'DIP-16' },
      { code: '669', name: '74669', subCat: 'Bộ Đếm & Chia Tần', title: 'synchronous 4-bit binary up/down co...', desc: 'synchronous 4-bit binary up/down counter', pkg: 'DIP-16' },
      { code: '690', name: '74690', subCat: 'Bộ Đếm & Chia Tần', title: '4-bit decimal counter/latch/multipl...', desc: '4-bit decimal counter/latch/multiplexer with asynchronous reset, three-state outputs', pkg: 'DIP-16' },
      { code: '691', name: '74691', subCat: 'Bộ Đếm & Chia Tần', title: '4-bit binary counter/latch/multiple...', desc: '4-bit binary counter/latch/multiplexer with asynchronous reset, three-state outputs', pkg: 'DIP-16' },
      { code: '692', name: '74692', subCat: 'Bộ Đếm & Chia Tần', title: '4-bit decimal counter/latch/multipl...', desc: '4-bit decimal counter/latch/multiplexer with synchronous reset, three-state outputs', pkg: 'DIP-16' },
      { code: '693', name: '74693', subCat: 'Bộ Đếm & Chia Tần', title: '4-bit binary counter/latch/multiple...', desc: '4-bit binary counter/latch/multiplexer with synchronous reset, three-state outputs', pkg: 'DIP-16' },
      { code: '694', name: '74694', subCat: 'Bộ Đếm & Chia Tần', title: '4-bit decimal counter/latch/multipl...', desc: '4-bit decimal counter/latch/multiplexer with synchronous and asynchronous resets, three-state outputs', pkg: 'DIP-16' },
      { code: '695', name: '74695', subCat: 'Bộ Đếm & Chia Tần', title: '4-bit binary counter/latch/multiple...', desc: '4-bit binary counter/latch/multiplexer with synchronous and asynchronous resets, three-state outputs', pkg: 'DIP-16' },
      { code: '696', name: '74696', subCat: 'Bộ Đếm & Chia Tần', title: '4-bit decimal counter/register/mult...', desc: '4-bit decimal counter/register/multiplexer with asynchronous reset, three-state outputs', pkg: 'DIP-16' },
      { code: '697', name: '74697', subCat: 'Bộ Đếm & Chia Tần', title: '4-bit binary counter/register/multi...', desc: '4-bit binary counter/register/multiplexer with asynchronous reset, three-state outputs', pkg: 'DIP-16' },
      { code: '698', name: '74698', subCat: 'Bộ Đếm & Chia Tần', title: '4-bit decimal counter/register/mult...', desc: '4-bit decimal counter/register/multiplexer with synchronous reset, three-state outputs', pkg: 'DIP-16' },
      { code: '699', name: '74699', subCat: 'Bộ Đếm & Chia Tần', title: '4-bit binary counter/register/multi...', desc: '4-bit binary counter/register/multiplexer with synchronous reset, three-state outputs', pkg: 'DIP-16' },
      { code: '716', name: '74716', subCat: 'Bộ Đếm & Chia Tần', title: 'programmable decade counter', desc: 'programmable decade counter', pkg: 'DIP-14' },
      { code: '718', name: '74718', subCat: 'Bộ Đếm & Chia Tần', title: 'programmable binary counter', desc: 'programmable binary counter', pkg: 'DIP-14' },
      { code: '779', name: '74779', subCat: 'Bộ Đếm & Chia Tần', title: '8-bit bidirectional binary counter', desc: '8-bit bidirectional binary counter (three-state)', pkg: 'DIP-20' },
      { code: '925', name: '74925', subCat: 'Bộ Đếm & Chia Tần', title: '4-digit counter/display driver', desc: '4-digit counter/display driver', pkg: 'DIP-14' },
      { code: '926', name: '74926', subCat: 'Bộ Đếm & Chia Tần', title: '4-digit decade counter/display driv...', desc: '4-digit decade counter/display driver with carry out and latch (up to 9999)', pkg: 'DIP-14' },
      { code: '927', name: '74927', subCat: 'Bộ Đếm & Chia Tần', title: '4-digit timer counter/display drive...', desc: '4-digit timer counter/display driver (up to 9599, intended as time elapsed)', pkg: 'DIP-14' },
      { code: '928', name: '74928', subCat: 'Bộ Đếm & Chia Tần', title: '4-digit counter/display driver', desc: '4-digit counter/display driver (up to 1999)', pkg: 'DIP-14' },
      { code: '945', name: '74945', subCat: 'Bộ Đếm & Chia Tần', title: '4-digit up/down counter with decode...', desc: '4-digit up/down counter with decoder and driver', pkg: 'DIP-16' },
      { code: '947', name: '74947', subCat: 'Bộ Đếm & Chia Tần', title: '4-digit up/down counter with decode...', desc: '4-digit up/down counter with decoder and driver', pkg: 'DIP-16' },
      { code: '4017', name: '74HC4017', subCat: 'Bộ Đếm & Chia Tần', title: 'Decade Counter 10 Out', desc: 'Bộ đếm 10 ngõ ra dạng giải mã', pkg: 'DIP-16' },
      { code: '4020', name: '74HC4020', subCat: 'Bộ Đếm & Chia Tần', title: '14-Stage Ripple Counter', desc: 'Bộ đếm gợn nhị phân 14 tầng', pkg: 'DIP-16' },
      { code: '4024', name: '744024', subCat: 'Bộ Đếm & Chia Tần', title: '7-stage ripple carry binary counter', desc: '7-stage ripple carry binary counter', pkg: 'DIP-14' },
      { code: '4040', name: '74HC4040', subCat: 'Bộ Đếm & Chia Tần', title: '12-Stage Ripple Counter', desc: 'Bộ đếm gợn nhị phân 12 tầng', pkg: 'DIP-16' },
      { code: '4059', name: '744059', subCat: 'Bộ Đếm & Chia Tần', title: 'programmable divide-by-N counter', desc: 'programmable divide-by-N counter', pkg: 'DIP-14' },
      { code: '4060', name: '744060', subCat: 'Bộ Đếm & Chia Tần', title: '14-stage binary ripple counter with...', desc: '14-stage binary ripple counter with oscillator', pkg: 'DIP-14' },
      { code: '4520', name: '744520', subCat: 'Bộ Đếm & Chia Tần', title: 'dual 4-bit synchronous binary count...', desc: 'dual 4-bit synchronous binary counter', pkg: 'DIP-16' },

      // --- THANH GHI DỊCH ---
      { code: '91', name: '7491', subCat: 'Thanh Ghi Dịch', title: '8-bit shift register', desc: '8-bit shift register, serial In, serial out, gated input', pkg: 'DIP-20' },
      { code: '94', name: '7494', subCat: 'Thanh Ghi Dịch', title: '4-bit shift register', desc: '4-bit shift register, dual asynchronous presets', pkg: 'DIP-16' },
      { code: '95', name: '7495', subCat: 'Thanh Ghi Dịch', title: '4-bit shift register', desc: '4-bit shift register, parallel in, parallel out, serial input', pkg: 'DIP-16' },
      { code: '96', name: '7496', subCat: 'Thanh Ghi Dịch', title: '5-bit parallel-in/parallel-out shif...', desc: '5-bit parallel-in/parallel-out shift register, asynchronous preset', pkg: 'DIP-14' },
      { code: '99', name: '7499', subCat: 'Thanh Ghi Dịch', title: '4-bit bidirectional universal shift...', desc: '4-bit bidirectional universal shift register', pkg: 'DIP-16' },
      { code: '164', name: '74164', subCat: 'Thanh Ghi Dịch', title: '8-Bit SIPO Shift Reg', desc: 'Dịch nối tiếp sang song song 8-bit', pkg: 'DIP-14' },
      { code: '165', name: '74165', subCat: 'Thanh Ghi Dịch', title: '8-Bit PISO Shift Reg', desc: 'Dịch song song sang nối tiếp 8-bit', pkg: 'DIP-16' },
      { code: '166', name: '74166', subCat: 'Thanh Ghi Dịch', title: '8-Bit PISO Synchronous', desc: 'Dịch song song sang nối tiếp đồng bộ', pkg: 'DIP-16' },
      { code: '178', name: '74178', subCat: 'Thanh Ghi Dịch', title: '4-bit parallel-access shift registe...', desc: '4-bit parallel-access shift register', pkg: 'DIP-16' },
      { code: '179', name: '74179', subCat: 'Thanh Ghi Dịch', title: '4-bit parallel-access shift registe...', desc: '4-bit parallel-access shift register with asynchronous clear and complementary Qd outputs', pkg: 'DIP-16' },
      { code: '194', name: '74194', subCat: 'Thanh Ghi Dịch', title: '4-Bit Universal Shift Reg', desc: 'Thanh ghi dịch đa năng 2 chiều 4-bit', pkg: 'DIP-16' },
      { code: '195', name: '74195', subCat: 'Thanh Ghi Dịch', title: '4-bit parallel-access shift registe...', desc: '4-bit parallel-access shift register', pkg: 'DIP-16' },
      { code: '198', name: '74198', subCat: 'Thanh Ghi Dịch', title: '8-bit bidirectional universal shift...', desc: '8-bit bidirectional universal shift register', pkg: 'DIP-20' },
      { code: '199', name: '74199', subCat: 'Thanh Ghi Dịch', title: '8-bit bidirectional universal shift...', desc: '8-bit bidirectional universal shift register with J-Not-K serial inputs', pkg: 'DIP-20' },
      { code: '291', name: '74291', subCat: 'Thanh Ghi Dịch', title: '4-bit universal shift register', desc: '4-bit universal shift register, binary up/down counter, synchronous', pkg: 'DIP-16' },
      { code: '299', name: '74299', subCat: 'Thanh Ghi Dịch', title: '8-Bit Universal Shift Reg', desc: 'Thanh ghi dịch đa năng 8-bit 3S', pkg: 'DIP-20' },
      { code: '322', name: '74322', subCat: 'Thanh Ghi Dịch', title: '8-bit shift register with sign exte...', desc: '8-bit shift register with sign extend, three-state outputs', pkg: 'DIP-20' },
      { code: '395', name: '74395', subCat: 'Thanh Ghi Dịch', title: '4-bit universal shift register with...', desc: '4-bit universal shift register with three-state outputs', pkg: 'DIP-16' },
      { code: '498', name: '74498', subCat: 'Thanh Ghi Dịch', title: '8-bit bidirectional shift register ...', desc: '8-bit bidirectional shift register with parallel inputs and three-state outputs', pkg: 'DIP-20' },
      { code: '589', name: '74589', subCat: 'Thanh Ghi Dịch', title: '8-bit shift register with input lat...', desc: '8-bit shift register with input latch, three-state outputs', pkg: 'DIP-20' },
      { code: '594', name: '74594', subCat: 'Thanh Ghi Dịch', title: '8-bit shift registers with output l...', desc: '8-bit shift registers with output latches', pkg: 'DIP-20' },
      { code: '595', name: '74595', subCat: 'Thanh Ghi Dịch', title: '8-Bit SIPO with Latch (3S)', desc: 'Thanh ghi dịch 8-bit có chốt 3 trạng thái', pkg: 'DIP-16' },
      { code: '596', name: '74596', subCat: 'Thanh Ghi Dịch', title: '8-bit shift registers with output l...', desc: '8-bit shift registers with output latches, open-collector parallel outputs', pkg: 'DIP-20' },
      { code: '597', name: '74597', subCat: 'Thanh Ghi Dịch', title: '8-Bit PISO with Latch', desc: 'Thanh ghi dịch 8-bit có chốt đầu vào', pkg: 'DIP-16' },
      { code: '598', name: '74598', subCat: 'Thanh Ghi Dịch', title: '8-bit shift register with input lat...', desc: '8-bit shift register with input latches', pkg: 'DIP-20' },
      { code: '599', name: '74599', subCat: 'Thanh Ghi Dịch', title: '8-bit shift registers with output l...', desc: '8-bit shift registers with output latches, open-collector outputs', pkg: 'DIP-20' },
      { code: '671', name: '74671', subCat: 'Thanh Ghi Dịch', title: '4-bit bidirectional shift register/...', desc: '4-bit bidirectional shift register/latch/multiplexer with three-state outputs', pkg: 'DIP-16' },
      { code: '672', name: '74672', subCat: 'Thanh Ghi Dịch', title: '4-bit bidirectional shift register/...', desc: '4-bit bidirectional shift register/latch/multiplexer with three-state outputs', pkg: 'DIP-16' },
      { code: '673', name: '74673', subCat: 'Thanh Ghi Dịch', title: '16-bit serial-in serial-out shift r...', desc: '16-bit serial-in serial-out shift register with output storage registers, three-state outputs', pkg: 'DIP-16' },
      { code: '674', name: '74674', subCat: 'Thanh Ghi Dịch', title: '16-bit parallel-in serial-out shift...', desc: '16-bit parallel-in serial-out shift register with three-state outputs', pkg: 'DIP-16' },
      { code: '4015', name: '744015', subCat: 'Thanh Ghi Dịch', title: 'dual 4-bit shift registers', desc: 'dual 4-bit shift registers', pkg: 'DIP-16' },
      { code: '4094', name: '744094', subCat: 'Thanh Ghi Dịch', title: '8-bit three-state shift register/la...', desc: '8-bit three-state shift register/latch', pkg: 'DIP-20' },

      // --- BỘ CHỌN & GIẢI MÃ ---
      { code: '41', name: '7441', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to decimal decoder/Nixie tube d...', desc: 'BCD to decimal decoder/Nixie tube driver', pkg: 'DIP-16' },
      { code: '42', name: '7442', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD-to-Decimal Decoder', desc: 'Giải mã BCD sang thập phân 10 đường', pkg: 'DIP-16' },
      { code: '43', name: '7443', subCat: 'Bộ Chọn & Giải Mã', title: 'excess-3 to decimal decoder', desc: 'excess-3 to decimal decoder', pkg: 'DIP-16' },
      { code: '44', name: '7444', subCat: 'Bộ Chọn & Giải Mã', title: 'excess-3-Gray code to decimal decod...', desc: 'excess-3-Gray code to decimal decoder', pkg: 'DIP-16' },
      { code: '45', name: '7445', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to decimal decoder/driver', desc: 'BCD to decimal decoder/driver', pkg: 'DIP-16' },
      { code: '46', name: '7446', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to 7-segment display decoder/dr...', desc: 'BCD to 7-segment display decoder/driver with 30 V open collector outputs', pkg: 'DIP-16' },
      { code: '47', name: '7447', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to 7-Segment (Anode)', desc: 'Giải mã BCD sang LED 7 đoạn Anode chung', pkg: 'DIP-16' },
      { code: '48', name: '7448', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to 7-Segment (Cathode)', desc: 'Giải mã BCD sang LED 7 đoạn Cathode chung', pkg: 'DIP-16' },
      { code: '49', name: '7449', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to 7-segment decoder/driver wit...', desc: 'BCD to 7-segment decoder/driver with open collector outputs', pkg: 'DIP-16' },
      { code: '137', name: '74137', subCat: 'Bộ Chọn & Giải Mã', title: '3 to 8-line decoder/demultiplexer w...', desc: '3 to 8-line decoder/demultiplexer with address latch', pkg: 'DIP-16' },
      { code: '138', name: '74138', subCat: 'Bộ Chọn & Giải Mã', title: '3-to-8 Line Decoder/Demux', desc: 'Giải mã 3-sang-8 đường / Demultiplexer', pkg: 'DIP-16' },
      { code: '139', name: '74139', subCat: 'Bộ Chọn & Giải Mã', title: 'Dual 2-to-4 Line Decoder', desc: 'Bộ giải mã 2-sang-4 kép', pkg: 'DIP-16' },
      { code: '141', name: '74141', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to decimal decoder/driver for c...', desc: 'BCD to decimal decoder/driver for cold-cathode indicator/Nixie tube', pkg: 'DIP-16' },
      { code: '145', name: '74145', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to decimal decoder/driver', desc: 'BCD to decimal decoder/driver', pkg: 'DIP-16' },
      { code: '147', name: '74147', subCat: 'Bộ Chọn & Giải Mã', title: '10-to-4 Priority Encoder', desc: 'Bộ mã hóa ưu tiên 10-sang-4 BCD', pkg: 'DIP-16' },
      { code: '148', name: '74148', subCat: 'Bộ Chọn & Giải Mã', title: '8-to-3 Priority Encoder', desc: 'Bộ mã hóa ưu tiên 8-sang-3 đường', pkg: 'DIP-16' },
      { code: '150', name: '74150', subCat: 'Bộ Chọn & Giải Mã', title: '16-line to 1-line data selector/mul...', desc: '16-line to 1-line data selector/multiplexer', pkg: 'DIP-16' },
      { code: '151', name: '74151', subCat: 'Bộ Chọn & Giải Mã', title: '8-to-1 Multiplexer', desc: 'Bộ chọn dữ liệu / dồn kênh 8-sang-1', pkg: 'DIP-16' },
      { code: '152', name: '74152', subCat: 'Bộ Chọn & Giải Mã', title: '8-line to 1-line data selector/mult...', desc: '8-line to 1-line data selector/multiplexer', pkg: 'DIP-16' },
      { code: '153', name: '74153', subCat: 'Bộ Chọn & Giải Mã', title: 'Dual 4-to-1 Multiplexer', desc: 'Bộ dồn kênh 4-sang-1 kép', pkg: 'DIP-16' },
      { code: '154', name: '74154', subCat: 'Bộ Chọn & Giải Mã', title: '4-to-16 Line Decoder', desc: 'Giải mã 4-sang-16 đường / Demux', pkg: 'DIP-24' },
      { code: '155', name: '74155', subCat: 'Bộ Chọn & Giải Mã', title: 'dual 2-line to 4-line decoder/demul...', desc: 'dual 2-line to 4-line decoder/demultiplexer', pkg: 'DIP-16' },
      { code: '156', name: '74156', subCat: 'Bộ Chọn & Giải Mã', title: 'dual 2-line to 4-line decoder/demul...', desc: 'dual 2-line to 4-line decoder/demultiplexer with open collector outputs', pkg: 'DIP-16' },
      { code: '157', name: '74157', subCat: 'Bộ Chọn & Giải Mã', title: 'Quad 2-to-1 MUX (Non-inv)', desc: 'Bộ chọn 2-sang-1 4-kênh không đảo', pkg: 'DIP-16' },
      { code: '158', name: '74158', subCat: 'Bộ Chọn & Giải Mã', title: 'quad 2-line to 1-line data selector...', desc: 'quad 2-line to 1-line data selector/multiplexer, inverting', pkg: 'DIP-16' },
      { code: '159', name: '74159', subCat: 'Bộ Chọn & Giải Mã', title: '4-line to 16-line decoder/demultipl...', desc: '4-line to 16-line decoder/demultiplexer with open collector outputs', pkg: 'DIP-16' },
      { code: '237', name: '74237', subCat: 'Bộ Chọn & Giải Mã', title: '3-of-8 decoder/demultiplexer with a...', desc: '3-of-8 decoder/demultiplexer with address latch, active high outputs', pkg: 'DIP-16' },
      { code: '238', name: '74238', subCat: 'Bộ Chọn & Giải Mã', title: '3-of-8 decoder/demultiplexer', desc: '3-of-8 decoder/demultiplexer, active high outputs', pkg: 'DIP-16' },
      { code: '239', name: '74239', subCat: 'Bộ Chọn & Giải Mã', title: 'dual 2-of-4 decoder/demultiplexer', desc: 'dual 2-of-4 decoder/demultiplexer, active high outputs', pkg: 'DIP-16' },
      { code: '246', name: '74246', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to 7-segment decoder/driver wit...', desc: 'BCD to 7-segment decoder/driver with 30 V open collector outputs', pkg: 'DIP-16' },
      { code: '247', name: '74247', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to 7-segment decoder/driver wit...', desc: 'BCD to 7-segment decoder/driver with 15 V open collector outputs', pkg: 'DIP-16' },
      { code: '248', name: '74248', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to 7-segment decoder/driver wit...', desc: 'BCD to 7-segment decoder/driver with Internal Pull-up outputs', pkg: 'DIP-16' },
      { code: '249', name: '74249', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to 7-segment decoder/driver wit...', desc: 'BCD to 7-segment decoder/driver with open collector outputs', pkg: 'DIP-16' },
      { code: '250', name: '74250', subCat: 'Bộ Chọn & Giải Mã', title: '1 of 16 data selectors/multiplexers', desc: '1 of 16 data selectors/multiplexers', pkg: 'DIP-16' },
      { code: '251', name: '74251', subCat: 'Bộ Chọn & Giải Mã', title: '8-to-1 MUX 3-State', desc: 'Bộ chọn 8-sang-1 ngõ ra 3 trạng thái', pkg: 'DIP-16' },
      { code: '253', name: '74253', subCat: 'Bộ Chọn & Giải Mã', title: 'dual 4-line to 1-line data selector...', desc: 'dual 4-line to 1-line data selector/multiplexer with three-state outputs', pkg: 'DIP-16' },
      { code: '257', name: '74257', subCat: 'Bộ Chọn & Giải Mã', title: 'Quad 2-to-1 MUX 3-State', desc: 'Bộ chọn 2-sang-1 4-kênh 3 trạng thái', pkg: 'DIP-16' },
      { code: '258', name: '74258', subCat: 'Bộ Chọn & Giải Mã', title: 'quad 2-line to 1-line data selector...', desc: 'quad 2-line to 1-line data selector/multiplexer with Inverted three-state outputs', pkg: 'DIP-16' },
      { code: '298', name: '74298', subCat: 'Bộ Chọn & Giải Mã', title: 'quad 2-input multiplexer with stora...', desc: 'quad 2-input multiplexer with storage', pkg: 'DIP-16' },
      { code: '347', name: '74347', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD-to-7 segment decoders/drivers o...', desc: 'BCD-to-7 segment decoders/drivers open collector outputs, low voltage version of 7447', pkg: 'DIP-16' },
      { code: '348', name: '74348', subCat: 'Bộ Chọn & Giải Mã', title: '8 to 3-line priority encoder with t...', desc: '8 to 3-line priority encoder with three-state outputs', pkg: 'DIP-14' },
      { code: '351', name: '74351', subCat: 'Bộ Chọn & Giải Mã', title: 'dual 8-line to 1-line data selector...', desc: 'dual 8-line to 1-line data selectors/multiplexers with three-state outputs and 4 common data inputs', pkg: 'DIP-16' },
      { code: '352', name: '74352', subCat: 'Bộ Chọn & Giải Mã', title: 'dual 4-line to 1-line data selector...', desc: 'dual 4-line to 1-line data selectors/multiplexers with inverting outputs', pkg: 'DIP-16' },
      { code: '353', name: '74353', subCat: 'Bộ Chọn & Giải Mã', title: 'dual 4-line to 1-line data selector...', desc: 'dual 4-line to 1-line data selectors/multiplexers with inverting three-state outputs', pkg: 'DIP-16' },
      { code: '354', name: '74354', subCat: 'Bộ Chọn & Giải Mã', title: '8 to 1-line data selector/multiplex...', desc: '8 to 1-line data selector/multiplexer with transparent latch, three-state outputs', pkg: 'DIP-16' },
      { code: '355', name: '74355', subCat: 'Bộ Chọn & Giải Mã', title: '8-line to 1-line data selector/mult...', desc: '8-line to 1-line data selector/multiplexer with transparent registers, open-collector outputs', pkg: 'DIP-16' },
      { code: '356', name: '74356', subCat: 'Bộ Chọn & Giải Mã', title: '8 to 1-line data selector/multiplex...', desc: '8 to 1-line data selector/multiplexer with edge-triggered register, three-state outputs', pkg: 'DIP-16' },
      { code: '357', name: '74357', subCat: 'Bộ Chọn & Giải Mã', title: '8-line to 1-line data selectors/mul...', desc: '8-line to 1-line data selectors/multiplexers/edge-triggered registers, open-collector outputs', pkg: 'DIP-16' },
      { code: '398', name: '74398', subCat: 'Bộ Chọn & Giải Mã', title: 'quad 2-input multiplexers with stor...', desc: 'quad 2-input multiplexers with storage and complementary outputs', pkg: 'DIP-16' },
      { code: '399', name: '74399', subCat: 'Bộ Chọn & Giải Mã', title: 'quad 2-input multiplexer with stora...', desc: 'quad 2-input multiplexer with storage', pkg: 'DIP-16' },
      { code: '405', name: '74405', subCat: 'Bộ Chọn & Giải Mã', title: '1 to 8 decoder', desc: '1 to 8 decoder, equivalent to Intel 8205, only found as UCY74S405 so might be non-TI number', pkg: 'DIP-16' },
      { code: '445', name: '74445', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD-to-decimal decoders/drivers', desc: 'BCD-to-decimal decoders/drivers', pkg: 'DIP-16' },
      { code: '447', name: '74447', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD-to-7-segment decoders/drivers', desc: 'BCD-to-7-segment decoders/drivers, low voltage version of 74247', pkg: 'DIP-16' },
      { code: '450', name: '74450', subCat: 'Bộ Chọn & Giải Mã', title: '16-to-1 multiplexer with complement...', desc: '16-to-1 multiplexer with complementary outputs', pkg: 'DIP-16' },
      { code: '451', name: '74451', subCat: 'Bộ Chọn & Giải Mã', title: 'dual 8-to-1 multiplexer', desc: 'dual 8-to-1 multiplexer', pkg: 'DIP-16' },
      { code: '453', name: '74453', subCat: 'Bộ Chọn & Giải Mã', title: 'quad 4-to-1 multiplexer', desc: 'quad 4-to-1 multiplexer', pkg: 'DIP-16' },
      { code: '537', name: '74537', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to decimal decoder with three-s...', desc: 'BCD to decimal decoder with three-state outputs', pkg: 'DIP-16' },
      { code: '538', name: '74538', subCat: 'Bộ Chọn & Giải Mã', title: '1 of 8 decoder with three-state out...', desc: '1 of 8 decoder with three-state outputs', pkg: 'DIP-16' },
      { code: '539', name: '74539', subCat: 'Bộ Chọn & Giải Mã', title: 'dual 1 of 4 decoder with three-stat...', desc: 'dual 1 of 4 decoder with three-state outputs', pkg: 'DIP-16' },
      { code: '604', name: '74604', subCat: 'Bộ Chọn & Giải Mã', title: 'octal 2-input multiplexer with latc...', desc: 'octal 2-input multiplexer with latch, high-speed, with three-state outputs', pkg: 'DIP-20' },
      { code: '606', name: '74606', subCat: 'Bộ Chọn & Giải Mã', title: 'octal 2-input multiplexer with latc...', desc: 'octal 2-input multiplexer with latch, glitch-free, with three-state outputs', pkg: 'DIP-20' },
      { code: '607', name: '74607', subCat: 'Bộ Chọn & Giải Mã', title: 'octal 2-input multiplexer with latc...', desc: 'octal 2-input multiplexer with latch, glitch-free, with open collector outputs', pkg: 'DIP-20' },
      { code: '646', name: '74646', subCat: 'Bộ Chọn & Giải Mã', title: 'octal bus transceiver/latch/multipl...', desc: 'octal bus transceiver/latch/multiplexer with noninverting three-state outputs', pkg: 'DIP-20' },
      { code: '647', name: '74647', subCat: 'Bộ Chọn & Giải Mã', title: 'octal bus transceiver/latch/multipl...', desc: 'octal bus transceiver/latch/multiplexer with noninverting open collector outputs', pkg: 'DIP-20' },
      { code: '648', name: '74648', subCat: 'Bộ Chọn & Giải Mã', title: 'octal bus transceiver/latch/multipl...', desc: 'octal bus transceiver/latch/multiplexer with inverting three-state outputs', pkg: 'DIP-20' },
      { code: '649', name: '74649', subCat: 'Bộ Chọn & Giải Mã', title: 'octal bus transceiver/latch/multipl...', desc: 'octal bus transceiver/latch/multiplexer with inverting open collector outputs', pkg: 'DIP-20' },
      { code: '748', name: '74748', subCat: 'Bộ Chọn & Giải Mã', title: '8 to 3-line priority encoder', desc: '8 to 3-line priority encoder', pkg: 'DIP-14' },
      { code: '783', name: '74783', subCat: 'Bộ Chọn & Giải Mã', title: 'synchronous address multiplexer', desc: 'synchronous address multiplexer', pkg: 'DIP-16' },
      { code: '848', name: '74848', subCat: 'Bộ Chọn & Giải Mã', title: '8 to 3-line priority encoder with t...', desc: '8 to 3-line priority encoder with three-state outputs', pkg: 'DIP-14' },
      { code: '857', name: '74857', subCat: 'Bộ Chọn & Giải Mã', title: 'hex 2-line to 1-line multiplexer wi...', desc: 'hex 2-line to 1-line multiplexer with three-state outputs', pkg: 'DIP-16' },
      { code: '915', name: '74915', subCat: 'Bộ Chọn & Giải Mã', title: '7-segment to BCD decoder', desc: '7-segment to BCD decoder', pkg: 'DIP-16' },
      { code: '922', name: '74922', subCat: 'Bộ Chọn & Giải Mã', title: '16-key encoder', desc: '16-key encoder', pkg: 'DIP-16' },
      { code: '923', name: '74923', subCat: 'Bộ Chọn & Giải Mã', title: '20-key encoder', desc: '20-key encoder', pkg: 'DIP-20' },
      { code: '4028', name: '744028', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to decimal decoder', desc: 'BCD to decimal decoder', pkg: 'DIP-16' },
      { code: '4051', name: '744051', subCat: 'Bộ Chọn & Giải Mã', title: 'high-speed CMOS 8-channel analog mu...', desc: 'high-speed CMOS 8-channel analog multiplexer/demultiplexer', pkg: 'DIP-16' },
      { code: '4052', name: '744052', subCat: 'Bộ Chọn & Giải Mã', title: 'dual 4-channel analog multiplexer/d...', desc: 'dual 4-channel analog multiplexer/demultiplexers', pkg: 'DIP-16' },
      { code: '4053', name: '744053', subCat: 'Bộ Chọn & Giải Mã', title: 'triple 2-channel analog multiplexer...', desc: 'triple 2-channel analog multiplexer/demultiplexers', pkg: 'DIP-16' },
      { code: '4067', name: '744067', subCat: 'Bộ Chọn & Giải Mã', title: '16-channel analog multiplexer/demul...', desc: '16-channel analog multiplexer/demultiplexer', pkg: 'DIP-16' },
      { code: '4351', name: '744351', subCat: 'Bộ Chọn & Giải Mã', title: '8-channel analog multiplexer/demult...', desc: '8-channel analog multiplexer/demultiplexer with latch', pkg: 'DIP-16' },
      { code: '4353', name: '744353', subCat: 'Bộ Chọn & Giải Mã', title: 'triple 2-channel analog multiplexer...', desc: 'triple 2-channel analog multiplexer/demultiplexer with latch', pkg: 'DIP-16' },
      { code: '4511', name: '744511', subCat: 'Bộ Chọn & Giải Mã', title: 'BCD to 7-segment decoder', desc: 'BCD to 7-segment decoder', pkg: 'DIP-16' },
      { code: '4514', name: '744514', subCat: 'Bộ Chọn & Giải Mã', title: '4-to-16 line decoder/demultiplexer ...', desc: '4-to-16 line decoder/demultiplexer with input latches', pkg: 'DIP-24' },

      // --- BỘ ĐỆM & BUS ---
      { code: '06', name: '7406', subCat: 'Bộ Đệm & Bus', title: 'Hex Inverting Buffer (OC)', desc: '6 bộ đệm đảo cực thu hở áp cao 30V', pkg: 'DIP-14' },
      { code: '07', name: '7407', subCat: 'Bộ Đệm & Bus', title: 'Hex Buffer (OC 30V)', desc: '6 bộ đệm không đảo cực thu hở 30V', pkg: 'DIP-14' },
      { code: '16', name: '7416', subCat: 'Bộ Đệm & Bus', title: 'hex inverter buffer/driver with 15 ...', desc: 'hex inverter buffer/driver with 15 V open collector outputs', pkg: 'DIP-14' },
      { code: '17', name: '7417', subCat: 'Bộ Đệm & Bus', title: 'hex buffer/driver with 15 V open co...', desc: 'hex buffer/driver with 15 V open collector outputs', pkg: 'DIP-14' },
      { code: '28', name: '7428', subCat: 'Bộ Đệm & Bus', title: 'quad 2-input NOR buffer', desc: 'quad 2-input NOR buffer', pkg: 'DIP-14' },
      { code: '33', name: '7433', subCat: 'Bộ Đệm & Bus', title: 'quad 2-input NOR buffer with open c...', desc: 'quad 2-input NOR buffer with open collector outputs', pkg: 'DIP-14' },
      { code: '37', name: '7437', subCat: 'Bộ Đệm & Bus', title: 'quad 2-input NAND buffer', desc: 'quad 2-input NAND buffer', pkg: 'DIP-14' },
      { code: '38', name: '7438', subCat: 'Bộ Đệm & Bus', title: 'quad 2-input NAND buffer with open ...', desc: 'quad 2-input NAND buffer with open collector outputs', pkg: 'DIP-14' },
      { code: '39', name: '7439', subCat: 'Bộ Đệm & Bus', title: 'quad 2-input NAND buffer with open ...', desc: 'quad 2-input NAND buffer with open collector outputs, input and output terminals flipped, otherwise functionally identical to 7438', pkg: 'DIP-14' },
      { code: '40', name: '7440', subCat: 'Bộ Đệm & Bus', title: 'dual 4-input NAND buffer', desc: 'dual 4-input NAND buffer', pkg: 'DIP-14' },
      { code: '125', name: '74125', subCat: 'Bộ Đệm & Bus', title: 'Quad 3-State Buffer (Low)', desc: '4 bộ đệm 3 trạng thái kích mức thấp', pkg: 'DIP-14' },
      { code: '126', name: '74126', subCat: 'Bộ Đệm & Bus', title: 'Quad 3-State Buffer (High)', desc: '4 bộ đệm 3 trạng thái kích mức cao', pkg: 'DIP-14' },
      { code: '128', name: '74128', subCat: 'Bộ Đệm & Bus', title: 'quad 2-input NOR line driver', desc: 'quad 2-input NOR line driver', pkg: 'DIP-14' },
      { code: '130', name: '74130', subCat: 'Bộ Đệm & Bus', title: 'quad 2-input AND gate buffer with 3...', desc: 'quad 2-input AND gate buffer with 30 V open collector outputs', pkg: 'DIP-14' },
      { code: '131', name: '74131', subCat: 'Bộ Đệm & Bus', title: 'quad 2-input AND gate buffer with 1...', desc: 'quad 2-input AND gate buffer with 15 V open collector outputs', pkg: 'DIP-14' },
      { code: '140', name: '74140', subCat: 'Bộ Đệm & Bus', title: 'dual 4-input NAND line driver', desc: 'dual 4-input NAND line driver', pkg: 'DIP-14' },
      { code: '210', name: '74210', subCat: 'Bộ Đệm & Bus', title: 'octal buffer', desc: 'octal buffer', pkg: 'DIP-20' },
      { code: '226', name: '74226', subCat: 'Bộ Đệm & Bus', title: '4-bit parallel latched bus transcei...', desc: '4-bit parallel latched bus transceiver with three-state outputs', pkg: 'DIP-20' },
      { code: '230', name: '74230', subCat: 'Bộ Đệm & Bus', title: 'octal buffer/driver with three-stat...', desc: 'octal buffer/driver with three-state outputs, true and complementary inputs', pkg: 'DIP-20' },
      { code: '231', name: '74231', subCat: 'Bộ Đệm & Bus', title: 'octal buffer and line driver with t...', desc: 'octal buffer and line driver with three-state outputs, G and /G complementary inputs', pkg: 'DIP-20' },
      { code: '240', name: '74240', subCat: 'Bộ Đệm & Bus', title: 'Octal Inverting Buffer 3S', desc: 'Bộ đệm Bus 8 đường đảo 3 trạng thái', pkg: 'DIP-20' },
      { code: '241', name: '74241', subCat: 'Bộ Đệm & Bus', title: 'Octal Buffer/Line Driver', desc: 'Bộ đệm Bus 8 đường 3 trạng thái', pkg: 'DIP-20' },
      { code: '242', name: '74242', subCat: 'Bộ Đệm & Bus', title: 'quad bus transceiver with inverted ...', desc: 'quad bus transceiver with inverted three-state outputs', pkg: 'DIP-20' },
      { code: '243', name: '74243', subCat: 'Bộ Đệm & Bus', title: 'quad bus transceiver with noninvert...', desc: 'quad bus transceiver with noninverted three-state outputs', pkg: 'DIP-20' },
      { code: '244', name: '74244', subCat: 'Bộ Đệm & Bus', title: 'Octal Buffer/Line Driver', desc: 'Bộ đệm Bus 8 đường không đảo 3S', pkg: 'DIP-20' },
      { code: '245', name: '74245', subCat: 'Bộ Đệm & Bus', title: 'Octal Bus Transceiver', desc: 'Bộ thu phát Bus 8-bit 2 chiều', pkg: 'DIP-20' },
      { code: '310', name: '74310', subCat: 'Bộ Đệm & Bus', title: 'octal buffer with Schmitt trigger i...', desc: 'octal buffer with Schmitt trigger inputs', pkg: 'DIP-20' },
      { code: '340', name: '74340', subCat: 'Bộ Đệm & Bus', title: 'octal buffer with Schmitt trigger i...', desc: 'octal buffer with Schmitt trigger inputs and three-state inverted outputs', pkg: 'DIP-20' },
      { code: '341', name: '74341', subCat: 'Bộ Đệm & Bus', title: 'octal buffer with Schmitt trigger i...', desc: 'octal buffer with Schmitt trigger inputs and three-state noninverted outputs', pkg: 'DIP-20' },
      { code: '344', name: '74344', subCat: 'Bộ Đệm & Bus', title: 'octal buffer with Schmitt trigger i...', desc: 'octal buffer with Schmitt trigger inputs and three-state noninverted outputs', pkg: 'DIP-20' },
      { code: '365', name: '74365', subCat: 'Bộ Đệm & Bus', title: 'hex buffer with noninverted three-s...', desc: 'hex buffer with noninverted three-state outputs', pkg: 'DIP-14' },
      { code: '366', name: '74366', subCat: 'Bộ Đệm & Bus', title: 'hex buffer with inverted three-stat...', desc: 'hex buffer with inverted three-state outputs', pkg: 'DIP-14' },
      { code: '367', name: '74367', subCat: 'Bộ Đệm & Bus', title: 'hex buffer with noninverted three-s...', desc: 'hex buffer with noninverted three-state outputs', pkg: 'DIP-14' },
      { code: '368', name: '74368', subCat: 'Bộ Đệm & Bus', title: 'hex buffer with Inverted three-stat...', desc: 'hex buffer with Inverted three-state outputs', pkg: 'DIP-14' },
      { code: '412', name: '74412', subCat: 'Bộ Đệm & Bus', title: 'multi-mode buffered 8-bit latches w...', desc: 'multi-mode buffered 8-bit latches with three-state outputs and clear', pkg: 'DIP-20' },
      { code: '436', name: '74436', subCat: 'Bộ Đệm & Bus', title: 'line driver/memory driver circuits ...', desc: 'line driver/memory driver circuits - mos memory interface, damping output resistor', pkg: 'DIP-14' },
      { code: '437', name: '74437', subCat: 'Bộ Đệm & Bus', title: 'line driver/memory driver circuits ...', desc: 'line driver/memory driver circuits - mos memory interface', pkg: 'DIP-14' },
      { code: '440', name: '74440', subCat: 'Bộ Đệm & Bus', title: 'quad tridirectional bus transceiver...', desc: 'quad tridirectional bus transceiver with noninverted open collector outputs', pkg: 'DIP-20' },
      { code: '441', name: '74441', subCat: 'Bộ Đệm & Bus', title: 'quad tridirectional bus transceiver...', desc: 'quad tridirectional bus transceiver with Inverted open collector outputs', pkg: 'DIP-20' },
      { code: '442', name: '74442', subCat: 'Bộ Đệm & Bus', title: 'quad tridirectional bus transceiver...', desc: 'quad tridirectional bus transceiver with noninverted three-state outputs', pkg: 'DIP-20' },
      { code: '443', name: '74443', subCat: 'Bộ Đệm & Bus', title: 'quad tridirectional bus transceiver...', desc: 'quad tridirectional bus transceiver with Inverted three-state outputs', pkg: 'DIP-20' },
      { code: '444', name: '74444', subCat: 'Bộ Đệm & Bus', title: 'quad tridirectional bus transceiver...', desc: 'quad tridirectional bus transceiver with Inverted and noninverted three-state outputs', pkg: 'DIP-20' },
      { code: '446', name: '74446', subCat: 'Bộ Đệm & Bus', title: 'quad bus transceivers with directio...', desc: 'quad bus transceivers with direction controls', pkg: 'DIP-20' },
      { code: '448', name: '74448', subCat: 'Bộ Đệm & Bus', title: 'quad tridirectional bus transceiver...', desc: 'quad tridirectional bus transceiver with inverted and noninverted open collector outputs', pkg: 'DIP-20' },
      { code: '449', name: '74449', subCat: 'Bộ Đệm & Bus', title: 'quad bus transceivers with directio...', desc: 'quad bus transceivers with direction controls, true outputs', pkg: 'DIP-20' },
      { code: '465', name: '74465', subCat: 'Bộ Đệm & Bus', title: 'octal buffer with three-state true ...', desc: 'octal buffer with three-state true outputs', pkg: 'DIP-20' },
      { code: '466', name: '74466', subCat: 'Bộ Đệm & Bus', title: 'octal buffers with three-state inve...', desc: 'octal buffers with three-state inverted outputs', pkg: 'DIP-20' },
      { code: '467', name: '74467', subCat: 'Bộ Đệm & Bus', title: 'octal buffers with three-state true...', desc: 'octal buffers with three-state true outputs', pkg: 'DIP-20' },
      { code: '468', name: '74468', subCat: 'Bộ Đệm & Bus', title: 'octal buffers with three-state inve...', desc: 'octal buffers with three-state inverted outputs', pkg: 'DIP-20' },
      { code: '540', name: '74540', subCat: 'Bộ Đệm & Bus', title: 'inverting octal buffer with three-s...', desc: 'inverting octal buffer with three-state outputs', pkg: 'DIP-20' },
      { code: '541', name: '74541', subCat: 'Bộ Đệm & Bus', title: 'Octal Buffer Flow-Through', desc: 'Bộ đệm Bus 8 đường chân thẳng hàng', pkg: 'DIP-20' },
      { code: '544', name: '74544', subCat: 'Bộ Đệm & Bus', title: 'non-inverting octal registered tran...', desc: 'non-inverting octal registered transceiver with three-state outputs', pkg: 'DIP-20' },
      { code: '580', name: '74580', subCat: 'Bộ Đệm & Bus', title: 'octal transceiver/latch with invert...', desc: 'octal transceiver/latch with inverting three-state outputs', pkg: 'DIP-20' },
      { code: '620', name: '74620', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver', desc: 'octal bus transceiver, inverting, three-state outputs', pkg: 'DIP-20' },
      { code: '621', name: '74621', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver', desc: 'octal bus transceiver, noninverting, open collector outputs', pkg: 'DIP-20' },
      { code: '622', name: '74622', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver', desc: 'octal bus transceiver, inverting, open collector outputs', pkg: 'DIP-20' },
      { code: '623', name: '74623', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver', desc: 'octal bus transceiver, noninverting, three-state outputs', pkg: 'DIP-20' },
      { code: '638', name: '74638', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver with invertin...', desc: 'octal bus transceiver with inverting three-state outputs', pkg: 'DIP-20' },
      { code: '639', name: '74639', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver with noninver...', desc: 'octal bus transceiver with noninverting three-state outputs', pkg: 'DIP-20' },
      { code: '640', name: '74640', subCat: 'Bộ Đệm & Bus', title: 'Octal Transceiver Inverting', desc: 'Bộ thu phát Bus 8-bit đảo 2 chiều', pkg: 'DIP-20' },
      { code: '641', name: '74641', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver with noninver...', desc: 'octal bus transceiver with noninverting open collector outputs', pkg: 'DIP-20' },
      { code: '642', name: '74642', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver with invertin...', desc: 'octal bus transceiver with inverting open collector outputs', pkg: 'DIP-20' },
      { code: '643', name: '74643', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver with mix of i...', desc: 'octal bus transceiver with mix of inverting and noninverting three-state outputs', pkg: 'DIP-20' },
      { code: '644', name: '74644', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver with mix of i...', desc: 'octal bus transceiver with mix of inverting and noninverting open collector outputs', pkg: 'DIP-20' },
      { code: '645', name: '74645', subCat: 'Bộ Đệm & Bus', title: 'Octal Bus Transceiver', desc: 'Bộ thu phát Bus 8-bit không đảo 2 chiều', pkg: 'DIP-20' },
      { code: '651', name: '74651', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver/register with...', desc: 'octal bus transceiver/register with inverting three-state outputs', pkg: 'DIP-20' },
      { code: '652', name: '74652', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver/register with...', desc: 'octal bus transceiver/register with noninverting three-state outputs', pkg: 'DIP-20' },
      { code: '653', name: '74653', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver/register with...', desc: 'octal bus transceiver/register with inverting three-state and open collector outputs', pkg: 'DIP-20' },
      { code: '654', name: '74654', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver/register with...', desc: 'octal bus transceiver/register with noninverting three-state and open collector outputs', pkg: 'DIP-20' },
      { code: '658', name: '74658', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver with parity', desc: 'octal bus transceiver with parity, inverting', pkg: 'DIP-20' },
      { code: '659', name: '74659', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver with parity', desc: 'octal bus transceiver with parity, noninverting', pkg: 'DIP-20' },
      { code: '664', name: '74664', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver with parity', desc: 'octal bus transceiver with parity, inverting', pkg: 'DIP-20' },
      { code: '665', name: '74665', subCat: 'Bộ Đệm & Bus', title: 'octal bus transceiver with parity', desc: 'octal bus transceiver with parity, noninverting', pkg: 'DIP-20' },
      { code: '740', name: '74740', subCat: 'Bộ Đệm & Bus', title: 'octal buffer/Line driver', desc: 'octal buffer/Line driver, inverting, three-state outputs', pkg: 'DIP-20' },
      { code: '741', name: '74741', subCat: 'Bộ Đệm & Bus', title: 'octal buffer/line driver', desc: 'octal buffer/line driver, noninverting, three-state outputs, mixed enable polarity', pkg: 'DIP-20' },
      { code: '744', name: '74744', subCat: 'Bộ Đệm & Bus', title: 'octal buffer/line driver', desc: 'octal buffer/line driver, noninverting, three-state outputs', pkg: 'DIP-20' },
      { code: '795', name: '74795', subCat: 'Bộ Đệm & Bus', title: 'octal buffer with three-state outpu...', desc: 'octal buffer with three-state outputs', pkg: 'DIP-20' },
      { code: '796', name: '74796', subCat: 'Bộ Đệm & Bus', title: 'octal buffer with three-state outpu...', desc: 'octal buffer with three-state outputs', pkg: 'DIP-20' },
      { code: '797', name: '74797', subCat: 'Bộ Đệm & Bus', title: 'octal buffer with three-state outpu...', desc: 'octal buffer with three-state outputs', pkg: 'DIP-20' },
      { code: '798', name: '74798', subCat: 'Bộ Đệm & Bus', title: 'octal buffer with three-state outpu...', desc: 'octal buffer with three-state outputs', pkg: 'DIP-20' },
      { code: '901', name: '74901', subCat: 'Bộ Đệm & Bus', title: 'hex inverting TTL buffer', desc: 'hex inverting TTL buffer', pkg: 'DIP-14' },
      { code: '902', name: '74902', subCat: 'Bộ Đệm & Bus', title: 'hex non-inverting TTL buffer', desc: 'hex non-inverting TTL buffer', pkg: 'DIP-14' },
      { code: '903', name: '74903', subCat: 'Bộ Đệm & Bus', title: 'hex inverting CMOS buffer', desc: 'hex inverting CMOS buffer', pkg: 'DIP-14' },
      { code: '904', name: '74904', subCat: 'Bộ Đệm & Bus', title: 'hex non-inverting CMOS buffer', desc: 'hex non-inverting CMOS buffer', pkg: 'DIP-14' },
      { code: '906', name: '74906', subCat: 'Bộ Đệm & Bus', title: 'hex open drain n-channel buffers', desc: 'hex open drain n-channel buffers', pkg: 'DIP-14' },
      { code: '907', name: '74907', subCat: 'Bộ Đệm & Bus', title: 'hex open drain p-channel buffers', desc: 'hex open drain p-channel buffers', pkg: 'DIP-14' },
      { code: '941', name: '74941', subCat: 'Bộ Đệm & Bus', title: 'octal bus/line drivers/line receive...', desc: 'octal bus/line drivers/line receivers', pkg: 'DIP-20' },
      { code: '1005', name: '741005', subCat: 'Bộ Đệm & Bus', title: 'hex inverting buffer with open-coll...', desc: 'hex inverting buffer with open-collector output', pkg: 'DIP-14' },
      { code: '1035', name: '741035', subCat: 'Bộ Đệm & Bus', title: 'hex noninverting buffers with open-...', desc: 'hex noninverting buffers with open-collector outputs', pkg: 'DIP-14' },
      { code: '2961', name: '742961', subCat: 'Bộ Đệm & Bus', title: 'edac bus buffer', desc: 'edac bus buffer, inverting', pkg: 'DIP-14' },
      { code: '2962', name: '742962', subCat: 'Bộ Đệm & Bus', title: 'edac bus buffer', desc: 'edac bus buffer, noninverting', pkg: 'DIP-14' },
      { code: '4049', name: '744049', subCat: 'Bộ Đệm & Bus', title: 'hex inverting buffer', desc: 'hex inverting buffer', pkg: 'DIP-14' },
      { code: '4050', name: '744050', subCat: 'Bộ Đệm & Bus', title: 'hex buffer/converter', desc: 'hex buffer/converter (non-inverting)', pkg: 'DIP-14' },
      { code: '7007', name: '747007', subCat: 'Bộ Đệm & Bus', title: 'hex buffer', desc: 'hex buffer', pkg: 'DIP-14' },
      { code: '7014', name: '747014', subCat: 'Bộ Đệm & Bus', title: 'hex Schmitt trigger non-inverting b...', desc: 'hex Schmitt trigger non-inverting buffer', pkg: 'DIP-14' },

      // --- SỐ HỌC & SO SÁNH ---
      { code: '80', name: '7480', subCat: 'Số Học & So Sánh', title: 'gated full adder', desc: 'gated full adder', pkg: 'DIP-14' },
      { code: '82', name: '7482', subCat: 'Số Học & So Sánh', title: '2-bit binary full adder', desc: '2-bit binary full adder', pkg: 'DIP-14' },
      { code: '83', name: '7483', subCat: 'Số Học & So Sánh', title: '4-Bit Binary Full Adder', desc: 'Bộ cộng nhị phân 4-bit có nhớ', pkg: 'DIP-16' },
      { code: '85', name: '7485', subCat: 'Số Học & So Sánh', title: '4-Bit Magnitude Comparator', desc: 'Bộ so sánh độ lớn nhị phân 4-bit', pkg: 'DIP-16' },
      { code: '97', name: '7497', subCat: 'Số Học & So Sánh', title: 'synchronous 6-bit binary rate multi...', desc: 'synchronous 6-bit binary rate multiplier', pkg: 'DIP-14' },
      { code: '167', name: '74167', subCat: 'Số Học & So Sánh', title: 'synchronous decade rate multiplier', desc: 'synchronous decade rate multiplier', pkg: 'DIP-14' },
      { code: '180', name: '74180', subCat: 'Số Học & So Sánh', title: '9-bit odd/even parity bit generator...', desc: '9-bit odd/even parity bit generator and checker', pkg: 'DIP-14' },
      { code: '181', name: '74181', subCat: 'Số Học & So Sánh', title: '4-Bit ALU Processor', desc: 'Khối số học logic ALU 4-bit', pkg: 'DIP-24' },
      { code: '183', name: '74183', subCat: 'Số Học & So Sánh', title: 'dual carry-save full adder', desc: 'dual carry-save full adder', pkg: 'DIP-14' },
      { code: '261', name: '74261', subCat: 'Số Học & So Sánh', title: '2-bit by 4-bit parallel binary mult...', desc: '2-bit by 4-bit parallel binary multiplier', pkg: 'DIP-16' },
      { code: '274', name: '74274', subCat: 'Số Học & So Sánh', title: '4-bit by 4-bit binary multiplier', desc: '4-bit by 4-bit binary multiplier', pkg: 'DIP-16' },
      { code: '280', name: '74280', subCat: 'Số Học & So Sánh', title: '9-Bit Parity Generator', desc: 'Bộ kiểm tra / tạo bit chẵn lẻ 9-bit', pkg: 'DIP-14' },
      { code: '283', name: '74283', subCat: 'Số Học & So Sánh', title: '4-Bit Fast Full Adder', desc: 'Bộ cộng nhị phân 4-bit tốc độ cao', pkg: 'DIP-16' },
      { code: '284', name: '74284', subCat: 'Số Học & So Sánh', title: '4-bit by 4-bit parallel binary mult...', desc: '4-bit by 4-bit parallel binary multiplier (low order 4 bits of product)', pkg: 'DIP-16' },
      { code: '285', name: '74285', subCat: 'Số Học & So Sánh', title: '4-bit by 4-bit parallel binary mult...', desc: '4-bit by 4-bit parallel binary multiplier (high order 4 bits of product)', pkg: 'DIP-16' },
      { code: '286', name: '74286', subCat: 'Số Học & So Sánh', title: '9-bit parity generator/checker with...', desc: '9-bit parity generator/checker with bus driver parity I/O port', pkg: 'DIP-14' },
      { code: '381', name: '74381', subCat: 'Số Học & So Sánh', title: '4-bit arithmetic logic unit/functio...', desc: '4-bit arithmetic logic unit/function generator with generate and propagate outputs', pkg: 'DIP-16' },
      { code: '382', name: '74382', subCat: 'Số Học & So Sánh', title: '4-bit arithmetic logic unit/functio...', desc: '4-bit arithmetic logic unit/function generator with ripple carry and overflow outputs', pkg: 'DIP-16' },
      { code: '384', name: '74384', subCat: 'Số Học & So Sánh', title: '8-bit by 1-bit two\'s complement mul...', desc: '8-bit by 1-bit two\'s complement multipliers', pkg: 'DIP-20' },
      { code: '385', name: '74385', subCat: 'Số Học & So Sánh', title: 'quad 4-bit adder/subtractor', desc: 'quad 4-bit adder/subtractor', pkg: 'DIP-16' },
      { code: '408', name: '74408', subCat: 'Số Học & So Sánh', title: '8-bit parity tree', desc: '8-bit parity tree', pkg: 'DIP-20' },
      { code: '456', name: '74456', subCat: 'Số Học & So Sánh', title: 'NBCD', desc: 'NBCD (Natural binary coded decimal) adder', pkg: 'DIP-16' },
      { code: '518', name: '74518', subCat: 'Số Học & So Sánh', title: '8-bit comparator with open collecto...', desc: '8-bit comparator with open collector output, input pull-up resistor', pkg: 'DIP-20' },
      { code: '519', name: '74519', subCat: 'Số Học & So Sánh', title: '8-bit comparator with open collecto...', desc: '8-bit comparator with open collector output', pkg: 'DIP-20' },
      { code: '520', name: '74520', subCat: 'Số Học & So Sánh', title: '8-bit comparator with inverted tote...', desc: '8-bit comparator with inverted totem-pole output, input pull-up resistor', pkg: 'DIP-20' },
      { code: '521', name: '74521', subCat: 'Số Học & So Sánh', title: '8-bit comparator with inverted tote...', desc: '8-bit comparator with inverted totem-pole output', pkg: 'DIP-20' },
      { code: '522', name: '74522', subCat: 'Số Học & So Sánh', title: '8-bit comparator with inverted open...', desc: '8-bit comparator with inverted open-collector output, input pull-up resistor', pkg: 'DIP-20' },
      { code: '526', name: '74526', subCat: 'Số Học & So Sánh', title: 'fuse programmable identity comparat...', desc: 'fuse programmable identity comparator, 16-bit', pkg: 'DIP-16' },
      { code: '527', name: '74527', subCat: 'Số Học & So Sánh', title: 'fuse programmable identity comparat...', desc: 'fuse programmable identity comparator, 8-bit + 4-bit conventional Identity comparator', pkg: 'DIP-20' },
      { code: '528', name: '74528', subCat: 'Số Học & So Sánh', title: 'fuse programmable Identity comparat...', desc: 'fuse programmable Identity comparator, 12-bit', pkg: 'DIP-14' },
      { code: '558', name: '74558', subCat: 'Số Học & So Sánh', title: '8-bit by 8-bit multiplier with thre...', desc: '8-bit by 8-bit multiplier with three-state outputs', pkg: 'DIP-20' },
      { code: '677', name: '74677', subCat: 'Số Học & So Sánh', title: '16-bit address comparator with enab...', desc: '16-bit address comparator with enable', pkg: 'DIP-16' },
      { code: '678', name: '74678', subCat: 'Số Học & So Sánh', title: '16-bit address comparator with latc...', desc: '16-bit address comparator with latch', pkg: 'DIP-16' },
      { code: '679', name: '74679', subCat: 'Số Học & So Sánh', title: '12-bit address comparator with latc...', desc: '12-bit address comparator with latch', pkg: 'DIP-14' },
      { code: '680', name: '74680', subCat: 'Số Học & So Sánh', title: '12-bit address comparator with enab...', desc: '12-bit address comparator with enable', pkg: 'DIP-14' },
      { code: '682', name: '74682', subCat: 'Số Học & So Sánh', title: '8-bit magnitude comparator', desc: '8-bit magnitude comparator', pkg: 'DIP-20' },
      { code: '683', name: '74683', subCat: 'Số Học & So Sánh', title: '8-bit magnitude comparator with ope...', desc: '8-bit magnitude comparator with open collector outputs', pkg: 'DIP-20' },
      { code: '684', name: '74684', subCat: 'Số Học & So Sánh', title: '8-bit magnitude comparator', desc: '8-bit magnitude comparator', pkg: 'DIP-20' },
      { code: '685', name: '74685', subCat: 'Số Học & So Sánh', title: '8-bit magnitude comparator with ope...', desc: '8-bit magnitude comparator with open collector outputs', pkg: 'DIP-20' },
      { code: '686', name: '74686', subCat: 'Số Học & So Sánh', title: '8-bit magnitude comparator with ena...', desc: '8-bit magnitude comparator with enable', pkg: 'DIP-20' },
      { code: '687', name: '74687', subCat: 'Số Học & So Sánh', title: '8-bit magnitude comparator with ena...', desc: '8-bit magnitude comparator with enable', pkg: 'DIP-20' },
      { code: '688', name: '74688', subCat: 'Số Học & So Sánh', title: '8-Bit Identity Comparator', desc: 'Bộ so sánh đẳng thức (bằng nhau) 8-bit', pkg: 'DIP-20' },
      { code: '689', name: '74689', subCat: 'Số Học & So Sánh', title: '8-bit magnitude comparator with ope...', desc: '8-bit magnitude comparator with open collector outputs', pkg: 'DIP-20' },
      { code: '881', name: '74881', subCat: 'Số Học & So Sánh', title: 'arithmetic logic unit', desc: 'arithmetic logic unit', pkg: 'DIP-14' },
      { code: '909', name: '74909', subCat: 'Số Học & So Sánh', title: 'quad voltage comparator', desc: 'quad voltage comparator', pkg: 'DIP-14' },
      { code: '932', name: '74932', subCat: 'Số Học & So Sánh', title: 'phase comparator', desc: 'phase comparator', pkg: 'DIP-14' },
      { code: '933', name: '74933', subCat: 'Số Học & So Sánh', title: 'address bus comparator', desc: 'address bus comparator', pkg: 'DIP-14' },

      // --- SCHMITT & TẠO XUNG ---
      { code: '13', name: '7413', subCat: 'Schmitt & Tạo Xung', title: 'Dual 4-NAND Schmitt Trigger', desc: '2 cổng NAND 4 ngõ vào kích Schmitt', pkg: 'DIP-14' },
      { code: '14', name: '7414', subCat: 'Schmitt & Tạo Xung', title: 'Hex Schmitt Inverter', desc: '6 cổng đảo Schmitt Trigger lọc nhiễu', pkg: 'DIP-14' },
      { code: '18', name: '7418', subCat: 'Schmitt & Tạo Xung', title: 'dual 4-input NAND gate with Schmitt...', desc: 'dual 4-input NAND gate with Schmitt trigger inputs', pkg: 'DIP-14' },
      { code: '19', name: '7419', subCat: 'Schmitt & Tạo Xung', title: 'hex Schmitt trigger inverter', desc: 'hex Schmitt trigger inverter', pkg: 'DIP-14' },
      { code: '24', name: '7424', subCat: 'Schmitt & Tạo Xung', title: 'quad 2-input NAND gate gates with S...', desc: 'quad 2-input NAND gate gates with Schmitt trigger line-receiver inputs.', pkg: 'DIP-14' },
      { code: '121', name: '74121', subCat: 'Schmitt & Tạo Xung', title: 'Monostable Multivibrator', desc: 'Bộ tạo xung đơn ổn (One-Shot Timer)', pkg: 'DIP-14' },
      { code: '122', name: '74122', subCat: 'Schmitt & Tạo Xung', title: 'Retriggerable Monostable', desc: 'Bộ tạo xung đơn ổn kích lại được có Clear', pkg: 'DIP-14' },
      { code: '123', name: '74123', subCat: 'Schmitt & Tạo Xung', title: 'Dual Retriggerable Monostable', desc: 'Bộ tạo xung đơn ổn kép kích lại được', pkg: 'DIP-16' },
      { code: '124', name: '74124', subCat: 'Schmitt & Tạo Xung', title: 'dual voltage-controlled oscillator', desc: 'dual voltage-controlled oscillator', pkg: 'DIP-14' },
      { code: '132', name: '74132', subCat: 'Schmitt & Tạo Xung', title: 'Quad 2-NAND Schmitt', desc: '4 cổng NAND 2 ngõ vào Schmitt Trigger', pkg: 'DIP-14' },
      { code: '221', name: '74221', subCat: 'Schmitt & Tạo Xung', title: 'Dual Monostable Schmitt', desc: 'Bộ tạo xung đơn ổn kép ngõ vào Schmitt', pkg: 'DIP-16' },
      { code: '232', name: '74232', subCat: 'Schmitt & Tạo Xung', title: 'quad NOR Schmitt trigger', desc: 'quad NOR Schmitt trigger', pkg: 'DIP-14' },
      { code: '320', name: '74320', subCat: 'Schmitt & Tạo Xung', title: 'crystal-controlled oscillator', desc: 'crystal-controlled oscillator', pkg: 'DIP-14' },
      { code: '321', name: '74321', subCat: 'Schmitt & Tạo Xung', title: 'crystal-controlled oscillators with...', desc: 'crystal-controlled oscillators with F/2 and F/4 count-down outputs', pkg: 'DIP-14' },
      { code: '324', name: '74324', subCat: 'Schmitt & Tạo Xung', title: 'voltage-controlled oscillator', desc: 'voltage-controlled oscillator (or crystal controlled)', pkg: 'DIP-14' },
      { code: '422', name: '74422', subCat: 'Schmitt & Tạo Xung', title: 're-triggerable mono-stable multivib...', desc: 're-triggerable mono-stable multivibrators, two inputs', pkg: 'DIP-14' },
      { code: '423', name: '74423', subCat: 'Schmitt & Tạo Xung', title: 'dual retriggerable monostable multi...', desc: 'dual retriggerable monostable multivibrator', pkg: 'DIP-14' },
      { code: '618', name: '74618', subCat: 'Schmitt & Tạo Xung', title: 'Schmitt trigger positive-nand gates...', desc: 'Schmitt trigger positive-nand gates with totem-pole outputs', pkg: 'DIP-14' },
      { code: '619', name: '74619', subCat: 'Schmitt & Tạo Xung', title: 'Schmitt trigger inverters with tote...', desc: 'Schmitt trigger inverters with totem-pole outputs', pkg: 'DIP-14' },
      { code: '624', name: '74624', subCat: 'Schmitt & Tạo Xung', title: 'voltage-controlled oscillator with ...', desc: 'voltage-controlled oscillator with enable control, range control, two-phase outputs', pkg: 'DIP-14' },
      { code: '625', name: '74625', subCat: 'Schmitt & Tạo Xung', title: 'dual voltage-controlled oscillator ...', desc: 'dual voltage-controlled oscillator with two-phase outputs', pkg: 'DIP-14' },
      { code: '626', name: '74626', subCat: 'Schmitt & Tạo Xung', title: 'dual voltage-controlled oscillator ...', desc: 'dual voltage-controlled oscillator with enable control, two-phase outputs', pkg: 'DIP-14' },
      { code: '627', name: '74627', subCat: 'Schmitt & Tạo Xung', title: 'dual voltage-controlled oscillator', desc: 'dual voltage-controlled oscillator', pkg: 'DIP-14' },
      { code: '628', name: '74628', subCat: 'Schmitt & Tạo Xung', title: 'voltage-controlled oscillator with ...', desc: 'voltage-controlled oscillator with enable control, range control, external temperature compensation, and two-phase outputs', pkg: 'DIP-14' },
      { code: '629', name: '74629', subCat: 'Schmitt & Tạo Xung', title: 'dual voltage-controlled oscillator ...', desc: 'dual voltage-controlled oscillator with enable control, range control', pkg: 'DIP-14' },
      { code: '724', name: '74724', subCat: 'Schmitt & Tạo Xung', title: 'voltage-controlled multivibrator', desc: 'voltage-controlled multivibrator', pkg: 'DIP-14' },
      { code: '914', name: '74914', subCat: 'Schmitt & Tạo Xung', title: 'hex Schmitt trigger with extended i...', desc: 'hex Schmitt trigger with extended input voltage', pkg: 'DIP-14' },
      { code: '4046', name: '744046', subCat: 'Schmitt & Tạo Xung', title: 'phase-locked loop and voltage-contr...', desc: 'phase-locked loop and voltage-controlled oscillator', pkg: 'DIP-14' },
      { code: '4538', name: '744538', subCat: 'Schmitt & Tạo Xung', title: 'dual retriggerable precision monost...', desc: 'dual retriggerable precision monostable multivibrator', pkg: 'DIP-14' }
    ];

    let currentAchievStatusFilter = 'all';
    let currentAchievSubCatFilter = 'Tất cả';
    let currentAchievSearch = '';

    function set74AchievementSearch(q) {
      currentAchievSearch = (q || '').trim().toLowerCase();
      render74AchievementGrid();
    }

    function open74AchievementModal() {
      currentAchievSearch = '';
      const sInput = document.getElementById('achievSearchInput');
      if (sInput) sInput.value = '';
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
      const allFilterBtn = document.getElementById('achievFilterBtn_all');
      if (allFilterBtn) allFilterBtn.innerText = `Tất cả (${totalCatalog})`;
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
        if (currentAchievSearch) {
          const s = currentAchievSearch;
          const match = item.code.toLowerCase().includes(s) ||
                        item.name.toLowerCase().includes(s) ||
                        (item.title && item.title.toLowerCase().includes(s)) ||
                        (item.desc && item.desc.toLowerCase().includes(s));
          if (!match) return false;
        }

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
