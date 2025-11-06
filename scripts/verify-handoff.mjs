#!/usr/bin/env node
/*
  verify-handoff.mjs
  Mục tiêu: Chạy duy nhất một lệnh để
  - Seed TEST_USER + dữ liệu test (nếu cần)
  - Kiểm tra DB (Prisma) xem dữ liệu seed đã có đúng chưa
  - Chạy lint, build, unit tests, API tests (Newman), E2E (Playwright)
  - Tổng hợp thành báo cáo HANDOFF_FINAL_REPORT.md với trạng thái PASS/FAIL
  - Exit non-zero nếu có bất kỳ FAIL nào (đảm bảo “không còn bug dù nhỏ nhất”)

  ENV cần thiết:
  - BASE_URL: URL chạy app (local: http://localhost:3000 hoặc preview/prod)
  - SEED_SECRET_KEY: key gọi các endpoint seed testing
  - TEST_USER_EMAIL / TEST_USER_PASSWORD: tài khoản test E2E
  - DATABASE_URL: cho Prisma kiểm tra DB trực tiếp
*/

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const START = Date.now()
const report = {
  meta: {
    startedAt: new Date().toISOString(),
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  },
  seed: {
    seedUser: { status: 'SKIPPED', message: '' },
    seedData: { status: 'SKIPPED', message: '' },
  },
  db: {
    connected: { status: 'SKIPPED', message: '' },
    testUser: { status: 'SKIPPED', message: '' },
    payouts: { status: 'SKIPPED', message: '' },
    referrals: { status: 'SKIPPED', message: '' },
    achievements: { status: 'SKIPPED', message: '' },
  },
  gates: {
    lint: { status: 'SKIPPED', message: '' },
    build: { status: 'SKIPPED', message: '' },
    unit: { status: 'SKIPPED', message: '' },
    api: { status: 'SKIPPED', message: '' },
    e2e: { status: 'SKIPPED', message: '' },
  },
  summary: {
    status: 'PENDING',
    durationMs: 0,
  }
}

const emoji = {
  PASS: '✅',
  FAIL: '❌',
  SKIPPED: '⚠️',
}

function log(step, status, msg = '') {
  const icon = emoji[status] || '•'
  console.log(`${icon} ${step}: ${status}${msg ? ' — ' + msg : ''}`)
}

async function safeFetch(url, init) {
  try {
    const res = await fetch(url, init)
    return res
  } catch (e) {
    return { ok: false, status: 0, error: e }
  }
}

// Global server process reference
let serverProcess = null

async function startServer() {
  log('Server', 'STARTING', 'Starting Next.js server...')
  const { spawn } = await import('node:child_process')
  serverProcess = spawn('npm', ['start'], {
    stdio: ['inherit', 'inherit', 'inherit'],
    env: { ...process.env, NODE_ENV: 'production' },
    detached: false
  })

  // Wait for server to be ready
  let retries = 0
  while (retries < 30) { // 30 seconds max
    try {
      const res = await fetch(`${report.meta.baseUrl}/api/health`)
      if (res.ok) {
        log('Server', 'READY', `Server running at ${report.meta.baseUrl}`)
        return true
      }
    } catch (e) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    retries++
  }

  log('Server', 'FAIL', 'Server failed to start within 30 seconds')
  return false
}

async function stopServer() {
  if (serverProcess) {
    log('Server', 'STOPPING', 'Stopping server...')
    serverProcess.kill('SIGTERM')

    // Wait a bit for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Force kill if still running
    if (!serverProcess.killed) {
      serverProcess.kill('SIGKILL')
    }

    serverProcess = null
    log('Server', 'STOPPED')
  }
}

