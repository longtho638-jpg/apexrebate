import { test, expect } from '@playwright/test'

test.describe('Guest - Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculator')
  })

  test('Tính toán với dữ liệu hợp lệ (Binance, taker)', async ({ page }) => {
    // Nhập volume
    await page.fill('#volume', '1000000')

    // Chọn loại giao dịch bằng data-testid (ổn định, không phụ thuộc locale)
    await page.locator('[data-testid="trade-type-trigger"]').click()
    await page.locator('[data-testid="trade-type-option-taker"]').click()

    // Bấm tính toán
    await page.getByRole('button', { name: /Tính toán|Đang tính/i }).click()

    // Kết quả hiển thị
    await expect(page.getByText(/Tiết kiệm hàng tháng/i)).toBeVisible()
    await expect(page.getByText(/Tiết kiệm hàng năm/i)).toBeVisible()

    // Badge VIP (mặc định với 1,000,000$ → VIP 0)
    await expect(page.getByText(/VIP/)).toBeVisible()

    // Chuyển tab "Phí giao dịch"
    await page.getByRole('tab', { name: /Phí giao dịch/i }).click()
    await expect(page.getByText(/Phí hàng tháng/i)).toBeVisible()
  })

  test('Đổi sàn/loại giao dịch cập nhật kết quả', async ({ page }) => {
    await page.fill('#volume', '250000000') // đủ để lên VIP cao hơn

    // Đổi sàn sang Bybit bằng data-testid
    await page.locator('[data-testid="exchange-trigger"]').click()
    await page.locator('[data-testid="exchange-option-bybit"]').click()

    // Đổi loại giao dịch sang Maker bằng data-testid
    await page.locator('[data-testid="trade-type-trigger"]').click()
    await page.locator('[data-testid="trade-type-option-maker"]').click()

    await page.getByRole('button', { name: /Tính toán|Đang tính/i }).click()

    // Tab Phân tích có ROI và tiết kiệm mỗi lệnh
    await page.getByRole('tab', { name: /Phân tích/i }).click()
    await expect(page.getByText(/ROI hàng tháng/i)).toBeVisible()
    await expect(page.getByText(/Tiết kiệm mỗi lệnh/i)).toBeVisible()
  })

  test('Xử lý input không hợp lệ', async ({ page }) => {
    await page.fill('#volume', '-5')
    await page.getByRole('button', { name: /Tính toán|Đang tính/i }).click()

    // Với volume <= 0 sẽ không có kết quả → hiển thị card "Chưa có kết quả"
    await expect(page.getByText(/Chưa có kết quả/i)).toBeVisible()
  })
})
