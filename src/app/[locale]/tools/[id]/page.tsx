'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  Users, 
  DollarSign, 
  Download, 
  Heart, 
  Share2, 
  ExternalLink,
  ShoppingCart,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Tool {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  type: string;
  image?: string;
  features: string[];
  requirements: string[];
  documentation: string;
  status: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  rating: number;
  reviews: number;
  sales: number;
  isFavorited?: boolean;
  isPurchased?: boolean;
}

interface ToolReview {
  id: string;
  rating: number;
  title?: string;
  content?: string;
  pros: string[];
  cons: string[];
  verified: boolean;
  helpful: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function ToolDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  
  const [tool, setTool] = useState<Tool | null>(null);
  const [reviews, setReviews] = useState<ToolReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchTool();
      fetchReviews();
    }
  }, [params.id, session]);

  const fetchTool = async () => {
    try {
      const response = await fetch(`/api/tools/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setTool(data);
      } else {
        toast.error('Không tìm thấy công cụ');
        router.push('/tools');
      }
    } catch (error) {
      console.error('Error fetching tool:', error);
      toast.error('Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/tools/${params.id}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handlePurchase = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setPurchasing(true);
    try {
      const response = await fetch(`/api/tools/${params.id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const order = await response.json();
        toast.success('Đặt hàng thành công! Vui lòng thanh toán.');
        // Redirect to payment or order details
        router.push(`/tools/orders/${order.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Đặt hàng thất bại');
      }
    } catch (error) {
      console.error('Error purchasing tool:', error);
      toast.error('Đã có lỗi xảy ra');
    } finally {
      setPurchasing(false);
    }
  };

  const handleFavorite = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setFavoriting(true);
    try {
      const method = tool?.isFavorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/tools/${params.id}/favorite`, {
        method,
      });

      if (response.ok) {
        setTool(prev => prev ? { ...prev, isFavorited: !prev.isFavorited } : null);
        toast.success(tool?.isFavorited ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
      } else {
        toast.error('Thao tác thất bại');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Đã có lỗi xảy ra');
    } finally {
      setFavoriting(false);
    }
  };

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded-lg"></div>
                <div className="h-96 bg-muted rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-muted rounded-lg"></div>
                <div className="h-64 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy công cụ</h1>
            <Link href="/tools">
              <Button>Quay lại Chợ Công Cụ</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/tools">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tool Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getTypeIcon(tool.type)}</span>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {getTypeLabel(tool.type)}
                      </Badge>
                      {tool.featured && (
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Nổi bật
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFavorite}
                    disabled={favoriting}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${tool.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                    {tool.isFavorited ? 'Đã thích' : 'Thích'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    Chia sẻ
                  </Button>
                </div>
              </div>

              {/* Rating and Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium text-foreground">{tool.rating.toFixed(1)}</span>
                  <span>({tool.reviews} đánh giá)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{tool.sales} đã bán</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Xu hướng</span>
                </div>
              </div>

              {/* Tool Image */}
              {tool.image && (
                <div className="mb-6">
                  <img
                    src={tool.image}
                    alt={tool.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Mô tả</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="features" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="features">Tính năng</TabsTrigger>
                  <TabsTrigger value="requirements">Yêu cầu</TabsTrigger>
                  <TabsTrigger value="documentation">Tài liệu</TabsTrigger>
                </TabsList>

                <TabsContent value="features" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        Tính năng nổi bật
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {tool.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="requirements" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                        Yêu cầu hệ thống
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {tool.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documentation" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Download className="w-5 h-5 mr-2" />
                        Tài liệu hướng dẫn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm">
                            {tool.documentation}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Đánh giá ({reviews.length})</h2>
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">Chưa có đánh giá nào</p>
                    </CardContent>
                  </Card>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={review.user.avatar} />
                              <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{review.user.name}</span>
                                {review.verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Đã mua
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < review.rating
                                        ? 'text-yellow-500 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                                <span className="text-sm text-muted-foreground ml-1">
                                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {review.title && (
                          <h4 className="font-medium mb-2">{review.title}</h4>
                        )}

                        {review.content && (
                          <p className="text-muted-foreground mb-3">{review.content}</p>
                        )}

                        {(review.pros.length > 0 || review.cons.length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {review.pros.length > 0 && (
                              <div>
                                <h5 className="font-medium text-green-600 mb-2">Ưu điểm:</h5>
                                <ul className="text-sm space-y-1">
                                  {review.pros.map((pro, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <span className="text-green-600">+</span>
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {review.cons.length > 0 && (
                              <div>
                                <h5 className="font-medium text-red-600 mb-2">Nhược điểm:</h5>
                                <ul className="text-sm space-y-1">
                                  {review.cons.map((con, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <span className="text-red-600">-</span>
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                          <Button variant="ghost" size="sm">
                            👍 Hữu ích ({review.helpful})
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card>
              <CardHeader>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${tool.price}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Một lần thanh toán
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tool.isPurchased ? (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="font-medium">Bạn đã sở hữu công cụ này</p>
                    <Button className="w-full mt-2">
                      <Download className="w-4 h-4 mr-2" />
                      Tải xuống
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={handlePurchase}
                    disabled={purchasing}
                  >
                    {purchasing ? (
                      'Đang xử lý...'
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Mua ngay
                      </>
                    )}
                  </Button>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Bảo vệ người mua</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Tải xuống ngay lập tức</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>Hỗ trợ 24/7</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Người bán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={tool.seller.avatar} />
                    <AvatarFallback>{tool.seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{tool.seller.name}</h4>
                    <p className="text-sm text-muted-foreground">Người bán verified</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Đã bán:</span>
                    <span className="font-medium">{tool.sales} công cụ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Đánh giá:</span>
                    <span className="font-medium">{tool.rating.toFixed(1)}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tham gia:</span>
                    <span className="font-medium">
                      {new Date(tool.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <Separator className="my-4" />
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Xem hồ sơ
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{tool.sales}</div>
                    <div className="text-sm text-muted-foreground">Đã bán</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{tool.reviews}</div>
                    <div className="text-sm text-muted-foreground">Đánh giá</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}