async function runSeeds() {
  const baseUrl = report.meta.baseUrl
  const key = process.env.SEED_SECRET_KEY
  const email = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD

  if (!baseUrl || !key) {
    report.seed.seedUser = { status: 'SKIPPED', message: 'Thiếu BASE_URL hoặc SEED_SECRET_KEY' }
    report.seed.seedData = { status: 'SKIPPED', message: 'Thiếu BASE_URL hoặc SEED_SECRET_KEY' }
    log('Seed', 'SKIPPED', 'Thiếu BASE_URL/SEED_SECRET_KEY')
    return
  }

  // 1) seed-test-user
  const r1 = await safeFetch(`${baseUrl}/api/testing/seed-test-user`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ email, password }),
  })
  if (r1.ok) {
    report.seed.seedUser = { status: 'PASS', message: `HTTP ${r1.status}` }
    log('Seed Test User', 'PASS')
  } else {
    report.seed.seedUser = { status: 'FAIL', message: `HTTP ${r1.status}` }
    log('Seed Test User', 'FAIL', `HTTP ${r1.status}`)
  }

  // 2) seed-test-data (payouts/referrals/achievements)
  const r2 = await safeFetch(`${baseUrl}/api/testing/seed-test-data`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ clean: true, payouts: 6, startMonthsAgo: 5, referralsCount: 2, grantAchievements: true }),
  })
  if (r2.ok) {
    const j = await r2.json().catch(() => ({}))
    report.seed.seedData = { status: 'PASS', message: `HTTP ${r2.status}, created=${j.created ?? '?'} payouts` }
    log('Seed Test Data', 'PASS', `created=${j.created ?? '?'} payouts`)
  } else {
    report.seed.seedData = { status: 'FAIL', message: `HTTP ${r2.status}` }
    log('Seed Test Data', 'FAIL', `HTTP ${r2.status}`)
  }
}

async function checkDB() {
  const { DATABASE_URL, TEST_USER_EMAIL } = process.env
  if (!DATABASE_URL || !TEST_USER_EMAIL) {
    report.db.connected = { status: 'SKIPPED', message: 'Thiếu DATABASE_URL hoặc TEST_USER_EMAIL' }
    log('DB Check', 'SKIPPED', 'Thiếu DATABASE_URL/TEST_USER_EMAIL')
    return
  }

  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    await prisma.$connect()
    report.db.connected = { status: 'PASS', message: '' }

    const user = await prisma.users.findUnique({ where: { email: TEST_USER_EMAIL } })
    if (user) {
      report.db.testUser = { status: 'PASS', message: `userId=${user.id}` }
      const payoutsCount = await prisma.payouts.count({ where: { userId: user.id, status: 'PROCESSED' } })
      const referralsCount = await prisma.users.count({ where: { referredBy: user.id } })
      const achievementsCount = await prisma.user_achievements.count({ where: { userId: user.id } })

      report.db.payouts = { status: payoutsCount > 0 ? 'PASS' : 'FAIL', message: `count=${payoutsCount}` }
      report.db.referrals = { status: referralsCount > 0 ? 'PASS' : 'FAIL', message: `count=${referralsCount}` }
      report.db.achievements = { status: achievementsCount > 0 ? 'PASS' : 'FAIL', message: `count=${achievementsCount}` }
    } else {
      report.db.testUser = { status: 'FAIL', message: 'Không tìm thấy TEST_USER' }
      report.db.payouts = { status: 'FAIL', message: '—' }
      report.db.referrals = { status: 'FAIL', message: '—' }
      report.db.achievements = { status: 'FAIL', message: '—' }
    }

    await prisma.$disconnect()
  } catch (e) {
    report.db.connected = { status: 'FAIL', message: String(e?.message || e) }
    log('DB Check', 'FAIL', String(e?.message || e))
  }
}

function runCmd(name, command, args, extraEnv = {}) {
  const env = { ...process.env, ...extraEnv }
  const p = spawnSync(command, args, { stdio: 'inherit', shell: true, env })
  const ok = p.status === 0
  report.gates[name] = { status: ok ? 'PASS' : 'FAIL', message: `exit=${p.status}` }
  log(name.toUpperCase(), ok ? 'PASS' : 'FAIL', `exit=${p.status}`)
  return ok
}

