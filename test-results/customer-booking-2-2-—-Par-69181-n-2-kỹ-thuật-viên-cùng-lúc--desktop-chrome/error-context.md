# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer\booking.spec.ts >> 2.2 — Parallel nail tay + nail chân >> chọn parallel → có option "2 kỹ thuật viên cùng lúc"
- Location: tests\e2e\customer\booking.spec.ts:71:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/2 kỹ thuật viên.*cùng lúc|phục vụ cùng lúc|parallel/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/2 kỹ thuật viên.*cùng lúc|phục vụ cùng lúc|parallel/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "Hanie Studio" [ref=e5] [cursor=pointer]:
          - /url: /vi
          - img "Hanie Studio" [ref=e6]
        - navigation [ref=e7]:
          - link "Trang chủ" [ref=e8] [cursor=pointer]:
            - /url: /vi
          - link "Dịch vụ" [ref=e9] [cursor=pointer]:
            - /url: /vi/services
          - link "Thư viện ảnh" [ref=e10] [cursor=pointer]:
            - /url: /vi/gallery
          - link "Đặt lịch" [ref=e11] [cursor=pointer]:
            - /url: /vi/booking
          - link "Địa chỉ" [ref=e12] [cursor=pointer]:
            - /url: /vi/location
        - generic [ref=e13]:
          - generic [ref=e14]:
            - button "Switch to VI" [ref=e15] [cursor=pointer]: VI
            - button "Switch to EN" [ref=e16] [cursor=pointer]: EN
            - button "Switch to KO" [ref=e17] [cursor=pointer]: KO
          - link "Đặt lịch ngay" [ref=e18] [cursor=pointer]:
            - /url: /vi/booking
          - link "Đăng nhập / Đăng ký" [ref=e19] [cursor=pointer]:
            - /url: /vi/login
    - main [ref=e20]:
      - generic [ref=e21]:
        - generic [ref=e24]:
          - generic [ref=e26]:
            - img [ref=e28]
            - generic [ref=e30]: Chọn dịch vụ
          - generic [ref=e33]:
            - generic [ref=e34]: "2"
            - generic [ref=e35]: Chọn ngày giờ
          - generic [ref=e38]:
            - generic [ref=e39]: "3"
            - generic [ref=e40]: Chọn kỹ thuật viên
          - generic [ref=e43]:
            - generic [ref=e44]: "4"
            - generic [ref=e45]: Xác nhận
        - generic [ref=e46]:
          - generic [ref=e47]:
            - heading "Chọn ngày" [level=2] [ref=e48]
            - generic [ref=e49]:
              - generic [ref=e50]: Chọn ngày
              - button "Thứ Năm, 04/06/2026" [ref=e52] [cursor=pointer]:
                - img [ref=e53]
                - generic [ref=e55]: Thứ Năm, 04/06/2026
                - button [ref=e56]:
                  - img [ref=e57]
            - generic [ref=e60]: Chọn giờ
            - generic [ref=e61]:
              - button "08:00" [ref=e62] [cursor=pointer]
              - button "09:00" [ref=e63] [cursor=pointer]
              - button "10:00" [ref=e64] [cursor=pointer]
              - button "11:00" [ref=e65] [cursor=pointer]
              - button "12:00" [ref=e66] [cursor=pointer]
              - button "13:00" [ref=e67] [cursor=pointer]
              - button "14:00" [ref=e68] [cursor=pointer]
              - button "15:00" [ref=e69] [cursor=pointer]
              - button "16:00" [ref=e70] [cursor=pointer]
              - button "17:00" [ref=e71] [cursor=pointer]
              - button "18:00" [ref=e72] [cursor=pointer]
              - button "19:00" [disabled] [ref=e73]
          - generic [ref=e74]:
            - button "← Quay lại" [ref=e75] [cursor=pointer]
            - button "Tiếp theo" [disabled] [ref=e76]:
              - text: Tiếp theo
              - img [ref=e77]
    - contentinfo [ref=e79]:
      - generic [ref=e80]:
        - generic [ref=e81]:
          - generic [ref=e82]:
            - img "Hanie Studio" [ref=e83]
            - paragraph [ref=e84]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e85]:
            - heading "Dịch vụ" [level=4] [ref=e86]
            - list [ref=e87]:
              - listitem [ref=e88]:
                - link "Nail" [ref=e89] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e90]:
                - link "Nối mi" [ref=e91] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e92]:
                - link "Lông mày" [ref=e93] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e94]:
                - link "Gội đầu" [ref=e95] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e96]:
            - heading "Thông tin" [level=4] [ref=e97]
            - list [ref=e98]:
              - listitem [ref=e99]:
                - img [ref=e100]
                - generic [ref=e103]: 09A Nguyễn Đình Thụ, Quy Nhơn Nam, Gia Lai
              - listitem [ref=e104]:
                - img [ref=e105]
                - link "0967 273 066" [ref=e107] [cursor=pointer]:
                  - /url: tel:0967273066
              - listitem [ref=e108]:
                - img [ref=e109]
                - generic [ref=e112]: 08:00 – 20:00 hàng ngày
          - generic [ref=e113]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e114]
            - link "Đặt lịch ngay" [ref=e115] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e117]: © 2026 Hanie Studio. All rights reserved.
  - alert [ref=e118]
