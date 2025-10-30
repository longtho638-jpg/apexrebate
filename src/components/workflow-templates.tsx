'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Eye, 
  Copy,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  BarChart3,
  Bell,
  Zap,
  Clock,
  CheckCircle,
  ArrowRight,
  Heart,
  MessageSquare
} from 'lucide-react'

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  steps: number
  uses: number
  rating: number
  tags: string[]
  features: string[]
  roi: string
  author: string
  preview: string
  icon: React.ReactNode
  color: string
  isNew?: boolean
  isPopular?: boolean
}

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: '1',
    name: '智能返佣计算系统',
    description: '自动化处理多平台返佣计算，支持实时数据同步和智能分润算法',
    category: '返佣管理',
    difficulty: 'intermediate',
    estimatedTime: '2-3天',
    steps: 8,
    uses: 1247,
    rating: 4.8,
    tags: ['返佣', '计算', '自动化', '分润'],
    features: [
      '多平台数据集成',
      '实时计算引擎',
      '智能分润算法',
      '自动报表生成',
      '异常监控告警'
    ],
    roi: '300%',
    author: 'ApexRebate Team',
    preview: '/templates/rebate-calc-preview.png',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'text-green-600',
    isPopular: true
  },
  {
    id: '2',
    name: '用户生命周期管理',
    description: '从注册到活跃的全流程自动化，提升用户留存和转化率',
    category: '用户管理',
    difficulty: 'advanced',
    estimatedTime: '5-7天',
    steps: 12,
    uses: 892,
    rating: 4.6,
    tags: ['用户管理', '营销自动化', '留存', '转化'],
    features: [
      '智能用户画像',
      '个性化推荐',
      '自动化营销',
      '流失预警',
      'A/B测试'
    ],
    roi: '250%',
    author: 'Product Team',
    preview: '/templates/user-lifecycle-preview.png',
    icon: <Users className="h-5 w-5" />,
    color: 'text-blue-600',
    isNew: true
  },
  {
    id: '3',
    name: '风险控制监控系统',
    description: '实时监控交易风险，自动识别异常行为并触发预警机制',
    category: '风险控制',
    difficulty: 'advanced',
    estimatedTime: '7-10天',
    steps: 15,
    uses: 656,
    rating: 4.9,
    tags: ['风控', '监控', '预警', '安全'],
    features: [
      '实时风险监控',
      '智能异常检测',
      '自动处置机制',
      '风险分析报告',
      '合规检查'
    ],
    roi: '400%',
    author: 'Security Team',
    preview: '/templates/risk-monitor-preview.png',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-red-600',
    isPopular: true
  },
  {
    id: '4',
    name: '数据同步与报表自动化',
    description: '多源数据自动同步，生成可视化报表和业务洞察',
    category: '数据分析',
    difficulty: 'beginner',
    estimatedTime: '1-2天',
    steps: 6,
    uses: 1823,
    rating: 4.5,
    tags: ['数据同步', '报表', 'BI', '可视化'],
    features: [
      '多数据源集成',
      '自动数据清洗',
      '可视化报表',
      '趋势分析',
      '定时推送'
    ],
    roi: '200%',
    author: 'Data Team',
    preview: '/templates/data-sync-preview.png',
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'text-purple-600'
  },
  {
    id: '5',
    name: '智能通知系统',
    description: '多渠道通知发送，支持个性化消息和智能调度',
    category: '通知系统',
    difficulty: 'intermediate',
    estimatedTime: '2-3天',
    steps: 7,
    uses: 934,
    rating: 4.4,
    tags: ['通知', '消息', '邮件', '短信'],
    features: [
      '多渠道发送',
      '个性化消息',
      '智能调度',
      '发送统计',
      '失败重试'
    ],
    roi: '180%',
    author: 'Communication Team',
    preview: '/templates/notification-preview.png',
    icon: <Bell className="h-5 w-5" />,
    color: 'text-orange-600'
  },
  {
    id: '6',
    name: 'API集成自动化',
    description: '第三方API集成，数据同步和业务流程自动化',
    category: 'API集成',
    difficulty: 'intermediate',
    estimatedTime: '3-4天',
    steps: 9,
    uses: 756,
    rating: 4.7,
    tags: ['API', '集成', '同步', '自动化'],
    features: [
      'RESTful API集成',
      '数据格式转换',
      '错误处理',
      '限流控制',
      '日志记录'
    ],
    roi: '220%',
    author: 'Integration Team',
    preview: '/templates/api-integration-preview.png',
    icon: <Zap className="h-5 w-5" />,
    color: 'text-yellow-600',
    isNew: true
  }
]

