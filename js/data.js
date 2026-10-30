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
    const DEFAULT_CLOUD_URL = 'https://nomiap-fe6e5-default-rtdb.asia-southeast1.firebasedatabase.app/ee_lab_v2.json';
    let cloudUrl = localStorage.getItem('ee_inventory_cloud_url') || DEFAULT_CLOUD_URL;

    // KIỂM TRA PHÂN LOẠI CÓ PHẢI NHÓM LOGIC IC KHÔNG (Hỗ trợ cả tên tùy chỉnh như 'Logic IC (74HC, CD40...)')
    function isLogicCategory(cat) {
      if (!cat) return false;
      const c = String(cat).toLowerCase().trim();
      return c === 'logic ic' || c.includes('logic') || c.includes('74hc') || c.includes('cd40');
    }

    // KIỂM TRA PHÂN LOẠI CÓ PHẢI NHÓM ANALOG / OP-AMP KHÔNG
    function isAnalogCategory(cat) {
      if (!cat) return false;
      const c = String(cat).toLowerCase().trim();
      return c === 'analog / op-amp' || c.includes('analog') || c.includes('op-amp') || c.includes('opamp') || c.includes('khuếch đại');
    }

    // TÌM PHÂN LOẠI PHÙ HỢP TRONG DANH SÁCH CATEGORIES HIỆN CÓ CỦA NGƯỜI DÙNG
    function findCategoryMatch(targetCat) {
      if (!targetCat) return '';
      if (categories.includes(targetCat)) return targetCat;
      if (isLogicCategory(targetCat)) {
        const found = categories.find(c => isLogicCategory(c));
        if (found) return found;
      }
      if (isAnalogCategory(targetCat)) {
        const found = categories.find(c => isAnalogCategory(c));
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
      '00': { desc: '4 cổng NAND 2 ngõ vào', pkg: 'DIP-14' },
      '01': { desc: 'quad 2-input NAND gate with open collector outputs', pkg: 'DIP-14' },
      '02': { desc: '4 cổng NOR 2 ngõ vào', pkg: 'DIP-14' },
      '03': { desc: 'quad 2-input NAND gate with open collector outputs', pkg: 'DIP-14' },
      '04': { desc: '6 cổng đảo NOT độc lập', pkg: 'DIP-14' },
      '05': { desc: 'hex inverter with open collector outputs', pkg: 'DIP-14' },
      '08': { desc: '4 cổng AND 2 ngõ vào', pkg: 'DIP-14' },
      '09': { desc: 'quad 2-input AND gate with open collector outputs', pkg: 'DIP-14' },
      '10': { desc: '3 cổng NAND 3 ngõ vào', pkg: 'DIP-14' },
      '11': { desc: '3 cổng AND 3 ngõ vào', pkg: 'DIP-14' },
      '12': { desc: 'triple 3-input NAND gate with open collector outputs', pkg: 'DIP-14' },
      '15': { desc: 'triple 3-input AND gate with open collector outputs', pkg: 'DIP-14' },
      '20': { desc: '2 cổng NAND 4 ngõ vào', pkg: 'DIP-14' },
      '21': { desc: '2 cổng AND 4 ngõ vào', pkg: 'DIP-14' },
      '22': { desc: 'dual 4-input NAND gate with open collector outputs', pkg: 'DIP-14' },
      '23': { desc: 'expandable dual 4-input NOR gate with strobe', pkg: 'DIP-14' },
      '25': { desc: 'dual 4-input NOR gate with strobe', pkg: 'DIP-14' },
      '26': { desc: 'quad 2-input NAND gate with 15 V open collector outputs', pkg: 'DIP-14' },
      '27': { desc: '3 cổng NOR 3 ngõ vào', pkg: 'DIP-14' },
      '30': { desc: '1 cổng NAND 8 ngõ vào', pkg: 'DIP-14' },
      '31': { desc: 'hex delay elements', pkg: 'DIP-14' },
      '32': { desc: '4 cổng OR 2 ngõ vào', pkg: 'DIP-14' },
      '34': { desc: 'hex noninverters', pkg: 'DIP-14' },
      '35': { desc: 'hex noninverters with open-collector outputs', pkg: 'DIP-14' },
      '36': { desc: 'quad 2-input NOR gate (different pinout than 7402)', pkg: 'DIP-14' },
      '50': { desc: 'dual 2-wide 2-input AND-OR-invert gate (one gate expandable)', pkg: 'DIP-14' },
      '51': { desc: 'dual 2-wide 2-input AND-OR-invert gate', pkg: 'DIP-14' },
      '52': { desc: 'expandable 4-wide 2-input AND-OR gate', pkg: 'DIP-14' },
      '53': { desc: 'expandable 4-wide 2-input AND-OR-invert gate', pkg: 'DIP-14' },
      '54': { desc: '3-2-2-3-input AND-OR-invert gate', pkg: 'DIP-14' },
      '55': { desc: '2-wide 4-input AND-OR-invert gate (74H version is expandable)', pkg: 'DIP-14' },
      '58': { desc: '2-input &amp; 3-input AND-OR gate', pkg: 'DIP-14' },
      '59': { desc: '2-input &amp; 3-input AND-OR-invert gate', pkg: 'DIP-14' },
      '60': { desc: 'dual 4-input expander', pkg: 'DIP-14' },
      '61': { desc: 'triple 3-input expander', pkg: 'DIP-14' },
      '62': { desc: '3-2-2-3-input AND-OR expander', pkg: 'DIP-14' },
      '63': { desc: 'hex current sensing interface gates', pkg: 'DIP-14' },
      '64': { desc: '4-2-3-2-input AND-OR-invert gate', pkg: 'DIP-14' },
      '65': { desc: '4-2-3-2 input AND-OR-invert gate with open collector output', pkg: 'DIP-14' },
      '81': { desc: '16-bit random access memory', pkg: 'DIP-16' },
      '84': { desc: '16-bit random access memory', pkg: 'DIP-16' },
      '86': { desc: '4 cổng XOR 2 ngõ vào', pkg: 'DIP-14' },
      '87': { desc: '4-bit true/complement/zero/one element', pkg: 'DIP-16' },
      '88': { desc: '256-bit read-only memory', pkg: 'DIP-14' },
      '89': { desc: '64-bit random access memory', pkg: 'DIP-16' },
      '120': { desc: 'dual pulse synchronizer/drivers', pkg: 'DIP-14' },
      '133': { desc: '13-input NAND gate', pkg: 'DIP-14' },
      '134': { desc: '12-input NAND gate with three-state output', pkg: 'DIP-14' },
      '135': { desc: 'quad exclusive-or/NOR gate', pkg: 'DIP-14' },
      '136': { desc: 'quad 2-input XOR gate with open collector outputs', pkg: 'DIP-14' },
      '182': { desc: 'lookahead carry generator', pkg: 'DIP-14' },
      '184': { desc: 'BCD to binary converter', pkg: 'DIP-16' },
      '185': { desc: '6-bit binary to BCD converter', pkg: 'DIP-16' },
      '186': { desc: '512-bit (64x8) read-only memory with open collector outputs', pkg: 'DIP-14' },
      '187': { desc: '1024-bit (256x4) read only memory with open collector outputs', pkg: 'DIP-24' },
      '188': { desc: '256-bit (32x8) programmable read-only memory with open collector outputs', pkg: 'DIP-14' },
      '189': { desc: '64-bit (16x4) RAM with inverting three-state outputs', pkg: 'DIP-16' },
      '200': { desc: '256-bit ram with three-state outputs', pkg: 'DIP-14' },
      '201': { desc: '256-bit (256x1) ram with three-state outputs', pkg: 'DIP-14' },
      '206': { desc: '256-bit ram with open collector outputs', pkg: 'DIP-14' },
      '209': { desc: '1024-bit (1024x1) ram with three-state output', pkg: 'DIP-24' },
      '219': { desc: '64-bit (16x4) RAM with noninverting three-state outputs', pkg: 'DIP-16' },
      '260': { desc: '2 cổng NOR 5 ngõ vào', pkg: 'DIP-14' },
      '264': { desc: 'look ahead carry generator', pkg: 'DIP-14' },
      '265': { desc: 'quad complementary output elements', pkg: 'DIP-14' },
      '266': { desc: 'quad 2-input XNOR gate with open collector outputs', pkg: 'DIP-14' },
      '270': { desc: '2048-bit (512x4) read only memory with open collector outputs', pkg: 'DIP-20' },
      '271': { desc: '2048-bit (256x8) read only memory with open collector outputs', pkg: 'DIP-20' },
      '275': { desc: '7-bit slice Wallace tree', pkg: 'DIP-14' },
      '281': { desc: '4-bit parallel binary accumulator', pkg: 'DIP-16' },
      '282': { desc: 'look-ahead carry generator with selectable carry inputs', pkg: 'DIP-14' },
      '287': { desc: '1024-bit (256x4) programmable read-only memory with three-state outputs', pkg: 'DIP-24' },
      '288': { desc: '256-bit (32x8) programmable read-only memory with three-state outputs', pkg: 'DIP-14' },
      '289': { desc: '64-bit (16x4) RAM with open collector outputs', pkg: 'DIP-16' },
      '297': { desc: 'digital phase-locked loop filter', pkg: 'DIP-14' },
      '301': { desc: '256-bit (256x1) random access memory with open collector output', pkg: 'DIP-14' },
      '309': { desc: '1024-bit (1024x1) random access memory with open collector output', pkg: 'DIP-24' },
      '314': { desc: '1024-bit random access memory', pkg: 'DIP-24' },
      '319': { desc: '64-bit random access memories 16x4 open collector outputs', pkg: 'DIP-16' },
      '350': { desc: '4-bit shifter with three-state outputs', pkg: 'DIP-16' },
      '361': { desc: 'bubble memory function timing generator', pkg: 'DIP-14' },
      '362': { desc: 'four-phase clock generator/driver', pkg: 'DIP-14' },
      '370': { desc: '2048-bit (512x4) read-only memory with three-state outputs', pkg: 'DIP-20' },
      '371': { desc: '2048-bit (256x8) read-only memory with three-state outputs', pkg: 'DIP-20' },
      '386': { desc: 'quad 2-input XOR gate', pkg: 'DIP-14' },
      '387': { desc: '1024-bit (256x4) programmable read-only memory with open collector outputs', pkg: 'DIP-24' },
      '424': { desc: 'two-phase clock generator/driver', pkg: 'DIP-14' },
      '425': { desc: 'quad gates with three-state outputs and active low enables', pkg: 'DIP-14' },
      '426': { desc: 'quad gates with three-state outputs and active high enables', pkg: 'DIP-14' },
      '428': { desc: 'system controller for 8080a', pkg: 'DIP-14' },
      '438': { desc: 'system controller for 8080a', pkg: 'DIP-14' },
      '460': { desc: 'bus transfer switch', pkg: 'DIP-14' },
      '462': { desc: 'fiber-optic link transmitter', pkg: 'DIP-14' },
      '463': { desc: 'fiber-optic link receiver', pkg: 'DIP-14' },
      '470': { desc: '2048-bit (256x8) programmable read-only memory with open collector outputs', pkg: 'DIP-20' },
      '471': { desc: '2048-bit (256x8) programmable read-only memory with three-state outputs', pkg: 'DIP-20' },
      '472': { desc: 'programmable read-only memory with open collector outputs', pkg: 'DIP-14' },
      '473': { desc: 'programmable read-only memory with three-state outputs', pkg: 'DIP-14' },
      '474': { desc: 'programmable read-only memory with open collector outputs', pkg: 'DIP-14' },
      '475': { desc: 'programmable read-only memory with three-state outputs', pkg: 'DIP-14' },
      '481': { desc: '4-bit slice cascadable processor elements', pkg: 'DIP-16' },
      '482': { desc: '4-bit slice expandable control elements', pkg: 'DIP-16' },
      '484': { desc: 'BCD-to-binary converter', pkg: 'DIP-16' },
      '485': { desc: 'binary-to-BCD converter', pkg: 'DIP-16' },
      '600': { desc: 'dynamic memory refresh controller, transparent and burst modes, for 4K or 16K drams', pkg: 'DIP-14' },
      '601': { desc: 'dynamic memory refresh controller, transparent and burst modes, for 64K drams', pkg: 'DIP-14' },
      '602': { desc: 'dynamic memory refresh controller, cycle steal and burst modes, for 4K or 16K drams', pkg: 'DIP-14' },
      '603': { desc: 'dynamic memory refresh controller, cycle steal and burst modes, for 64K drams', pkg: 'DIP-14' },
      '608': { desc: 'memory cycle controller', pkg: 'DIP-14' },
      '612': { desc: 'memory mapper, three-state outputs', pkg: 'DIP-14' },
      '613': { desc: 'memory mapper, open collector outputs', pkg: 'DIP-14' },
      '630': { desc: '16-bit error detection and correction (EDAC) with three-state outputs', pkg: 'DIP-16' },
      '631': { desc: '16-bit error detection and correction with open collector outputs', pkg: 'DIP-16' },
      '632': { desc: '32-bit parallel error detection and correction, three-state outputs, byte-write', pkg: 'DIP-14' },
      '633': { desc: '32-bit parallel error detection and correction, open-collector outputs, byte-write', pkg: 'DIP-14' },
      '634': { desc: '32-bit parallel error detection and correction, three-state outputs', pkg: 'DIP-14' },
      '635': { desc: '32-bit parallel error detection and correction, open-collector outputs', pkg: 'DIP-14' },
      '681': { desc: '4-bit parallel binary accumulator', pkg: 'DIP-16' },
      '790': { desc: 'error detection and correction (EDAC)', pkg: 'DIP-14' },
      '804': { desc: 'hex 2-input NAND drivers', pkg: 'DIP-14' },
      '805': { desc: 'hex 2-input NOR drivers', pkg: 'DIP-14' },
      '808': { desc: 'hex 2-input AND drivers', pkg: 'DIP-14' },
      '832': { desc: 'hex 2-input OR drivers', pkg: 'DIP-14' },
      '882': { desc: '32-bit lookahead carry generator', pkg: 'DIP-14' },
      '888': { desc: '8-bit slice processor', pkg: 'DIP-20' },
      '908': { desc: 'dual CMOS 30 V relay driver', pkg: 'DIP-14' },
      '910': { desc: '256x1 CMOS static RAM', pkg: 'DIP-14' },
      '911': { desc: '4-digit expandable display controller', pkg: 'DIP-14' },
      '912': { desc: '6-digit BCD display controller and driver', pkg: 'DIP-16' },
      '917': { desc: '6-digit hex display controller and driver', pkg: 'DIP-14' },
      '918': { desc: 'dual CMOS 30 V relay driver', pkg: 'DIP-14' },
      '920': { desc: '256x4 CMOS static RAM', pkg: 'DIP-14' },
      '921': { desc: '256x4 CMOS static RAM', pkg: 'DIP-14' },
      '929': { desc: '1024x1 CMOS static RAM', pkg: 'DIP-14' },
      '930': { desc: '1024x1 CMOS static RAM', pkg: 'DIP-14' },
      '934': { desc: '=ADC0829 ADC, see corresponding NSC datasheet', pkg: 'DIP-14' },
      '935': { desc: '3.5-digit digital voltmeter (DVM) support chip for multiplexed 7-segment displays', pkg: 'DIP-14' },
      '936': { desc: '3.75-digit digital voltmeter (DVM) support chip for multiplexed 7-segment displays', pkg: 'DIP-14' },
      '937': { desc: '=ADC3511 ADC, see corresponding NSC datasheet', pkg: 'DIP-14' },
      '938': { desc: '=ADC3711 ADC, see corresponding NSC datasheet', pkg: 'DIP-14' },
      '948': { desc: '=ADC0816 ADC, see corresponding NSC datasheet', pkg: 'DIP-14' },
      '949': { desc: '=ADC0808 ADC, see corresponding NSC datasheet', pkg: 'DIP-14' },
      '2960': { desc: 'error detection and correction (EDAC)', pkg: 'DIP-14' },
      '2968': { desc: 'dynamic memory controller', pkg: 'DIP-14' },
      '2969': { desc: 'memory timing controller for use with EDAC', pkg: 'DIP-14' },
      '2970': { desc: 'memory timing controller for use without EDAC', pkg: 'DIP-14' },
      '4002': { desc: 'dual 4-input NOR gate', pkg: 'DIP-14' },
      '4016': { desc: 'quad bilateral switch', pkg: 'DIP-14' },
      '4066': { desc: 'quad bilateral switches', pkg: 'DIP-14' },
      '4075': { desc: 'triple 3-input OR gate', pkg: 'DIP-14' },
      '4078': { desc: '8-input OR/NOR gate', pkg: 'DIP-14' },
      '4316': { desc: 'quad analog switch', pkg: 'DIP-14' },
      '7266': { desc: 'quad 2-input XNOR gate', pkg: 'DIP-14' },
      '70': { desc: 'AND-gated positive edge triggered J-K flip-flop with preset and clear', pkg: 'DIP-14' },
      '72': { desc: 'AND gated J-K master-slave flip-flop with preset and clear', pkg: 'DIP-14' },
      '73': { desc: 'JK Flip-Flop kép có Reset', pkg: 'DIP-14' },
      '74': { desc: 'D Flip-Flop kép có Set/Reset', pkg: 'DIP-14' },
      '75': { desc: '4 chốt dữ liệu D hai trạng thái', pkg: 'DIP-16' },
      '76': { desc: 'JK Flip-Flop kép có Preset & Clear', pkg: 'DIP-16' },
      '77': { desc: '4-bit bistable latch', pkg: 'DIP-16' },
      '79': { desc: 'dual D flip-flop', pkg: 'DIP-14' },
      '98': { desc: '4-bit data selector/storage register', pkg: 'DIP-16' },
      '100': { desc: 'dual 4-bit bistable latch', pkg: 'DIP-16' },
      '101': { desc: 'AND-OR-gated J-K negative-edge-triggered flip-flop with preset', pkg: 'DIP-14' },
      '102': { desc: 'AND-gated J-K negative-edge-triggered flip-flop with preset and clear', pkg: 'DIP-14' },
      '103': { desc: 'dual J-K negative-edge-triggered flip-flop with clear', pkg: 'DIP-14' },
      '104': { desc: 'J-K master-slave flip-flop', pkg: 'DIP-14' },
      '105': { desc: 'J-K master-slave flip-flop', pkg: 'DIP-14' },
      '106': { desc: 'dual J-K negative-edge-triggered flip-flop with preset and clear', pkg: 'DIP-14' },
      '107': { desc: 'JK Flip-Flop kép ngõ vào Clear', pkg: 'DIP-14' },
      '108': { desc: 'dual J-K negative-edge-triggered flip-flop with preset, common clear, and common clock', pkg: 'DIP-14' },
      '109': { desc: 'J-Not-K Flip-Flop kích cạnh dương', pkg: 'DIP-16' },
      '110': { desc: 'AND-gated J-K master-slave flip-flop with data lockout', pkg: 'DIP-14' },
      '111': { desc: 'dual J-K master-slave flip-flop with data lockout', pkg: 'DIP-14' },
      '112': { desc: 'JK Flip-Flop kích cạnh âm', pkg: 'DIP-16' },
      '113': { desc: 'dual J-K negative-edge-triggered flip-flop with preset', pkg: 'DIP-14' },
      '114': { desc: 'dual J-K negative-edge-triggered flip-flop with preset, common clock and clear', pkg: 'DIP-14' },
      '116': { desc: 'dual 4-bit latch with clear', pkg: 'DIP-16' },
      '118': { desc: 'hex set/reset latch', pkg: 'DIP-14' },
      '119': { desc: 'hex set/reset latch', pkg: 'DIP-14' },
      '170': { desc: '4 by 4 register file with open collector outputs', pkg: 'DIP-14' },
      '171': { desc: 'quad D-type flip-flops with clear', pkg: 'DIP-14' },
      '172': { desc: '16-bit multiple port register file with three-state outputs', pkg: 'DIP-16' },
      '173': { desc: 'Thanh ghi 4 D-FF ngõ ra 3 trạng thái', pkg: 'DIP-16' },
      '174': { desc: 'Thanh ghi 6 D-FF có Master Reset', pkg: 'DIP-16' },
      '175': { desc: 'Thanh ghi 4 D-FF có ngõ ra bù đảo', pkg: 'DIP-16' },
      '222': { desc: '16 by 4 synchronous FIFO memory with three-state outputs', pkg: 'DIP-14' },
      '224': { desc: '16 by 4 synchronous FIFO memory with three-state outputs', pkg: 'DIP-14' },
      '225': { desc: 'asynchronous 16x5 FIFO memory', pkg: 'DIP-14' },
      '227': { desc: '64-bit fifo memories 16x4', pkg: 'DIP-16' },
      '228': { desc: '64-bit fifo memories 16x4 open-collector outputs', pkg: 'DIP-16' },
      '255': { desc: 'dual 4-bit addressable latch', pkg: 'DIP-16' },
      '256': { desc: 'dual 4-bit addressable latch', pkg: 'DIP-16' },
      '259': { desc: 'Chốt dữ liệu 8-bit định địa chỉ', pkg: 'DIP-16' },
      '268': { desc: 'hex d-type latches three-state outputs, common output control, common enable', pkg: 'DIP-14' },
      '273': { desc: 'Thanh ghi 8 D-FF kích cạnh dương', pkg: 'DIP-20' },
      '276': { desc: 'quad J-Not-K edge-triggered flip-flops with separate clocks, common preset and clear', pkg: 'DIP-14' },
      '278': { desc: '4-bit cascadeable priority registers with latched data inputs', pkg: 'DIP-16' },
      '279': { desc: 'quad set-reset latch', pkg: 'DIP-14' },
      '295': { desc: '4-bit bidirectional register with three-state outputs', pkg: 'DIP-16' },
      '323': { desc: '8-bit bidirectional universal shift/storage register with three-state outputs', pkg: 'DIP-20' },
      '363': { desc: 'octal three-state D-latches', pkg: 'DIP-20' },
      '373': { desc: 'Chốt 8-bit trong suốt 3 trạng thái', pkg: 'DIP-20' },
      '374': { desc: 'Thanh ghi 8 D-FF ngõ ra 3 trạng thái', pkg: 'DIP-20' },
      '375': { desc: 'quad bistable latch', pkg: 'DIP-14' },
      '376': { desc: 'quad J-Not-K flip-flop with common clock and common clear', pkg: 'DIP-14' },
      '377': { desc: 'Thanh ghi 8 D-FF có chân Clock Enable', pkg: 'DIP-20' },
      '378': { desc: '6-bit register with clock enable', pkg: 'DIP-14' },
      '379': { desc: '4-bit register with clock enable and complementary outputs', pkg: 'DIP-16' },
      '380': { desc: '8-bit multifunction register', pkg: 'DIP-20' },
      '388': { desc: '4-bit register with standard and three-state outputs', pkg: 'DIP-16' },
      '396': { desc: 'octal storage registers, parallel access', pkg: 'DIP-20' },
      '531': { desc: 'octal transparent latch with 32 ma three-state outputs', pkg: 'DIP-20' },
      '532': { desc: 'octal register with 32 ma three-state outputs', pkg: 'DIP-20' },
      '533': { desc: 'octal transparent latch with inverting three-state outputs', pkg: 'DIP-20' },
      '534': { desc: 'octal register with inverting three-state outputs', pkg: 'DIP-20' },
      '535': { desc: 'octal transparent latch with inverting three-state outputs', pkg: 'DIP-20' },
      '536': { desc: 'octal register with inverting 32 ma three-state outputs', pkg: 'DIP-20' },
      '563': { desc: '8-bit D-type transparent latch with inverting three-state outputs', pkg: 'DIP-20' },
      '564': { desc: '8-bit D-type edge-triggered register with inverting three-state outputs', pkg: 'DIP-20' },
      '573': { desc: 'Chốt 8-bit chân thẳng hàng dễ layout', pkg: 'DIP-20' },
      '574': { desc: 'Thanh ghi 8 D-FF chân thẳng hàng', pkg: 'DIP-20' },
      '575': { desc: 'octal D-type flip-flop with synchronous clear, three-state outputs', pkg: 'DIP-20' },
      '576': { desc: 'octal D-type flip-flop with inverting three-state outputs', pkg: 'DIP-20' },
      '577': { desc: 'octal D-type flip-flop with synchronous clear, inverting three-state outputs', pkg: 'DIP-20' },
      '605': { desc: 'latch, high-speed, with open collector outputs', pkg: 'DIP-14' },
      '610': { desc: 'memory mapper, latched, three-state outputs', pkg: 'DIP-14' },
      '611': { desc: 'memory mapper, latched, open collector outputs', pkg: 'DIP-14' },
      '670': { desc: '4 by 4 register file with three-state outputs', pkg: 'DIP-14' },
      '794': { desc: '8-bit register with readback', pkg: 'DIP-20' },
      '822': { desc: '10-bit bus interface flip-flop with three-state outputs', pkg: 'DIP-14' },
      '873': { desc: 'octal transparent latch', pkg: 'DIP-20' },
      '874': { desc: 'octal D-type flip-flop', pkg: 'DIP-20' },
      '876': { desc: 'octal D-type flip-flop with inverting outputs', pkg: 'DIP-20' },
      '878': { desc: 'dual 4-bit D-type flip-flop with synchronous clear, noninverting three-state outputs', pkg: 'DIP-16' },
      '879': { desc: 'dual 4-bit D-type flip-flop with synchronous clear, inverting three-state outputs', pkg: 'DIP-16' },
      '880': { desc: 'octal transparent latch with inverting outputs', pkg: 'DIP-20' },
      '905': { desc: '12-bit successive approximation register', pkg: 'DIP-14' },
      '56': { desc: '50:1 frequency divider', pkg: 'DIP-14' },
      '57': { desc: '60:1 frequency divider', pkg: 'DIP-14' },
      '68': { desc: 'dual 4-bit decade counters', pkg: 'DIP-16' },
      '69': { desc: 'dual 4-bit binary counters', pkg: 'DIP-16' },
      '90': { desc: 'Bộ đếm thập phân chia 10 bất đồng bộ', pkg: 'DIP-14' },
      '92': { desc: 'Bộ đếm chia 12 / chia 6', pkg: 'DIP-14' },
      '93': { desc: 'Bộ đếm nhị phân 4-bit chia 16', pkg: 'DIP-14' },
      '142': { desc: 'decade counter/latch/decoder/driver for Nixie tubes', pkg: 'DIP-16' },
      '143': { desc: 'decade counter/latch/decoder/7-segment driver, 15 ma constant current', pkg: 'DIP-16' },
      '144': { desc: 'decade counter/latch/decoder/7-segment driver, 15 V open collector outputs', pkg: 'DIP-16' },
      '160': { desc: 'Bộ đếm BCD đồng bộ nạp song song', pkg: 'DIP-16' },
      '161': { desc: 'Bộ đếm nhị phân 4-bit đồng bộ', pkg: 'DIP-16' },
      '162': { desc: 'Bộ đếm BCD đồng bộ xóa đồng bộ', pkg: 'DIP-16' },
      '163': { desc: 'Bộ đếm nhị phân 4-bit xóa đồng bộ', pkg: 'DIP-16' },
      '168': { desc: 'synchronous 4-bit up/down decade counter', pkg: 'DIP-16' },
      '169': { desc: 'synchronous 4-bit up/down binary counter', pkg: 'DIP-16' },
      '176': { desc: 'presettable decade (bi-quinary) counter/latch', pkg: 'DIP-14' },
      '177': { desc: 'presettable binary counter/latch', pkg: 'DIP-14' },
      '190': { desc: 'Bộ đếm lên/xuống BCD đồng bộ', pkg: 'DIP-16' },
      '191': { desc: 'Bộ đếm lên/xuống nhị phân đồng bộ', pkg: 'DIP-16' },
      '192': { desc: 'Đếm lên/xuống BCD 2 chân clock', pkg: 'DIP-16' },
      '193': { desc: 'Đếm lên/xuống nhị phân 2 chân clock', pkg: 'DIP-16' },
      '196': { desc: 'presettable decade counter/latch', pkg: 'DIP-14' },
      '197': { desc: 'presettable binary counter/latch', pkg: 'DIP-14' },
      '290': { desc: 'decade counter (separate divide-by-2 and divide-by-5 sections)', pkg: 'DIP-14' },
      '292': { desc: 'programmable frequency divider/digital timer', pkg: 'DIP-14' },
      '293': { desc: '4-bit binary counter (separate divide-by-2 and divide-by-8 sections)', pkg: 'DIP-16' },
      '294': { desc: 'programmable frequency divider/digital timer', pkg: 'DIP-14' },
      '390': { desc: 'Bộ đếm thập phân kép (2 trong 1)', pkg: 'DIP-16' },
      '393': { desc: 'Bộ đếm nhị phân kép 4-bit độc lập', pkg: 'DIP-14' },
      '452': { desc: 'dual decade counter, synchronous', pkg: 'DIP-14' },
      '454': { desc: 'dual decade up/down counter, synchronous, preset input', pkg: 'DIP-14' },
      '455': { desc: 'dual binary up/down counter, synchronous, preset input', pkg: 'DIP-14' },
      '461': { desc: '8-bit presettable binary counter with three-state outputs', pkg: 'DIP-20' },
      '469': { desc: '8-bit synchronous up/down counter with parallel load and hold capability', pkg: 'DIP-20' },
      '490': { desc: 'dual decade counter', pkg: 'DIP-14' },
      '491': { desc: '10-bit binary up/down counter with limited preset and three-state outputs', pkg: 'DIP-14' },
      '508': { desc: '8-bit multiplier/divider', pkg: 'DIP-20' },
      '560': { desc: '4-bit decade counter with three-state outputs', pkg: 'DIP-16' },
      '561': { desc: '4-bit binary counter with three-state outputs', pkg: 'DIP-16' },
      '568': { desc: 'decade up/down counter with three-state outputs', pkg: 'DIP-14' },
      '569': { desc: 'binary up/down counter with three-state outputs', pkg: 'DIP-14' },
      '590': { desc: '8-bit binary counter with output registers and three-state outputs', pkg: 'DIP-20' },
      '591': { desc: '8-bit binary counters with output registers, open-collector outputs', pkg: 'DIP-20' },
      '592': { desc: '8-bit binary counter with input registers', pkg: 'DIP-20' },
      '593': { desc: '8-bit binary counter with input registers and three-state outputs', pkg: 'DIP-20' },
      '668': { desc: 'synchronous 4-bit decade up/down counter', pkg: 'DIP-16' },
      '669': { desc: 'synchronous 4-bit binary up/down counter', pkg: 'DIP-16' },
      '690': { desc: '4-bit decimal counter/latch/multiplexer with asynchronous reset, three-state outputs', pkg: 'DIP-16' },
      '691': { desc: '4-bit binary counter/latch/multiplexer with asynchronous reset, three-state outputs', pkg: 'DIP-16' },
      '692': { desc: '4-bit decimal counter/latch/multiplexer with synchronous reset, three-state outputs', pkg: 'DIP-16' },
      '693': { desc: '4-bit binary counter/latch/multiplexer with synchronous reset, three-state outputs', pkg: 'DIP-16' },
      '694': { desc: '4-bit decimal counter/latch/multiplexer with synchronous and asynchronous resets, three-state outputs', pkg: 'DIP-16' },
      '695': { desc: '4-bit binary counter/latch/multiplexer with synchronous and asynchronous resets, three-state outputs', pkg: 'DIP-16' },
      '696': { desc: '4-bit decimal counter/register/multiplexer with asynchronous reset, three-state outputs', pkg: 'DIP-16' },
      '697': { desc: '4-bit binary counter/register/multiplexer with asynchronous reset, three-state outputs', pkg: 'DIP-16' },
      '698': { desc: '4-bit decimal counter/register/multiplexer with synchronous reset, three-state outputs', pkg: 'DIP-16' },
      '699': { desc: '4-bit binary counter/register/multiplexer with synchronous reset, three-state outputs', pkg: 'DIP-16' },
      '716': { desc: 'programmable decade counter', pkg: 'DIP-14' },
      '718': { desc: 'programmable binary counter', pkg: 'DIP-14' },
      '779': { desc: '8-bit bidirectional binary counter (three-state)', pkg: 'DIP-20' },
      '925': { desc: '4-digit counter/display driver', pkg: 'DIP-14' },
      '926': { desc: '4-digit decade counter/display driver with carry out and latch (up to 9999)', pkg: 'DIP-14' },
      '927': { desc: '4-digit timer counter/display driver (up to 9599, intended as time elapsed)', pkg: 'DIP-14' },
      '928': { desc: '4-digit counter/display driver (up to 1999)', pkg: 'DIP-14' },
      '945': { desc: '4-digit up/down counter with decoder and driver', pkg: 'DIP-16' },
      '947': { desc: '4-digit up/down counter with decoder and driver', pkg: 'DIP-16' },
      '4017': { desc: 'Bộ đếm 10 ngõ ra dạng giải mã', pkg: 'DIP-16' },
      '4020': { desc: 'Bộ đếm gợn nhị phân 14 tầng', pkg: 'DIP-16' },
      '4024': { desc: '7-stage ripple carry binary counter', pkg: 'DIP-14' },
      '4040': { desc: 'Bộ đếm gợn nhị phân 12 tầng', pkg: 'DIP-16' },
      '4059': { desc: 'programmable divide-by-N counter', pkg: 'DIP-14' },
      '4060': { desc: '14-stage binary ripple counter with oscillator', pkg: 'DIP-14' },
      '4520': { desc: 'dual 4-bit synchronous binary counter', pkg: 'DIP-16' },
      '91': { desc: '8-bit shift register, serial In, serial out, gated input', pkg: 'DIP-20' },
      '94': { desc: '4-bit shift register, dual asynchronous presets', pkg: 'DIP-16' },
      '95': { desc: '4-bit shift register, parallel in, parallel out, serial input', pkg: 'DIP-16' },
      '96': { desc: '5-bit parallel-in/parallel-out shift register, asynchronous preset', pkg: 'DIP-14' },
      '99': { desc: '4-bit bidirectional universal shift register', pkg: 'DIP-16' },
      '164': { desc: 'Dịch nối tiếp sang song song 8-bit', pkg: 'DIP-14' },
      '165': { desc: 'Dịch song song sang nối tiếp 8-bit', pkg: 'DIP-16' },
      '166': { desc: 'Dịch song song sang nối tiếp đồng bộ', pkg: 'DIP-16' },
      '178': { desc: '4-bit parallel-access shift register', pkg: 'DIP-16' },
      '179': { desc: '4-bit parallel-access shift register with asynchronous clear and complementary Qd outputs', pkg: 'DIP-16' },
      '194': { desc: 'Thanh ghi dịch đa năng 2 chiều 4-bit', pkg: 'DIP-16' },
      '195': { desc: '4-bit parallel-access shift register', pkg: 'DIP-16' },
      '198': { desc: '8-bit bidirectional universal shift register', pkg: 'DIP-20' },
      '199': { desc: '8-bit bidirectional universal shift register with J-Not-K serial inputs', pkg: 'DIP-20' },
      '291': { desc: '4-bit universal shift register, binary up/down counter, synchronous', pkg: 'DIP-16' },
      '299': { desc: 'Thanh ghi dịch đa năng 8-bit 3S', pkg: 'DIP-20' },
      '322': { desc: '8-bit shift register with sign extend, three-state outputs', pkg: 'DIP-20' },
      '395': { desc: '4-bit universal shift register with three-state outputs', pkg: 'DIP-16' },
      '498': { desc: '8-bit bidirectional shift register with parallel inputs and three-state outputs', pkg: 'DIP-20' },
      '589': { desc: '8-bit shift register with input latch, three-state outputs', pkg: 'DIP-20' },
      '594': { desc: '8-bit shift registers with output latches', pkg: 'DIP-20' },
      '595': { desc: 'Thanh ghi dịch 8-bit có chốt 3 trạng thái', pkg: 'DIP-16' },
      '596': { desc: '8-bit shift registers with output latches, open-collector parallel outputs', pkg: 'DIP-20' },
      '597': { desc: 'Thanh ghi dịch 8-bit có chốt đầu vào', pkg: 'DIP-16' },
      '598': { desc: '8-bit shift register with input latches', pkg: 'DIP-20' },
      '599': { desc: '8-bit shift registers with output latches, open-collector outputs', pkg: 'DIP-20' },
      '671': { desc: '4-bit bidirectional shift register/latch/multiplexer with three-state outputs', pkg: 'DIP-16' },
      '672': { desc: '4-bit bidirectional shift register/latch/multiplexer with three-state outputs', pkg: 'DIP-16' },
      '673': { desc: '16-bit serial-in serial-out shift register with output storage registers, three-state outputs', pkg: 'DIP-16' },
      '674': { desc: '16-bit parallel-in serial-out shift register with three-state outputs', pkg: 'DIP-16' },
      '4015': { desc: 'dual 4-bit shift registers', pkg: 'DIP-16' },
      '4094': { desc: '8-bit three-state shift register/latch', pkg: 'DIP-20' },
      '41': { desc: 'BCD to decimal decoder/Nixie tube driver', pkg: 'DIP-16' },
      '42': { desc: 'Giải mã BCD sang thập phân 10 đường', pkg: 'DIP-16' },
      '43': { desc: 'excess-3 to decimal decoder', pkg: 'DIP-16' },
      '44': { desc: 'excess-3-Gray code to decimal decoder', pkg: 'DIP-16' },
      '45': { desc: 'BCD to decimal decoder/driver', pkg: 'DIP-16' },
      '46': { desc: 'BCD to 7-segment display decoder/driver with 30 V open collector outputs', pkg: 'DIP-16' },
      '47': { desc: 'Giải mã BCD sang LED 7 đoạn Anode chung', pkg: 'DIP-16' },
      '48': { desc: 'Giải mã BCD sang LED 7 đoạn Cathode chung', pkg: 'DIP-16' },
      '49': { desc: 'BCD to 7-segment decoder/driver with open collector outputs', pkg: 'DIP-16' },
      '137': { desc: '3 to 8-line decoder/demultiplexer with address latch', pkg: 'DIP-16' },
      '138': { desc: 'Giải mã 3-sang-8 đường / Demultiplexer', pkg: 'DIP-16' },
      '139': { desc: 'Bộ giải mã 2-sang-4 kép', pkg: 'DIP-16' },
      '141': { desc: 'BCD to decimal decoder/driver for cold-cathode indicator/Nixie tube', pkg: 'DIP-16' },
      '145': { desc: 'BCD to decimal decoder/driver', pkg: 'DIP-16' },
      '147': { desc: 'Bộ mã hóa ưu tiên 10-sang-4 BCD', pkg: 'DIP-16' },
      '148': { desc: 'Bộ mã hóa ưu tiên 8-sang-3 đường', pkg: 'DIP-16' },
      '150': { desc: '16-line to 1-line data selector/multiplexer', pkg: 'DIP-16' },
      '151': { desc: 'Bộ chọn dữ liệu / dồn kênh 8-sang-1', pkg: 'DIP-16' },
      '152': { desc: '8-line to 1-line data selector/multiplexer', pkg: 'DIP-16' },
      '153': { desc: 'Bộ dồn kênh 4-sang-1 kép', pkg: 'DIP-16' },
      '154': { desc: 'Giải mã 4-sang-16 đường / Demux', pkg: 'DIP-24' },
      '155': { desc: 'dual 2-line to 4-line decoder/demultiplexer', pkg: 'DIP-16' },
      '156': { desc: 'dual 2-line to 4-line decoder/demultiplexer with open collector outputs', pkg: 'DIP-16' },
      '157': { desc: 'Bộ chọn 2-sang-1 4-kênh không đảo', pkg: 'DIP-16' },
      '158': { desc: 'quad 2-line to 1-line data selector/multiplexer, inverting', pkg: 'DIP-16' },
      '159': { desc: '4-line to 16-line decoder/demultiplexer with open collector outputs', pkg: 'DIP-16' },
      '237': { desc: '3-of-8 decoder/demultiplexer with address latch, active high outputs', pkg: 'DIP-16' },
      '238': { desc: '3-of-8 decoder/demultiplexer, active high outputs', pkg: 'DIP-16' },
      '239': { desc: 'dual 2-of-4 decoder/demultiplexer, active high outputs', pkg: 'DIP-16' },
      '246': { desc: 'BCD to 7-segment decoder/driver with 30 V open collector outputs', pkg: 'DIP-16' },
      '247': { desc: 'BCD to 7-segment decoder/driver with 15 V open collector outputs', pkg: 'DIP-16' },
      '248': { desc: 'BCD to 7-segment decoder/driver with Internal Pull-up outputs', pkg: 'DIP-16' },
      '249': { desc: 'BCD to 7-segment decoder/driver with open collector outputs', pkg: 'DIP-16' },
      '250': { desc: '1 of 16 data selectors/multiplexers', pkg: 'DIP-16' },
      '251': { desc: 'Bộ chọn 8-sang-1 ngõ ra 3 trạng thái', pkg: 'DIP-16' },
      '253': { desc: 'dual 4-line to 1-line data selector/multiplexer with three-state outputs', pkg: 'DIP-16' },
      '257': { desc: 'Bộ chọn 2-sang-1 4-kênh 3 trạng thái', pkg: 'DIP-16' },
      '258': { desc: 'quad 2-line to 1-line data selector/multiplexer with Inverted three-state outputs', pkg: 'DIP-16' },
      '298': { desc: 'quad 2-input multiplexer with storage', pkg: 'DIP-16' },
      '347': { desc: 'BCD-to-7 segment decoders/drivers open collector outputs, low voltage version of 7447', pkg: 'DIP-16' },
      '348': { desc: '8 to 3-line priority encoder with three-state outputs', pkg: 'DIP-14' },
      '351': { desc: 'dual 8-line to 1-line data selectors/multiplexers with three-state outputs and 4 common data inputs', pkg: 'DIP-16' },
      '352': { desc: 'dual 4-line to 1-line data selectors/multiplexers with inverting outputs', pkg: 'DIP-16' },
      '353': { desc: 'dual 4-line to 1-line data selectors/multiplexers with inverting three-state outputs', pkg: 'DIP-16' },
      '354': { desc: '8 to 1-line data selector/multiplexer with transparent latch, three-state outputs', pkg: 'DIP-16' },
      '355': { desc: '8-line to 1-line data selector/multiplexer with transparent registers, open-collector outputs', pkg: 'DIP-16' },
      '356': { desc: '8 to 1-line data selector/multiplexer with edge-triggered register, three-state outputs', pkg: 'DIP-16' },
      '357': { desc: '8-line to 1-line data selectors/multiplexers/edge-triggered registers, open-collector outputs', pkg: 'DIP-16' },
      '398': { desc: 'quad 2-input multiplexers with storage and complementary outputs', pkg: 'DIP-16' },
      '399': { desc: 'quad 2-input multiplexer with storage', pkg: 'DIP-16' },
      '405': { desc: '1 to 8 decoder, equivalent to Intel 8205, only found as UCY74S405 so might be non-TI number', pkg: 'DIP-16' },
      '445': { desc: 'BCD-to-decimal decoders/drivers', pkg: 'DIP-16' },
      '447': { desc: 'BCD-to-7-segment decoders/drivers, low voltage version of 74247', pkg: 'DIP-16' },
      '450': { desc: '16-to-1 multiplexer with complementary outputs', pkg: 'DIP-16' },
      '451': { desc: 'dual 8-to-1 multiplexer', pkg: 'DIP-16' },
      '453': { desc: 'quad 4-to-1 multiplexer', pkg: 'DIP-16' },
      '537': { desc: 'BCD to decimal decoder with three-state outputs', pkg: 'DIP-16' },
      '538': { desc: '1 of 8 decoder with three-state outputs', pkg: 'DIP-16' },
      '539': { desc: 'dual 1 of 4 decoder with three-state outputs', pkg: 'DIP-16' },
      '604': { desc: 'octal 2-input multiplexer with latch, high-speed, with three-state outputs', pkg: 'DIP-20' },
      '606': { desc: 'octal 2-input multiplexer with latch, glitch-free, with three-state outputs', pkg: 'DIP-20' },
      '607': { desc: 'octal 2-input multiplexer with latch, glitch-free, with open collector outputs', pkg: 'DIP-20' },
      '646': { desc: 'octal bus transceiver/latch/multiplexer with noninverting three-state outputs', pkg: 'DIP-20' },
      '647': { desc: 'octal bus transceiver/latch/multiplexer with noninverting open collector outputs', pkg: 'DIP-20' },
      '648': { desc: 'octal bus transceiver/latch/multiplexer with inverting three-state outputs', pkg: 'DIP-20' },
      '649': { desc: 'octal bus transceiver/latch/multiplexer with inverting open collector outputs', pkg: 'DIP-20' },
      '748': { desc: '8 to 3-line priority encoder', pkg: 'DIP-14' },
      '783': { desc: 'synchronous address multiplexer', pkg: 'DIP-16' },
      '848': { desc: '8 to 3-line priority encoder with three-state outputs', pkg: 'DIP-14' },
      '857': { desc: 'hex 2-line to 1-line multiplexer with three-state outputs', pkg: 'DIP-16' },
      '915': { desc: '7-segment to BCD decoder', pkg: 'DIP-16' },
      '922': { desc: '16-key encoder', pkg: 'DIP-16' },
      '923': { desc: '20-key encoder', pkg: 'DIP-20' },
      '4028': { desc: 'BCD to decimal decoder', pkg: 'DIP-16' },
      '4051': { desc: 'high-speed CMOS 8-channel analog multiplexer/demultiplexer', pkg: 'DIP-16' },
      '4052': { desc: 'dual 4-channel analog multiplexer/demultiplexers', pkg: 'DIP-16' },
      '4053': { desc: 'triple 2-channel analog multiplexer/demultiplexers', pkg: 'DIP-16' },
      '4067': { desc: '16-channel analog multiplexer/demultiplexer', pkg: 'DIP-16' },
      '4351': { desc: '8-channel analog multiplexer/demultiplexer with latch', pkg: 'DIP-16' },
      '4353': { desc: 'triple 2-channel analog multiplexer/demultiplexer with latch', pkg: 'DIP-16' },
      '4511': { desc: 'BCD to 7-segment decoder', pkg: 'DIP-16' },
      '4514': { desc: '4-to-16 line decoder/demultiplexer with input latches', pkg: 'DIP-24' },
      '06': { desc: '6 bộ đệm đảo cực thu hở áp cao 30V', pkg: 'DIP-14' },
      '07': { desc: '6 bộ đệm không đảo cực thu hở 30V', pkg: 'DIP-14' },
      '16': { desc: 'hex inverter buffer/driver with 15 V open collector outputs', pkg: 'DIP-14' },
      '17': { desc: 'hex buffer/driver with 15 V open collector outputs', pkg: 'DIP-14' },
      '28': { desc: 'quad 2-input NOR buffer', pkg: 'DIP-14' },
      '33': { desc: 'quad 2-input NOR buffer with open collector outputs', pkg: 'DIP-14' },
      '37': { desc: 'quad 2-input NAND buffer', pkg: 'DIP-14' },
      '38': { desc: 'quad 2-input NAND buffer with open collector outputs', pkg: 'DIP-14' },
      '39': { desc: 'quad 2-input NAND buffer with open collector outputs, input and output terminals flipped, otherwise functionally identical to 7438', pkg: 'DIP-14' },
      '40': { desc: 'dual 4-input NAND buffer', pkg: 'DIP-14' },
      '125': { desc: '4 bộ đệm 3 trạng thái kích mức thấp', pkg: 'DIP-14' },
      '126': { desc: '4 bộ đệm 3 trạng thái kích mức cao', pkg: 'DIP-14' },
      '128': { desc: 'quad 2-input NOR line driver', pkg: 'DIP-14' },
      '130': { desc: 'quad 2-input AND gate buffer with 30 V open collector outputs', pkg: 'DIP-14' },
      '131': { desc: 'quad 2-input AND gate buffer with 15 V open collector outputs', pkg: 'DIP-14' },
      '140': { desc: 'dual 4-input NAND line driver', pkg: 'DIP-14' },
      '210': { desc: 'octal buffer', pkg: 'DIP-20' },
      '226': { desc: '4-bit parallel latched bus transceiver with three-state outputs', pkg: 'DIP-20' },
      '230': { desc: 'octal buffer/driver with three-state outputs, true and complementary inputs', pkg: 'DIP-20' },
      '231': { desc: 'octal buffer and line driver with three-state outputs, G and /G complementary inputs', pkg: 'DIP-20' },
      '240': { desc: 'Bộ đệm Bus 8 đường đảo 3 trạng thái', pkg: 'DIP-20' },
      '241': { desc: 'Bộ đệm Bus 8 đường 3 trạng thái', pkg: 'DIP-20' },
      '242': { desc: 'quad bus transceiver with inverted three-state outputs', pkg: 'DIP-20' },
      '243': { desc: 'quad bus transceiver with noninverted three-state outputs', pkg: 'DIP-20' },
      '244': { desc: 'Bộ đệm Bus 8 đường không đảo 3S', pkg: 'DIP-20' },
      '245': { desc: 'Bộ thu phát Bus 8-bit 2 chiều', pkg: 'DIP-20' },
      '310': { desc: 'octal buffer with Schmitt trigger inputs', pkg: 'DIP-20' },
      '340': { desc: 'octal buffer with Schmitt trigger inputs and three-state inverted outputs', pkg: 'DIP-20' },
      '341': { desc: 'octal buffer with Schmitt trigger inputs and three-state noninverted outputs', pkg: 'DIP-20' },
      '344': { desc: 'octal buffer with Schmitt trigger inputs and three-state noninverted outputs', pkg: 'DIP-20' },
      '365': { desc: 'hex buffer with noninverted three-state outputs', pkg: 'DIP-14' },
      '366': { desc: 'hex buffer with inverted three-state outputs', pkg: 'DIP-14' },
      '367': { desc: 'hex buffer with noninverted three-state outputs', pkg: 'DIP-14' },
      '368': { desc: 'hex buffer with Inverted three-state outputs', pkg: 'DIP-14' },
      '412': { desc: 'multi-mode buffered 8-bit latches with three-state outputs and clear', pkg: 'DIP-20' },
      '436': { desc: 'line driver/memory driver circuits - mos memory interface, damping output resistor', pkg: 'DIP-14' },
      '437': { desc: 'line driver/memory driver circuits - mos memory interface', pkg: 'DIP-14' },
      '440': { desc: 'quad tridirectional bus transceiver with noninverted open collector outputs', pkg: 'DIP-20' },
      '441': { desc: 'quad tridirectional bus transceiver with Inverted open collector outputs', pkg: 'DIP-20' },
      '442': { desc: 'quad tridirectional bus transceiver with noninverted three-state outputs', pkg: 'DIP-20' },
      '443': { desc: 'quad tridirectional bus transceiver with Inverted three-state outputs', pkg: 'DIP-20' },
      '444': { desc: 'quad tridirectional bus transceiver with Inverted and noninverted three-state outputs', pkg: 'DIP-20' },
      '446': { desc: 'quad bus transceivers with direction controls', pkg: 'DIP-20' },
      '448': { desc: 'quad tridirectional bus transceiver with inverted and noninverted open collector outputs', pkg: 'DIP-20' },
      '449': { desc: 'quad bus transceivers with direction controls, true outputs', pkg: 'DIP-20' },
      '465': { desc: 'octal buffer with three-state true outputs', pkg: 'DIP-20' },
      '466': { desc: 'octal buffers with three-state inverted outputs', pkg: 'DIP-20' },
      '467': { desc: 'octal buffers with three-state true outputs', pkg: 'DIP-20' },
      '468': { desc: 'octal buffers with three-state inverted outputs', pkg: 'DIP-20' },
      '540': { desc: 'inverting octal buffer with three-state outputs', pkg: 'DIP-20' },
      '541': { desc: 'Bộ đệm Bus 8 đường chân thẳng hàng', pkg: 'DIP-20' },
      '544': { desc: 'non-inverting octal registered transceiver with three-state outputs', pkg: 'DIP-20' },
      '580': { desc: 'octal transceiver/latch with inverting three-state outputs', pkg: 'DIP-20' },
      '620': { desc: 'octal bus transceiver, inverting, three-state outputs', pkg: 'DIP-20' },
      '621': { desc: 'octal bus transceiver, noninverting, open collector outputs', pkg: 'DIP-20' },
      '622': { desc: 'octal bus transceiver, inverting, open collector outputs', pkg: 'DIP-20' },
      '623': { desc: 'octal bus transceiver, noninverting, three-state outputs', pkg: 'DIP-20' },
      '638': { desc: 'octal bus transceiver with inverting three-state outputs', pkg: 'DIP-20' },
      '639': { desc: 'octal bus transceiver with noninverting three-state outputs', pkg: 'DIP-20' },
      '640': { desc: 'Bộ thu phát Bus 8-bit đảo 2 chiều', pkg: 'DIP-20' },
      '641': { desc: 'octal bus transceiver with noninverting open collector outputs', pkg: 'DIP-20' },
      '642': { desc: 'octal bus transceiver with inverting open collector outputs', pkg: 'DIP-20' },
      '643': { desc: 'octal bus transceiver with mix of inverting and noninverting three-state outputs', pkg: 'DIP-20' },
      '644': { desc: 'octal bus transceiver with mix of inverting and noninverting open collector outputs', pkg: 'DIP-20' },
      '645': { desc: 'Bộ thu phát Bus 8-bit không đảo 2 chiều', pkg: 'DIP-20' },
      '651': { desc: 'octal bus transceiver/register with inverting three-state outputs', pkg: 'DIP-20' },
      '652': { desc: 'octal bus transceiver/register with noninverting three-state outputs', pkg: 'DIP-20' },
      '653': { desc: 'octal bus transceiver/register with inverting three-state and open collector outputs', pkg: 'DIP-20' },
      '654': { desc: 'octal bus transceiver/register with noninverting three-state and open collector outputs', pkg: 'DIP-20' },
      '658': { desc: 'octal bus transceiver with parity, inverting', pkg: 'DIP-20' },
      '659': { desc: 'octal bus transceiver with parity, noninverting', pkg: 'DIP-20' },
      '664': { desc: 'octal bus transceiver with parity, inverting', pkg: 'DIP-20' },
      '665': { desc: 'octal bus transceiver with parity, noninverting', pkg: 'DIP-20' },
      '740': { desc: 'octal buffer/Line driver, inverting, three-state outputs', pkg: 'DIP-20' },
      '741': { desc: 'octal buffer/line driver, noninverting, three-state outputs, mixed enable polarity', pkg: 'DIP-20' },
      '744': { desc: 'octal buffer/line driver, noninverting, three-state outputs', pkg: 'DIP-20' },
      '795': { desc: 'octal buffer with three-state outputs', pkg: 'DIP-20' },
      '796': { desc: 'octal buffer with three-state outputs', pkg: 'DIP-20' },
      '797': { desc: 'octal buffer with three-state outputs', pkg: 'DIP-20' },
      '798': { desc: 'octal buffer with three-state outputs', pkg: 'DIP-20' },
      '901': { desc: 'hex inverting TTL buffer', pkg: 'DIP-14' },
      '902': { desc: 'hex non-inverting TTL buffer', pkg: 'DIP-14' },
      '903': { desc: 'hex inverting CMOS buffer', pkg: 'DIP-14' },
      '904': { desc: 'hex non-inverting CMOS buffer', pkg: 'DIP-14' },
      '906': { desc: 'hex open drain n-channel buffers', pkg: 'DIP-14' },
      '907': { desc: 'hex open drain p-channel buffers', pkg: 'DIP-14' },
      '941': { desc: 'octal bus/line drivers/line receivers', pkg: 'DIP-20' },
      '1005': { desc: 'hex inverting buffer with open-collector output', pkg: 'DIP-14' },
      '1035': { desc: 'hex noninverting buffers with open-collector outputs', pkg: 'DIP-14' },
      '2961': { desc: 'edac bus buffer, inverting', pkg: 'DIP-14' },
      '2962': { desc: 'edac bus buffer, noninverting', pkg: 'DIP-14' },
      '4049': { desc: 'hex inverting buffer', pkg: 'DIP-14' },
      '4050': { desc: 'hex buffer/converter (non-inverting)', pkg: 'DIP-14' },
      '7007': { desc: 'hex buffer', pkg: 'DIP-14' },
      '7014': { desc: 'hex Schmitt trigger non-inverting buffer', pkg: 'DIP-14' },
      '80': { desc: 'gated full adder', pkg: 'DIP-14' },
      '82': { desc: '2-bit binary full adder', pkg: 'DIP-14' },
      '83': { desc: 'Bộ cộng nhị phân 4-bit có nhớ', pkg: 'DIP-16' },
      '85': { desc: 'Bộ so sánh độ lớn nhị phân 4-bit', pkg: 'DIP-16' },
      '97': { desc: 'synchronous 6-bit binary rate multiplier', pkg: 'DIP-14' },
      '167': { desc: 'synchronous decade rate multiplier', pkg: 'DIP-14' },
      '180': { desc: '9-bit odd/even parity bit generator and checker', pkg: 'DIP-14' },
      '181': { desc: 'Khối số học logic ALU 4-bit', pkg: 'DIP-24' },
      '183': { desc: 'dual carry-save full adder', pkg: 'DIP-14' },
      '261': { desc: '2-bit by 4-bit parallel binary multiplier', pkg: 'DIP-16' },
      '274': { desc: '4-bit by 4-bit binary multiplier', pkg: 'DIP-16' },
      '280': { desc: 'Bộ kiểm tra / tạo bit chẵn lẻ 9-bit', pkg: 'DIP-14' },
      '283': { desc: 'Bộ cộng nhị phân 4-bit tốc độ cao', pkg: 'DIP-16' },
      '284': { desc: '4-bit by 4-bit parallel binary multiplier (low order 4 bits of product)', pkg: 'DIP-16' },
      '285': { desc: '4-bit by 4-bit parallel binary multiplier (high order 4 bits of product)', pkg: 'DIP-16' },
      '286': { desc: '9-bit parity generator/checker with bus driver parity I/O port', pkg: 'DIP-14' },
      '381': { desc: '4-bit arithmetic logic unit/function generator with generate and propagate outputs', pkg: 'DIP-16' },
      '382': { desc: '4-bit arithmetic logic unit/function generator with ripple carry and overflow outputs', pkg: 'DIP-16' },
      '384': { desc: '8-bit by 1-bit two\'s complement multipliers', pkg: 'DIP-20' },
      '385': { desc: 'quad 4-bit adder/subtractor', pkg: 'DIP-16' },
      '408': { desc: '8-bit parity tree', pkg: 'DIP-20' },
      '456': { desc: 'NBCD (Natural binary coded decimal) adder', pkg: 'DIP-16' },
      '518': { desc: '8-bit comparator with open collector output, input pull-up resistor', pkg: 'DIP-20' },
      '519': { desc: '8-bit comparator with open collector output', pkg: 'DIP-20' },
      '520': { desc: '8-bit comparator with inverted totem-pole output, input pull-up resistor', pkg: 'DIP-20' },
      '521': { desc: '8-bit comparator with inverted totem-pole output', pkg: 'DIP-20' },
      '522': { desc: '8-bit comparator with inverted open-collector output, input pull-up resistor', pkg: 'DIP-20' },
      '526': { desc: 'fuse programmable identity comparator, 16-bit', pkg: 'DIP-16' },
      '527': { desc: 'fuse programmable identity comparator, 8-bit + 4-bit conventional Identity comparator', pkg: 'DIP-20' },
      '528': { desc: 'fuse programmable Identity comparator, 12-bit', pkg: 'DIP-14' },
      '558': { desc: '8-bit by 8-bit multiplier with three-state outputs', pkg: 'DIP-20' },
      '677': { desc: '16-bit address comparator with enable', pkg: 'DIP-16' },
      '678': { desc: '16-bit address comparator with latch', pkg: 'DIP-16' },
      '679': { desc: '12-bit address comparator with latch', pkg: 'DIP-14' },
      '680': { desc: '12-bit address comparator with enable', pkg: 'DIP-14' },
      '682': { desc: '8-bit magnitude comparator', pkg: 'DIP-20' },
      '683': { desc: '8-bit magnitude comparator with open collector outputs', pkg: 'DIP-20' },
      '684': { desc: '8-bit magnitude comparator', pkg: 'DIP-20' },
      '685': { desc: '8-bit magnitude comparator with open collector outputs', pkg: 'DIP-20' },
      '686': { desc: '8-bit magnitude comparator with enable', pkg: 'DIP-20' },
      '687': { desc: '8-bit magnitude comparator with enable', pkg: 'DIP-20' },
      '688': { desc: 'Bộ so sánh đẳng thức (bằng nhau) 8-bit', pkg: 'DIP-20' },
      '689': { desc: '8-bit magnitude comparator with open collector outputs', pkg: 'DIP-20' },
      '881': { desc: 'arithmetic logic unit', pkg: 'DIP-14' },
      '909': { desc: 'quad voltage comparator', pkg: 'DIP-14' },
      '932': { desc: 'phase comparator', pkg: 'DIP-14' },
      '933': { desc: 'address bus comparator', pkg: 'DIP-14' },
      '13': { desc: '2 cổng NAND 4 ngõ vào kích Schmitt', pkg: 'DIP-14' },
      '14': { desc: '6 cổng đảo Schmitt Trigger lọc nhiễu', pkg: 'DIP-14' },
      '18': { desc: 'dual 4-input NAND gate with Schmitt trigger inputs', pkg: 'DIP-14' },
      '19': { desc: 'hex Schmitt trigger inverter', pkg: 'DIP-14' },
      '24': { desc: 'quad 2-input NAND gate gates with Schmitt trigger line-receiver inputs.', pkg: 'DIP-14' },
      '121': { desc: 'Bộ tạo xung đơn ổn (One-Shot Timer)', pkg: 'DIP-14' },
      '122': { desc: 'Bộ tạo xung đơn ổn kích lại được có Clear', pkg: 'DIP-14' },
      '123': { desc: 'Bộ tạo xung đơn ổn kép kích lại được', pkg: 'DIP-16' },
      '124': { desc: 'dual voltage-controlled oscillator', pkg: 'DIP-14' },
      '132': { desc: '4 cổng NAND 2 ngõ vào Schmitt Trigger', pkg: 'DIP-14' },
      '221': { desc: 'Bộ tạo xung đơn ổn kép ngõ vào Schmitt', pkg: 'DIP-16' },
      '232': { desc: 'quad NOR Schmitt trigger', pkg: 'DIP-14' },
      '320': { desc: 'crystal-controlled oscillator', pkg: 'DIP-14' },
      '321': { desc: 'crystal-controlled oscillators with F/2 and F/4 count-down outputs', pkg: 'DIP-14' },
      '324': { desc: 'voltage-controlled oscillator (or crystal controlled)', pkg: 'DIP-14' },
      '422': { desc: 're-triggerable mono-stable multivibrators, two inputs', pkg: 'DIP-14' },
      '423': { desc: 'dual retriggerable monostable multivibrator', pkg: 'DIP-14' },
      '618': { desc: 'Schmitt trigger positive-nand gates with totem-pole outputs', pkg: 'DIP-14' },
      '619': { desc: 'Schmitt trigger inverters with totem-pole outputs', pkg: 'DIP-14' },
      '624': { desc: 'voltage-controlled oscillator with enable control, range control, two-phase outputs', pkg: 'DIP-14' },
      '625': { desc: 'dual voltage-controlled oscillator with two-phase outputs', pkg: 'DIP-14' },
      '626': { desc: 'dual voltage-controlled oscillator with enable control, two-phase outputs', pkg: 'DIP-14' },
      '627': { desc: 'dual voltage-controlled oscillator', pkg: 'DIP-14' },
      '628': { desc: 'voltage-controlled oscillator with enable control, range control, external temperature compensation, and two-phase outputs', pkg: 'DIP-14' },
      '629': { desc: 'dual voltage-controlled oscillator with enable control, range control', pkg: 'DIP-14' },
      '724': { desc: 'voltage-controlled multivibrator', pkg: 'DIP-14' },
      '914': { desc: 'hex Schmitt trigger with extended input voltage', pkg: 'DIP-14' },
      '4046': { desc: 'phase-locked loop and voltage-controlled oscillator', pkg: 'DIP-14' },
      '4538': { desc: 'dual retriggerable precision monostable multivibrator', pkg: 'DIP-14' }
    };

    const EXACT_IC_KNOWLEDGE = {
      // Drivers & Transistor Arrays
      'ULN2803': { desc: 'Mảng 8 transistor Darlington công suất kéo relay/động cơ 50V 500mA', pkg: 'DIP-18', cat: 'Công suất', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/ULN2803_pinout.svg/500px-ULN2803_pinout.svg.png' },
      'ULN2003': { desc: 'Mảng 7 transistor Darlington công suất kéo relay/stepper 50V 500mA', pkg: 'DIP-16', cat: 'Công suất', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/ULN2003A_Pinout.svg/500px-ULN2003A_Pinout.svg.png' },
      'L293D': { desc: 'IC cầu H đôi điều khiển động cơ DC / Stepper có diode dập xung', pkg: 'DIP-16', cat: 'Công suất', pinout: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/L293D_Pinout.svg/500px-L293D_Pinout.svg.png' },
      'L298N': { desc: 'IC cầu H đôi công suất lớn điều khiển 2 động cơ DC (Dual Full-Bridge 2A)', pkg: 'Multiwatt-15', cat: 'Công suất' },
      'A4988': { desc: 'Module điều khiển động cơ bước vi bước vi sai (Microstepping Driver)', pkg: 'Module', cat: 'Công suất' },
      'DRV8825': { desc: 'Module điều khiển động cơ bước dòng cao tới 2.5A vi bước 1/32', pkg: 'Module', cat: 'Công suất' },

      // Comprehensive Analog / Op-Amp IC Knowledge Base (120+ ICs with Sub-Catalogs)
      'LM358': {"desc": "Bộ khuếch đại thuật toán kép nguồn đơn 3V-32V (Dual Op-Amp)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/LM358_pinout.svg/500px-LM358_pinout.svg.png"},
      'LM358N': {"desc": "Bộ khuếch đại thuật toán kép nguồn đơn 3V-32V (Dual Op-Amp DIP-8)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/LM358_pinout.svg/500px-LM358_pinout.svg.png"},
      'LM358P': {"desc": "Dual General-Purpose Op-Amp chuẩn Texas Instruments (DIP-8)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/LM358_pinout.svg/500px-LM358_pinout.svg.png"},
      'LM324': {"desc": "Bộ khuếch đại thuật toán 4 kênh nguồn đơn đa dụng (Quad Op-Amp)", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LM324_pinout.svg/500px-LM324_pinout.svg.png"},
      'LM324N': {"desc": "Quad Low-Power Op-Amp 4 kênh hoạt động từ nguồn đơn 3V-32V", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LM324_pinout.svg/500px-LM324_pinout.svg.png"},
      'UA741': {"desc": "Op-Amp kinh điển 1 kênh đa dụng có chân bù điện áp Offset (Single Op-Amp)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/741_Op-amp_pinout.svg/500px-741_Op-amp_pinout.svg.png"},
      'LM741': {"desc": "Op-Amp kinh điển 1 kênh bảo vệ quá tải ngõ vào và ngõ ra (Single Op-Amp)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/741_Op-amp_pinout.svg/500px-741_Op-amp_pinout.svg.png"},
      'RC4558': {"desc": "Dual Op-Amp tiền khuếch đại âm thanh và tín hiệu đa dụng băng thông 3MHz", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng"},
      'MC1458': {"desc": "Dual Op-Amp đa dụng nội bộ bù tần số không lo dao động tự kích", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng"},
      'NJM4558': {"desc": "Dual High Gain Op-Amp âm thanh và xử lý tín hiệu analog phổ biến", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng"},
      'LM301': {"desc": "Op-Amp đa dụng có chân bù tần số rời cho phép tùy biến tốc độ đáp ứng", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng"},
      'LM301A': {"desc": "Precision General-Purpose Op-Amp dải áp hoạt động tới ±18V", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng"},
      'LF351': {"desc": "Op-Amp đơn ngõ vào JFET tốc độ cao băng thông rộng trở kháng vào 10^12 Ω", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng"},
      'LF353': {"desc": "Op-Amp kép ngõ vào JFET băng thông 4MHz tốc độ quét 13V/µs", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng"},
      'LF356': {"desc": "JFET-Input Op-Amp dòng đáp ứng cực nhanh thời gian xác lập siêu ngắn", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng"},
      'CA3140': {"desc": "Op-Amp ngõ vào BiMOS MOSFET trở kháng siêu cao 1.5TΩ dòng vào cực nhỏ 10pA", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng"},
      'CA3140E': {"desc": "BiMOS Operational Amplifier kết hợp ngõ vào MOSFET và ngõ ra Bipolar", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng"},
      'CA3130': {"desc": "Op-Amp ngõ vào BiMOS ngõ ra CMOS Rail-to-Rail kéo áp sát nguồn", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng"},
      'LM258': {"desc": "Dual Op-Amp tiêu chuẩn công nghiệp dải nhiệt độ rộng -25°C đến 85°C", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng"},
      'LM2902': {"desc": "Quad Op-Amp 4 kênh chuẩn công nghiệp và ô tô nhiệt độ -40°C đến 125°C", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Đa Dụng"},
      'TL071': {"desc": "Op-Amp đơn ngõ vào JFET âm thanh độ nhiễu thấp (Low-Noise JFET Op-Amp)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'TL072': {"desc": "Op-Amp kép ngõ vào JFET âm thanh độ méo hài thấp (Dual Low-Noise Audio Op-Amp)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/LM358_pinout.svg/500px-LM358_pinout.svg.png"},
      'TL072CP': {"desc": "Dual Low-Noise JFET-Input General Purpose Audio Op-Amp (DIP-8)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'TL074': {"desc": "Op-Amp 4 kênh ngõ vào JFET âm thanh chất lượng cao (Quad Low-Noise Audio Op-Amp)", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LM324_pinout.svg/500px-LM324_pinout.svg.png"},
      'TL074CN': {"desc": "Quad Low-Noise JFET-Input Audio Op-Amp 4 kênh độ trung thực cao", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'TL081': {"desc": "Op-Amp đơn JFET tốc độ cao trở kháng vào cao (Wide Bandwidth JFET Op-Amp)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'TL082': {"desc": "Op-Amp kép ngõ vào JFET tốc độ đáp ứng cao 13V/µs (Dual JFET Op-Amp)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/LM358_pinout.svg/500px-LM358_pinout.svg.png"},
      'TL084': {"desc": "Op-Amp 4 kênh ngõ vào JFET đa dụng chất lượng cao (Quad JFET Op-Amp)", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'TL061': {"desc": "Op-Amp đơn ngõ vào JFET tiêu thụ dòng siêu thấp Low-Power 200µA", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'TL062': {"desc": "Op-Amp kép JFET tiêu thụ dòng siêu thấp Low-Power cho thiết bị dùng pin", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'TL064': {"desc": "Op-Amp 4 kênh JFET tiêu thụ dòng siêu thấp Low-Power", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'NE5532': {"desc": "Op-Amp kép âm thanh Hi-Fi độ ồn siêu thấp 5nV/√Hz chuyên mạch Pre-Amp (Dual Audio Op-Amp)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/LM358_pinout.svg/500px-LM358_pinout.svg.png"},
      'NE5532P': {"desc": "Dual High-Performance Low-Noise Audio Op-Amp chuyên pre-amp âm thanh Hi-Fi", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'NE5534': {"desc": "Op-Amp đơn âm thanh chất lượng phòng thu băng thông 10MHz độ ồn cực thấp 3.5nV/√Hz", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'OPA2134': {"desc": "Op-Amp kép âm thanh cao cấp SoundPlus méo hài cực thấp 0.00008% (Burr-Brown)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'OPA2134PA': {"desc": "High Performance Audio Operational Amplifier ngõ vào FET của Burr-Brown", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'OPA134': {"desc": "Op-Amp đơn âm thanh cao cấp SoundPlus méo cực thấp ngõ vào FET (Burr-Brown)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'OPA2604': {"desc": "Op-Amp kép âm thanh FET-Input điện áp cao ±24V chất âm analog ấm áp", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'LM833': {"desc": "Dual Audio Op-Amp độ ồn thấp tối ưu cho tiền khuếch đại âm thanh và mixer", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'LM833N': {"desc": "Dual Audio Operational Amplifier băng thông 15MHz tốc độ quét 7V/µs", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'MUSES02': {"desc": "Op-Amp kép âm thanh Hi-End cao cấp cấu trúc đồng khử oxy OFC của hãng JRC", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'AD712': {"desc": "Dual Precision High Speed BiFET Op-Amp âm thanh chính xác băng thông 4MHz", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'OPA1612': {"desc": "SoundPlus Dual Bipolar Audio Op-Amp siêu tĩnh độ méo siêu nhỏ cho DAC/Audio", "pkg": "SOIC-8 / Module", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'OPA627': {"desc": "Op-Amp đơn High-Speed Difet âm thanh đỉnh cao băng thông 16MHz tốc độ 55V/µs", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp JFET & Âm Thanh"},
      'OP07': {"desc": "Op-Amp độ chính xác cao bù điện áp siêu thấp 75µV trôi nhiệt cực nhỏ (Ultra-Low Offset)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'OP07CP': {"desc": "Precision Operational Amplifier điện áp lệch cực thấp 75µV độ ổn định cao", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'OP27': {"desc": "Op-Amp chính xác tốc độ cao độ ồn siêu thấp 3nV/√Hz cho đo lường chuẩn", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'OP37': {"desc": "Op-Amp chính xác tốc độ quét cực nhanh 17V/µs băng thông 63MHz (độ lợi > 5)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'OP77': {"desc": "Op-Amp đo lường độ chính xác cao trôi nhiệt cực thấp 0.3µV/°C CMRR 120dB", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'OP177': {"desc": "Op-Amp đo lường chuẩn tham chiếu Offset cực đại 10µV trôi nhiệt 0.1µV/°C", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'AD620': {"desc": "IC khuếch đại đo lường Instrumentation Amp chỉnh độ lợi 1-10000 bằng 1 điện trở Rg", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'AD620AN': {"desc": "Low Cost Low Power Instrumentation Amplifier đo cảm biến Loadcell/Y tế", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'INA128': {"desc": "IC khuếch đại đo lường độ chính xác cao CMRR 120dB của Burr-Brown", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'INA128P': {"desc": "Precision Low Power Instrumentation Amplifier chỉnh độ lợi từ 1 đến 10000", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'INA129': {"desc": "IC khuếch đại đo lường cảm biến cầu biến dạng Loadcell/Cặp nhiệt điện", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'INA126': {"desc": "IC khuếch đại đo lường nguồn đơn vi công suất 175µA dải áp 2.7V - 36V", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'ICL7650': {"desc": "Op-Amp tự động triệt tiêu điện áp lệch Chopper-Stabilized không trôi áp theo nhiệt", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'LTC1050': {"desc": "Precision Zero-Drift Op-Amp công nghệ ổn định bằng băm xung tích hợp tụ nội", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'LT1028': {"desc": "Op-Amp độ ồn nhỏ nhất thế giới 0.85nV/√Hz cho máy đo siêu âm và hạt nhân", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'AD524': {"desc": "IC khuếch đại đo lường lập trình được hệ số khuếch đại G=1, 10, 100, 1000 bằng chân ghim", "pkg": "DIP-16", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Chính Xác & Đo Lường"},
      'MCP6001': {"desc": "Op-Amp đơn Rail-to-Rail nguồn thấp 1.8V-6V dòng tiêu thụ 100µA (SOT-23-5)", "pkg": "SOT-23-5", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'MCP6002': {"desc": "Op-Amp kép Rail-to-Rail ngõ vào & ngõ ra nguồn thấp 1.8V-6.0V tiết kiệm điện", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'MCP6002-I/P': {"desc": "Dual General Purpose Rail-to-Rail I/O Op-Amp nguồn 1.8V-6V (DIP-8)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'MCP6004': {"desc": "Op-Amp 4 kênh Rail-to-Rail nguồn đơn tối ưu cho Vi điều khiển/Arduino 3.3V/5V", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'MCP601': {"desc": "Op-Amp đơn Rail-to-Rail ngõ ra 2.8MHz có chân bù áp Offset", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'MCP602': {"desc": "Op-Amp kép Rail-to-Rail tốc độ cao 2.8MHz nguồn đơn (2.7V - 6.0V)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'LMC6482': {"desc": "Dual CMOS Op-Amp Rail-to-Rail cả ngõ vào và ngõ ra dải rộng 3V - 15V", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'LMC6484': {"desc": "Quad CMOS Op-Amp Rail-to-Rail Input/Output 4 kênh hoạt động từ nguồn 3V", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'LMC662': {"desc": "Dual CMOS Op-Amp dòng ngõ vào siêu nhỏ picoampe trở kháng 10^12 Ω", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'OPA340': {"desc": "Op-Amp đơn MicroAmplifier Rail-to-Rail tốc độ cao 5.5MHz nguồn đơn 2.5V-5.5V", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'OPA2340': {"desc": "Dual Rail-to-Rail CMOS Op-Amp tốc độ cao 5.5MHz tối ưu cho ADC vi điều khiển", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'AD822': {"desc": "Dual FET-Input Rail-to-Rail Op-Amp độ chính xác cao nguồn đơn 5V hoặc đôi ±15V", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'AD823': {"desc": "Dual 16MHz Rail-to-Rail FET Op-Amp tốc độ cao kéo tải điện dung lớn", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'AD8606': {"desc": "Precision Low Noise Rail-to-Rail Input/Output Op-Amp nguồn 2.7V - 5.5V", "pkg": "SOP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'TS922': {"desc": "Dual Op-Amp Rail-to-Rail dòng ngõ ra lớn tới 80mA kéo loa nhỏ/tai nghe trực tiếp", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Op-Amp Rail-to-Rail & Nguồn Đơn"},
      'LM393': {"desc": "Bộ so sánh điện áp kép nguồn đơn ngõ ra cực thu hở (Dual Voltage Comparator)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Bộ So Sánh Điện Áp", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/LM358_pinout.svg/500px-LM358_pinout.svg.png"},
      'LM393P': {"desc": "Dual Differential Comparator ngõ ra cực thu hở kéo mức logic dễ dàng", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Bộ So Sánh Điện Áp"},
      'LM339': {"desc": "Bộ so sánh điện áp 4 kênh nguồn đơn ngõ ra cực thu hở (Quad Comparator)", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Bộ So Sánh Điện Áp", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LM324_pinout.svg/500px-LM324_pinout.svg.png"},
      'LM339N': {"desc": "Quad Differential Comparator 4 kênh độc lập dải áp 2V đến 36V", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Bộ So Sánh Điện Áp"},
      'LM311': {"desc": "Bộ so sánh điện áp tốc độ cao có ngõ ra kéo tải trực tiếp 50mA kèm chân Strobe", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Bộ So Sánh Điện Áp"},
      'LM311P': {"desc": "Voltage Comparator tốc độ cao ngõ ra transistor mở kéo tải relay/LED trực tiếp", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Bộ So Sánh Điện Áp"},
      'LM2903': {"desc": "Dual Voltage Comparator chuẩn nhiệt độ công nghiệp -40°C đến 125°C", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Bộ So Sánh Điện Áp"},
      'LM2901': {"desc": "Quad Voltage Comparator chuẩn nhiệt độ công nghiệp và ô tô", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Bộ So Sánh Điện Áp"},
      'TLC3702': {"desc": "Dual Micropower LinCMOS Comparator ngõ ra Push-Pull không cần điện trở kéo lên", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Bộ So Sánh Điện Áp"},
      'TLC3704': {"desc": "Quad LinCMOS Voltage Comparator ngõ ra Push-Pull tốc độ cao", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Bộ So Sánh Điện Áp"},
      'LM319': {"desc": "Bộ so sánh điện áp kép tốc độ cực cao độ trễ 80ns hoạt động từ nguồn đơn 5V hoặc ±15V", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Bộ So Sánh Điện Áp"},
      'MAX902': {"desc": "Dual High-Speed Voltage Comparator độ trễ thấp 8ns tương thích TTL", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Bộ So Sánh Điện Áp"},
      'MAX9140': {"desc": "Bộ so sánh điện áp Rail-to-Rail tốc độ cao 40ns nguồn đơn 2.7V - 5.5V", "pkg": "SOT-23-5", "cat": "Analog / Op-Amp", "subCat": "Bộ So Sánh Điện Áp"},
      'NE555': {"desc": "IC định thời / tạo dao động xung vuông kinh điển (Precision Timer)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Định Thời & Tạo Sóng", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/NE555_Pinout.svg/500px-NE555_Pinout.svg.png"},
      'LM555': {"desc": "IC định thời / tạo dao động xung vuông kinh điển (Precision Timer)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Định Thời & Tạo Sóng", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/NE555_Pinout.svg/500px-NE555_Pinout.svg.png"},
      'TLC555': {"desc": "IC 555 công nghệ CMOS tốc độ cao 2MHz tiêu thụ điện năng cực thấp", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Định Thời & Tạo Sóng"},
      'ICM7555': {"desc": "Phiên bản CMOS của 555 hoạt động từ 2V dòng tiêu thụ chỉ 60µA không sụt nguồn", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Định Thời & Tạo Sóng"},
      'NE556': {"desc": "IC định thời kép tích hợp 2 bộ 555 hoạt động độc lập (Dual Timer)", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Định Thời & Tạo Sóng"},
      'ICL8038': {"desc": "IC tạo sóng sin, tam giác, vuông chính xác chỉnh được tần số và độ rộng xung", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Định Thời & Tạo Sóng"},
      'XR2206': {"desc": "IC tạo hàm phát sóng sin, tam giác, răng cưa chất lượng cao điều chế AM/FM", "pkg": "DIP-16", "cat": "Analog / Op-Amp", "subCat": "Định Thời & Tạo Sóng"},
      'CD4046': {"desc": "IC vòng khóa pha số / tương tự (Phase-Locked Loop PLL kèm bộ dao động VCO)", "pkg": "DIP-16", "cat": "Analog / Op-Amp", "subCat": "Định Thời & Tạo Sóng"},
      'MAX038': {"desc": "IC phát hàm sóng tần số siêu cao tới 20MHz điều khiển bằng dòng điện", "pkg": "DIP-20", "cat": "Analog / Op-Amp", "subCat": "Định Thời & Tạo Sóng"},
      'NE567': {"desc": "IC giải mã âm tần Tone Decoder kèm vòng khóa pha PLL chống nhiễu", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Định Thời & Tạo Sóng"},
      'LM567': {"desc": "Tone Decoder / Phase-Locked Loop lọc và phát hiện đúng tần số mục tiêu", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Định Thời & Tạo Sóng"},
      'LM386': {"desc": "IC khuếch đại âm thanh nguồn thấp công suất 325mW - 1W (Low Voltage Audio Amp)", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh", "pinout": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/LM386_Pinout.svg/500px-LM386_Pinout.svg.png"},
      'TDA2030': {"desc": "IC khuếch đại âm thanh Hi-Fi công suất 14W - 18W class AB (Audio Power Amp)", "pkg": "TO-220-5", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh"},
      'TDA2030A': {"desc": "IC khuếch đại âm thanh Hi-Fi 18W class AB hoạt động nguồn đơn hoặc đôi ±18V", "pkg": "TO-220-5", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh"},
      'TDA2050': {"desc": "IC khuếch đại âm thanh Hi-Fi công suất 32W cho loa thùng 4Ω - 8Ω", "pkg": "TO-220-5", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh"},
      'TDA7297': {"desc": "IC khuếch đại âm thanh 2 kênh Dual Bridge 2x15W nguồn đơn 12V tiện dụng", "pkg": "MultiWatt-15", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh"},
      'TDA7294': {"desc": "IC công suất âm thanh DMOS Hi-Fi 100V 100W độ méo tiếng cực thấp class AB", "pkg": "MultiWatt-15", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh"},
      'TDA2822': {"desc": "IC khuếch đại âm thanh stereo 2 kênh nguồn thấp cho máy nghe nhạc/tai nghe", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh"},
      'TDA2822M': {"desc": "Dual Low-Voltage Power Amplifier hoạt động từ 1.8V chuyên tai nghe/loa mini", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh"},
      'PAM8403': {"desc": "IC/Module khuếch đại âm thanh Stereo kỹ thuật số Class D 2x3W hiệu suất 90%", "pkg": "SOP-16 / Module", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh"},
      'PAM8406': {"desc": "IC khuếch đại âm thanh Class D / Class AB kép 2x5W chuyển đổi linh hoạt", "pkg": "SOP-16 / Module", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh"},
      'TEA2025B': {"desc": "IC khuếch đại âm thanh Stereo 2.3W x 2 hoặc cầu BTL 4.7W cho loa vi tính", "pkg": "DIP-16", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh"},
      'LM1875': {"desc": "IC công suất âm thanh Hi-Fi 20W độ méo tiếng siêu nhỏ 0.015% (TO-220-5)", "pkg": "TO-220-5", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh"},
      'LM3886': {"desc": "IC công suất âm thanh cao cấp Overture 68W bảo vệ mạch an toàn SPIKe", "pkg": "TO-220-11", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh"},
      'TPA3116D2': {"desc": "IC khuếch đại công suất Class D Stereo 2x50W hoặc Mono 100W tần số quét cao", "pkg": "HTSSOP-32 / Module", "cat": "Analog / Op-Amp", "subCat": "Khuếch Đại Công Suất Âm Thanh"},
      'TL431': {"desc": "IC tham chiếu điện áp điều chỉnh được 2.5V-36V độ ổn định cao (Programmable Shunt)", "pkg": "TO-92 / SOT-23", "cat": "Analog / Op-Amp", "subCat": "Tham Chiếu Áp & Mux/Switch Analog"},
      'TL431A': {"desc": "Precision Programmable Reference dung sai chuẩn xác 0.5% dải áp 2.5V-36V", "pkg": "TO-92", "cat": "Analog / Op-Amp", "subCat": "Tham Chiếu Áp & Mux/Switch Analog"},
      'TL432': {"desc": "IC tham chiếu điện áp đổi chân cho nguồn xung flyback/adapter", "pkg": "TO-92 / SOT-23", "cat": "Analog / Op-Amp", "subCat": "Tham Chiếu Áp & Mux/Switch Analog"},
      'LM385': {"desc": "Diode Zener tham chiếu vi công suất 1.2V / 2.5V dòng tối thiểu chỉ 10µA", "pkg": "TO-92", "cat": "Analog / Op-Amp", "subCat": "Tham Chiếu Áp & Mux/Switch Analog"},
      'LM336': {"desc": "IC tham chiếu điện áp chính xác 2.5V / 5.0V có chân chỉnh trôi nhiệt độ", "pkg": "TO-92", "cat": "Analog / Op-Amp", "subCat": "Tham Chiếu Áp & Mux/Switch Analog"},
      'AD584': {"desc": "IC chuẩn tham chiếu điện áp phòng thí nghiệm 4 mức: 10.0V, 7.5V, 5.0V, 2.5V", "pkg": "TO-99 / DIP-8", "cat": "Analog / Op-Amp", "subCat": "Tham Chiếu Áp & Mux/Switch Analog"},
      'REF02': {"desc": "IC tham chiếu điện áp chuẩn chính xác 5.0V kèm ngõ ra đo nhiệt độ 2.1mV/°C", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Tham Chiếu Áp & Mux/Switch Analog"},
      'CD4051': {"desc": "Bộ dồn/giải dồn kênh Analog 8 kênh (8-Channel Analog Multiplexer/Demultiplexer)", "pkg": "DIP-16", "cat": "Analog / Op-Amp", "subCat": "Tham Chiếu Áp & Mux/Switch Analog"},
      'CD4052': {"desc": "Bộ dồn kênh Analog 4 kênh đôi kép (Dual 4-Channel Analog Multiplexer/Demux)", "pkg": "DIP-16", "cat": "Analog / Op-Amp", "subCat": "Tham Chiếu Áp & Mux/Switch Analog"},
      'CD4053': {"desc": "Bộ chuyển mạch Analog 2 kênh 3 cụm (Triple 2-Channel Analog MUX/DEMUX)", "pkg": "DIP-16", "cat": "Analog / Op-Amp", "subCat": "Tham Chiếu Áp & Mux/Switch Analog"},
      'CD4066': {"desc": "4 công tắc song công Analog/Digital độc lập trở kháng thấp (Quad Bilateral Switch)", "pkg": "DIP-14", "cat": "Analog / Op-Amp", "subCat": "Tham Chiếu Áp & Mux/Switch Analog"},
      'DG408': {"desc": "Bộ dồn kênh Analog 8 kênh CMOS điện áp cao ±15V nội trở bật cực thấp 100Ω", "pkg": "DIP-16", "cat": "Analog / Op-Amp", "subCat": "Tham Chiếu Áp & Mux/Switch Analog"},
      'MAX318': {"desc": "Công tắc Analog CMOS tốc độ cao nội trở cực thấp thời gian trễ dưới 10ns", "pkg": "DIP-8", "cat": "Analog / Op-Amp", "subCat": "Tham Chiếu Áp & Mux/Switch Analog"},

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

      // Tra cứu thông minh: Loại bỏ hậu tố đóng gói & dải nhiệt độ (VD: LM358N, LM358P, TL072CP, NE5532P, OP07CP, LM386N-1, MCP6002-I/P)
      let suffixStripped = clean.replace(/[\-\/][A-Z0-9\/]+$/i, '').replace(/(?:[NPD]|CN|CP|DR|CDR|IDR|EP|IP|AP|DT|PW)$/i, '');
      if (EXACT_IC_KNOWLEDGE[suffixStripped]) {
        return EXACT_IC_KNOWLEDGE[suffixStripped];
      }
      let strippedSuffix = stripped.replace(/[\-\/][A-Z0-9\/]+$/i, '').replace(/(?:[NPD]|CN|CP|DR|CDR|IDR|EP|IP|AP|DT|PW)$/i, '');
      if (EXACT_IC_KNOWLEDGE[strippedSuffix]) {
        return EXACT_IC_KNOWLEDGE[strippedSuffix];
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

    // =========================================================================
    // FEATURE 1.1: SUB-CATALOG PHÂN LOẠI CHỨC NĂNG SÂU CHO ANALOG / OP-AMP
    // =========================================================================

    const ANALOG_SUBCAT_LIST = [
      { id: 'Op-Amp Đa Dụng', label: 'Op-Amp Đa Dụng', icon: 'activity', desc: 'LM358, LM324, UA741, RC4558, MC1458, LF351/353/356, CA3140' },
      { id: 'Op-Amp JFET & Âm Thanh', label: 'JFET & Âm Thanh Hi-Fi', icon: 'volume-2', desc: 'TL071/072/074, TL082, NE5532, NE5534, OPA2134, LM833, MUSES' },
      { id: 'Op-Amp Chính Xác & Đo Lường', label: 'Chính Xác & Đo Lường', icon: 'gauge', desc: 'OP07, OP27/37/77, AD620, INA128/129, ICL7650, Zero-Drift, LTC1050' },
      { id: 'Op-Amp Rail-to-Rail & Nguồn Đơn', label: 'Rail-to-Rail & Nguồn Đơn', icon: 'sliders', desc: 'MCP6001/6002/6004, MCP601/602, LMC6482/6484, OPA340, AD822' },
      { id: 'Bộ So Sánh Điện Áp', label: 'So Sánh Điện Áp', icon: 'git-commit', desc: 'LM393, LM339, LM311, LM2903, TLC3702, LM319 (Comparators)' },
      { id: 'Định Thời & Tạo Sóng', label: 'Định Thời & Tạo Sóng', icon: 'clock', desc: 'NE555, LM555, TLC555, NE556, ICL8038, XR2206, CD4046 PLL, MAX038' },
      { id: 'Khuếch Đại Công Suất Âm Thanh', label: 'Công Suất Âm Thanh', icon: 'speaker', desc: 'LM386, TDA2030, TDA2050, TDA7297, TDA7294, TDA2822, PAM8403, LM1875' },
      { id: 'Tham Chiếu Áp & Mux/Switch Analog', label: 'Tham Chiếu & Switch Analog', icon: 'cpu', desc: 'TL431, TL432, LM385, LM336, AD584, CD4051, CD4052, CD4053, CD4066' }
    ];

    let currentAnalogSubCategory = 'Tất cả';

    function determineAnalogSubcategory(rawName, rawDesc = '') {
      if (!rawName) return 'Op-Amp Đa Dụng';
      const clean = String(rawName).toUpperCase().trim();
      const d = String(rawDesc || '').toLowerCase();

      // 1. Rail-to-Rail & Low Voltage Single-Supply
      if (/MCP600[124]|MCP60[12]|LMC648[24]|LMC662|OPA[23]?340|AD82[23]|AD860[65]|TS922|TLV237[124]/i.test(clean) || d.includes('rail-to-rail') || d.includes('rail to rail') || (d.includes('nguồn thấp') && d.includes('nguồn đơn'))) {
        return 'Op-Amp Rail-to-Rail & Nguồn Đơn';
      }

      // 2. Precision & Instrumentation
      if (/^(?:OP07|OP27|OP37|OP77|OP177|AD620|AD8421|INA12[896]|INA11[48]|INA13[28]|ICL7650|LTC1050|LT1028|AD524)/i.test(clean) || d.includes('instrumentation') || d.includes('đo lường') || d.includes('chính xác cao') || d.includes('zero-drift') || d.includes('chopper') || d.includes('ultra-low offset')) {
        return 'Op-Amp Chính Xác & Đo Lường';
      }

      // 3. JFET & Hi-Fi Audio Op-Amps
      if (/^(?:TL07[124]|TL08[124]|TL06[124]|NE553[24]|OPA2134|OPA134|OPA2604|OPA1612|OPA627|OPA2107|LM833|MUSES|AD712)/i.test(clean) || d.includes('jfet') || d.includes('âm thanh hi-fi') || d.includes('audio op-amp') || d.includes('low-noise audio') || d.includes('độ ồn siêu thấp') || d.includes('tiền khuếch đại âm thanh')) {
        return 'Op-Amp JFET & Âm Thanh';
      }

      // 4. Comparators
      if (/^(?:LM393|LM339|LM311|LM2903|LM2901|TLC370[24]|MAX902|MAX9140|CMP01|LM319)/i.test(clean) || d.includes('so sánh') || d.includes('comparator')) {
        return 'Bộ So Sánh Điện Áp';
      }

      // 5. Timers, Function Generators & PLL
      if (/^(?:NE555|LM555|TLC555|ICM7555|NE556|ICL8038|XR2206|CD4046|MAX038|NE567)/i.test(clean) || /(?:^|\D)555(?:\D|$)/.test(clean) || /(?:^|\D)556(?:\D|$)/.test(clean) || d.includes('định thời') || d.includes('timer') || d.includes('phát sóng') || d.includes('khóa pha') || d.includes('function generator') || d.includes('tạo xung')) {
        return 'Định Thời & Tạo Sóng';
      }

      // 6. Power Audio Amplifiers
      if (/^(?:LM386|TDA2030|TDA2050|TDA729[47]|TDA2822|PAM840[36]|TEA2025|LM1875|LM3886|TPA3116)/i.test(clean) || d.includes('công suất âm thanh') || d.includes('audio amp') || d.includes('class d') || d.includes('class ab') || d.includes('khuếch đại âm thanh') || d.includes('bridge amp')) {
        return 'Khuếch Đại Công Suất Âm Thanh';
      }

      // 7. Voltage References & Analog Switches/Mux
      if (/^(?:TL431|TL432|LM385|LM336|AD584|REF02|CD405[123]|CD4066|DG408|MAX318)/i.test(clean) || clean.includes('4051') || clean.includes('4052') || clean.includes('4053') || clean.includes('4066') || d.includes('tham chiếu') || d.includes('reference') || d.includes('bilateral switch') || d.includes('analog mux') || d.includes('công tắc analog') || d.includes('shunt regulator')) {
        return 'Tham Chiếu Áp & Mux/Switch Analog';
      }

      // 8. General Purpose Op-Amps
      if (/^(?:LM358|LM324|UA741|LM741|741|RC4558|MC1458|NJM4558|LM301|LF35[136]|CA3140|CA3130|LM258|LM2902)/i.test(clean) || d.includes('op-amp') || d.includes('opamp') || d.includes('thuật toán') || d.includes('operational amplifier')) {
        return 'Op-Amp Đa Dụng';
      }

      return 'Op-Amp Đa Dụng';
    }

