'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Plus, X, Save, Eye, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function ToolUpload() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    type: 'INDICATOR',
    image: '',
    features: [''],
    requirements: [''],
    documentation: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchCategories();
  }, [session, status, router]);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên công cụ');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả công cụ');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return false;
    }
    if (!formData.category) {
      toast.error('Vui lòng chọn danh mục');
      return false;
    }
    if (!formData.type) {
      toast.error('Vui lòng chọn loại công cụ');
      return false;
    }
    return true;
  };

  const handleSubmit = async (publish = false) => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        features: formData.features.filter(f => f.trim()),
        requirements: formData.requirements.filter(r => r.trim()),
        status: publish ? 'PENDING' : 'DRAFT'
      };

      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const tool = await response.json();
        toast.success(publish ? 'Công cụ đã được gửi để duyệt' : 'Nháp đã được lưu');
        router.push(`/tools/${tool.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create tool');
      }
    } catch (error) {
      console.error('Error creating tool:', error);
      toast.error('Đã có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tools">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Đăng Công Cụ Mới</h1>
                <p className="text-muted-foreground">Chia sẻ công cụ giao dịch của bạn với cộng đồng</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPreview(!preview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {preview ? 'Chỉnh sửa' : 'Xem trước'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {preview ? (
            /* Preview Mode */
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{formData.name || 'Tên công cụ'}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {formData.type === 'INDICATOR' ? '📊 Chỉ báo' :
                         formData.type === 'BOT' ? '🤖 Bot' :
                         formData.type === 'SCANNER' ? '🔍 Scanner' :
                         formData.type === 'STRATEGY' ? '📋 Chiến lược' :
                         '📚 Giáo dục'}
                      </Badge>
                      <Badge variant="outline">
                        {categories.find(c => c.id === formData.category)?.name || 'Danh mục'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      ${formData.price || '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">Giá bán</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Mô tả</h3>
                  <p className="text-muted-foreground">
                    {formData.description || 'Chưa có mô tả'}
                  </p>
                </div>

                {formData.features.filter(f => f.trim()).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Tính năng</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {formData.features.filter(f => f.trim()).map((feature, index) => (
                        <li key={index} className="text-muted-foreground">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {formData.requirements.filter(r => r.trim()).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Yêu cầu</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {formData.requirements.filter(r => r.trim()).map((req, index) => (
                        <li key={index} className="text-muted-foreground">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {formData.documentation && (
                  <div>
                    <h3 className="font-semibold mb-2">Tài liệu</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {formData.documentation}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={() => setPreview(false)} variant="outline">
                    Quay lại chỉnh sửa
                  </Button>
                  <Button 
                    onClick={() => handleSubmit(true)} 
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? 'Đang gửi...' : 'Gửi để duyệt'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Edit Mode */
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                <TabsTrigger value="details">Chi tiết</TabsTrigger>
                <TabsTrigger value="documentation">Tài liệu</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin cơ bản</CardTitle>
                    <CardDescription>
                      Thông tin chính về công cụ của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Tên công cụ *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Nhập tên công cụ"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Giá ($) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Mô tả *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Mô tả chi tiết về công cụ của bạn..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Danh mục *</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.icon} {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="type">Loại công cụ *</Label>
                        <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INDICATOR">📊 Chỉ báo</SelectItem>
                            <SelectItem value="BOT">🤖 Bot</SelectItem>
                            <SelectItem value="SCANNER">🔍 Scanner</SelectItem>
                            <SelectItem value="STRATEGY">📋 Chiến lược</SelectItem>
                            <SelectItem value="EDUCATION">📚 Giáo dục</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="image">URL hình ảnh</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => handleInputChange('image', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tính năng</CardTitle>
                    <CardDescription>
                      Các tính năng chính của công cụ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="Nhập tính năng"
                        />
                        {formData.features.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFeature(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addFeature}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm tính năng
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Yêu cầu hệ thống</CardTitle>
                    <CardDescription>
                      Các yêu cầu để sử dụng công cụ
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.requirements.map((requirement, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={requirement}
                          onChange={(e) => updateRequirement(index, e.target.value)}
                          placeholder="Nhập yêu cầu"
                        />
                        {formData.requirements.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeRequirement(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addRequirement}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm yêu cầu
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documentation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tài liệu hướng dẫn</CardTitle>
                    <CardDescription>
                      Hướng dẫn chi tiết về cách sử dụng công cụ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.documentation}
                      onChange={(e) => handleInputChange('documentation', e.target.value)}
                      placeholder="Nhập tài liệu hướng dẫn sử dụng công cụ..."
                      rows={12}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(false)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Đang lưu...' : 'Lưu nháp'}
                </Button>
                <Button
                  onClick={() => setPreview(true)}
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Xem trước
                </Button>
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {saving ? 'Đang gửi...' : 'Gửi để duyệt'}
                </Button>
              </div>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}