const CATEGORIES = [
  { value: 'all', label: '全部模板' },
  { value: 'rebate', label: '返佣管理' },
  { value: 'user', label: '用户管理' },
  { value: 'risk', label: '风险控制' },
  { value: 'data', label: '数据分析' },
  { value: 'notification', label: '通知系统' },
  { value: 'api', label: 'API集成' }
]

const DIFFICULTY_LEVELS = [
  { value: 'all', label: '全部难度' },
  { value: 'beginner', label: '初级' },
  { value: 'intermediate', label: '中级' },
  { value: 'advanced', label: '高级' }
]

export function WorkflowTemplates() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)

  const filteredTemplates = WORKFLOW_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.uses - a.uses
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return b.id.localeCompare(a.id)
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      default:
        return 0
    }
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初级'
      case 'intermediate': return '中级'
      case 'advanced': return '高级'
      default: return '未知'
    }
  }

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索模板名称、描述或标签..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="难度" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="排序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">最受欢迎</SelectItem>
                  <SelectItem value="rating">评分最高</SelectItem>
                  <SelectItem value="newest">最新发布</SelectItem>
                  <SelectItem value="difficulty">难度排序</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{WORKFLOW_TEMPLATES.length}</div>
            <div className="text-sm text-muted-foreground">总模板数</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {WORKFLOW_TEMPLATES.reduce((sum, t) => sum + t.uses, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">总使用次数</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(WORKFLOW_TEMPLATES.reduce((sum, t) => sum + t.rating, 0) / WORKFLOW_TEMPLATES.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">平均评分</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredTemplates.length}
            </div>
            <div className="text-sm text-muted-foreground">筛选结果</div>
          </CardContent>
        </Card>
      </div>

      {/* 模板列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-opacity-10 ${template.color.replace('text', 'bg')}`}>
                    <div className={template.color}>
                      {template.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {template.category}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {template.isNew && (
                    <Badge variant="secondary" className="text-xs">
                      新
                    </Badge>
                  )}
                  {template.isPopular && (
                    <Badge variant="default" className="text-xs bg-orange-500">
                      热门
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">{template.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{template.uses}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{template.estimatedTime}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {getDifficultyText(template.difficulty)}
                </Badge>
                <Badge variant="outline">
                  {template.steps} 步骤
                </Badge>
                <Badge variant="outline" className="text-green-600">
                  ROI {template.roi}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  预览
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Copy className="h-3 w-3 mr-1" />
                  使用
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {filteredTemplates.length === 0 && (
        <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">未找到匹配的模板</h3>
            <p className="text-sm text-gray-500 mb-4">
              尝试调整搜索条件或浏览其他分类
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedDifficulty('all')
              }}
            >
              清除筛选条件
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 模板详情弹窗 */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-opacity-10 ${selectedTemplate.color.replace('text', 'bg')}`}>
                    <div className={`${selectedTemplate.color} text-xl`}>
                      {selectedTemplate.icon}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl">{selectedTemplate.name}</CardTitle>
                    <CardDescription>
                      作者: {selectedTemplate.author} • {selectedTemplate.category}
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">模板描述</h4>
                <p className="text-muted-foreground">{selectedTemplate.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedTemplate.rating}</div>
                  <div className="text-sm text-muted-foreground">用户评分</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedTemplate.uses}</div>
                  <div className="text-sm text-muted-foreground">使用次数</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedTemplate.steps}</div>
                  <div className="text-sm text-muted-foreground">步骤数量</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{selectedTemplate.roi}</div>
                  <div className="text-sm text-muted-foreground">预期ROI</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">核心功能</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedTemplate.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">技术信息</h4>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">难度等级:</span>
                    <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                      {getDifficultyText(selectedTemplate.difficulty)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">预计时间:</span>
                    <span>{selectedTemplate.estimatedTime}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">标签</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1" size="lg">
                  <Copy className="h-4 w-4 mr-2" />
                  使用此模板
                </Button>
                <Button variant="outline" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  下载模板
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-4 w-4 mr-2" />
                  收藏
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}