function exists(p) {
  try { return fs.existsSync(p) } catch { return false }
}

async function runGates() {
  // Lint, Build, Unit
  runCmd('lint', 'npm', ['run', 'lint'])
  runCmd('build', 'npm', ['run', 'build'])
  runCmd('unit', 'npm', ['run', 'test'])

  // API tests (Newman) nếu có collection
  const postman = path.join(process.cwd(), 'tests', 'apexrebate-api.postman_collection.json')
  if (exists(postman)) {
    runCmd('api', 'npx', ['newman', 'run', postman, '--env-var', `baseUrl=${report.meta.baseUrl}`])
  } else {
    report.gates.api = { status: 'SKIPPED', message: 'Không tìm thấy Postman collection' }
    log('API', 'SKIPPED', 'Không tìm thấy Postman collection')
  }

  // E2E tests (Playwright)
  // Dùng TEST_USER_* & BASE_URL đã set trong ENV
  // Set CI=1 to disable webServer in playwright config
  runCmd('e2e', 'npx', ['playwright', 'test', '--reporter=line'], { CI: '1' })
}

function finalize() {
  report.summary.durationMs = Date.now() - START
  const allStatuses = [
    report.seed.seedUser.status,
    report.seed.seedData.status,
    report.db.connected.status,
    report.db.testUser.status,
    report.db.payouts.status,
    report.db.referrals.status,
    report.db.achievements.status,
    report.gates.lint.status,
    report.gates.build.status,
    report.gates.unit.status,
    report.gates.api.status,
    report.gates.e2e.status,
  ]

  const hasFail = allStatuses.includes('FAIL')
  report.summary.status = hasFail ? 'FAIL' : 'PASS'

  const lines = []
  lines.push(`# Handoff Verification Report`)
  lines.push(`- Thời gian: ${new Date().toLocaleString('vi-VN')}`)
  lines.push(`- BASE_URL: ${report.meta.baseUrl}`)
  lines.push(`- Tổng thời gian: ${(report.summary.durationMs/1000).toFixed(1)}s`)
  lines.push(`- Kết luận: ${emoji[report.summary.status]} ${report.summary.status}`)
  lines.push('')

  const sec = (title) => { lines.push(`## ${title}`); lines.push('') }
  const row = (k, v) => { lines.push(`- ${k}: ${emoji[v.status]} ${v.status}${v.message ? ` — ${v.message}` : ''}`) }

  sec('Seed')
  row('Seed Test User', report.seed.seedUser)
  row('Seed Test Data', report.seed.seedData)
  lines.push('')

  sec('Kiểm tra DB')
  row('Kết nối DB', report.db.connected)
  row('TEST_USER', report.db.testUser)
  row('Payouts', report.db.payouts)
  row('Referrals', report.db.referrals)
  row('Achievements', report.db.achievements)
  lines.push('')

  sec('Quality Gates')
  row('Lint', report.gates.lint)
  row('Build', report.gates.build)
  row('Unit Tests', report.gates.unit)
  row('API Tests', report.gates.api)
  row('E2E Tests', report.gates.e2e)
  lines.push('')

  const outPath = path.join(process.cwd(), 'HANDOFF_FINAL_REPORT.md')
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8')
  console.log(`\n📄 Report written to ${outPath}`)

  if (report.summary.status === 'FAIL') {
    process.exitCode = 1
  }
}

;(async () => {
  console.log('🚀 Bắt đầu verify handoff...')

  // Start server first
  const serverStarted = await startServer()
  if (!serverStarted) {
    console.error('❌ Failed to start server, aborting verification')
    process.exit(1)
  }

  try {
    await runSeeds()
    await checkDB()
    await runGates()
  } finally {
    // Always stop server
    await stopServer()
  }

  finalize()
})().catch(async (e) => {
  console.error('Unexpected error:', e)
  // Make sure to stop server on error
  await stopServer()
  process.exitCode = 1
})
