'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Grid, List, Star, Users, DollarSign, TrendingUp, Plus, Upload, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  type: 'INDICATOR' | 'BOT' | 'SCANNER' | 'STRATEGY' | 'EDUCATION';
  image?: string;
  rating: number;
  reviews: number;
  sales: number;
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
  featured: boolean;
  createdAt: string;
}

interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function ToolsMarketplace() {
  const { data: session } = useSession();
  const t = useTranslations();
  const locale = useLocale();
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchTools();
    fetchCategories();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/tools');
      if (response.ok) {
        const data = await response.json();
        // API trả về { tools, pagination } trên endpoint hiện tại
        // Chuẩn hóa dữ liệu về shape UI đang render (có field seller)
        const list = Array.isArray(data) ? data : (data?.tools || []);
        const mapped: Tool[] = list.map((tool: any) => ({
          id: tool.id,
          name: tool.name,
          description: tool.description,
          price: tool.price,
          category: tool.category,
          type: tool.type,
          image: tool.image,
          rating: typeof tool.rating === 'number' ? tool.rating : 0,
          reviews: typeof tool.reviews === 'number' ? tool.reviews : 0,
          sales: typeof tool.sales === 'number' ? tool.sales : (tool._count?.tool_orders ?? 0),
          seller: {
            id: tool.users?.id ?? tool.seller?.id ?? '',
            name: tool.users?.name ?? tool.seller?.name ?? 'Seller',
            avatar: tool.users?.image ?? tool.seller?.avatar ?? undefined,
          },
          featured: !!tool.featured,
          createdAt: tool.createdAt,
        }));
        setTools(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/tools/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesType = selectedType === 'all' || tool.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const sortedTools = [...filteredTools].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.sales - a.sales;
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INDICATOR':
        return '📊';
      case 'BOT':
        return '🤖';
      case 'SCANNER':
        return '🔍';
      case 'STRATEGY':
        return '📋';
      case 'EDUCATION':
        return '📚';
      default:
        return '🔧';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'INDICATOR':
        return 'Chỉ báo';
      case 'BOT':
        return 'Bot';
      case 'SCANNER':
        return 'Scanner';
      case 'STRATEGY':
        return 'Chiến lược';
      case 'EDUCATION':
        return 'Giáo dục';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Chợ Công Cụ</h1>
              <p className="text-green-100 text-lg">
                Khám phá và mua các công cụ giao dịch chuyên nghiệp từ cộng đồng trader hàng đầu
              </p>
            </div>
            <div className="flex gap-2">
              {session && (
                <Link href={`/${locale}/tools/upload`}>
                  <Button className="bg-white text-green-600 hover:bg-green-50">
                    <Upload className="w-4 h-4 mr-2" />
                    Đăng Công Cụ
                  </Button>
                </Link>
              )}
              {session?.user?.role === 'ADMIN' && (
                <Link href={`/${locale}/tools/analytics`}>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Phân Tích
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm công cụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="INDICATOR">📊 Chỉ báo</SelectItem>
                <SelectItem value="BOT">🤖 Bot</SelectItem>
                <SelectItem value="SCANNER">🔍 Scanner</SelectItem>
                <SelectItem value="STRATEGY">📋 Chiến lược</SelectItem>
                <SelectItem value="EDUCATION">📚 Giáo dục</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">🔥 Phổ biến nhất</SelectItem>
                <SelectItem value="rating">⭐ Đánh giá cao</SelectItem>
                <SelectItem value="price-low">💰 Giá thấp đến cao</SelectItem>
                <SelectItem value="price-high">💎 Giá cao đến thấp</SelectItem>
                <SelectItem value="newest">🆕 Mới nhất</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Tools */}
        {sortedTools.filter(tool => tool.featured).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              Công Cụ Nổi Bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTools.filter(tool => tool.featured).slice(0, 3).map((tool) => (
                <Card key={tool.id} className="border-yellow-200 bg-yellow-50/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getTypeIcon(tool.type)}</span>
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {getTypeLabel(tool.type)}
                          </Badge>
                        </div>
                      </div>
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Nổi bật
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-2">
                      {tool.description}
                    </CardDescription>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={tool.seller.avatar} />
                          <AvatarFallback>{tool.seller.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{tool.seller.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{tool.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({tool.reviews})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          ${tool.price}
                        </span>
                      </div>
                      <Link href={`/${locale}/tools/${tool.id}`}>
                        <Button className="bg-green-600 hover:bg-green-700">
                          Xem chi tiết
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Tools */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              Tất cả công cụ ({sortedTools.length})
            </h2>
          </div>

          {sortedTools.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold mb-2">Không tìm thấy công cụ nào</h3>
              <p className="text-muted-foreground">
                Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" :
              "space-y-4"
            }>
              {sortedTools.map((tool) => (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getTypeIcon(tool.type)}</span>
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {getTypeLabel(tool.type)}
                          </Badge>
                        </div>
                      </div>
                      {tool.featured && (
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Nổi bật
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-2">
                      {tool.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      {/* Seller Info */}
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={tool.seller.avatar} />
                          <AvatarFallback>{tool.seller.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{tool.seller.name}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{tool.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({tool.reviews} đánh giá)</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{tool.sales} đã bán</span>
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <span className="text-xl font-bold text-green-600">
                            ${tool.price}
                          </span>
                        </div>
                        <Link href={`/${locale}/tools/${tool.id}`}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Xem chi tiết
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}