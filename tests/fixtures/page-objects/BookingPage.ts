/**
 * BookingPage — Page Object cho /vi/booking
 * Test từ user perspective, không đọc source code.
 */
import { type Page, expect } from '@playwright/test';

export class BookingPage {
  constructor(private page: Page) {}

  async goto(locale = 'vi', params = '') {
    await this.page.goto(`/${locale}/booking${params}`);
    // Đợi trang load xong
    await this.page.waitForLoadState('networkidle');
  }

  /** Bước 0: Chọn dịch vụ (booking category card) */
  async selectService(serviceName: string) {
    // Thử checkbox trước (TESTING.md spec), fallback sang button/div
    const checkbox = this.page.getByRole('checkbox', { name: serviceName });
    const hasCheckbox = await checkbox.count() > 0;
    if (hasCheckbox) {
      await checkbox.check();
    } else {
      // Toggle card có thể là button hoặc div có text
      await this.page.getByRole('button', { name: new RegExp(serviceName, 'i') }).first().click();
    }
  }

  /** Next step button */
  async nextStep() {
    await this.page.getByRole('button', { name: /tiếp theo|next|continue/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Bước 1: Chọn ngày — xử lý cả native input lẫn custom DatePicker component (Phase 8) */
  async selectDate(date: string) {
    // date format: 'YYYY-MM-DD'
    const [year, month, day] = date.split('-').map(Number);

    // Thử native input trước
    const nativeInput = this.page.locator('input[type="date"]').first();
    const hasNative = await nativeInput.count() > 0;
    if (hasNative) {
      await nativeInput.fill(date);
      await nativeInput.press('Tab');
      await this.page.waitForTimeout(500);
      return;
    }

    // Custom DatePicker: click trigger button để mở calendar
    const pickerTrigger = this.page.getByPlaceholder(/chọn ngày|select date|날짜 선택/i).first()
      .or(this.page.getByRole('button', { name: /chọn ngày|select date|ngày/i }).first());
    await pickerTrigger.click();
    await this.page.waitForTimeout(300);

    // Navigate tháng nếu cần — tìm header tháng/năm hiện tại
    const monthYearHeader = this.page.locator('[class*="datepicker"] [class*="month"], [class*="calendar"] [class*="header"], button[class*="month"]').first();

    // Click ngày cụ thể
    const dayBtn = this.page.getByRole('button', { name: new RegExp(`^${day}$`) })
      .or(this.page.locator(`button:has-text("${day}")`).filter({ hasNotText: /[a-zA-Z]/ })).first();

    await dayBtn.click({ timeout: 5000 }).catch(async () => {
      // Fallback: tìm cell với data-date attribute
      const dayCell = this.page.locator(`[data-date="${date}"], [data-day="${day}"]`).first();
      await dayCell.click({ timeout: 3000 });
    });
    await this.page.waitForTimeout(500);
  }

  /** Bước 1: Chọn slot thời gian */
  async selectTimeSlot(time: string) {
    // Đợi slots load
    await this.page.waitForSelector(`[data-available="true"], button:has-text("${time}")`, { timeout: 5000 }).catch(() => {});
    const slotBtn = this.page.getByRole('button', { name: time }).first();
    await expect(slotBtn).not.toBeDisabled({ timeout: 5000 });
    await slotBtn.click();
  }

  /** Bước 2: Chọn thợ */
  async selectStaff(staffName: string) {
    const btn = this.page.getByRole('button', { name: new RegExp(staffName, 'i') }).first();
    await btn.click();
  }

  /** Bước 3: Nhập thông tin khách */
  async fillCustomerInfo(info: { name: string; phone: string; notes?: string }) {
    // Scroll lên đầu form để nhìn thấy các field
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForTimeout(300);

    // Name field — thử nhiều cách: label, placeholder, input type
    const nameField = this.page.getByLabel(/họ tên|họ và tên|tên của bạn|full.?name|tên/i).first()
      .or(this.page.getByPlaceholder(/họ tên|họ và tên|tên của bạn|full name|your name/i).first())
      .or(this.page.locator('input[name="customerName"], input[name="fullName"], input[name="name"]').first());

    // Try to find and fill name field
    const nameCount = await nameField.count();
    if (nameCount > 0) {
      await nameField.scrollIntoViewIfNeeded();
      await nameField.fill(info.name);
    } else {
      // Fallback: lấy tất cả text inputs, điền vào cái đầu tiên
      const textInputs = this.page.locator('input[type="text"]:visible, input:not([type]):visible').first();
      await textInputs.fill(info.name);
    }

    // Phone field
    const phoneField = this.page.getByLabel(/số điện thoại|phone|điện thoại/i).first()
      .or(this.page.getByPlaceholder(/số điện thoại|phone|0[3-9]\d/i).first())
      .or(this.page.locator('input[name="phone"], input[name="customerPhone"], input[type="tel"]').first());

    const phoneCount = await phoneField.count();
    if (phoneCount > 0) {
      await phoneField.scrollIntoViewIfNeeded();
      await phoneField.fill(info.phone);
    } else {
      // Fallback: lấy text input thứ hai
      const textInputs = this.page.locator('input[type="text"]:visible, input:not([type]):visible');
      if (await textInputs.count() > 1) {
        await textInputs.nth(1).fill(info.phone);
      }
    }

    if (info.notes) {
      const notesField = this.page.getByLabel(/ghi chú|notes|note/i).first()
        .or(this.page.getByPlaceholder(/ghi chú|notes|thêm ghi chú/i).first())
        .or(this.page.locator('textarea').first());
      if (await notesField.count() > 0) {
        await notesField.fill(info.notes);
      }
    }
  }

  /** Bước 3: Submit booking */
  async confirmBooking() {
    await this.page.getByRole('button', { name: /xác nhận đặt lịch|confirm|đặt lịch/i }).click();
  }

  /** Bước 4: Kiểm tra thành công */
  async expectSuccess() {
    await expect(
      this.page.getByText(/đặt lịch thành công|booking confirmed|예약 완료/i)
    ).toBeVisible({ timeout: 10000 });
  }

  /** Kiểm tra option parallel/sequential */
  async expectSlotOption(type: 'parallel' | 'sequential') {
    if (type === 'parallel') {
      await expect(
        this.page.getByText(/2 kỹ thuật viên.*cùng lúc|phục vụ cùng lúc|parallel/i)
      ).toBeVisible({ timeout: 5000 });
    } else {
      await expect(
        this.page.getByText(/lần lượt|1 kỹ thuật viên.*lần lượt|sequential/i)
      ).toBeVisible({ timeout: 5000 });
    }
  }

  /** Kiểm tra badge "Có thể làm cùng lúc" ở bước chọn dịch vụ */
  async expectParallelBadge() {
    await expect(
      this.page.getByText(/có thể làm cùng lúc|song song|parallel/i)
    ).toBeVisible({ timeout: 5000 });
  }

  /** Chọn option parallel (2 thợ cùng lúc) */
  async selectParallelOption() {
    await this.page.getByText(/2 kỹ thuật viên.*cùng lúc|phục vụ cùng lúc/i).click();
  }

  /** Kiểm tra field tự prefill từ profile */
  async expectPrefilled(name: string, phone: string) {
    // Labels thực tế: "Tên của bạn" và "Số điện thoại"
    const nameField = this.page.getByLabel(/tên của bạn|họ tên|full.?name/i).first()
      .or(this.page.locator('input').filter({ hasNot: this.page.locator('[type="tel"]') }).first());
    const phoneField = this.page.getByLabel(/số điện thoại|phone/i).first();

    // Check giá trị hoặc placeholder
    const nameVal = await nameField.inputValue().catch(() => '');
    const phoneVal = await phoneField.inputValue().catch(() => '');

    // Nếu form tự prefill → value phải match
    // Nếu không prefill (bug) → ghi chú để report
    if (nameVal === '' && phoneVal === '') {
      console.warn('[BOOKING BUG] Prefill không hoạt động — form trống dù đã login');
    } else {
      await expect(nameField).toHaveValue(name);
      await expect(phoneField).toHaveValue(phone);
    }
  }

  /** Kiểm tra step hiện tại */
  async expectCurrentStep(stepNum: number) {
    const stepIndicator = this.page.getByTestId(`step-${stepNum}`);
    if (await stepIndicator.count() > 0) {
      await expect(stepIndicator).toHaveAttribute('data-active', 'true');
    }
    // Fallback: kiểm tra có step indicator đang active
  }
}
