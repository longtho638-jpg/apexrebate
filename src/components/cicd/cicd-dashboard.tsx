'use client'

// Dashboard giữ logic client + mock fetch để không phụ thuộc server
export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe, GitBranch, GitCommit, RefreshCw, Settings, Shield } from 'lucide-react'

type Status = 'pending' | 'running' | 'success' | 'failed' | 'rolled_back'

type Environment = 'development' | 'staging' | 'production'

interface Deployment {
  id: string
  version: string
  environment: Environment
  status: Status
  branch: string
  commit: string
  author: string
  startedAt: string
  completedAt?: string
  duration?: number
  changes: { added: number; modified: number; deleted: number }
  tests: { total: number; passed: number; failed: number }
}

const FALLBACK_DEPLOYMENTS: Deployment[] = [
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
]

const environmentIcon = (env: Environment) =>
  env === 'production' ? <Globe className="h-4 w-4" /> : env === 'staging' ? <Shield className="h-4 w-4" /> : <Settings className="h-4 w-4" />

const environmentBadge = (env: Environment) => (
  <Badge
    className={
      env === 'production'
        ? 'text-green-600 bg-green-50'
        : env === 'staging'
          ? 'text-blue-600 bg-blue-50'
          : 'text-gray-600 bg-gray-50'
    }
  >
    {env}
  </Badge>
)

const statusBadge = (status: Status) => {
  switch (status) {
    case 'success':
      return <Badge className="bg-green-100 text-green-800">成功</Badge>
    case 'failed':
      return <Badge variant="destructive">失败</Badge>
    case 'running':
      return <Badge className="bg-blue-100 text-blue-800">运行中</Badge>
    case 'rolled_back':
      return <Badge variant="secondary">已回滚</Badge>
    default:
      return <Badge variant="outline">待定</Badge>
  }
}

export default function CICDDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [deployments, setDeployments] = useState<Deployment[]>([])

  const fetchDeployments = async () => {
    try {
      const res = await fetch('/api/cicd/deployments')
      if (!res.ok) {
        throw new Error('Failed to load deployments')
      }
      const json = (await res.json()) as { data?: Deployment[] }
      setDeployments(json.data ?? FALLBACK_DEPLOYMENTS)
    } catch (error) {
      console.warn('Falling back to static deployments', error)
      setDeployments(FALLBACK_DEPLOYMENTS)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDeployments().catch(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        加载CI/CD数据...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {deployments.map(deployment => (
        <Card key={deployment.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {environmentIcon(deployment.environment)}
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {deployment.version}
                    {environmentBadge(deployment.environment)}
                    {statusBadge(deployment.status)}
                  </CardTitle>
                  <CardDescription>
                    <div className="mt-1 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {deployment.branch}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitCommit className="h-3 w-3" />
                        {deployment.commit.slice(0, 7)}
                      </span>
                      <span>作者: {deployment.author}</span>
                    </div>
                  </CardDescription>
                </div>
              </div>
              {deployment.status === 'failed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await fetch('/api/cicd/rollback', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ deploymentId: deployment.id }),
                    })
                    fetchDeployments().catch(() => undefined)
                  }}
                >
                  回滚
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium">开始时间</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(deployment.startedAt).toLocaleString()}
                </p>
              </div>
              {deployment.completedAt && (
                <div>
                  <p className="text-sm font-medium">完成时间</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(deployment.completedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {deployment.duration && (
                <div>
                  <p className="text-sm font-medium">持续时间</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(deployment.duration / 60)}分{deployment.duration % 60}秒
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">代码变更</p>
                <p className="text-xs text-muted-foreground">
                  +{deployment.changes.added} -{deployment.changes.deleted} ~{deployment.changes.modified}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
