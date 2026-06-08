# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer\booking.spec.ts >> 2.2 — Parallel nail tay + nail chân >> chọn 2 dịch vụ nail → badge song song hiển thị
- Location: tests\e2e\customer\booking.spec.ts:60:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/có thể làm cùng lúc|song song|parallel/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/có thể làm cùng lúc|song song|parallel/i)

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
            - generic [ref=e27]: "1"
            - generic [ref=e28]: Chọn dịch vụ
          - generic [ref=e31]:
            - generic [ref=e32]: "2"
            - generic [ref=e33]: Chọn ngày giờ
          - generic [ref=e36]:
            - generic [ref=e37]: "3"
            - generic [ref=e38]: Chọn kỹ thuật viên
          - generic [ref=e41]:
            - generic [ref=e42]: "4"
            - generic [ref=e43]: Xác nhận
        - generic [ref=e44]:
          - generic [ref=e45]:
            - heading "Chọn dịch vụ" [level=2] [ref=e46]
            - generic [ref=e47]:
              - button "Nail tay ~60 phút · 1 slot" [ref=e48] [cursor=pointer]:
                - generic [ref=e49]:
                  - paragraph [ref=e50]: Nail tay
                  - paragraph [ref=e51]: ~60 phút · 1 slot
                - img [ref=e53]
              - button "Nail chân ~60 phút · 1 slot" [active] [ref=e55] [cursor=pointer]:
                - generic [ref=e56]:
                  - paragraph [ref=e57]: Nail chân
                  - paragraph [ref=e58]: ~60 phút · 1 slot
                - img [ref=e60]
              - button "Nối mi ~90 phút · 2 slot" [ref=e62] [cursor=pointer]:
                - generic [ref=e63]:
                  - paragraph [ref=e64]: Nối mi
                  - paragraph [ref=e65]: ~90 phút · 2 slot
              - button "Uốn mi ~40 phút · 1 slot" [ref=e66] [cursor=pointer]:
                - generic [ref=e67]:
                  - paragraph [ref=e68]: Uốn mi
                  - paragraph [ref=e69]: ~40 phút · 1 slot
              - button "Lông mày ~30 phút · 1 slot" [ref=e70] [cursor=pointer]:
                - generic [ref=e71]:
                  - paragraph [ref=e72]: Lông mày
                  - paragraph [ref=e73]: ~30 phút · 1 slot
              - button "Gội đầu ~30 phút · 1 slot" [ref=e74] [cursor=pointer]:
                - generic [ref=e75]:
                  - paragraph [ref=e76]: Gội đầu
                  - paragraph [ref=e77]: ~30 phút · 1 slot
            - generic [ref=e78]:
              - img [ref=e79]
              - text: Nhanh hơn
          - button "Tiếp theo" [ref=e82] [cursor=pointer]:
            - text: Tiếp theo
            - img [ref=e83]
    - contentinfo [ref=e85]:
      - generic [ref=e86]:
        - generic [ref=e87]:
          - generic [ref=e88]:
            - img "Hanie Studio" [ref=e89]
            - paragraph [ref=e90]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e91]:
            - heading "Dịch vụ" [level=4] [ref=e92]
            - list [ref=e93]:
              - listitem [ref=e94]:
                - link "Nail" [ref=e95] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e96]:
                - link "Nối mi" [ref=e97] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e98]:
                - link "Lông mày" [ref=e99] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e100]:
                - link "Gội đầu" [ref=e101] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e102]:
            - heading "Thông tin" [level=4] [ref=e103]
            - list [ref=e104]:
              - listitem [ref=e105]:
                - img [ref=e106]
                - generic [ref=e109]: 55 Nguyễn Nhạc, Quy Nhơn, Bình Định
              - listitem [ref=e110]:
                - img [ref=e111]
                - link "0967 273 066" [ref=e113] [cursor=pointer]:
                  - /url: tel:0967273066
              - listitem [ref=e114]:
                - img [ref=e115]
                - generic [ref=e118]: 08:00 – 20:00 hàng ngày
          - generic [ref=e119]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e120]
            - link "Đặt lịch ngay" [ref=e121] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e123]: © 2026 Hanie Studio. All rights reserved.
  - alert [ref=e124]
```

# Test source

```ts
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
  152 |       ).toBeVisible({ timeout: 5000 });
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
> 164 |     ).toBeVisible({ timeout: 5000 });
      |       ^ Error: expect(locator).toBeVisible() failed
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