import { test, expect } from '@playwright/test'
import { login } from './helpers/navigation'

const EMAIL = process.env.TEST_USER_EMAIL
const PASSWORD = process.env.TEST_USER_PASSWORD

test.describe('Analytics E2E (dựa trên dữ liệu seed)', () => {
  test.skip(!EMAIL || !PASSWORD, 'Thiếu TEST_USER_EMAIL/TEST_USER_PASSWORD, bỏ qua bài test analytics.')

  test('Đăng nhập → truy cập /analytics → xác thực API analytics sử dụng dữ liệu seed', async ({ page }) => {
    // 1) Đăng nhập với helper function
    await login(page, EMAIL!, PASSWORD!)

    // 2) Điều hướng sang trang Analytics
    await page.goto('/analytics')
    await page.waitForLoadState('networkidle')

    // UI cơ bản hiển thị (phần tiêu đề và tab)
    await expect(page.getByRole('heading', { name: '智能业务分析' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('tab', { name: '分析仪表板' })).toBeVisible()

    // Bên trong dashboard, heading "业务分析" nên hiển thị nếu component render OK
    await expect(page.getByRole('heading', { name: '业务分析', exact: true })).toBeVisible()

    // 3) Gọi API analytics (đã đăng nhập nên cookie session được đính kèm)
    // 3a) /api/analytics/user - dữ liệu phụ thuộc seed payouts/referrals/achievements
    const userRes = await page.request.get('/api/analytics/user?period=6m')
    expect(userRes.ok()).toBeTruthy()
    const userJson = await userRes.json()

    expect(userJson).toHaveProperty('success', true)
    expect(userJson).toHaveProperty('data')

    const data = userJson.data

    // Kiểm tra một vài chỉ số chủ chốt dựa trên dữ liệu seed
    // - Broker distribution phải có đủ 3 broker mặc định được seed: Binance, Bybit, Okx
    const brokers: string[] = (data.brokerDistribution || []).map((b: any) => b.broker)
    expect(brokers).toEqual(expect.arrayContaining(['Binance', 'Bybit', 'Okx']))

    // - Payouts over time có dữ liệu theo tháng (seed mặc định 6 bản ghi trải đều trong ~6 tháng)
    expect((data.payoutsOverTime || []).length).toBeGreaterThanOrEqual(3)

    // - Tổng số referrals tối thiểu >= 1 (seed mặc định tạo ít nhất 2 referrals)
    expect((data.performanceMetrics?.totalReferrals ?? 0)).toBeGreaterThanOrEqual(1)

    // 3b) /api/analytics/insights - tổng hợp insights dựa trên dữ liệu user đã seed
    const insightsRes = await page.request.get('/api/analytics/insights')
    expect(insightsRes.ok()).toBeTruthy()
    const insightsJson = await insightsRes.json()

    expect(insightsJson).toHaveProperty('success', true)
    expect(insightsJson).toHaveProperty('data')

    const insights = insightsJson.data
    // Một vài field cơ bản trong insights
    expect(insights).toHaveProperty('performanceInsights')
    expect(insights).toHaveProperty('referralInsights')
    expect(insights.referralInsights?.totalReferrals ?? 0).toBeGreaterThanOrEqual(1)
  })
})
