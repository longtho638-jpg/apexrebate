import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    data: [
      {
        id: '1',
        version: 'v2.1.0',
        environment: 'production',
        status: 'success',
        branch: 'main',
        commit: 'a1b2c3d4',
        author: 'John Doe',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        duration: 1800,
        changes: { added: 12, modified: 34, deleted: 5 },
        tests: { total: 285, passed: 276, failed: 9 },
      },
      {
        id: '2',
        version: 'v2.0.9',
        environment: 'staging',
        status: 'running',
        branch: 'develop',
        commit: 'e5f6g7h8',
        author: 'Jane Smith',
        startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        changes: { added: 8, modified: 22, deleted: 3 },
        tests: { total: 265, passed: 245, failed: 0 },
      },
      {
        id: '3',
        version: 'v2.0.8',
        environment: 'development',
        status: 'failed',
        branch: 'feature/new-ui',
        commit: 'i9j0k1l2',
        author: 'Bob Johnson',
        startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        duration: 300,
        changes: { added: 15, modified: 28, deleted: 7 },
        tests: { total: 295, passed: 280, failed: 15 },
      },
    ],
  })
}
