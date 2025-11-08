'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface BuildStatus {
  id: string
  status: 'success' | 'failed' | 'pending' | 'running'
  branch: string
  commit: string
  timestamp: string
  duration?: string
}

export default function CICDPage() {
  const [builds, setBuilds] = useState<BuildStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
	// Giả lập dữ liệu build status
	const mockBuilds: BuildStatus[] = [
	  {
		id: '1',
		status: 'success',
		branch: 'main',
		commit: 'abc123d',
		timestamp: new Date().toISOString(),
		duration: '2m 15s'
	  },
	  {
		id: '2', 
		status: 'running',
		branch: 'feature/user-auth',
		commit: 'def456e',
		timestamp: new Date().toISOString()
	  }
	]
	
	setTimeout(() => {
	  setBuilds(mockBuilds)
	  setIsLoading(false)
	}, 1000)
  }, [])

  const getStatusColor = (status: string) => {
	switch (status) {
	  case 'success': return 'bg-green-500'
	  case 'failed': return 'bg-red-500'
	  case 'running': return 'bg-yellow-500'
	  case 'pending': return 'bg-gray-500'
	  default: return 'bg-gray-500'
	}
  }

  const getStatusEmoji = (status: string) => {
	switch (status) {
	  case 'success': return '✅'
	  case 'failed': return '❌'
	  case 'running': return '🔄'
	  case 'pending': return '⏳'
	  default: return '❓'
	}
  }

  if (isLoading) {
	return (
	  <div className="container mx-auto py-8">
		<div className="flex items-center justify-center">
		  <div className="text-lg">🔄 Đang tải dữ liệu CI/CD...</div>
		</div>
	  </div>
	)
  }

  return (
	<div className="container mx-auto py-8 space-y-6">
	  <div className="flex items-center justify-between">
		<div>
		  <h1 className="text-3xl font-bold">🚀 ApexRebate CI/CD Dashboard</h1>
		  <p className="text-muted-foreground mt-2">
			Theo dõi trạng thái build và deployment theo thời gian thực
		  </p>
		</div>
		<Button onClick={() => window.location.reload()}>
		  🔄 Refresh
		</Button>
	  </div>

	  <div className="grid gap-4">
		{builds.map((build) => (
		  <Card key={build.id}>
			<CardHeader className="pb-3">
			  <div className="flex items-center justify-between">
				<CardTitle className="text-lg flex items-center gap-2">
				  {getStatusEmoji(build.status)}
				  Build #{build.id}
				</CardTitle>
				<Badge className={getStatusColor(build.status)}>
				  {build.status.toUpperCase()}
				</Badge>
			  </div>
			  <CardDescription>
				Branch: <code className="bg-muted px-1 rounded">{build.branch}</code> • 
				Commit: <code className="bg-muted px-1 rounded">{build.commit}</code>
			  </CardDescription>
			</CardHeader>
			<CardContent>
			  <div className="flex items-center gap-4 text-sm text-muted-foreground">
				<span>⏰ {new Date(build.timestamp).toLocaleString('vi-VN')}</span>
				{build.duration && (
				  <span>⚡ Duration: {build.duration}</span>
				)}
			  </div>
			</CardContent>
		  </Card>
		))}
	  </div>

	  {builds.length === 0 && (
		<Card>
		  <CardContent className="text-center py-8">
			<div className="text-muted-foreground">
			  🤔 Chưa có build nào được tìm thấy
			</div>
		  </CardContent>
		</Card>
	  )}
	</div>
  )
}