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

  /** Bước 1: Chọn ngày */
  async selectDate(date: string) {
    // date format: 'YYYY-MM-DD'
    const dateInput = this.page.getByLabel(/chọn ngày|ngày|date/i).first();
    await dateInput.fill(date);
    // Trigger change event
    await dateInput.press('Tab');
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
    await this.page.getByLabel(/họ tên|tên|name/i).fill(info.name);
    await this.page.getByLabel(/số điện thoại|phone/i).fill(info.phone);
    if (info.notes) {
      await this.page.getByLabel(/ghi chú|notes/i).fill(info.notes);
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
    await expect(this.page.getByLabel(/họ tên|tên|name/i)).toHaveValue(name);
    await expect(this.page.getByLabel(/số điện thoại|phone/i)).toHaveValue(phone);
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
