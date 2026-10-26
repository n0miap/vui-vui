// =========================================================================
// MODULE: DATA & KNOWLEDGE BASE (DỮ LIỆU GỐC & TỪ ĐIỂN LINH KIỆN)
// =========================================================================


    // 1. DỮ LIỆU MẪU KHỞI TẠO (HỘP NHỰA + LINH KIỆN)
    const DEFAULT_BOXES = [
      { id: 'box_logic', name: 'Hộp IC Số & Vi Điều Khiển', rows: 4, cols: 6, note: 'Hộp nhựa 24 ngăn nắp trong (Ngăn trên cùng)', dividedCells: ['A1'] },
      { id: 'box_analog', name: 'Hộp Analog & Công Suất', rows: 3, cols: 5, note: 'Hộp nhựa 15 ngăn (Để cạnh máy hiện sóng)', dividedCells: [] },
      { id: 'box_sensor', name: 'Kệ Module & Cảm Biến', rows: 3, cols: 4, note: 'Kệ ngăn kéo 12 hộc', dividedCells: [] }
    ];

    const DEFAULT_PARTS = [
      {
        id: 'p1',
        name: '74HC595N',
        favorite: true,
        category: 'Logic IC',
        package: 'DIP-16',
        boxId: 'box_logic',
        cell: 'A1',
        subCell: '1',
        location: 'Hộp IC Số & Vi Điều Khiển • A1 (Ngăn 1)',
        qty: 6,
        inUse: 2,
        minQty: 3,
        project: 'Mạch LED Matrix / Breadboard số 1',
        desc: 'Thanh ghi dịch 8-bit (Shift Register)',
        pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/74HC595_pinout.svg/500px-74HC595_pinout.svg.png',
        datasheet: 'https://www.ti.com/lit/ds/symlink/sn74hc595.pdf',
        buyUrl: '',
        notes: 'VCC: Chân 16 | GND: Chân 8\nDS (Data): 14 | SHCP (Clock): 11 | STCP (Latch): 12'
      },
      {
        id: 'p2',
        name: 'AT28C64B',
        favorite: false,
        category: 'Logic IC',
        package: 'DIP-28',
        boxId: 'box_logic',
        cell: 'A1',
        subCell: '2',
        location: 'Hộp IC Số & Vi Điều Khiển • A1 (Ngăn 2)',
        qty: 1,
        inUse: 1,
        minQty: 2,
        project: 'Breadboard Game Logic',
        desc: '64K (8K x 8) Parallel EEPROM',
        pinout: '',
        datasheet: 'https://ww1.microchip.com/downloads/en/DeviceDoc/doc0270.pdf',
        buyUrl: '',
        notes: 'Nhớ mở khóa SDP nếu bật chống ghi. Thời gian ghi trang ~5-10ms.'
      },
      {
        id: 'p3',
        name: 'MCP602-I/P',
        favorite: false,
        category: 'Analog / Op-Amp',
        package: 'DIP-8',
        boxId: 'box_analog',
        cell: 'A1',
        subCell: '',
        location: 'Hộp Analog & Công Suất • A1',
        qty: 4,
        inUse: 2,
        minQty: 2,
        project: 'Mạch tính tích phân Analog',
        desc: 'Dual Op-Amp Rail-to-Rail (2.7V - 6.0V)',
        pinout: '',
        datasheet: 'https://ww1.microchip.com/downloads/en/DeviceDoc/21314g.pdf',
        buyUrl: '',
        notes: 'CẢNH BÁO: Áp tối đa 6V (Không cấp 12V!).\nChân 8: VDD | Chân 4: VSS | Out A: 1 | Out B: 7.'
      },
      {
        id: 'p4',
        name: 'IRLB3034PBF',
        favorite: false,
        category: 'Công suất',
        package: 'TO-220',
        boxId: 'box_analog',
        cell: 'B3',
        subCell: '',
        location: 'Hộp Analog & Công Suất • B3',
        qty: 1,
        inUse: 0,
        minQty: 2,
        project: '',
        desc: 'MOSFET kênh N Logic-Level (Kích mở trực tiếp 3.3V/5V)',
        pinout: '',
        datasheet: 'https://www.infineon.com/dgdl/irlb3034pbf.pdf?fileId=5546d462533600a40153566027b22585',
        buyUrl: '',
        notes: 'Thứ tự chân nhìn mặt chữ: 1. Gate - 2. Drain - 3. Source. Rds(on) siêu thấp.'
      }
    ];

    const DEFAULT_CATEGORIES = [
      'Logic IC',
      'Analog / Op-Amp',
      'MCU / Board',
      'Cảm biến / Module',
      'Công suất',
      'Điện trở',
      'Tụ điện',
      'Diode / Transistor',
      'Thụ động / Khác'
    ];
    let categories = JSON.parse(localStorage.getItem('ee_inventory_categories')) || DEFAULT_CATEGORIES;
    const DEFAULT_PROJECTS = [
      { id: 'proj_1', name: 'Breadboard máy tính 8-bit', note: 'Đang lắp khối ALU & thanh ghi' },
      { id: 'proj_2', name: 'Mạch Analog Lorenz', note: 'Mạch hỗn loạn Lorenz Attractor' }
    ];
    let projects = JSON.parse(localStorage.getItem('ee_inventory_projects')) || DEFAULT_PROJECTS;
    let selectedInUseProject = 'all';
    let currentCategory = 'Tất cả';
    let currentViewMode = 'all'; // 'all' | 'favorite' | 'inuse' | 'shopping'
    let activePreviewBoxId = null;
    let activeHighlightCell = null;
    let activeHighlightSubCell = null;

    // Load dữ liệu (Tương thích ngược với cả bản v1.0 & v2.0)
    let boxes = JSON.parse(localStorage.getItem('ee_inventory_boxes')) || DEFAULT_BOXES;
    let parts = JSON.parse(localStorage.getItem('ee_inventory_parts')) || DEFAULT_PARTS;
    let cloudUrl = localStorage.getItem('ee_inventory_cloud_url') || '';

    // KIỂM TRA PHÂN LOẠI CÓ PHẢI NHÓM LOGIC IC KHÔNG (Hỗ trợ cả tên tùy chỉnh như 'Logic IC (74HC, CD40...)')
    function isLogicCategory(cat) {
      if (!cat) return false;
      const c = String(cat).toLowerCase().trim();
      return c === 'logic ic' || c.includes('logic') || c.includes('74hc') || c.includes('cd40');
    }

    // TÌM PHÂN LOẠI PHÙ HỢP TRONG DANH SÁCH CATEGORIES HIỆN CÓ CỦA NGƯỜI DÙNG
    function findCategoryMatch(targetCat) {
      if (!targetCat) return '';
      if (categories.includes(targetCat)) return targetCat;
      if (isLogicCategory(targetCat)) {
        const found = categories.find(c => isLogicCategory(c));
        if (found) return found;
      }
      const tLower = targetCat.toLowerCase().trim();
      const partial = categories.find(c => {
        const cl = c.toLowerCase().trim();
        return cl === tLower || cl.includes(tLower) || tLower.includes(cl);
      });
      if (partial) return partial;
      return categories[0] || targetCat;
    }

    // TRÍCH XUẤT MÃ SỐ CHIP HỌ 74 VỚI WHITELIST CHUẨN XÁC (CHỈ CHẤP NHẬN 74HC, 74LS, 74HCT, 74ALS, 74F, 74...)
    function extract74ChipNumber(rawName) {
      if (!rawName) return null;
      // Bỏ ghi chú kiểu chân trong ngoặc và bỏ hậu tố đóng gói như DIP-14, SOP-16 để không bị dính số chân vào mã chip
      let s = String(rawName).trim().replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '');
      s = s.replace(/(?:DIP|SOP|SOIC|TSSOP|QFP|QFN|PDIP|CDIP)[\s\-_0-9]*/gi, '');
      const tokens = s.split(/[\s,/]+/);
      let targetToken = tokens.find(t => /74/i.test(t)) || tokens[0] || '';
      let clean = targetToken.toUpperCase().replace(/^(?:IC|CHIP)/i, '').replace(/[\s\-_]/g, '');

      // Whitelist họ 74 chuẩn:
      // Tiền tố hãng: SN, HD, DM, MC, TC, MM, TI, GD, KS, UT... (hoặc rỗng)
      // Base: 74 hoặc 54
      // Family whitelist: HC, HCT, LS, ALS, F, ACT, AC, AHC, AHCT, LVC, LV, VHC, VHCT, S, C, L (hoặc rỗng cho chuẩn 74xx TTL gốc)
      // Số chip: 2 đến 4 chữ số (\d{2,4})
      // Hậu tố vỏ / package: chỉ chữ cái ([A-Z]*), TUYỆT ĐỐI KHÔNG ĐƯỢC CHỨA SỐ
      const m = clean.match(/^(?:SN|HD|DM|MC|TC|MM|TI|GD|KS|UT)?(?:74|54)(HC|HCT|LS|ALS|F|ACT|AC|AHC|AHCT|LVC|LV|VHC|VHCT|S|C|L)?(\d{2,4})([A-Z]*)$/i);
      if (!m) return null;
      return m[2];
    }

    // KIỂM TRA CHIP CÓ KHỚP ĐÚNG SỐ CODE 74 HAY KHÔNG (Tránh 74HC138 bị ăn nhầm vào 74xx13)
    function isMatching74Code(partName, code) {
      const chipNum = extract74ChipNumber(partName);
      if (!chipNum) return false;

      // 1. So khớp chính xác số (exact match)
      if (chipNum === code) return true;

      // 2. So khớp trường hợp có / không có số 0 ở đầu (VD: '4' vs '04')
      if (parseInt(chipNum, 10) === parseInt(code, 10)) {
        if (chipNum.length >= 2 && code.length >= 2) {
          return chipNum === code;
        }
        return (code === '0' + chipNum) || (chipNum === '0' + code);
      }

      return false;
    }

    function getPartsMatching74Code(code) {
      return parts.filter(p => isMatching74Code(p.name, code));
    }



    // ================= TỰ ĐỘNG TRA CỨU CHỨC NĂNG IC (KNOWLEDGE BASE) =================
    const LOGIC_74_MAP = {
      '00': { desc: '4 cổng NAND 2 ngõ vào (Quad 2-Input NAND)', pkg: 'DIP-14', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/7400_pinout.svg/500px-7400_pinout.svg.png' },
      '01': { desc: '4 cổng NAND 2 ngõ vào cực thu hở (Open Collector)', pkg: 'DIP-14' },
      '02': { desc: '4 cổng NOR 2 ngõ vào (Quad 2-Input NOR)', pkg: 'DIP-14', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/7402_pinout.svg/500px-7402_pinout.svg.png' },
      '03': { desc: '4 cổng NAND 2 ngõ vào cực thu hở', pkg: 'DIP-14' },
      '04': { desc: '6 cổng đảo NOT (Hex Inverter)', pkg: 'DIP-14', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/7404_pinout.svg/500px-7404_pinout.svg.png' },
      '05': { desc: '6 cổng đảo NOT cực thu hở (Hex Inverter Open Collector)', pkg: 'DIP-14' },
      '06': { desc: '6 bộ đệm đảo áp cao cực thu hở (Hex Inverting Buffer)', pkg: 'DIP-14' },
      '07': { desc: '6 bộ đệm không đảo áp cao cực thu hở (Hex Buffer)', pkg: 'DIP-14' },
      '08': { desc: '4 cổng AND 2 ngõ vào (Quad 2-Input AND)', pkg: 'DIP-14', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/7408_pinout.svg/500px-7408_pinout.svg.png' },
      '09': { desc: '4 cổng AND 2 ngõ vào cực thu hở', pkg: 'DIP-14' },
      '10': { desc: '3 cổng NAND 3 ngõ vào (Triple 3-Input NAND)', pkg: 'DIP-14', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/7410_pinout.svg/500px-7410_pinout.svg.png' },
      '11': { desc: '3 cổng AND 3 ngõ vào (Triple 3-Input AND)', pkg: 'DIP-14' },
      '12': { desc: '3 cổng NAND 3 ngõ vào cực thu hở', pkg: 'DIP-14' },
      '13': { desc: '2 cổng NAND 4 ngõ vào kích Schmitt Trigger', pkg: 'DIP-14' },
      '14': { desc: '6 cổng đảo Schmitt Trigger (Hex Schmitt Inverter)', pkg: 'DIP-14', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/7404_pinout.svg/500px-7404_pinout.svg.png' },
      '20': { desc: '2 cổng NAND 4 ngõ vào (Dual 4-Input NAND)', pkg: 'DIP-14', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/7420_pinout.svg/500px-7420_pinout.svg.png' },
      '21': { desc: '2 cổng AND 4 ngõ vào (Dual 4-Input AND)', pkg: 'DIP-14' },
      '27': { desc: '3 cổng NOR 3 ngõ vào (Triple 3-Input NOR)', pkg: 'DIP-14' },
      '30': { desc: '1 cổng NAND 8 ngõ vào (8-Input NAND Gate)', pkg: 'DIP-14' },
      '32': { desc: '4 cổng OR 2 ngõ vào (Quad 2-Input OR)', pkg: 'DIP-14', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/7432_pinout.svg/500px-7432_pinout.svg.png' },
      '42': { desc: 'Bộ giải mã BCD sang Thập phân (BCD-to-Decimal Decoder)', pkg: 'DIP-16' },
      '47': { desc: 'Bộ giải mã BCD sang LED 7 đoạn Anode chung (Open Collector)', pkg: 'DIP-16', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/7447_pinout.svg/500px-7447_pinout.svg.png' },
      '48': { desc: 'Bộ giải mã BCD sang LED 7 đoạn Cathode chung kéo lên nội', pkg: 'DIP-16' },
      '73': { desc: 'Dual J-K Flip-Flop kép có chân Reset xóa bất đồng bộ', pkg: 'DIP-14' },
      '74': { desc: 'Dual D-Type Flip-Flop kép kích cạnh dương có Set/Reset', pkg: 'DIP-14', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/7474_pinout.svg/500px-7474_pinout.svg.png' },
      '75': { desc: '4 chốt dữ liệu D bistable (Quad Bistable Latch)', pkg: 'DIP-16' },
      '76': { desc: 'Dual J-K Flip-Flop kép có cả chân Preset và Clear', pkg: 'DIP-16' },
      '83': { desc: 'Bộ cộng nhị phân 4-bit có nhớ (4-bit Binary Full Adder)', pkg: 'DIP-16' },
      '85': { desc: 'Bộ so sánh độ lớn nhị phân 4-bit (4-bit Magnitude Comparator)', pkg: 'DIP-16' },
      '86': { desc: '4 cổng XOR 2 ngõ vào (Quad 2-Input Exclusive-OR)', pkg: 'DIP-14', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/7486_pinout.svg/500px-7486_pinout.svg.png' },
      '90': { desc: 'Bộ đếm thập phân chia 10 bất đồng bộ (Decade Counter)', pkg: 'DIP-14' },
      '93': { desc: 'Bộ đếm nhị phân 4-bit chia 16 bất đồng bộ (4-bit Binary Counter)', pkg: 'DIP-14' },
      '123': { desc: 'Dual Monostable Multivibrator kép kích lại được (One-Shot Timer)', pkg: 'DIP-16' },
      '125': { desc: '4 bộ đệm 3 trạng thái kích mức thấp (Quad 3-State Buffer)', pkg: 'DIP-14' },
      '126': { desc: '4 bộ đệm 3 trạng thái kích mức cao (Quad 3-State Buffer)', pkg: 'DIP-14' },
      '132': { desc: '4 cổng NAND 2 ngõ vào Schmitt Trigger chống nhiễu', pkg: 'DIP-14' },
      '138': { desc: 'Bộ giải mã / giải dồn kênh 3-sang-8 (3-to-8 Line Decoder/Demux)', pkg: 'DIP-16', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/74138_pinout.svg/500px-74138_pinout.svg.png' },
      '139': { desc: 'Bộ giải mã 2-sang-4 kép (Dual 2-to-4 Line Decoder/Demux)', pkg: 'DIP-16' },
      '147': { desc: 'Bộ mã hóa ưu tiên 10-sang-4 BCD (10-to-4 Priority Encoder)', pkg: 'DIP-16' },
      '148': { desc: 'Bộ mã hóa ưu tiên 8-sang-3 (8-to-3 Priority Encoder)', pkg: 'DIP-16' },
      '151': { desc: 'Bộ chọn dữ liệu / dồn kênh 8-sang-1 (8-to-1 Multiplexer)', pkg: 'DIP-16' },
      '153': { desc: 'Bộ dồn kênh 4-sang-1 kép (Dual 4-to-1 Multiplexer)', pkg: 'DIP-16' },
      '154': { desc: 'Bộ giải mã / giải dồn kênh 4-sang-16 (4-to-16 Line Decoder)', pkg: 'DIP-24' },
      '157': { desc: 'Bộ chọn dữ liệu 2-sang-1 4-kênh không đảo (Quad 2-to-1 MUX)', pkg: 'DIP-16' },
      '160': { desc: 'Bộ đếm BCD đồng bộ thập phân có nạp song song (Sync BCD Counter)', pkg: 'DIP-16' },
      '161': { desc: 'Bộ đếm nhị phân đồng bộ 4-bit có nạp song song (Sync 4-bit Counter)', pkg: 'DIP-16', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/74161_pinout.svg/500px-74161_pinout.svg.png' },
      '163': { desc: 'Bộ đếm nhị phân đồng bộ 4-bit có nạp và xóa đồng bộ', pkg: 'DIP-16' },
      '164': { desc: 'Thanh ghi dịch 8-bit nối tiếp sang song song (Serial-In Parallel-Out)', pkg: 'DIP-14' },
      '165': { desc: 'Thanh ghi dịch 8-bit song song sang nối tiếp (Parallel-In Serial-Out)', pkg: 'DIP-16' },
      '173': { desc: 'Thanh ghi 4 D-Flip-Flop ngõ ra 3 trạng thái có nạp dữ liệu', pkg: 'DIP-16' },
      '174': { desc: 'Thanh ghi 6 D-Flip-Flop (Hex D-Type Flip-Flop with Reset)', pkg: 'DIP-16' },
      '175': { desc: 'Thanh ghi 4 D-Flip-Flop ngõ ra bù đảo (Quad D Flip-Flop)', pkg: 'DIP-16' },
      '181': { desc: 'Khối số học logic ALU 4-bit (4-bit Arithmetic Logic Unit)', pkg: 'DIP-24' },
      '190': { desc: 'Bộ đếm lên/xuống BCD thập phân đồng bộ nạp trước được', pkg: 'DIP-16' },
      '191': { desc: 'Bộ đếm lên/xuống nhị phân 4-bit đồng bộ nạp trước được', pkg: 'DIP-16' },
      '192': { desc: 'Bộ đếm lên/xuống thập phân BCD 2 ngõ xung Clock riêng biệt', pkg: 'DIP-16' },
      '193': { desc: 'Bộ đếm lên/xuống nhị phân 4-bit 2 ngõ xung Clock riêng biệt', pkg: 'DIP-16' },
      '240': { desc: 'Bộ đệm bus 8 đường đảo ngõ ra 3 trạng thái (Octal Inverting Buffer)', pkg: 'DIP-20' },
      '244': { desc: 'Bộ đệm bus 8 đường không đảo 3 trạng thái (Octal Buffer/Line Driver)', pkg: 'DIP-20' },
      '245': { desc: 'Bộ thu phát bus 8-bit 2 chiều (Octal Non-Inverting Bus Transceiver)', pkg: 'DIP-20', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/74245_pinout.svg/500px-74245_pinout.svg.png' },
      '259': { desc: 'Chốt dữ liệu 8-bit định địa chỉ (8-Bit Addressable Latch)', pkg: 'DIP-16' },
      '273': { desc: 'Thanh ghi 8 D-Flip-Flop kích cạnh dương có chân Master Reset', pkg: 'DIP-20' },
      '283': { desc: 'Bộ cộng nhị phân 4-bit tốc độ cao (4-bit Binary Full Adder)', pkg: 'DIP-16' },
      '373': { desc: 'Chốt dữ liệu trong suốt 8-bit ngõ ra 3 trạng thái (Octal D Latch)', pkg: 'DIP-20' },
      '374': { desc: 'Thanh ghi 8 D-Flip-Flop kích cạnh ngõ ra 3 trạng thái', pkg: 'DIP-20' },
      '377': { desc: 'Thanh ghi 8 D-Flip-Flop có chân Clock Enable cho phép ghi', pkg: 'DIP-20' },
      '541': { desc: 'Bộ đệm bus 8 đường chân thẳng hàng dễ layout (Octal Buffer)', pkg: 'DIP-20' },
      '573': { desc: 'Chốt dữ liệu 8-bit chân thẳng hàng dễ đi dây mạch (Octal D Latch)', pkg: 'DIP-20' },
      '574': { desc: 'Thanh ghi 8 D-Flip-Flop chân thẳng hàng dễ layout (Octal D Flip-Flop)', pkg: 'DIP-20' },
      '595': { desc: 'Thanh ghi dịch 8-bit ngõ ra chốt 3 trạng thái (Shift Register)', pkg: 'DIP-16', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/74HC595_pinout.svg/500px-74HC595_pinout.svg.png' },
      '688': { desc: 'Bộ so sánh đẳng thức 8-bit (8-Bit Identity Comparator)', pkg: 'DIP-20' }
    };

    const EXACT_IC_KNOWLEDGE = {
      // Drivers & Transistor Arrays
      'ULN2803': { desc: 'Mảng 8 transistor Darlington công suất kéo relay/động cơ 50V 500mA', pkg: 'DIP-18', cat: 'Công suất', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/ULN2803_pinout.svg/500px-ULN2803_pinout.svg.png' },
      'ULN2003': { desc: 'Mảng 7 transistor Darlington công suất kéo relay/stepper 50V 500mA', pkg: 'DIP-16', cat: 'Công suất', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/ULN2003A_Pinout.svg/500px-ULN2003A_Pinout.svg.png' },
      'L293D': { desc: 'IC cầu H đôi điều khiển động cơ DC / Stepper có diode dập xung', pkg: 'DIP-16', cat: 'Công suất', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/L293D_Pinout.svg/500px-L293D_Pinout.svg.png' },
      'L298N': { desc: 'IC cầu H đôi công suất lớn điều khiển 2 động cơ DC (Dual Full-Bridge 2A)', pkg: 'Multiwatt-15', cat: 'Công suất' },
      'A4988': { desc: 'Module điều khiển động cơ bước vi bước vi sai (Microstepping Driver)', pkg: 'Module', cat: 'Công suất' },
      'DRV8825': { desc: 'Module điều khiển động cơ bước dòng cao tới 2.5A vi bước 1/32', pkg: 'Module', cat: 'Công suất' },

      // Timers & Analog / Op-Amps
      'NE555': { desc: 'IC định thời / tạo dao động xung vuông (Precision Timer)', pkg: 'DIP-8', cat: 'Analog / Op-Amp', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/NE555_Pinout.svg/500px-NE555_Pinout.svg.png' },
      'LM555': { desc: 'IC định thời / tạo dao động xung vuông (Precision Timer)', pkg: 'DIP-8', cat: 'Analog / Op-Amp', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/NE555_Pinout.svg/500px-NE555_Pinout.svg.png' },
      'NE556': { desc: 'IC định thời kép tích hợp 2 bộ 555 riêng biệt (Dual Timer)', pkg: 'DIP-14', cat: 'Analog / Op-Amp' },
      'LM358': { desc: 'Bộ khuếch đại thuật toán kép nguồn đơn (Dual Op-Amp)', pkg: 'DIP-8', cat: 'Analog / Op-Amp', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/LM358_pinout.svg/500px-LM358_pinout.svg.png' },
      'LM324': { desc: 'Bộ khuếch đại thuật toán 4 kênh nguồn đơn (Quad Op-Amp)', pkg: 'DIP-14', cat: 'Analog / Op-Amp', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LM324_pinout.svg/500px-LM324_pinout.svg.png' },
      'LM393': { desc: 'Bộ so sánh điện áp kép ngõ ra cực thu hở (Dual Voltage Comparator)', pkg: 'DIP-8', cat: 'Analog / Op-Amp' },
      'LM339': { desc: 'Bộ so sánh điện áp 4 kênh ngõ ra cực thu hở (Quad Comparator)', pkg: 'DIP-14', cat: 'Analog / Op-Amp' },
      'LM386': { desc: 'IC khuếch đại âm thanh công suất nhỏ nguồn thấp 300mW (Audio Amp)', pkg: 'DIP-8', cat: 'Analog / Op-Amp' },
      'TL072': { desc: 'Op-Amp kép ngõ vào JFET âm thanh độ nhiễu thấp (Dual JFET Op-Amp)', pkg: 'DIP-8', cat: 'Analog / Op-Amp' },
      'TL082': { desc: 'Op-Amp kép ngõ vào JFET tốc độ đáp ứng cao (Wide Bandwidth Op-Amp)', pkg: 'DIP-8', cat: 'Analog / Op-Amp' },
      'TL074': { desc: 'Op-Amp 4 kênh ngõ vào JFET âm thanh chất lượng cao (Quad Op-Amp)', pkg: 'DIP-14', cat: 'Analog / Op-Amp' },
      'TL084': { desc: 'Op-Amp 4 kênh ngõ vào JFET đa dụng (Quad JFET Op-Amp)', pkg: 'DIP-14', cat: 'Analog / Op-Amp' },
      'NE5532': { desc: 'Op-Amp kép âm thanh Hi-Fi độ ồn siêu thấp (Dual Audio Op-Amp)', pkg: 'DIP-8', cat: 'Analog / Op-Amp' },
      'OP07': { desc: 'Op-Amp độ chính xác cao bù điện áp siêu thấp (Ultra-Low Offset Op-Amp)', pkg: 'DIP-8', cat: 'Analog / Op-Amp' },
      'MCP6002': { desc: 'Op-Amp kép Rail-to-Rail nguồn đơn 1.8V-6V tiết kiệm điện', pkg: 'DIP-8', cat: 'Analog / Op-Amp' },
      'MCP602': { desc: 'Op-Amp kép Rail-to-Rail tốc độ cao 2.8MHz nguồn đơn', pkg: 'DIP-8', cat: 'Analog / Op-Amp' },

      // Voltage Regulators & Power
      'LM7805': { desc: 'IC ổn áp tuyến tính ngõ ra +5V 1.5A', pkg: 'TO-220', cat: 'Công suất', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/7805_Pinout.svg/500px-7805_Pinout.svg.png' },
      '7805': { desc: 'IC ổn áp tuyến tính ngõ ra +5V 1.5A', pkg: 'TO-220', cat: 'Công suất', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/7805_Pinout.svg/500px-7805_Pinout.svg.png' },
      'LM7809': { desc: 'IC ổn áp tuyến tính ngõ ra +9V 1.5A', pkg: 'TO-220', cat: 'Công suất' },
      'LM7812': { desc: 'IC ổn áp tuyến tính ngõ ra +12V 1.5A', pkg: 'TO-220', cat: 'Công suất' },
      '7812': { desc: 'IC ổn áp tuyến tính ngõ ra +12V 1.5A', pkg: 'TO-220', cat: 'Công suất' },
      'LM7905': { desc: 'IC ổn áp tuyến tính ngõ ra nguồn âm -5V 1.5A', pkg: 'TO-220', cat: 'Công suất' },
      'LM7912': { desc: 'IC ổn áp tuyến tính ngõ ra nguồn âm -12V 1.5A', pkg: 'TO-220', cat: 'Công suất' },
      'LM317': { desc: 'IC ổn áp tuyến tính điều chỉnh điện áp dương (1.2V - 37V 1.5A)', pkg: 'TO-220', cat: 'Công suất' },
      'LM337': { desc: 'IC ổn áp tuyến tính điều chỉnh điện áp âm (-1.2V - -37V 1.5A)', pkg: 'TO-220', cat: 'Công suất' },
      'AMS1117-3.3': { desc: 'IC ổn áp LDO 3.3V 800mA (Low-Dropout Voltage Regulator)', pkg: 'SOT-223', cat: 'Công suất' },
      'AMS1117-5.0': { desc: 'IC ổn áp LDO 5V 800mA (Low-Dropout Voltage Regulator)', pkg: 'SOT-223', cat: 'Công suất' },
      'AMS1117-ADJ': { desc: 'IC ổn áp LDO điều chỉnh điện áp ngõ ra (Adjustable LDO)', pkg: 'SOT-223', cat: 'Công suất' },
      'LM2596': { desc: 'IC/Module hạ áp xung Buck DC-DC 3A tần số 150kHz', pkg: 'TO-263 / Module', cat: 'Công suất' },
      'XL4015': { desc: 'Module hạ áp xung Buck DC-DC 5A hiệu suất cao', pkg: 'Module', cat: 'Công suất' },
      'MT3608': { desc: 'IC/Module tăng áp xung Boost DC-DC 2A', pkg: 'SOT23-6 / Module', cat: 'Công suất' },
      'TP4056': { desc: 'IC/Module sạc pin Lithium-ion 1S 1A kèm bảo vệ ngắt sạc', pkg: 'SOP-8 / Module', cat: 'Công suất' },

      // Memory & Microcontrollers
      'AT28C64': { desc: 'Bộ nhớ EEPROM song song 64K (8K x 8-bit Parallel EEPROM)', pkg: 'DIP-28', cat: 'Logic IC' },
      'AT28C64B': { desc: 'Bộ nhớ EEPROM song song 64K (8K x 8-bit Parallel EEPROM)', pkg: 'DIP-28', cat: 'Logic IC' },
      'AT28C256': { desc: 'Bộ nhớ EEPROM song song 256K (32K x 8-bit Parallel EEPROM)', pkg: 'DIP-28', cat: 'Logic IC' },
      'HM62256': { desc: 'Bộ nhớ RAM tĩnh SRAM 32K x 8-bit tốc độ cao (Static RAM)', pkg: 'DIP-28', cat: 'Logic IC' },
      '24C02': { desc: 'Bộ nhớ EEPROM nối tiếp I2C 2Kbit', pkg: 'DIP-8 / SOP-8', cat: 'Logic IC' },
      '24C08': { desc: 'Bộ nhớ EEPROM nối tiếp I2C 8Kbit', pkg: 'DIP-8 / SOP-8', cat: 'Logic IC' },
      '24C32': { desc: 'Bộ nhớ EEPROM nối tiếp I2C 32Kbit', pkg: 'DIP-8 / SOP-8', cat: 'Logic IC' },
      '24C256': { desc: 'Bộ nhớ EEPROM nối tiếp I2C 256Kbit (32KB)', pkg: 'DIP-8 / SOP-8', cat: 'Logic IC' },
      'W25Q32': { desc: 'Bộ nhớ Flash SPI dung lượng 32Mbit (4MB SPI Flash)', pkg: 'SOP-8', cat: 'Logic IC' },
      'W25Q64': { desc: 'Bộ nhớ Flash SPI dung lượng 64Mbit (8MB SPI Flash)', pkg: 'SOP-8', cat: 'Logic IC' },
      'ESP32': { desc: 'Vi điều khiển Wi-Fi + Bluetooth BLE lõi kép 240MHz (NodeMCU ESP-32S)', pkg: 'Module / DIP-30', cat: 'MCU / Board' },
      'ESP8266': { desc: 'Vi điều khiển tích hợp Wi-Fi 80MHz (NodeMCU Lua, ESP-12F, D1 Mini)', pkg: 'Module', cat: 'MCU / Board' },
      'STM32F103C8T6': { desc: 'Vi điều khiển ARM Cortex-M3 32-bit 72MHz 64KB Flash (Blue Pill)', pkg: 'LQFP-48 / Module', cat: 'MCU / Board' },
      'ATMEGA328P': { desc: 'Vi điều khiển AVR 8-bit 32KB Flash 16MHz (Chip Arduino Uno/Nano)', pkg: 'DIP-28 / TQFP-32', cat: 'MCU / Board' },
      'ATTINY85': { desc: 'Vi điều khiển AVR 8 chân nhỏ gọn 8KB Flash 20MHz', pkg: 'DIP-8', cat: 'MCU / Board' },
      'RP2040': { desc: 'Vi điều khiển Raspberry Pi lõi kép ARM Cortex-M0+ 133MHz', pkg: 'QFN-56 / Module', cat: 'MCU / Board' },

      // Opto & Interface
      'PC817': { desc: 'Cách ly quang 1 kênh (Optocoupler Phototransistor 5kV)', pkg: 'DIP-4', cat: 'Công suất', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/PC817_Pinout.svg/500px-PC817_Pinout.svg.png' },
      '4N35': { desc: 'Cách ly quang ngõ ra Phototransistor có chân cực Base', pkg: 'DIP-6', cat: 'Công suất' },
      'MAX232': { desc: 'IC chuyển đổi mức tín hiệu RS-232 sang TTL (kèm bơm điện tích)', pkg: 'DIP-16', cat: 'Logic IC', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/MAX232_Pinout.svg/500px-MAX232_Pinout.svg.png' },
      'MAX485': { desc: 'IC thu phát truyền thông vi sai RS-485 / Modbus công nghiệp', pkg: 'DIP-8', cat: 'Logic IC' },
      'CH340G': { desc: 'IC chuyển đổi giao tiếp USB sang UART / Serial', pkg: 'SOP-16', cat: 'Logic IC' },
      'CP2102': { desc: 'IC cầu USB sang UART tốc độ cao độ ổn định cao', pkg: 'QFN-28', cat: 'Logic IC' },
      'MAX7219': { desc: 'IC điều khiển ma trận LED 8x8 hoặc 8 LED 7 đoạn qua SPI', pkg: 'DIP-24 / SOP-24', cat: 'Logic IC' },
      'DS1307': { desc: 'IC đồng hồ thời gian thực RTC đếm giây/phút/ngày qua I2C', pkg: 'DIP-8', cat: 'Logic IC' },
      'DS3231': { desc: 'IC đồng hồ thời gian thực RTC chính xác cao bù nhiệt TCXO', pkg: 'SO-16', cat: 'Logic IC' },
      'PCF8574': { desc: 'IC mở rộng 8 ngõ I/O qua giao tiếp 2 dây I2C (cho LCD 1602/2004)', pkg: 'DIP-16', cat: 'Logic IC' },
      'MCP2515': { desc: 'IC điều khiển mạng CAN Bus qua giao tiếp SPI', pkg: 'DIP-18', cat: 'Logic IC' },
      'ADS1115': { desc: 'Bộ chuyển đổi tương tự sang số ADC 16-bit 4 kênh I2C', pkg: 'MSOP-10 / Module', cat: 'Cảm biến / Module' },
      'HX711': { desc: 'Module khuếch đại cảm biến tải trọng Loadcell 24-bit ADC', pkg: 'Module', cat: 'Cảm biến / Module' },

      // Sensors & Displays
      'BME280': { desc: 'Cảm biến nhiệt độ, độ ẩm và áp suất khí quyển chính xác cao I2C/SPI', pkg: 'Module', cat: 'Cảm biến / Module' },
      'BMP280': { desc: 'Cảm biến nhiệt độ và áp suất khí quyển I2C/SPI', pkg: 'Module', cat: 'Cảm biến / Module' },
      'DHT11': { desc: 'Cảm biến nhiệt độ và độ ẩm kỹ thuật số 1 dây giá rẻ', pkg: 'Module / 4-pin', cat: 'Cảm biến / Module' },
      'DHT22': { desc: 'Cảm biến nhiệt độ và độ ẩm kỹ thuật số độ chính xác cao', pkg: 'Module / 4-pin', cat: 'Cảm biến / Module' },
      'DS18B20': { desc: 'Cảm biến nhiệt độ kỹ thuật số chống nước 1-Wire Bus', pkg: 'TO-92 / Dây cáp', cat: 'Cảm biến / Module' },
      'MPU6050': { desc: 'Cảm biến con quay hồi chuyển & gia tốc kế 6 trục (6-DoF IMU I2C)', pkg: 'Module', cat: 'Cảm biến / Module' },
      'HC-SR04': { desc: 'Cảm biến khoảng cách bằng sóng siêu âm (2cm - 400cm)', pkg: 'Module', cat: 'Cảm biến / Module' },
      'SSD1306': { desc: 'Màn hình OLED 0.96 inch 128x64 giao tiếp I2C/SPI', pkg: 'Module', cat: 'Cảm biến / Module' },

      // Transistors & Diodes
      '2N2222': { desc: 'Transistor NPN đa dụng chuyển mạch & khuếch đại 800mA 40V', pkg: 'TO-92', cat: 'Diode / Transistor' },
      '2N3904': { desc: 'Transistor NPN đa dụng tín hiệu nhỏ 200mA 40V', pkg: 'TO-92', cat: 'Diode / Transistor' },
      '2N3906': { desc: 'Transistor PNP đa dụng tín hiệu nhỏ 200mA 40V', pkg: 'TO-92', cat: 'Diode / Transistor' },
      'BC547': { desc: 'Transistor NPN khuếch đại âm thanh và tín hiệu nhỏ độ nhiễu thấp', pkg: 'TO-92', cat: 'Diode / Transistor' },
      'BC557': { desc: 'Transistor PNP khuếch đại âm thanh và tín hiệu nhỏ độ nhiễu thấp', pkg: 'TO-92', cat: 'Diode / Transistor' },
      'TIP120': { desc: 'Transistor Darlington NPN công suất kéo relay/động cơ 5A 60V', pkg: 'TO-220', cat: 'Công suất' },
      'TIP122': { desc: 'Transistor Darlington NPN công suất 5A 100V', pkg: 'TO-220', cat: 'Công suất' },
      'TIP127': { desc: 'Transistor Darlington PNP công suất 5A 100V', pkg: 'TO-220', cat: 'Công suất' },
      'IRFZ44N': { desc: 'MOSFET kênh N công suất 55V 49A Rds(on) 17.5mΩ', pkg: 'TO-220', cat: 'Công suất' },
      'IRF540N': { desc: 'MOSFET kênh N công suất 100V 33A Rds(on) 44mΩ', pkg: 'TO-220', cat: 'Công suất' },
      'IRLB3034': { desc: 'MOSFET kênh N Logic-Level kích mở trực tiếp 3.3V/5V 40V 195A Rds 1.4mΩ', pkg: 'TO-220', cat: 'Công suất' },
      'IRF9540N': { desc: 'MOSFET kênh P công suất -100V -23A Rds(on) 117mΩ', pkg: 'TO-220', cat: 'Công suất' },
      '1N4007': { desc: 'Diode chỉnh lưu điện áp cao 1A 1000V', pkg: 'DO-41', cat: 'Diode / Transistor' },
      '1N4001': { desc: 'Diode chỉnh lưu 1A 50V', pkg: 'DO-41', cat: 'Diode / Transistor' },
      '1N4148': { desc: 'Diode chuyển mạch tốc độ cao tín hiệu nhỏ (High-speed Switching Diode)', pkg: 'DO-35', cat: 'Diode / Transistor' },
      '1N5819': { desc: 'Diode Schottky sụt áp thấp tốc độ cao 1A 40V', pkg: 'DO-41', cat: 'Diode / Transistor' },
      '1N5822': { desc: 'Diode Schottky dòng lớn sụt áp thấp 3A 40V', pkg: 'DO-201AD', cat: 'Diode / Transistor' },
      'SS14': { desc: 'Diode Schottky dán SMD sụt áp thấp 1A 40V', pkg: 'SMA', cat: 'Diode / Transistor' },
      'SS34': { desc: 'Diode Schottky dán SMD sụt áp thấp 3A 40V', pkg: 'SMC', cat: 'Diode / Transistor' }
    };

    function lookupComponentKnowledge(rawName) {
      if (!rawName) return null;
      let clean = rawName.trim().toUpperCase();

      if (EXACT_IC_KNOWLEDGE[clean]) {
        return EXACT_IC_KNOWLEDGE[clean];
      }

      let stripped = clean.replace(/^(SN|MC|HD|DM|TC|HCF|HEF|MM|TI)/i, '');
      if (EXACT_IC_KNOWLEDGE[stripped]) {
        return EXACT_IC_KNOWLEDGE[stripped];
      }

      const m74 = clean.match(/^74([A-Z]{0,4})?(\d{2,3})([A-Z0-9]*)$/i) || stripped.match(/^74([A-Z]{0,4})?(\d{2,3})([A-Z0-9]*)$/i);
      if (m74) {
        const code = m74[2];
        if (LOGIC_74_MAP[code]) {
          const item = LOGIC_74_MAP[code];
          return {
            desc: item.desc,
            pkg: item.pkg,
            pinout: item.pinout || null,
            cat: 'Logic IC'
          };
        }
      }

      const m40 = clean.match(/^(?:CD)?40(\d{2,3})([A-Z0-9]*)$/i) || stripped.match(/^(?:CD)?40(\d{2,3})([A-Z0-9]*)$/i);
      if (m40) {
        const full40 = 'CD40' + m40[1];
        if (EXACT_IC_KNOWLEDGE[full40]) return EXACT_IC_KNOWLEDGE[full40];
        const map40 = {
          '01': { desc: '4 cổng NOR CMOS 2 ngõ vào (Quad 2-Input NOR)', pkg: 'DIP-14' },
          '11': { desc: '4 cổng NAND CMOS 2 ngõ vào (Quad 2-Input NAND)', pkg: 'DIP-14' },
          '13': { desc: 'Dual D-Type Flip-Flop CMOS kép', pkg: 'DIP-14' },
          '17': { desc: 'Bộ đếm thập phân Johnson 10 ngõ ra (Decade Counter)', pkg: 'DIP-16', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/CD4017_Pinout.svg/500px-CD4017_Pinout.svg.png' },
          '26': { desc: 'Bộ đếm thập phân giải mã trực tiếp ra LED 7 đoạn', pkg: 'DIP-16' },
          '49': { desc: '6 bộ đệm đảo mức tín hiệu logic cao xuống thấp', pkg: 'DIP-16' },
          '51': { desc: 'Bộ dồn/giải dồn kênh Analog 8 kênh (8-Channel Analog Mux)', pkg: 'DIP-16' },
          '60': { desc: 'Bộ dao động kèm bộ đếm nhị phân 14 giai đoạn', pkg: 'DIP-16' },
          '66': { desc: '4 công tắc song công Analog/Digital (Quad Bilateral Switch)', pkg: 'DIP-14' },
          '69': { desc: '6 cổng đảo NOT CMOS (Hex Inverter)', pkg: 'DIP-14' },
          '71': { desc: '4 cổng OR CMOS 2 ngõ vào (Quad 2-Input OR)', pkg: 'DIP-14' },
          '81': { desc: '4 cổng AND CMOS 2 ngõ vào (Quad 2-Input AND)', pkg: 'DIP-14' },
          '106': { desc: '6 cổng đảo Schmitt Trigger CMOS (Hex Schmitt Inverter)', pkg: 'DIP-14' }
        };
        if (map40[m40[1]]) {
          return {
            desc: map40[m40[1]].desc,
            pkg: map40[m40[1]].pkg || 'DIP-14',
            pinout: map40[m40[1]].pinout || null,
            cat: 'Logic IC'
          };
        }
      }

      const mReg = clean.match(/^LM7([89])(\d{2})/i) || clean.match(/^7([89])(\d{2})/i);
      if (mReg) {
        const sign = mReg[1] === '8' ? '+' : '-';
        const volt = parseInt(mReg[2], 10);
        return {
          desc: `IC ổn áp tuyến tính ngõ ra ${sign}${volt}V 1.5A`,
          pkg: 'TO-220',
          cat: 'Công suất'
        };
      }

      return null;
    }

    let lastAutoFilledDesc = '';


    // =========================================================================
    // FEATURE 3: TRA CỨU IC THAY THẾ TƯƠNG ĐƯƠNG (CROSS-REFERENCE & DROP-IN IC)
    // =========================================================================

    const EQUIVALENT_IC_DB = {
      // --- OP-AMP & COMPARATOR (CHUẨN CHÂN SO-8 / DIP-8) ---
      'LM358': [
        { name: 'LM2904', type: 'Drop-in 100%', note: 'Phiên bản công nghiệp, dải nhiệt độ rộng (-40°C đến 125°C), cùng sơ đồ chân.' },
        { name: 'NE5532', type: 'Thay thế âm thanh Hi-Fi', note: 'Op-amp âm thanh low noise, méo tiếng siêu thấp (khuyên dùng nguồn đôi ±5V~±15V).' },
        { name: 'TL072', type: 'Thay thế JFET Input', note: 'Trở kháng vào siêu cao (10¹² Ω), tốc độ đáp ứng nhanh (13V/µs), tối ưu tiền khuếch đại âm thanh / cảm biến.' },
        { name: 'TL082', type: 'Thay thế JFET Input', note: 'Cùng họ TL072, chuyên dùng tiền khuếch đại JFET.' },
        { name: 'RC4558', type: 'Drop-in Dual Op-Amp', note: 'Op-amp kép phổ biến, hoạt động ổn định trong các mạch âm thanh và lọc tần số.' },
        { name: 'MCP6002', type: 'Drop-in Rail-to-Rail 3.3V/5V', note: 'Op-amp Rail-to-Rail nguồn đơn 1.8V - 6V, tối ưu tuyệt đối cho Arduino/ESP32.' }
      ],
      'LM324': [
        { name: 'LM2902', type: 'Drop-in 100%', note: 'Quad Op-Amp công nghiệp (-40°C đến 125°C), cùng sơ đồ chân DIP-14.' },
        { name: 'TL074', type: 'Thay thế JFET Quad', note: '4 cổng Op-Amp JFET trở kháng vào cao, chuyên tiền khuếch đại.' },
        { name: 'TL084', type: 'Thay thế JFET Quad', note: 'Tương đương TL074, tốc độ cao (13V/µs).' },
        { name: 'MCP6004', type: 'Drop-in Rail-to-Rail 3.3V/5V', note: 'Quad Op-Amp Rail-to-Rail 1.8V - 6V, tín hiệu ngõ ra đạt sát 0V và VCC.' }
      ],
      'LM741': [
        { name: 'TL071', type: 'Thay thế JFET cao cấp', note: 'Single Op-Amp ngõ vào JFET, méo tiếng thấp, nhanh hơn LM741 nhiều lần.' },
        { name: 'TL081', type: 'Thay thế JFET', note: 'Single Op-Amp tương đương TL071.' },
        { name: 'NE5534', type: 'Thay thế Audio Low-Noise', note: 'Op-amp đơn âm thanh độ ồn cực thấp, cần nguồn đôi ±5V~±15V.' },
        { name: 'OP07', type: 'Thay thế Đo lường chính xác', note: 'Điện áp bù (Offset voltage) cực thấp chỉ vài chục µV, siêu chuẩn cho mạch đo lường/cảm biến.' }
      ],
      'LM393': [
        { name: 'LM2903', type: 'Drop-in 100%', note: 'Dual Comparator công nghiệp (-40°C đến 125°C), ngõ ra Open-Collector, cần trở kéo lên (pull-up).' },
        { name: 'LM393B', type: 'Drop-in Nâng cấp', note: 'Phiên bản cải tiến của TI, chống nhiễu ESD cao hơn.' }
      ],
      'LM339': [
        { name: 'LM2901', type: 'Drop-in 100%', note: 'Quad Comparator công nghiệp, 4 bộ so sánh Open-Collector độc lập.' }
      ],

      // --- TIMER 555 ---
      'NE555': [
        { name: 'LM555', type: 'Drop-in 100%', note: 'IC định thời 555 kinh điển của TI/National Semiconductor (4.5V - 16V).' },
        { name: 'SE555 / SA555', type: 'Drop-in Chuẩn quân sự / Công nghiệp', note: 'Dải nhiệt độ hoạt động chịu nhiệt cao hơn.' },
        { name: 'ICM7555', type: 'Thay thế CMOS Tiết kiệm điện', note: 'Bản CMOS tiêu thụ dòng chỉ ~60µA, chạy được từ 2V - 18V, không bị sụt áp nguồn nhọn lúc đổi trạng thái.' },
        { name: 'TLC555', type: 'Thay thế LinCMOS (TI)', note: 'Bản LinCMOS tốc độ cao lên đến 2.1MHz, ngõ ra Rail-to-Rail, chạy từ 2V.' }
      ],

      // --- REGULATOR (ỔN ÁP TUYẾN TÍNH & LDO) ---
      'LM7805': [
        { name: 'L7805CV', type: 'Drop-in 100%', note: 'Ổn áp 5V 1.5A hãng STMicroelectronics, chân 1=IN, 2=GND, 3=OUT (TO-220).' },
        { name: 'KA7805', type: 'Drop-in 100%', note: 'Ổn áp 5V 1.5A Fairchild/ON Semiconductor.' },
        { name: 'MC7805', type: 'Drop-in 100%', note: 'Ổn áp 5V 1.5A Motorola/ON Semi.' },
        { name: 'LM2940CT-5.0', type: 'Thay thế LDO (Độ sụt áp thấp)', note: 'Cùng sơ đồ chân TO-220, nhưng chỉ cần chênh áp ~0.5V (thay vì 2V như 7805) để ra đủ 5V.' }
      ],
      'LM7812': [
        { name: 'L7812CV', type: 'Drop-in 100%', note: 'Ổn áp 12V 1.5A TO-220.' },
        { name: 'KA7812', type: 'Drop-in 100%', note: 'Ổn áp 12V 1.5A Fairchild.' }
      ],
      'LM317': [
        { name: 'LM317T', type: 'Drop-in 100%', note: 'Ổn áp tuyến tính điều chỉnh điện áp ngõ ra (1.2V - 37V, 1.5A, TO-220: 1=ADJ, 2=OUT, 3=IN).' },
        { name: 'LM117 / LM217', type: 'Drop-in Công nghiệp / Quân sự', note: 'Độ ổn định nhiệt và độ bền chuẩn công nghiệp cao cấp.' }
      ],
      'AMS1117-3.3': [
        { name: 'LM1117-3.3', type: 'Drop-in 100%', note: 'LDO 3.3V 800mA - 1A, cùng sơ đồ chân (1=GND, 2=VOUT, 3=VIN).' },
        { name: 'LD1117V33', type: 'Tương đương', note: 'Phiên bản TO-220 hoặc SOT-223 của STMicro.' }
      ],
      'AMS1117-5.0': [
        { name: 'LM1117-5.0', type: 'Drop-in 100%', note: 'LDO 5V 800mA - 1A.' },
        { name: 'LD1117V50', type: 'Tương đương', note: 'Phiên bản của STMicro.' }
      ],

      // --- DRIVER & OPTOCOUPLER ---
      'ULN2003': [
        { name: 'ULN2003A', type: 'Drop-in 100%', note: 'Mảng 7 transistor Darlington kéo dòng 500mA/kênh, tích hợp diode dập xung ngược.' },
        { name: 'MC1413', type: 'Drop-in 100%', note: 'Tương đương 100% ULN2003 của Motorola.' },
        { name: 'ULN2004', type: 'Tương đương cho CMOS 6-15V', note: 'Tương thích chân, tối ưu kích mở với mức logic CMOS 6V - 15V.' },
        { name: 'ULN2803', type: 'Thay thế 8 kênh (DIP-18)', note: 'Có 8 kênh thay vì 7 kênh, lưu ý lệch chân do vỏ DIP-18.' }
      ],
      'L293D': [
        { name: 'SN754410', type: 'Drop-in Pin-to-Pin Dòng cao hơn', note: 'Cùng sơ đồ chân 16 chân, dòng định mức 1A/kênh (so với 600mA của L293D). Cần thêm diode nếu kéo động cơ công suất lớn.' },
        { name: 'L293', type: 'Tương đương chân', note: 'Dòng 1A nhưng không có sẵn diode kẹp dập xung ngược bên trong ruột chip.' }
      ],
      'PC817': [
        { name: 'EL817', type: 'Drop-in 100%', note: 'Opto cách ly quang 4 chân của Everlight, cùng chân 1=Anode, 2=Cathode, 3=Emitter, 4=Collector.' },
        { name: 'LTV-817', type: 'Drop-in 100%', note: 'Opto của Lite-On, tương thích 100% pin-to-pin.' },
        { name: 'PS2501-1', type: 'Drop-in 100%', note: 'Opto của Renesas / NEC, tốc độ và độ bền cao.' },
        { name: 'TLP521-1', type: 'Drop-in 100%', note: 'Opto của Toshiba 4 chân.' }
      ],

      // --- CMOS 4000 LOGIC SERIES ---
      'CD4017': [
        { name: 'HEF4017B', type: 'Drop-in 100%', note: 'Bộ đếm thập phân 10 ngõ ra (Decade Counter) của Nexperia/Philips (3V - 15V).' },
        { name: 'MC14017B', type: 'Drop-in 100%', note: 'Phiên bản Motorola/ON Semi.' },
        { name: 'HCF4017BE', type: 'Drop-in 100%', note: 'Phiên bản STMicroelectronics.' },
        { name: '74HC4017', type: 'Thay thế CMOS Tốc độ cao', note: 'Chạy điện áp chuẩn 2V - 6V, tốc độ chuyển mạch cao hơn nhiều so với CD4000 cổ điển.' }
      ],
      'CD4011': [
        { name: 'HEF4011B', type: 'Drop-in 100%', note: 'Quad 2-Input NAND gate họ CMOS (3V - 15V).' },
        { name: 'MC14011B', type: 'Drop-in 100%', note: 'Tương đương 100% pin-to-pin.' }
      ],
      'CD4001': [
        { name: 'HEF4001B', type: 'Drop-in 100%', note: 'Quad 2-Input NOR gate họ CMOS (3V - 15V).' },
        { name: 'MC14001B', type: 'Drop-in 100%', note: 'Tương đương 100% pin-to-pin.' }
      ],
      'CD4069': [
        { name: 'HEF4069UB', type: 'Drop-in 100%', note: 'Hex Inverter họ CMOS (3V - 15V).' },
        { name: 'MC14069UB', type: 'Drop-in 100%', note: 'Tương đương 100% pin-to-pin.' }
      ],
      'CD4066': [
        { name: '74HC4066', type: 'Thay thế Tốc độ cao & Ron nhỏ', note: 'Quad Bilateral Analog Switch, điện trở dẫn Ron nhỏ hơn nhiều, tốc độ đóng cắt cao.' },
        { name: 'HEF4066B', type: 'Drop-in 100%', note: 'Tương đương 100% pin-to-pin họ CMOS.' }
      ],

      // --- TRANSISTOR & MOSFET ---
      '2N3904': [
        { name: '2N2222 / PN2222', type: 'Cùng sơ đồ chân (E-B-C), dòng mạnh hơn', note: 'TO-92 chân 1=E, 2=B, 3=C. Dòng Ic chịu được 600mA - 800mA (so với 200mA của 2N3904).' },
        { name: 'BC547 / BC548', type: 'Tương đương NPN (LƯU Ý ĐẢO CHÂN)', note: 'TO-92 thứ tự chân ngược lại: 1=C, 2=B, 3=E! Khi cắm mạch breadboard cần quay ngược 180°.' },
        { name: 'C1815 (2SC1815)', type: 'Tương đương NPN (LƯU Ý CHÂN)', note: 'TO-92 thứ tự chân: 1=E, 2=C, 3=B. Cần chú ý cắm đúng chân Base ở giữa.' }
      ],
      '2N3906': [
        { name: '2N2907', type: 'Cùng sơ đồ chân (E-B-C), dòng mạnh hơn', note: 'PNP TO-92 chân 1=E, 2=B, 3=C. Dòng Ic chịu được 600mA.' },
        { name: 'BC557 / BC558', type: 'Tương đương PNP (LƯU Ý ĐẢO CHÂN)', note: 'PNP TO-92 thứ tự chân ngược lại: 1=C, 2=B, 3=E! Khi cắm cần xoay 180°.' },
        { name: 'A1015 (2SA1015)', type: 'Tương đương PNP (LƯU Ý CHÂN)', note: 'PNP TO-92 thứ tự chân: 1=E, 2=C, 3=B.' }
      ],
      'IRFZ44N': [
        { name: 'IRF3205', type: 'Drop-in Dòng khủng 110A', note: 'N-MOSFET 55V 110A, Rds(on) siêu thấp 8mΩ, chạy mát hơn khi gánh tải nặng.' },
        { name: 'IRF540N', type: 'Drop-in Chịu áp cao 100V', note: 'N-MOSFET 100V 33A, phù hợp mạch nguồn hoặc tải điện áp 24V - 48V.' },
        { name: 'IRLB8721', type: 'Thay thế Logic-Level (3.3V / 5V)', note: 'Kích mở trực tiếp hoàn toàn từ chân GPIO vi điều khiển mà không cần tầng kích Gate 10V!' },
        { name: 'STP55NF06', type: 'Drop-in 100%', note: 'N-MOSFET 60V 50A TO-220 của STMicroelectronics.' }
      ]
    };

    function getEquivalentChips(partName) {
      if (!partName) return [];
      const clean = partName.toUpperCase().trim();
      const results = [];

      // 1. Kiểm tra họ 74xx
      const match74 = clean.match(/^(?:SN|HD|DM|MC|TC)?74([A-Z]{0,4})(\d{2,4})([A-Z0-9]*)$/);
      if (match74) {
        const currentFamily = match74[1] || ''; // 'LS', 'HC', 'HCT', etc.
        const code = match74[2]; // '04', '00', '138', '595'
        
        const subFamilies = [
          {
            fam: 'HCT',
            type: currentFamily === 'LS' ? 'Khuyên dùng thay cho 74LS' : 'Tương đương Pin-to-Pin',
            note: 'Tương thích 100% pin-to-pin. Ngõ vào nhận mức logic TTL 5V chuẩn xác giống 74LS, ngõ ra CMOS tiết kiệm điện.'
          },
          {
            fam: 'HC',
            type: 'Tương thích Pin-to-Pin',
            note: 'Họ High-speed CMOS (2V - 6V), tiêu thụ dòng tĩnh cực nhỏ. Tương thích chân 100%.'
          },
          {
            fam: 'LS',
            type: 'Chuẩn TTL cổ điển',
            note: 'Họ Low-power Schottky phổ biến, ngõ vào chuẩn TTL 5V.'
          },
          {
            fam: 'ALS',
            type: 'Nâng cấp Tốc độ cao',
            note: 'Advanced Low-power Schottky: Nhanh hơn 74LS, tiêu thụ điện năng ít hơn.'
          },
          {
            fam: 'F',
            type: 'Tốc độ cực nhanh (Fast)',
            note: 'Họ Fast Schottky (Fairchild/TI), kéo tải mạnh và tần số hoạt động cao.'
          },
          {
            fam: 'AHC',
            type: 'Advanced High-Speed',
            note: 'Thế hệ CMOS tiên tiến hơn họ HC, tốc độ tăng gấp 3 lần và giảm nhiễu.'
          }
        ];

        subFamilies.forEach(sf => {
          if (sf.fam !== currentFamily) {
            results.push({
              name: `74${sf.fam}${code}`,
              type: sf.type,
              note: sf.note,
              compatibility: '100% Pin-to-pin'
            });
          }
        });

        // Một số mã đặc biệt có chip tương đương chức năng
        if (code === '04') {
          results.push({
            name: '74HC14 / 74LS14',
            type: 'Nâng cấp có Schmitt Trigger',
            note: 'Cùng sơ đồ 6 cổng đảo NOT 14 chân, nhưng có mạch kích Schmitt Trigger giúp chống dội phím và lọc nhiễu ngõ vào cực tốt.',
            compatibility: '100% Pin-to-pin'
          });
        } else if (code === '00') {
          results.push({
            name: '74HC132 / 74LS132',
            type: 'Nâng cấp có Schmitt Trigger',
            note: 'Cùng sơ đồ 4 cổng NAND 2 ngõ vào, có Schmitt Trigger chống dội xung.',
            compatibility: '100% Pin-to-pin'
          });
        } else if (code === '595') {
          results.push({
            name: 'TPIC6B595',
            type: 'Thay thế Kéo Tải Dòng Cao',
            note: 'Power Logic 8-bit Shift Register: Kéo tải trực tiếp lên đến 150mA/kênh cho Relay/LED công suất cao.',
            compatibility: 'Khác chân một số ngõ ra (Cần xem Pinout)'
          });
        }
      }

      // 2. Tra cứu trong cơ sở dữ liệu mẫu EXACT_EQUIVALENT_DB
      let matchedKey = null;
      for (const key in EQUIVALENT_IC_DB) {
        if (clean.includes(key) || key.includes(clean)) {
          matchedKey = key;
          break;
        }
      }

      if (matchedKey) {
        EQUIVALENT_IC_DB[matchedKey].forEach(item => {
          if (!results.some(r => r.name.toLowerCase() === item.name.toLowerCase())) {
            results.push({
              name: item.name,
              type: item.type,
              note: item.note,
              compatibility: item.type.includes('Drop-in') ? '100% Pin-to-pin' : 'Tương đương chức năng'
            });
          }
        });
      }

      return results;
    }

    function findInStockReplacements(partName, currentPartId = null) {
      const candidates = getEquivalentChips(partName);
      if (candidates.length === 0) return [];

      const inStockMatches = [];

      candidates.forEach(cand => {
        const subNames = cand.name.split('/').map(s => s.trim().toUpperCase());

        parts.forEach(p => {
          if (currentPartId && p.id === currentPartId) return;
          if (Number(p.qty || 0) <= 0) return;

          const pClean = p.name.toUpperCase().trim();
          const isMatch = subNames.some(sn => {
            const snBase = sn.replace(/[^A-Z0-9]/g, '');
            const pBase = pClean.replace(/[^A-Z0-9]/g, '');
            return pBase.includes(snBase) || snBase.includes(pBase);
          });

          if (isMatch && !inStockMatches.some(m => m.id === p.id)) {
            inStockMatches.push({
              id: p.id,
              name: p.name,
              package: p.package || '',
              qty: Number(p.qty),
              location: p.location || 'Chưa xếp ô',
              boxId: p.boxId,
              cell: p.cell,
              subCell: p.subCell,
              type: cand.type,
              note: cand.note,
              compatibility: cand.compatibility
            });
          }
        });
      });

      return inStockMatches;
    }

    let currentReplacePartId = null;



    // =========================================================================
    // FEATURE 1: SUB-CATALOG PHÂN LOẠI CHỨC NĂNG SÂU CHO LOGIC IC
    // =========================================================================

    const LOGIC_SUBCAT_LIST = [
      { id: 'Cổng Logic', label: 'Cổng Logic', icon: 'square', desc: 'NAND, NOR, AND, OR, NOT, XOR, XNOR' },
      { id: 'Bộ Nhớ & Chốt', label: 'Bộ Nhớ & Chốt', icon: 'database', desc: 'D Flip-Flop, JK Flip-Flop, D Latch, SRAM, EEPROM' },
      { id: 'Bộ Đếm & Chia Tần', label: 'Bộ Đếm & Chia Tần', icon: 'timer', desc: 'Binary Counter, Decade/BCD Counter, Up/Down Counter' },
      { id: 'Thanh Ghi Dịch', label: 'Thanh Ghi Dịch', icon: 'arrow-right-left', desc: 'Shift Register: SIPO (74595, 74164), PISO (74165)' },
      { id: 'Bộ Chọn & Giải Mã', label: 'Bộ Chọn & Giải Mã', icon: 'git-merge', desc: 'MUX 8-to-1, Demux, 3-to-8 Decoder (74138), LED 7 đoạn (7447)' },
      { id: 'Bộ Đệm & Bus', label: 'Bộ Đệm & Bus', icon: 'binary', desc: 'Octal Buffer (74244, 74541), Bus Transceiver 2 chiều (74245)' },
      { id: 'Số Học & So Sánh', label: 'Số Học & So Sánh', icon: 'calculator', desc: 'Khối ALU (74181), Bộ cộng Full Adder (7483/74283), So sánh (7485)' },
      { id: 'Schmitt & Tạo Xung', label: 'Schmitt & Tạo Xung', icon: 'zap', desc: 'Cổng Schmitt Trigger (7414, 74132), Đơn ổn Monostable (74123)' }
    ];

    let currentLogicSubCategory = 'Tất cả';

    function determineLogicSubcategory(rawName, rawDesc = '') {
      if (!rawName) return '';
      const clean = rawName.toUpperCase().trim();
      const desc = (rawDesc || '').toLowerCase();

      // 1. Kiểm tra theo mã chip họ 74xx
      const m74 = clean.match(/^(?:SN|HD|DM|MC|TC)?74[A-Z]{0,4}(\d{2,4})[A-Z0-9]*$/i) || clean.match(/^74(\d{2,4})/i);
      if (m74) {
        const code = m74[1];

        // Cổng Logic
        if (['00', '01', '02', '03', '04', '05', '08', '09', '10', '11', '12', '20', '21', '27', '30', '32', '86', '260'].includes(code)) {
          return 'Cổng Logic';
        }
        // Schmitt & Tạo xung
        if (['13', '14', '121', '122', '123', '132', '221'].includes(code)) {
          return 'Schmitt & Tạo Xung';
        }
        // Bộ Nhớ & Chốt (Flip-Flop, Latch)
        if (['73', '74', '75', '76', '107', '109', '112', '173', '174', '175', '259', '273', '373', '374', '377', '573', '574'].includes(code)) {
          return 'Bộ Nhớ & Chốt';
        }
        // Bộ Đếm & Chia Tần
        if (['90', '92', '93', '160', '161', '162', '163', '190', '191', '192', '193', '390', '393', '4017', '4020', '4040'].includes(code)) {
          return 'Bộ Đếm & Chia Tần';
        }
        // Thanh Ghi Dịch
        if (['164', '165', '166', '194', '195', '299', '595', '597'].includes(code)) {
          return 'Thanh Ghi Dịch';
        }
        // Bộ Chọn & Giải Mã
        if (['42', '47', '48', '138', '139', '147', '148', '151', '153', '154', '157', '158', '251', '257'].includes(code)) {
          return 'Bộ Chọn & Giải Mã';
        }
        // Bộ Đệm & Bus
        if (['06', '07', '125', '126', '240', '241', '244', '245', '541', '640', '645'].includes(code)) {
          return 'Bộ Đệm & Bus';
        }
        // Số Học & So Sánh
        if (['83', '85', '181', '280', '283', '688'].includes(code)) {
          return 'Số Học & So Sánh';
        }
      }

      // 2. Kiểm tra các chip CMOS 4000
      if (clean.includes('4017') || clean.includes('4020') || clean.includes('4040') || clean.includes('4026') || clean.includes('4033') || clean.includes('4060')) {
        return 'Bộ Đếm & Chia Tần';
      }
      if (clean.includes('4011') || clean.includes('4001') || clean.includes('4069') || clean.includes('4071') || clean.includes('4081') || clean.includes('4070') || clean.includes('4077')) {
        return 'Cổng Logic';
      }
      if (clean.includes('4013') || clean.includes('4027') || clean.includes('4042') || clean.includes('4043') || clean.includes('4044')) {
        return 'Bộ Nhớ & Chốt';
      }
      if (clean.includes('4014') || clean.includes('4015') || clean.includes('4021') || clean.includes('4094')) {
        return 'Thanh Ghi Dịch';
      }
      if (clean.includes('4051') || clean.includes('4052') || clean.includes('4053') || clean.includes('4066') || clean.includes('4067') || clean.includes('4028')) {
        return 'Bộ Chọn & Giải Mã';
      }
      if (clean.includes('4093') || clean.includes('4046') || clean.includes('555') || clean.includes('556')) {
        return 'Schmitt & Tạo Xung';
      }

      // 3. Kiểm tra các bộ nhớ song song & I2C/SPI
      if (clean.includes('28C') || clean.includes('62256') || clean.includes('24C') || clean.includes('W25Q') || desc.includes('eeprom') || desc.includes('sram') || desc.includes('bộ nhớ')) {
        return 'Bộ Nhớ & Chốt';
      }

      // 4. Kiểm tra giao tiếp & Bus driver
      if (clean.includes('MAX232') || clean.includes('MAX485') || clean.includes('CH340') || clean.includes('CP2102') || clean.includes('ULN2803') || clean.includes('ULN2003')) {
        return 'Bộ Đệm & Bus';
      }

      // 5. Kiểm tra theo từ khóa trong mô tả (Description Keyword matching)
      if (desc.includes('cổng đảo') || desc.includes('inverter') || desc.includes('nand') || desc.includes('nor') || desc.includes('xor') || desc.includes('cổng and') || desc.includes('cổng or')) {
        return 'Cổng Logic';
      }
      if (desc.includes('flip-flop') || desc.includes('latch') || desc.includes('chốt') || desc.includes('thanh ghi dữ liệu')) {
        return 'Bộ Nhớ & Chốt';
      }
      if (desc.includes('bộ đếm') || desc.includes('counter') || desc.includes('chia tần')) {
        return 'Bộ Đếm & Chia Tần';
      }
      if (desc.includes('thanh ghi dịch') || desc.includes('shift register') || desc.includes('sipo') || desc.includes('piso')) {
        return 'Thanh Ghi Dịch';
      }
      if (desc.includes('giải mã') || desc.includes('chọn kênh') || desc.includes('dồn kênh') || desc.includes('multiplexer') || desc.includes('decoder') || desc.includes('7 đoạn') || desc.includes('7-segment')) {
        return 'Bộ Chọn & Giải Mã';
      }
      if (desc.includes('bộ đệm') || desc.includes('buffer') || desc.includes('transceiver') || desc.includes('thu phát bus') || desc.includes('line driver')) {
        return 'Bộ Đệm & Bus';
      }
      if (desc.includes('alu') || desc.includes('bộ cộng') || desc.includes('full adder') || desc.includes('so sánh độ lớn') || desc.includes('comparator')) {
        return 'Số Học & So Sánh';
      }
      if (desc.includes('schmitt') || desc.includes('dao động') || desc.includes('tạo xung') || desc.includes('đơn ổn') || desc.includes('multivibrator') || desc.includes('timer')) {
        return 'Schmitt & Tạo Xung';
      }

      return 'Cổng Logic';
    }