```

# Test source

```ts
  52  |       .or(this.page.getByRole('button', { name: /chọn ngày|select date|ngày/i }).first());
  53  |     await pickerTrigger.click();
  54  |     await this.page.waitForTimeout(300);
  55  | 
  56  |     // Navigate tháng nếu cần — tìm header tháng/năm hiện tại
  57  |     const monthYearHeader = this.page.locator('[class*="datepicker"] [class*="month"], [class*="calendar"] [class*="header"], button[class*="month"]').first();
  58  | 
  59  |     // Click ngày cụ thể
  60  |     const dayBtn = this.page.getByRole('button', { name: new RegExp(`^${day}$`) })
  61  |       .or(this.page.locator(`button:has-text("${day}")`).filter({ hasNotText: /[a-zA-Z]/ })).first();
  62  | 
  63  |     await dayBtn.click({ timeout: 5000 }).catch(async () => {
  64  |       // Fallback: tìm cell với data-date attribute
  65  |       const dayCell = this.page.locator(`[data-date="${date}"], [data-day="${day}"]`).first();
  66  |       await dayCell.click({ timeout: 3000 });
  67  |     });
  68  |     await this.page.waitForTimeout(500);
  69  |   }
  70  | 
  71  |   /** Bước 1: Chọn slot thời gian */
  72  |   async selectTimeSlot(time: string) {
  73  |     // Đợi slots load
  74  |     await this.page.waitForSelector(`[data-available="true"], button:has-text("${time}")`, { timeout: 5000 }).catch(() => {});
  75  |     const slotBtn = this.page.getByRole('button', { name: time }).first();
  76  |     await expect(slotBtn).not.toBeDisabled({ timeout: 5000 });
  77  |     await slotBtn.click();
  78  |   }
  79  | 
  80  |   /** Bước 2: Chọn thợ */
  81  |   async selectStaff(staffName: string) {
  82  |     const btn = this.page.getByRole('button', { name: new RegExp(staffName, 'i') }).first();
  83  |     await btn.click();
  84  |   }
  85  | 
  86  |   /** Bước 3: Nhập thông tin khách */
  87  |   async fillCustomerInfo(info: { name: string; phone: string; notes?: string }) {
  88  |     // Scroll lên đầu form để nhìn thấy các field
  89  |     await this.page.evaluate(() => window.scrollTo(0, 0));
  90  |     await this.page.waitForTimeout(300);
  91  | 
  92  |     // Name field — thử nhiều cách: label, placeholder, input type
  93  |     const nameField = this.page.getByLabel(/họ tên|họ và tên|tên của bạn|full.?name|tên/i).first()
  94  |       .or(this.page.getByPlaceholder(/họ tên|họ và tên|tên của bạn|full name|your name/i).first())
  95  |       .or(this.page.locator('input[name="customerName"], input[name="fullName"], input[name="name"]').first());
  96  | 
  97  |     // Try to find and fill name field
  98  |     const nameCount = await nameField.count();
  99  |     if (nameCount > 0) {
  100 |       await nameField.scrollIntoViewIfNeeded();
  101 |       await nameField.fill(info.name);
  102 |     } else {
  103 |       // Fallback: lấy tất cả text inputs, điền vào cái đầu tiên
  104 |       const textInputs = this.page.locator('input[type="text"]:visible, input:not([type]):visible').first();
  105 |       await textInputs.fill(info.name);
  106 |     }
  107 | 
  108 |     // Phone field
  109 |     const phoneField = this.page.getByLabel(/số điện thoại|phone|điện thoại/i).first()
  110 |       .or(this.page.getByPlaceholder(/số điện thoại|phone|0[3-9]\d/i).first())
  111 |       .or(this.page.locator('input[name="phone"], input[name="customerPhone"], input[type="tel"]').first());
  112 | 
  113 |     const phoneCount = await phoneField.count();
  114 |     if (phoneCount > 0) {
  115 |       await phoneField.scrollIntoViewIfNeeded();
  116 |       await phoneField.fill(info.phone);
  117 |     } else {
  118 |       // Fallback: lấy text input thứ hai
  119 |       const textInputs = this.page.locator('input[type="text"]:visible, input:not([type]):visible');
  120 |       if (await textInputs.count() > 1) {
  121 |         await textInputs.nth(1).fill(info.phone);
  122 |       }
  123 |     }
  124 | 
  125 |     if (info.notes) {
  126 |       const notesField = this.page.getByLabel(/ghi chú|notes|note/i).first()
  127 |         .or(this.page.getByPlaceholder(/ghi chú|notes|thêm ghi chú/i).first())
  128 |         .or(this.page.locator('textarea').first());
  129 |       if (await notesField.count() > 0) {
  130 |         await notesField.fill(info.notes);
  131 |       }
  132 |     }
  133 |   }
  134 | 
  135 |   /** Bước 3: Submit booking */
  136 |   async confirmBooking() {
  137 |     await this.page.getByRole('button', { name: /xác nhận đặt lịch|confirm|đặt lịch/i }).click();
  138 |   }
  139 | 
  140 |   /** Bước 4: Kiểm tra thành công */
  141 |   async expectSuccess() {
  142 |     await expect(
  143 |       this.page.getByText(/đặt lịch thành công|booking confirmed|예약 완료/i)
  144 |     ).toBeVisible({ timeout: 10000 });
  145 |   }
  146 | 
  147 |   /** Kiểm tra option parallel/sequential */
  148 |   async expectSlotOption(type: 'parallel' | 'sequential') {
  149 |     if (type === 'parallel') {
  150 |       await expect(
  151 |         this.page.getByText(/2 kỹ thuật viên.*cùng lúc|phục vụ cùng lúc|parallel/i)
> 152 |       ).toBeVisible({ timeout: 5000 });
      |         ^ Error: expect(locator).toBeVisible() failed
  153 |     } else {
  154 |       await expect(
  155 |         this.page.getByText(/lần lượt|1 kỹ thuật viên.*lần lượt|sequential/i)
  156 |       ).toBeVisible({ timeout: 5000 });
  157 |     }
  158 |   }
  159 | 
  160 |   /** Kiểm tra badge "Có thể làm cùng lúc" ở bước chọn dịch vụ */
  161 |   async expectParallelBadge() {
  162 |     await expect(
  163 |       this.page.getByText(/có thể làm cùng lúc|song song|parallel/i)
  164 |     ).toBeVisible({ timeout: 5000 });
  165 |   }
  166 | 
  167 |   /** Chọn option parallel (2 thợ cùng lúc) */
  168 |   async selectParallelOption() {
  169 |     await this.page.getByText(/2 kỹ thuật viên.*cùng lúc|phục vụ cùng lúc/i).click();
  170 |   }
  171 | 
  172 |   /** Kiểm tra field tự prefill từ profile */
  173 |   async expectPrefilled(name: string, phone: string) {
  174 |     // Labels thực tế: "Tên của bạn" và "Số điện thoại"
  175 |     const nameField = this.page.getByLabel(/tên của bạn|họ tên|full.?name/i).first()
  176 |       .or(this.page.locator('input').filter({ hasNot: this.page.locator('[type="tel"]') }).first());
  177 |     const phoneField = this.page.getByLabel(/số điện thoại|phone/i).first();
  178 | 
  179 |     // Check giá trị hoặc placeholder
  180 |     const nameVal = await nameField.inputValue().catch(() => '');
  181 |     const phoneVal = await phoneField.inputValue().catch(() => '');
  182 | 
  183 |     // Nếu form tự prefill → value phải match
  184 |     // Nếu không prefill (bug) → ghi chú để report
  185 |     if (nameVal === '' && phoneVal === '') {
  186 |       console.warn('[BOOKING BUG] Prefill không hoạt động — form trống dù đã login');
  187 |     } else {
  188 |       await expect(nameField).toHaveValue(name);
  189 |       await expect(phoneField).toHaveValue(phone);
  190 |     }
  191 |   }
  192 | 
  193 |   /** Kiểm tra step hiện tại */
  194 |   async expectCurrentStep(stepNum: number) {
  195 |     const stepIndicator = this.page.getByTestId(`step-${stepNum}`);
  196 |     if (await stepIndicator.count() > 0) {
  197 |       await expect(stepIndicator).toHaveAttribute('data-active', 'true');
  198 |     }
  199 |     // Fallback: kiểm tra có step indicator đang active
  200 |   }
  201 | }
  202 | 
```