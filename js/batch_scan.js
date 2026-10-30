// =========================================================================
// MODULE: BATCH SCAN & 4 SHOPS (QUÉT KHO HÀNG LOẠT & SO GIÁ 4 SHOP)
// =========================================================================

    // ================= MODAL 7: AUTO QUÉT MÔ TẢ & PINOUT TOÀN KHO =================
    let isBatchRunning = false;
    let batchAbortController = null;

    function openBatchEnrichModal() {
      renderBatchModalStats();
      document.getElementById('batchProgressWrapper').classList.add('hidden');
      document.getElementById('batchSummaryNotice').textContent = '';
      const btn = document.getElementById('btnStartBatch');
      btn.innerHTML = '<i data-lucide="play" class="w-4 h-4 fill-slate-950"></i> Bắt đầu Quét Kho';
      btn.className = 'px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-950/30';
      document.getElementById('batchEnrichModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeBatchEnrichModal() {
      if (isBatchRunning) {
        if (!confirm('Quá trình quét đang diễn ra. Bạn có chắc muốn dừng lại và đóng không?')) return;
        isBatchRunning = false;
        if (batchAbortController) batchAbortController.abort();
      }
      document.getElementById('batchEnrichModal').classList.add('hidden');
    }

    function renderBatchModalStats() {
      const total = parts.length;
      const missingDesc = parts.filter(p => !p.desc || !p.desc.trim()).length;
      const missingPinout = parts.filter(p => !p.pinout || !p.pinout.trim()).length;
      const missingBuy = parts.filter(p => !p.buyUrl && (!p.buyShops || Object.keys(p.buyShops).length === 0)).length;

      const elTotal = document.getElementById('batchStatTotal');
      const elDesc = document.getElementById('batchStatMissingDesc');
      const elPinout = document.getElementById('batchStatMissingPinout');
      const elBuy = document.getElementById('batchStatMissingBuy');
      if (elTotal) elTotal.innerText = total;
      if (elDesc) elDesc.innerText = missingDesc;
      if (elPinout) elPinout.innerText = missingPinout;
      if (elBuy) elBuy.innerText = missingBuy;
    }

    async function toggleBatchEnrich() {
      if (isBatchRunning) {
        isBatchRunning = false;
        if (batchAbortController) batchAbortController.abort();
        const btn = document.getElementById('btnStartBatch');
        btn.innerHTML = '<i data-lucide="play" class="w-4 h-4 fill-slate-950"></i> Tiếp tục Quét';
        btn.className = 'px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5';
        document.getElementById('batchCurrentItem').innerHTML = '<span class="text-amber-400">Đã tạm dừng.</span>';
        lucide.createIcons();
        return;
      }

      const doDesc = document.getElementById('batchOptDesc')?.checked ?? true;
      const doPinout = document.getElementById('batchOptPinout')?.checked ?? true;
      const doPkg = document.getElementById('batchOptPkg')?.checked ?? true;
      const doBuy = document.getElementById('batchOptBuy')?.checked ?? true;
      const doSubCat = document.getElementById('batchOptSubCat')?.checked ?? true;

      if (!doDesc && !doPinout && !doPkg && !doBuy && !doSubCat) {
        return alert('Vui lòng chọn ít nhất 1 tùy chọn tự động bổ sung!');
      }

      // LỌC CÁC LINH KIỆN CẦN BỔ SUNG (TUYỆT ĐỐI KHÔNG ĐỤNG VÀO LINH KIỆN ĐÃ CÓ ĐẦY ĐỦ)
      const targets = parts.filter(p => {
        const needDesc = doDesc && (!p.desc || !p.desc.trim());
        const needPinout = doPinout && (!p.pinout || !p.pinout.trim());
        const needPkg = doPkg && (!p.package || !p.package.trim());
        const needBuy = doBuy && (!p.buyUrl && (!p.buyShops || Object.keys(p.buyShops).length === 0));
        const needSubCat = doSubCat && ((isLogicCategory(p.category) || isAnalogCategory(p.category)) && !p.subCategory);
        return needDesc || needPinout || needPkg || needBuy || needSubCat;
      });

      if (targets.length === 0) {
        alert('Kho linh kiện của bạn đã có đầy đủ thông tin theo các tùy chọn đã chọn! Không có linh kiện nào cần bổ sung.');
        return;
      }

      isBatchRunning = true;
      batchAbortController = new AbortController();

      const btn = document.getElementById('btnStartBatch');
      btn.innerHTML = '<i data-lucide="square" class="w-4 h-4 fill-white"></i> Dừng quét';
      btn.className = 'px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-rose-950/30';

      const progressWrapper = document.getElementById('batchProgressWrapper');
      progressWrapper.classList.remove('hidden');
      const progressBar = document.getElementById('batchProgressBar');
      const currentItemText = document.getElementById('batchCurrentItem');
      const percentText = document.getElementById('batchPercentText');
      const logBox = document.getElementById('batchLogBox');
      const summaryNotice = document.getElementById('batchSummaryNotice');
      logBox.innerHTML = '';
      summaryNotice.textContent = '';
      lucide.createIcons();

      let updatedDesc = 0;
      let updatedPinout = 0;
      let updatedPkg = 0;
      let updatedBuy = 0;
      let updatedSubCat = 0;

      for (let i = 0; i < targets.length; i++) {
        if (!isBatchRunning) break;
        const p = targets[i];
        const pct = Math.round(((i + 1) / targets.length) * 100);
        progressBar.style.width = pct + '%';
        percentText.innerText = `${pct}% (${i + 1}/${targets.length})`;
        currentItemText.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> Đang xử lý: <b>${p.name}</b>...`;
        lucide.createIcons();

        let changes = [];

        // 1. TÌM MÔ TẢ & KIỂU CHÂN (CHỈ KHI CHƯA CÓ!)
        if ((doDesc && (!p.desc || !p.desc.trim())) || (doPkg && (!p.package || !p.package.trim()))) {
          const local = lookupComponentKnowledge(p.name);
          if (local) {
            if (doDesc && (!p.desc || !p.desc.trim()) && local.desc) {
              p.desc = local.desc;
              updatedDesc++;
              changes.push(`+ Mô tả`);
            }
            if (doPkg && (!p.package || !p.package.trim()) && local.pkg) {
              p.package = local.pkg;
              updatedPkg++;
              changes.push(`+ Kiểu chân (${local.pkg})`);
            }
          } else if (doDesc && (!p.desc || !p.desc.trim())) {
            try {
              const info = await fetchDescForPart(p.name);
              if (info && info.desc) {
                p.desc = info.desc;
                updatedDesc++;
                changes.push(`+ Mô tả (Online)`);
              }
            } catch(e) {}
          }
        }

        // 2. TÌM ẢNH PINOUT (CHỈ KHI Ô PINOUT ĐANG TRỐNG!)
        if (doPinout && (!p.pinout || !p.pinout.trim())) {
          try {
            const img = await fetchPinoutImageForPart(p.name, p.package || '');
            if (img) {
              p.pinout = img;
              updatedPinout++;
              changes.push(`+ Gắn ảnh Pinout ✓`);
            }
          } catch(e) {}
        }

        // 3. TÌM LINK ĐẶT MUA 4 SHOP & GIÁ (TUYẾT NGA, HSHOP, CAKA, SHOPEE)
        if (doBuy && (!p.buyUrl || !p.buyShops || Object.keys(p.buyShops).length === 0)) {
          try {
            const shops = await fetchShopLinksForPart(p.name, p.package || '');
            if (shops) {
              p.buyShops = shops;
              if (!p.buyUrl) {
                p.buyUrl = shops.tuyetnga?.available ? shops.tuyetnga.url : (shops.caka?.available ? shops.caka.url : shops.shopee?.url);
              }
              p.minPrice = getMinPriceString(shops);
              updatedBuy++;
              changes.push(`+ 4 Shop Mua & Giá`);
            }
          } catch(e) {}
        }

        // 4. PHÂN LOẠI SÂU SUB-CATALOG CHO LOGIC & ANALOG IC
        if (doSubCat && !p.subCategory) {
          let sub = '';
          if (isLogicCategory(p.category)) {
            sub = determineLogicSubcategory(p.name, p.desc);
          } else if (isAnalogCategory(p.category)) {
            sub = determineAnalogSubcategory(p.name, p.desc);
          }
          if (sub) {
            p.subCategory = sub;
            updatedSubCat++;
            changes.push(`+ Sub-catalog (${sub})`);
          }
        }

        // Ghi nhật ký dòng
        const logLine = document.createElement('div');
        logLine.className = 'py-0.5 flex items-center justify-between border-b border-slate-800/60';
        if (changes.length > 0) {
          logLine.innerHTML = `<span class="font-bold text-white">${p.name}</span> <span class="text-emerald-400 font-sans">${changes.join(', ')}</span>`;
        } else {
          logLine.innerHTML = `<span class="text-slate-400">${p.name}</span> <span class="text-slate-500 font-sans">Không tìm thấy thêm dữ liệu</span>`;
        }
        logBox.appendChild(logLine);
        logBox.scrollTop = logBox.scrollHeight;

        // Lưu dữ liệu từng đợt
        if ((i + 1) % 4 === 0 || i === targets.length - 1) {
          saveData();
          renderParts();
          renderBatchModalStats();
        }

        await new Promise(r => setTimeout(r, 80));
      }

      isBatchRunning = false;
      btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Hoàn tất';
      btn.className = 'px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs transition flex items-center gap-1.5';
      currentItemText.innerHTML = `<span class="text-emerald-400 font-bold flex items-center gap-1"><i data-lucide="check-circle" class="w-4 h-4"></i> Quét hoàn tất!</span>`;
      summaryNotice.innerHTML = `Đã bổ sung: <b class="text-emerald-400">${updatedDesc}</b> mô tả • <b class="text-sky-400">${updatedPinout}</b> ảnh pinout • <b class="text-amber-400">${updatedPkg}</b> kiểu chân • <b class="text-rose-400">${updatedBuy}</b> 4 shop • <b class="text-indigo-400">${updatedSubCat}</b> sub-catalog Logic & Analog. Các dữ liệu cũ của bạn được giữ nguyên 100%.`;

      saveData();
      renderParts();
      renderBatchModalStats();
      lucide.createIcons();
    }

    // ================= MODAL 8 & TIỆN ÍCH SO SÁNH GIÁ 4 SHOP =================
    function getComponentPriceEstimate(name, pkg = '') {
      const upper = (name || '').toUpperCase().trim();
      
      // 1. Logic IC họ 74xx
      if (/^74|SN74|MC74|HD74/i.test(upper)) {
        return {
          tuyetnga: '5.500₫ - 8.000₫',
          tuyetngaAvailable: true,
          hshop: null,
          hshopAvailable: false,
          hshopNote: 'HShop không kinh doanh IC logic rời (bỏ qua)',
          caka: '6.000₫ - 9.000₫',
          cakaAvailable: true,
          shopee: '4.000₫ - 7.000₫',
          minPrice: '4k - 8k'
        };
      }

      // 2. CMOS họ 40xx
      if (/^CD40|HEF40|HCF40|MC140/i.test(upper)) {
        return {
          tuyetnga: '5.000₫ - 7.500₫',
          tuyetngaAvailable: true,
          hshop: null,
          hshopAvailable: false,
          hshopNote: 'HShop không kinh doanh IC logic rời (bỏ qua)',
          caka: '5.500₫ - 8.500₫',
          cakaAvailable: true,
          shopee: '3.500₫ - 6.500₫',
          minPrice: '3.5k - 7k'
        };
      }

      // 3. NE555 / LM555 Timer
      if (/555|NE556/i.test(upper)) {
        return {
          tuyetnga: '3.000₫ - 4.500₫',
          tuyetngaAvailable: true,
          hshop: '10.000₫ (Module)',
          hshopAvailable: true,
          caka: '4.000₫ - 5.500₫',
          cakaAvailable: true,
          shopee: '2.500₫ - 4.000₫',
          minPrice: '2.5k - 4.5k'
        };
      }

      // 4. Op-Amp (LM358, LM324, TL072, TL084, LM393...)
      if (/LM358|LM324|TL072|TL082|TL074|TL084|LM393|LM339|NE5532|OP07/i.test(upper)) {
        return {
          tuyetnga: '4.000₫ - 7.000₫',
          tuyetngaAvailable: true,
          hshop: null,
          hshopAvailable: false,
          hshopNote: 'HShop ít bán Op-Amp cắm rời (bỏ qua)',
          caka: '5.000₫ - 8.000₫',
          cakaAvailable: true,
          shopee: '3.500₫ - 6.000₫',
          minPrice: '3.5k - 7k'
        };
      }

      // 5. Driver / Transistor array (ULN2803, ULN2003, L293D, L298N)
      if (/ULN2803|ULN2003|L293|L298/i.test(upper)) {
        return {
          tuyetnga: '8.000₫ - 12.000₫',
          tuyetngaAvailable: true,
          hshop: '15.000₫ - 20.000₫',
          hshopAvailable: true,
          caka: '9.000₫ - 14.000₫',
          cakaAvailable: true,
          shopee: '6.500₫ - 11.000₫',
          minPrice: '6.5k - 12k'
        };
      }

      // 6. Ổn áp (LM7805, 7805, 7812, LM317, AMS1117)
      if (/7805|7812|7905|7912|LM317|AMS1117/i.test(upper)) {
        return {
          tuyetnga: '4.000₫ - 6.000₫',
          tuyetngaAvailable: true,
          hshop: '7.000₫ - 10.000₫',
          hshopAvailable: true,
          caka: '5.000₫ - 7.000₫',
          cakaAvailable: true,
          shopee: '3.000₫ - 5.500₫',
          minPrice: '3k - 6k'
        };
      }

      // 7. Optocoupler / Giao tiếp (PC817, 4N35, MAX232, MAX485)
      if (/PC817|4N35|MAX232|MAX485|CH340/i.test(upper)) {
        return {
          tuyetnga: '2.500₫ - 6.000₫',
          tuyetngaAvailable: true,
          hshop: '12.000₫ (Module)',
          hshopAvailable: true,
          caka: '3.000₫ - 7.000₫',
          cakaAvailable: true,
          shopee: '2.000₫ - 5.000₫',
          minPrice: '2k - 6k'
        };
      }

      // 8. Vi điều khiển / Bo mạch (ESP32, ESP8266, STM32, Arduino Nano/Uno)
      if (/ESP32|ESP8266|STM32|ATMEGA328|ARDUINO|NANO|UNO|RP2040/i.test(upper)) {
        return {
          tuyetnga: '85.000₫ - 95.000₫',
          tuyetngaAvailable: true,
          hshop: '105.000₫ - 125.000₫ (Hàng chuẩn)',
          hshopAvailable: true,
          caka: '88.000₫ - 99.000₫',
          cakaAvailable: true,
          shopee: '75.000₫ - 90.000₫',
          minPrice: '75k - 110k'
        };
      }

      // 9. Cảm biến / Hiển thị (BME280, DHT11, DHT22, HC-SR04, SSD1306, MPU6050)
      if (/BME280|BMP280|DHT11|DHT22|HC-SR04|SSD1306|MPU6050|DS18B20/i.test(upper)) {
        return {
          tuyetnga: '18.000₫ - 45.000₫',
          tuyetngaAvailable: true,
          hshop: '25.000₫ - 55.000₫',
          hshopAvailable: true,
          caka: '20.000₫ - 50.000₫',
          cakaAvailable: true,
          shopee: '14.000₫ - 40.000₫',
          minPrice: '14k - 45k'
        };
      }

      // 10. Diode / Transistor / MOSFET công suất (1N4007, 2N2222, IRFZ44N...)
      if (/1N400|1N4148|1N58|2N2222|2N3904|BC547|TIP|IRF/i.test(upper)) {
        return {
          tuyetnga: '1.000₫ - 10.000₫',
          tuyetngaAvailable: true,
          hshop: null,
          hshopAvailable: false,
          hshopNote: 'HShop không kinh doanh transistor/diode rời',
          caka: '1.500₫ - 12.000₫',
          cakaAvailable: true,
          shopee: '800₫ - 8.000₫',
          minPrice: '1k - 10k'
        };
      }

      return {
        tuyetnga: '5.000₫ - 15.000₫',
        tuyetngaAvailable: true,
        hshop: '15.000₫ - 30.000₫',
        hshopAvailable: true,
        caka: '6.000₫ - 18.000₫',
        cakaAvailable: true,
        shopee: '4.000₫ - 12.000₫',
        minPrice: '4k - 15k'
      };
    }

    function getMinPriceString(shops) {
      if (!shops) return '';
      const prices = [];
      for (const k in shops) {
        if (shops[k] && shops[k].available && shops[k].price) {
          const m = shops[k].price.match(/(\d+(?:\.\d+)?)\s*[kK₫]/);
          if (m) prices.push(shops[k].price);
        }
      }
      return prices.length > 0 ? prices[0].split(' - ')[0] : '';
    }

    function generateShopLinksForPart(name, pkg = '') {
      if (!name) return null;
      const cleanName = name.trim();
      const cleanPkg = (pkg || '').trim();
      const query = cleanPkg ? `${cleanName} ${cleanPkg}` : cleanName;
      const encodedQ = encodeURIComponent(query);
      const isDip = /\bdip\b/i.test(cleanPkg);
      const isSmd = /\b(smd|sop|soic|qfp)\b/i.test(cleanPkg);

      const priceEst = getComponentPriceEstimate(cleanName, cleanPkg);

      return {
        tuyetnga: {
          name: 'Điện tử Tuyết Nga',
          shortName: 'Tuyết Nga',
          url: `https://dientutuyetnga.com/tim-kiem?q=${encodedQ}`,
          price: priceEst.tuyetnga,
          available: priceEst.tuyetngaAvailable !== false,
          pkgMatch: true,
          theme: 'orange',
          badgeText: isDip ? 'Đúng chân cắm DIP' : (isSmd ? 'Đúng chân dán SMD' : 'Chuẩn linh kiện')
        },
        hshop: {
          name: 'HShop.vn',
          shortName: 'HShop',
          url: `https://hshop.vn/search?q=${encodedQ}`,
          price: priceEst.hshop,
          available: priceEst.hshopAvailable === true,
          pkgMatch: priceEst.hshopAvailable === true,
          theme: 'sky',
          note: priceEst.hshopNote || (priceEst.hshopAvailable === false ? 'HShop chủ yếu bán module, không bán IC logic rời (bỏ qua)' : '')
        },
        caka: {
          name: 'Linh kiện Caka',
          shortName: 'Caka.vn',
          url: `https://caka.vn/search?query=${encodedQ}`,
          price: priceEst.caka,
          available: priceEst.cakaAvailable !== false,
          pkgMatch: true,
          theme: 'emerald',
          badgeText: isDip ? 'Đúng chân cắm DIP' : (isSmd ? 'Đúng chân dán SMD' : 'Chuẩn linh kiện')
        },
        shopee: {
          name: 'Shopee (Đa dạng shop)',
          shortName: 'Shopee',
          url: `https://shopee.vn/search?keyword=${encodedQ}`,
          price: priceEst.shopee,
          available: true,
          pkgMatch: true,
          theme: 'rose',
          badgeText: 'Nhiều shop rẻ & mã Freeship'
        }
      };
    }

    async function fetchShopLinksForPart(name, pkg = '') {
      if (!name) return null;
      let shopData = null;

      if (pinoutServerUrl) {
        try {
          const res = await fetch(`${pinoutServerUrl}/api/shops?name=${encodeURIComponent(name)}&pkg=${encodeURIComponent(pkg)}`, { signal: AbortSignal.timeout(3000) });
          if (res.ok) {
            const data = await res.json();
            if (data && (data.tuyetnga || data.hshop || data.caka || data.shopee)) {
              shopData = data;
            }
          }
        } catch(e) {}
      }

      if (!shopData) {
        shopData = generateShopLinksForPart(name, pkg);
      }

      return shopData;
    }

    let currentBuyModalPartId = null;

    function openBuyModal(partId) {
      const p = parts.find(x => x.id === partId);
      if (!p) return;
      currentBuyModalPartId = partId;

      document.getElementById('buyModalPartName').innerText = p.name;
      const pkgBadge = document.getElementById('buyModalPackageBadge');
      if (p.package) {
        pkgBadge.innerText = p.package;
        pkgBadge.classList.remove('hidden');
      } else {
        pkgBadge.classList.add('hidden');
      }
      document.getElementById('buyModalPartDesc').innerText = p.desc || 'Chưa có mô tả chi tiết';
      document.getElementById('buyModalStockQty').innerText = `${p.qty} ${p.package?.includes('Module') ? 'module' : 'con'}`;
      document.getElementById('buyModalInUseQty').innerText = `Cắm mạch: ${p.inUse || 0}`;

      const pkgNotice = document.getElementById('buyModalPkgNotice');
      if (p.package) {
        pkgNotice.innerHTML = `<i data-lucide="check-check" class="w-3.5 h-3.5 text-emerald-400"></i> <span>Ưu tiên đúng kiểu chân <b>${p.package}</b></span>`;
      } else {
        pkgNotice.innerHTML = `<i data-lucide="alert-circle" class="w-3.5 h-3.5 text-amber-400"></i> <span>Chưa chọn kiểu chân (mặc định tìm cả DIP/SMD)</span>`;
      }

      if (!p.buyShops || Object.keys(p.buyShops).length === 0) {
        p.buyShops = generateShopLinksForPart(p.name, p.package || '');
        p.minPrice = getMinPriceString(p.buyShops);
        if (!p.buyUrl) {
          p.buyUrl = p.buyShops.tuyetnga?.available ? p.buyShops.tuyetnga.url : (p.buyShops.caka?.available ? p.buyShops.caka.url : p.buyShops.shopee?.url);
        }
        saveData();
      }

      renderBuyModalShops(p.buyShops, p.package || '');
      document.getElementById('buyModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeBuyModal() {
      document.getElementById('buyModal').classList.add('hidden');
    }

    function renderBuyModalShops(shops, pkg = '') {
      const listEl = document.getElementById('buyModalShopsList');
      if (!listEl || !shops) return;

      const shopConfigs = [
        {
          key: 'tuyetnga',
          title: 'Điện tử Tuyết Nga',
          subtitle: 'Chuyên IC số, linh kiện cắm DIP/SMD Nhật Tảo',
          iconColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          btnClass: 'bg-orange-600 hover:bg-orange-500 text-white'
        },
        {
          key: 'hshop',
          title: 'HShop.vn',
          subtitle: 'Mạch nạp, Module, Cảm biến & Vi điều khiển chính hãng',
          iconColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
          btnClass: 'bg-sky-600 hover:bg-sky-500 text-white'
        },
        {
          key: 'caka',
          title: 'Linh kiện Caka',
          subtitle: 'Linh kiện rời, IC tương tự & Module thực hành',
          iconColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white'
        },
        {
          key: 'shopee',
          title: 'Shopee (Đa dạng Shop)',
          subtitle: 'Tổng hợp nhiều nhà bán lẻ, áp mã Freeship & Voucher',
          iconColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          btnClass: 'bg-[#ee4d2d] hover:bg-[#d73211] text-white'
        }
      ];

      listEl.innerHTML = shopConfigs.map(cfg => {
        const item = shops[cfg.key];
        if (!item) return '';

        const isAvailable = item.available !== false;
        const priceDisplay = item.price ? `<span class="text-emerald-400 font-bold font-mono text-sm">${item.price}</span>` : '<span class="text-slate-500 text-xs">Chưa rõ giá</span>';
        
        let statusBadge = '';
        if (isAvailable) {
          statusBadge = `<span class="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Có hàng ${pkg ? `(${pkg})` : ''}
          </span>`;
        } else {
          statusBadge = `<span class="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span> ${item.note || 'Không có sẵn loại này'}
          </span>`;
        }

        return `
        <div class="bg-slate-800/80 border ${isAvailable ? 'border-slate-700/80 hover:border-slate-600' : 'border-slate-800 opacity-75'} rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition">
          <div class="flex items-start gap-2.5">
            <div class="w-9 h-9 rounded-lg ${cfg.iconColor} border flex items-center justify-center shrink-0 mt-0.5">
              <i data-lucide="store" class="w-4 h-4"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-bold text-white text-sm">${cfg.title}</h4>
                ${statusBadge}
              </div>
              <p class="text-xs text-slate-400 mt-0.5">${cfg.subtitle}</p>
              ${item.title && item.title !== cfg.title ? `<p class="text-[11px] text-slate-300 italic truncate max-w-xs mt-0.5">"${item.title}"</p>` : ''}
            </div>
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60">
            <div class="text-right">
              <span class="text-[10px] text-slate-400 block">Giá tham khảo:</span>
              ${priceDisplay}
            </div>
            <a href="${item.url}" target="_blank" rel="noopener noreferrer"
               class="px-3.5 py-2 rounded-lg ${cfg.btnClass} font-semibold text-xs transition flex items-center gap-1.5 shadow-md">
              <span>Xem Shop</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>
        `;
      }).join('');

      lucide.createIcons();
    }

    async function refreshBuyModalOnline() {
      if (!currentBuyModalPartId) return;
      const p = parts.find(x => x.id === currentBuyModalPartId);
      if (!p) return;

      const btn = document.getElementById('btnRefreshBuyModal');
      btn.innerHTML = '<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> Đang quét online...';
      btn.disabled = true;
      lucide.createIcons();

      try {
        const liveShops = await fetchShopLinksForPart(p.name, p.package || '');
        if (liveShops) {
          p.buyShops = liveShops;
          p.minPrice = getMinPriceString(liveShops);
          saveData();
          renderBuyModalShops(p.buyShops, p.package || '');
          renderParts();
        }
      } catch(e) {
      } finally {
        btn.innerHTML = '<i data-lucide="refresh-cw" class="w-3 h-3"></i> Quét lại giá';
        btn.disabled = false;
        lucide.createIcons();
      }
    }

    function previewCurrentFormBuyShops() {
      const name = document.getElementById('partName').value.trim();
      const pkg = document.getElementById('partPackage').value.trim();
      if (!name) {
        return alert('Vui lòng nhập Tên / Mã linh kiện trước đã bạn ơi!');
      }

      const tempPart = {
        id: '__temp_form__',
        name: name,
        package: pkg,
        desc: document.getElementById('partDesc').value.trim() || 'Linh kiện đang nhập',
        qty: document.getElementById('partQty').value || 5,
        inUse: document.getElementById('partInUse').value || 0,
        buyShops: generateShopLinksForPart(name, pkg)
      };

      const existingIdx = parts.findIndex(x => x.id === '__temp_form__');
      if (existingIdx > -1) parts[existingIdx] = tempPart;
      else parts.push(tempPart);

      openBuyModal('__temp_form__');
    }



    function openBuyModalForExternal(chipName) {
      const tempId = '__ext_buy_' + Date.now();
      const tempPart = {
        id: tempId,
        name: chipName,
        package: 'DIP',
        desc: 'IC thay thế tương đương',
        qty: 0,
        inUse: 0,
        buyShops: generateShopLinksForPart(chipName, 'DIP')
      };
      parts.push(tempPart);
      closeReplaceModal();
      openBuyModal(tempId);
    }

