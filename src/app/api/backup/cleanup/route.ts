import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)

interface CleanupResult {
  success: boolean
  deletedFiles: string[]
  freedSpace: number
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { retentionDays = 7, dryRun = false } = body

    // 备份目录配置
    const backupDir = path.join(process.cwd(), 'backups')
    const logsDir = path.join(process.cwd(), 'logs')
    
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({
        success: false,
        error: 'Backup directory not found'
      }, { status: 404 })
    }

    const result: CleanupResult = {
      success: true,
      deletedFiles: [],
      freedSpace: 0
    }

    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000)

    // 清理备份文件
    const cleanupDirectory = async (dir: string, pattern: string) => {
      if (!fs.existsSync(dir)) return

      const files = fs.readdirSync(dir)
      
      for (const file of files) {
        const filePath = path.join(dir, file)
        const stats = fs.statSync(filePath)
        
        if (stats.mtime.getTime() < cutoffTime) {
          const fileSize = stats.size
          
          if (!dryRun) {
            try {
              if (stats.isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true })
              } else {
                fs.unlinkSync(filePath)
              }
              result.deletedFiles.push(filePath)
              result.freedSpace += fileSize
            } catch (error) {
              console.error(`Failed to delete ${filePath}:`, error)
            }
          } else {
            result.deletedFiles.push(`${filePath} (dry run)`)
            result.freedSpace += fileSize
          }
        }
      }
    }

    // 清理备份目录
    await cleanupDirectory(backupDir, '*.tar.gz*')
    
    // 清理日志目录
    await cleanupDirectory(logsDir, '*.log')

    // 清理临时文件
    const tempDir = path.join(process.cwd(), 'temp')
    await cleanupDirectory(tempDir, '*')

    // 如果是实际清理，运行系统清理命令
    if (!dryRun) {
      try {
        // 清理 npm 缓存
        await execAsync('npm cache clean --force 2>/dev/null || true')
        
        // 清理 Next.js 构建缓存
        const nextCacheDir = path.join(process.cwd(), '.next')
        if (fs.existsSync(nextCacheDir)) {
          await execAsync(`rm -rf "${nextCacheDir}/cache" 2>/dev/null || true`)
        }

        // 清理 Prisma 缓存
        const prismaCacheDir = path.join(process.cwd(), 'node_modules/.prisma')
        if (fs.existsSync(prismaCacheDir)) {
          await execAsync(`rm -rf "${prismaCacheDir}" 2>/dev/null || true`)
        }

      } catch (error) {
        console.error('System cleanup failed:', error)
      }
    }

    // 获取当前磁盘使用情况
    let diskUsage: { total: string | number; used: string | number; free: string | number; percentage: number } = { total: 0, used: 0, free: 0, percentage: 0 }
    try {
      const { stdout } = await execAsync('df -h .')
      const lines = stdout.split('\n')
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/)
        if (parts.length >= 6) {
          diskUsage = {
            total: parts[1],
            used: parts[2],
            free: parts[3],
            percentage: parseInt(parts[4]) || 0
          }
        }
      }
    } catch (error) {
      console.error('Failed to get disk usage:', error)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        freedSpaceMB: Math.round(result.freedSpace / 1024 / 1024 * 100) / 100,
        deletedCount: result.deletedFiles.length,
        diskUsage,
        retentionDays,
        dryRun
      }
    })

  } catch (error) {
    console.error('Backup cleanup API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Cleanup failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // 获取备份和日志目录的磁盘使用情况
    const backupDir = path.join(process.cwd(), 'backups')
    const logsDir = path.join(process.cwd(), 'logs')
    
    const getDirectorySize = (dir: string): number => {
      if (!fs.existsSync(dir)) return 0
      
      let totalSize = 0
      const files = fs.readdirSync(dir)
      
      for (const file of files) {
        const filePath = path.join(dir, file)
        const stats = fs.statSync(filePath)
        
        if (stats.isDirectory()) {
          totalSize += getDirectorySize(filePath)
        } else {
          totalSize += stats.size
        }
      }
      
      return totalSize
    }

    const backupSize = getDirectorySize(backupDir)
    const logsSize = getDirectorySize(logsDir)

    // 获取总体磁盘使用情况
    let diskUsage: { total: string | number; used: string | number; free: string | number; percentage: number } = { total: 0, used: 0, free: 0, percentage: 0 }
    try {
      const { stdout } = await execAsync('df -h .')
      const lines = stdout.split('\n')
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/)
        if (parts.length >= 6) {
          diskUsage = {
            total: parts[1],
            used: parts[2],
            free: parts[3],
            percentage: parseInt(parts[4]) || 0
          }
        }
      }
    } catch (error) {
      console.error('Failed to get disk usage:', error)
    }

    return NextResponse.json({
      success: true,
      data: {
        backupSizeMB: Math.round(backupSize / 1024 / 1024 * 100) / 100,
        logsSizeMB: Math.round(logsSize / 1024 / 1024 * 100) / 100,
        diskUsage,
        backupDir: fs.existsSync(backupDir),
        logsDir: fs.existsSync(logsDir)
      }
    })

  } catch (error) {
    console.error('Backup status API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get backup status'
    }, { status: 500 })
  }
}