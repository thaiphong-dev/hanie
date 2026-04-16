# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security\security.spec.ts >> 5.3 — XSS >> <script>alert() trong input → không execute, không có popup
- Location: tests\e2e\security\security.spec.ts:123:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /tiếp theo|next|continue/i })

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
        - button "Open menu" [ref=e7] [cursor=pointer]:
          - img [ref=e8]
    - main [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e13]:
          - generic [ref=e16]: "1"
          - generic [ref=e20]: "2"
          - generic [ref=e24]: "3"
          - generic [ref=e28]: "4"
        - generic [ref=e29]:
          - generic [ref=e30]:
            - heading "Chọn dịch vụ" [level=2] [ref=e31]
            - generic [ref=e32]:
              - button "Nail tay ~60 phút · 1 slot" [active] [ref=e33] [cursor=pointer]:
                - generic [ref=e34]:
                  - paragraph [ref=e35]: Nail tay
                  - paragraph [ref=e36]: ~60 phút · 1 slot
                - img [ref=e38]
              - button "Nail chân ~60 phút · 1 slot" [ref=e40] [cursor=pointer]:
                - generic [ref=e41]:
                  - paragraph [ref=e42]: Nail chân
                  - paragraph [ref=e43]: ~60 phút · 1 slot
              - button "Nối mi ~90 phút · 2 slot" [ref=e44] [cursor=pointer]:
                - generic [ref=e45]:
                  - paragraph [ref=e46]: Nối mi
                  - paragraph [ref=e47]: ~90 phút · 2 slot
              - button "Uốn mi ~40 phút · 1 slot" [ref=e48] [cursor=pointer]:
                - generic [ref=e49]:
                  - paragraph [ref=e50]: Uốn mi
                  - paragraph [ref=e51]: ~40 phút · 1 slot
              - button "Lông mày ~30 phút · 1 slot" [ref=e52] [cursor=pointer]:
                - generic [ref=e53]:
                  - paragraph [ref=e54]: Lông mày
                  - paragraph [ref=e55]: ~30 phút · 1 slot
              - button "Gội đầu ~30 phút · 1 slot" [ref=e56] [cursor=pointer]:
                - generic [ref=e57]:
                  - paragraph [ref=e58]: Gội đầu
                  - paragraph [ref=e59]: ~30 phút · 1 slot
          - button "Xác nhận" [ref=e61] [cursor=pointer]:
            - text: Xác nhận
            - img [ref=e62]
    - contentinfo [ref=e64]:
      - generic [ref=e65]:
        - generic [ref=e66]:
          - generic [ref=e67]:
            - img "Hanie Studio" [ref=e68]
            - paragraph [ref=e69]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e70]:
            - heading "Dịch vụ" [level=4] [ref=e71]
            - list [ref=e72]:
              - listitem [ref=e73]:
                - link "Nail" [ref=e74] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e75]:
                - link "Nối mi" [ref=e76] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e77]:
                - link "Lông mày" [ref=e78] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e79]:
                - link "Gội đầu" [ref=e80] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e81]:
            - heading "Thông tin" [level=4] [ref=e82]
            - list [ref=e83]:
              - listitem [ref=e84]:
                - img [ref=e85]
                - generic [ref=e88]: 55 Nguyễn Nhạc, Quy Nhơn
              - listitem [ref=e89]:
                - img [ref=e90]
                - link "0901 234 567" [ref=e92] [cursor=pointer]:
                  - /url: tel:0901234567
              - listitem [ref=e93]:
                - img [ref=e94]
                - generic [ref=e97]: 08:00 – 20:00 hàng ngày
          - generic [ref=e98]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e99]
            - link "Đặt lịch ngay" [ref=e100] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e102]: © 2026 Hanie Studio. All rights reserved.
    - navigation [ref=e103]:
      - generic [ref=e104]:
        - link "Trang chủ" [ref=e105] [cursor=pointer]:
          - /url: /vi
          - img [ref=e106]
          - generic [ref=e109]: Trang chủ
        - link "Đặt lịch" [ref=e110] [cursor=pointer]:
          - /url: /vi/booking
          - img [ref=e111]
          - generic [ref=e114]: Đặt lịch
        - link "Lịch sử" [ref=e115] [cursor=pointer]:
          - /url: /vi/history
          - img [ref=e116]
          - generic [ref=e119]: Lịch sử
        - link "Voucher" [ref=e120] [cursor=pointer]:
          - /url: /vi/vouchers
          - img [ref=e121]
          - generic [ref=e124]: Voucher
        - link "Tôi" [ref=e125] [cursor=pointer]:
          - /url: /vi/profile
          - img [ref=e126]
          - generic [ref=e129]: Tôi
  - alert [ref=e130]
