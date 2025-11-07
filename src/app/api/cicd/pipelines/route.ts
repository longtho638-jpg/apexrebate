import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    data: [
      {
        id: '1',
        name: '主应用部署管道',
        description: '主应用程序的完整CI/CD流程',
        status: 'active',
        lastRun: new Date(Date.now()-30*60*1000).toISOString(),
        nextRun: new Date(Date.now()+30*60*1000).toISOString(),
        triggers: ['push','pull_request','schedule'],
        stages: [
          { name:'代码检查', status:'success', duration:120 },
          { name:'单元测试', status:'success', duration:180 },
          { name:'构建镜像', status:'success', duration:300 },
          { name:'部署到Staging', status:'success', duration:240 },
          { name:'集成测试', status:'running' },
          { name:'部署到Production', status:'pending' },
        ]
      },
    ]
  })
}
