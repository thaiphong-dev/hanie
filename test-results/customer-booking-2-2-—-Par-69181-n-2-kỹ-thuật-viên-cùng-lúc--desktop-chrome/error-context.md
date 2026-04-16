# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer\booking.spec.ts >> 2.2 — Parallel nail tay + nail chân >> chọn parallel → có option "2 kỹ thuật viên cùng lúc"
- Location: tests\e2e\customer\booking.spec.ts:71:7

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
    - main [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e23]:
          - generic [ref=e25]:
            - generic [ref=e26]: "1"
            - generic [ref=e27]: Chọn dịch vụ
          - generic [ref=e30]:
            - generic [ref=e31]: "2"
            - generic [ref=e32]: Chọn ngày giờ
          - generic [ref=e35]:
            - generic [ref=e36]: "3"
            - generic [ref=e37]: Chọn kỹ thuật viên
          - generic [ref=e40]:
            - generic [ref=e41]: "4"
            - generic [ref=e42]: Xác nhận
        - generic [ref=e43]:
          - generic [ref=e44]:
            - heading "Chọn dịch vụ" [level=2] [ref=e45]
            - generic [ref=e46]:
              - button "Nail tay ~60 phút · 1 slot" [ref=e47] [cursor=pointer]:
                - generic [ref=e48]:
                  - paragraph [ref=e49]: Nail tay
                  - paragraph [ref=e50]: ~60 phút · 1 slot
                - img [ref=e52]
              - button "Nail chân ~60 phút · 1 slot" [active] [ref=e54] [cursor=pointer]:
                - generic [ref=e55]:
                  - paragraph [ref=e56]: Nail chân
                  - paragraph [ref=e57]: ~60 phút · 1 slot
                - img [ref=e59]
              - button "Nối mi ~90 phút · 2 slot" [ref=e61] [cursor=pointer]:
                - generic [ref=e62]:
                  - paragraph [ref=e63]: Nối mi
                  - paragraph [ref=e64]: ~90 phút · 2 slot
              - button "Uốn mi ~40 phút · 1 slot" [ref=e65] [cursor=pointer]:
                - generic [ref=e66]:
                  - paragraph [ref=e67]: Uốn mi
                  - paragraph [ref=e68]: ~40 phút · 1 slot
              - button "Lông mày ~30 phút · 1 slot" [ref=e69] [cursor=pointer]:
                - generic [ref=e70]:
                  - paragraph [ref=e71]: Lông mày
                  - paragraph [ref=e72]: ~30 phút · 1 slot
              - button "Gội đầu ~30 phút · 1 slot" [ref=e73] [cursor=pointer]:
                - generic [ref=e74]:
                  - paragraph [ref=e75]: Gội đầu
                  - paragraph [ref=e76]: ~30 phút · 1 slot
            - generic [ref=e77]:
              - img [ref=e78]
              - text: Nhanh hơn
          - button "Xác nhận" [ref=e81] [cursor=pointer]:
            - text: Xác nhận
            - img [ref=e82]
    - contentinfo [ref=e84]:
      - generic [ref=e85]:
        - generic [ref=e86]:
          - generic [ref=e87]:
            - img "Hanie Studio" [ref=e88]
            - paragraph [ref=e89]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e90]:
            - heading "Dịch vụ" [level=4] [ref=e91]
            - list [ref=e92]:
              - listitem [ref=e93]:
                - link "Nail" [ref=e94] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e95]:
                - link "Nối mi" [ref=e96] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e97]:
                - link "Lông mày" [ref=e98] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e99]:
                - link "Gội đầu" [ref=e100] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e101]:
            - heading "Thông tin" [level=4] [ref=e102]
            - list [ref=e103]:
              - listitem [ref=e104]:
                - img [ref=e105]
                - generic [ref=e108]: 55 Nguyễn Nhạc, Quy Nhơn
              - listitem [ref=e109]:
                - img [ref=e110]
                - link "0901 234 567" [ref=e112] [cursor=pointer]:
                  - /url: tel:0901234567
              - listitem [ref=e113]:
                - img [ref=e114]
                - generic [ref=e117]: 08:00 – 20:00 hàng ngày
          - generic [ref=e118]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e119]
            - link "Đặt lịch ngay" [ref=e120] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e122]: © 2026 Hanie Studio. All rights reserved.
  - alert [ref=e123]
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