```

# Test source

```ts
  1   | /**
  2   |  * BookingPage — Page Object cho /vi/booking
  3   |  * Test từ user perspective, không đọc source code.
  4   |  */
  5   | import { type Page, expect } from '@playwright/test';
  6   | 
  7   | export class BookingPage {
  8   |   constructor(private page: Page) {}
  9   | 
  10  |   async goto(locale = 'vi', params = '') {
  11  |     await this.page.goto(`/${locale}/booking${params}`);
  12  |     // Đợi trang load xong
  13  |     await this.page.waitForLoadState('networkidle');
  14  |   }
  15  | 
  16  |   /** Bước 0: Chọn dịch vụ (booking category card) */
  17  |   async selectService(serviceName: string) {
  18  |     // Thử checkbox trước (TESTING.md spec), fallback sang button/div
  19  |     const checkbox = this.page.getByRole('checkbox', { name: serviceName });
  20  |     const hasCheckbox = await checkbox.count() > 0;
  21  |     if (hasCheckbox) {
  22  |       await checkbox.check();
  23  |     } else {
  24  |       // Toggle card có thể là button hoặc div có text
  25  |       await this.page.getByRole('button', { name: new RegExp(serviceName, 'i') }).first().click();
  26  |     }
  27  |   }
  28  | 
  29  |   /** Next step button */
  30  |   async nextStep() {
> 31  |     await this.page.getByRole('button', { name: /tiếp theo|next|continue/i }).click();
      |                                                                               ^ Error: locator.click: Test timeout of 30000ms exceeded.
  32  |     await this.page.waitForLoadState('networkidle');
  33  |   }
  34  | 
  35  |   /** Bước 1: Chọn ngày */
  36  |   async selectDate(date: string) {
  37  |     // date format: 'YYYY-MM-DD'
  38  |     const dateInput = this.page.getByLabel(/chọn ngày|ngày|date/i).first();
  39  |     await dateInput.fill(date);
  40  |     // Trigger change event
  41  |     await dateInput.press('Tab');
  42  |     await this.page.waitForTimeout(500);
  43  |   }
  44  | 
  45  |   /** Bước 1: Chọn slot thời gian */
  46  |   async selectTimeSlot(time: string) {
  47  |     // Đợi slots load
  48  |     await this.page.waitForSelector(`[data-available="true"], button:has-text("${time}")`, { timeout: 5000 }).catch(() => {});
  49  |     const slotBtn = this.page.getByRole('button', { name: time }).first();
  50  |     await expect(slotBtn).not.toBeDisabled({ timeout: 5000 });
  51  |     await slotBtn.click();
  52  |   }
  53  | 
  54  |   /** Bước 2: Chọn thợ */
  55  |   async selectStaff(staffName: string) {
  56  |     const btn = this.page.getByRole('button', { name: new RegExp(staffName, 'i') }).first();
  57  |     await btn.click();
  58  |   }
  59  | 
  60  |   /** Bước 3: Nhập thông tin khách */
  61  |   async fillCustomerInfo(info: { name: string; phone: string; notes?: string }) {
  62  |     await this.page.getByLabel(/họ tên|tên|name/i).fill(info.name);
  63  |     await this.page.getByLabel(/số điện thoại|phone/i).fill(info.phone);
  64  |     if (info.notes) {
  65  |       await this.page.getByLabel(/ghi chú|notes/i).fill(info.notes);
  66  |     }
  67  |   }
  68  | 
  69  |   /** Bước 3: Submit booking */
  70  |   async confirmBooking() {
  71  |     await this.page.getByRole('button', { name: /xác nhận đặt lịch|confirm|đặt lịch/i }).click();
  72  |   }
  73  | 
  74  |   /** Bước 4: Kiểm tra thành công */
  75  |   async expectSuccess() {
  76  |     await expect(
  77  |       this.page.getByText(/đặt lịch thành công|booking confirmed|예약 완료/i)
  78  |     ).toBeVisible({ timeout: 10000 });
  79  |   }
  80  | 
  81  |   /** Kiểm tra option parallel/sequential */
  82  |   async expectSlotOption(type: 'parallel' | 'sequential') {
  83  |     if (type === 'parallel') {
  84  |       await expect(
  85  |         this.page.getByText(/2 kỹ thuật viên.*cùng lúc|phục vụ cùng lúc|parallel/i)
  86  |       ).toBeVisible({ timeout: 5000 });
  87  |     } else {
  88  |       await expect(
  89  |         this.page.getByText(/lần lượt|1 kỹ thuật viên.*lần lượt|sequential/i)
  90  |       ).toBeVisible({ timeout: 5000 });
  91  |     }
  92  |   }
  93  | 
  94  |   /** Kiểm tra badge "Có thể làm cùng lúc" ở bước chọn dịch vụ */
  95  |   async expectParallelBadge() {
  96  |     await expect(
  97  |       this.page.getByText(/có thể làm cùng lúc|song song|parallel/i)
  98  |     ).toBeVisible({ timeout: 5000 });
  99  |   }
  100 | 
  101 |   /** Chọn option parallel (2 thợ cùng lúc) */
  102 |   async selectParallelOption() {
  103 |     await this.page.getByText(/2 kỹ thuật viên.*cùng lúc|phục vụ cùng lúc/i).click();
  104 |   }
  105 | 
  106 |   /** Kiểm tra field tự prefill từ profile */
  107 |   async expectPrefilled(name: string, phone: string) {
  108 |     await expect(this.page.getByLabel(/họ tên|tên|name/i)).toHaveValue(name);
  109 |     await expect(this.page.getByLabel(/số điện thoại|phone/i)).toHaveValue(phone);
  110 |   }
  111 | 
  112 |   /** Kiểm tra step hiện tại */
  113 |   async expectCurrentStep(stepNum: number) {
  114 |     const stepIndicator = this.page.getByTestId(`step-${stepNum}`);
  115 |     if (await stepIndicator.count() > 0) {
  116 |       await expect(stepIndicator).toHaveAttribute('data-active', 'true');
  117 |     }
  118 |     // Fallback: kiểm tra có step indicator đang active
  119 |   }
  120 | }
  121 | 
```