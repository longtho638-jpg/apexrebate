'use client'

// Dashboard giữ logic client + mock fetch để không phụ thuộc server
export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, XCircle, Activity, Rocket, Settings, Shield, Globe, GitBranch, GitCommit, History } from 'lucide-react'

type Status = 'pending'|'running'|'success'|'failed'|'rolled_back'

interface Deployment {
  id: string
  version: string
  environment: 'development' | 'staging' | 'production'
  status: Status
  branch: string
  commit: string
  author: string
  startedAt: string
  completedAt?: string
  duration?: number
  changes: { added:number; modified:number; deleted:number }
  tests: { total:number; passed:number; failed:number }
}

export default function CICDDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [deployments, setDeployments] = useState<Deployment[]>([])

  const fetchDeployments = async () => {
    try {
      const res = await fetch('/api/cicd/deployments')
      const json = await res.json()
      setDeployments(json.data)
    } catch (e) {
      // fallback mock nếu API không sẵn
      setDeployments([
        {
          id: '1', version: 'v2.1.0', environment: 'production', status: 'success',
          branch: 'main', commit: 'a1b2c3d4', author: 'John Doe',
          startedAt: new Date(Date.now()-2*60*60*1000).toISOString(),
          completedAt: new Date(Date.now()-1.5*60*60*1000).toISOString(),
          duration: 1800, changes: {added:12,modified:34,deleted:5},
          tests: {total:285, passed:276, failed:9}
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchDeployments() }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="h-5 w-5 animate-spin" />
        <span className="ml-2 text-sm">加载CI/CD数据...</span>
      </div>
    )
  }

  const badgeBy = (s:Status) => s==='success'
    ? <Badge className="bg-green-100 text-green-800">成功</Badge>
    : s==='failed'
      ? <Badge variant="destructive">失败</Badge>
      : s==='running'
        ? <Badge className="bg-blue-100 text-blue-800">运行中</Badge>
        : s==='rolled_back'
          ? <Badge variant="secondary">已回滚</Badge>
          : <Badge variant="outline">待定</Badge>

  const envBadge = (e:Deployment['environment']) => (
    <Badge className={
      e==='production' ? 'text-green-600 bg-green-50' :
      e==='staging' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-50'
    }>{e}</Badge>
  )

  return (
    <div className="space-y-4">
      {deployments.map(d => (
        <Card key={d.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {d.environment==='production' ? <Globe className="h-4 w-4" /> : d.environment==='staging' ? <Shield className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {d.version} {envBadge(d.environment)} {badgeBy(d.status)}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1"><GitBranch className="h-3 w-3"/>{d.branch}</span>
                      <span className="flex items-center gap-1"><GitCommit className="h-3 w-3"/>{d.commit.slice(0,7)}</span>
                      <span>作者: {d.author}</span>
                    </div>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {d.status==='failed' && <Button size="sm" variant="outline" onClick={async ()=>{
                  await fetch('/api/cicd/rollback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({deploymentId:d.id})})
                  fetchDeployments()
                }}>回滚</Button>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium">开始时间</p>
                <p className="text-xs text-muted-foreground">{new Date(d.startedAt).toLocaleString()}</p>
              </div>
              {d.completedAt && <div>
                <p className="text-sm font-medium">完成时间</p>
                <p className="text-xs text-muted-foreground">{new Date(d.completedAt).toLocaleString()}</p>
              </div>}
              {d.duration && <div>
                <p className="text-sm font-medium">持续时间</p>
                <p className="text-xs text-muted-foreground">{Math.floor(d.duration/60)}分{d.duration%60}秒</p>
              </div>}
              <div>
                <p className="text-sm font-medium">代码变更</p>
                <p className="text-xs text-muted-foreground">+{d.changes.added} -{d.changes.deleted} ~{d.changes.modified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}