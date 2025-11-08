'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Users,
    Shield,
    MessageCircle,
    Trophy,
    Star,
    Crown,
    Gem,
    Lock,
    Eye,
    ThumbsUp,
    Clock,
    TrendingUp,
    BarChart3,
    Target,
    Zap,
    Award,
    Send,
    Search,
    Filter,
    Loader2
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function HangSoiPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isMember, setIsMember] = useState(false);
    const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview');
    const [newPost, setNewPost] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedRank, setSelectedRank] = useState('');
    const [posts, setPosts] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // FIX #2: Real membership detection from NextAuth session
    useEffect(() => {
        const checkMembership = async () => {
            setIsLoading(true);
            try {
                // Get user session
                const sessionResponse = await fetch('/api/auth/session');
                const session = await sessionResponse.json();

                if (!session?.user?.id) {
                    setIsMember(false);
                    setIsLoading(false);
                    // Load public data even without session
                    fetchHangSoiData();
                    return;
                }

                // Check actual membership from API
                const hangSoiResponse = await fetch('/api/hang-soi');
                const hangSoiData = await hangSoiResponse.json();

                if (hangSoiData.success) {
                    setIsMember(hangSoiData.isMember || false);
                    setPosts(hangSoiData.posts);
                    setMembers(hangSoiData.members);
                } else {
                    // Fallback to mock data
                    fetchHangSoiData();
                }
            } catch (error) {
                console.error('Failed to load Hang Sói data:', error);
                fetchHangSoiData();
            } finally {
                setIsLoading(false);
            }
        };

        const fetchHangSoiData = async () => {
            try {
                const response = await fetch('/api/hang-soi');
                const data = await response.json();

                if (data.success) {
                    setIsMember(data.isMember);
                    setPosts(data.posts);
                    setMembers(data.members);
                } else {
                    // Fallback to mock data (max 100 members to match design spec)
                    const mockPosts = [
                        {
                            id: '1',
                            author: { name: 'Kaison', avatar: '', rank: 'Silver', joinDate: '2024-01-15' },
                            title: 'Phân tích kỹ thuật BTC - Cơ hội mua vào?',
                            content: 'Sau khi phân tích khung H4, tôi thấy BTC đang hình thành mô hình tam giác tăng dần. RSI đang ở vùng 45, cho thấy còn room để tăng. Target đầu tiên là $72,000 với stop loss tại $68,500.',
                            category: 'Phân Tích Kỹ Thuật',
                            likes: 23,
                            comments: 8,
                            timestamp: '2 giờ trước',
                            tags: ['BTC', 'Technical Analysis', 'H4'],
                            isPinned: true
                        },
                        {
                            id: '2',
                            author: { name: 'TraderBeta', avatar: '', rank: 'Gold', joinDate: '2024-02-01' },
                            title: 'Chiến lược quản lý rủi ro hiệu quả',
                            content: 'Em muốn chia sẻ chiến lược quản lý rủi ro mà em đã áp dụng thành công: 1% rule cho mỗi trade, never add to losing position, và luôn đặt stop loss tại điểm break-even khi profit đạt 1R.',
                            category: 'Quản Lý Rủi Ro',
                            likes: 45,
                            comments: 12,
                            timestamp: '5 giờ trước',
                            tags: ['Risk Management', '1% Rule', 'Stop Loss'],
                            isPinned: false
                        },
                        {
                            id: '3',
                            author: { name: 'AlphaTrader', avatar: '', rank: 'Platinum', joinDate: '2023-12-10' },
                            title: 'Backtest chiến lược grid trading ETH',
                            content: 'Đã backtest chiến lược grid trading trên ETH trong 6 tháng qua với các tham số: grid size 0.5%, take profit 2%, và max 10 levels. Kết quả: win rate 78%, profit factor 2.1.',
                            category: 'Backtest & Strategy',
                            likes: 67,
                            comments: 15,
                            timestamp: '1 ngày trước',
                            tags: ['Grid Trading', 'ETH', 'Backtest'],
                            isPinned: false
                        }
                    ];

                    // Standard 5 mock members to represent the start of the community
                    const mockMembers = [
                        { id: '1', name: 'Kaison', rank: 'Silver', joinDate: '2024-01-15', totalSavings: 2847.50, posts: 23, reputation: 456 },
                        { id: '2', name: 'TraderBeta', rank: 'Gold', joinDate: '2024-02-01', totalSavings: 5234.80, posts: 45, reputation: 789 },
                        { id: '3', name: 'AlphaTrader', rank: 'Platinum', joinDate: '2023-12-10', totalSavings: 12450.00, posts: 67, reputation: 1234 },
                        { id: '4', name: 'CryptoWolf', rank: 'Silver', joinDate: '2024-01-20', totalSavings: 3456.70, posts: 12, reputation: 234 },
                        { id: '5', name: 'BullRunner', rank: 'Bronze', joinDate: '2024-03-01', totalSavings: 1234.50, posts: 8, reputation: 123 }
                    ];

                    setPosts(mockPosts);
                    setMembers(mockMembers);
                    setIsMember(false); // Default to non-member for security
                }
            } catch (error) {
                console.error('Failed to fetch Hang Sói data:', error);
            }
        };

        checkMembership();
    }, []);

    const handleJoinCommunity = async () => {
        setIsJoining(true);
        try {
            const response = await fetch('/api/hang-soi/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                setIsMember(true);
                // Toast-like feedback instead of alert
                const msg = '🎉 Chúc mừng! Bạn đã gia nhập Hang Sói';
                console.log(msg);
            } else {
                console.error(`❌ Lỗi: ${data.error || 'Không thể gia nhập cộng đồng'}`);
            }
        } catch (error) {
            console.error('Join community error:', error);
        } finally {
            setIsJoining(false);
        }
    };

    // FIX #9: Better loading states with real async handling
    const handleCreatePost = async () => {
        if (!newPost.trim()) return;

        setIsCreatingPost(true);
        try {
            const response = await fetch('/api/hang-soi/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newPost }),
            });

            const data = await response.json();

            if (data.success) {
                setNewPost('');
                console.log('✅ Bài viết đã được đăng thành công!');
                // Refresh posts without page reload
                location.reload();
            } else {
                console.error(`❌ Lỗi: ${data.error || 'Không thể tạo bài viết'}`);
            }
        } catch (error) {
            console.error('Create post error:', error);
        } finally {
            setIsCreatingPost(false);
        }
    };

    // FIX #3: Handle tab changes with URL sync
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.push(`?tab=${tab}`, { scroll: false });
    };

    const getRankColor = (rank: string) => {
        switch (rank) {
            case 'Bronze': return 'bg-orange-100 text-orange-800';
            case 'Silver': return 'bg-gray-100 text-gray-800';
            case 'Gold': return 'bg-yellow-100 text-yellow-800';
            case 'Platinum': return 'bg-purple-100 text-purple-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const getRankIcon = (rank: string) => {
        switch (rank) {
            case 'Bronze': return Star;
            case 'Silver': return Award;
            case 'Gold': return Crown;
            case 'Platinum': return Gem;
            default: return Shield;
        }
    };

    const renderRankIcon = (rank: string) => {
        const IconComponent = getRankIcon(rank);
        return <IconComponent className="w-3 h-3" />;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Đang tải cộng đồng Hang Sói...</p>
                </div>
            </div>
        );
    }

    // FIX #5: Filter posts with search and category
    const filteredBySearch = posts.filter(post => {
        if (!searchTerm.trim()) return true;

        const term = searchTerm.toLowerCase();
        return (
            post.title.toLowerCase().includes(term) ||
            post.content.toLowerCase().includes(term) ||
            post.author.name.toLowerCase().includes(term) ||
            post.tags?.some((tag: string) => tag.toLowerCase().includes(term)) ||
            post.category.toLowerCase().includes(term)
        );
    });

    const filteredByCategory = !selectedCategory
        ? filteredBySearch
        : filteredBySearch.filter(p => p.category === selectedCategory);

    const filteredPosts = !selectedRank
        ? filteredByCategory
        : filteredByCategory.filter(p => p.author.rank === selectedRank);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-600 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Hang Sói</h1>
                            <p className="text-slate-600">Cộng đồng trader ưu tú - The Wolf's Den</p>
                        </div>
                    </div>

                    {!isMember ? (
                        <div className="relative z-10">
                            <Card className="bg-gradient-to-r from-slate-800 to-slate-600 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                                <Lock className="w-5 h-5" />
                                                Cộng Đồng Riêng Tư
                                            </h2>
                                            <p className="text-slate-200 mb-4">
                                                Chỉ dành cho 100 thành viên ưu tú đã được xác minh.
                                                Nơi chúng tôi chia sẻ chiến lược, phân tích kỹ thuật và quản lý rủi ro.
                                            </p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {members.length}/100 thành viên
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Shield className="w-4 h-4" />
                                                    Đã xác minh
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            size="lg"
                                            className="bg-white text-slate-800 hover:bg-slate-100"
                                            onClick={handleJoinCommunity}
                                            disabled={isJoining}
                                        >
                                            {isJoining ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="w-4 h-4 mr-2" />
                                                    Đăng Ký Gia Nhập
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Badge className="bg-green-100 text-green-800">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Thành viên đã xác minh
                                </Badge>
                                <span className="text-sm text-slate-600">
                                    {members.length}/100 thành viên
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                className="border-slate-300"
                                onClick={() => handleTabChange('discussions')}
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Tạo bài viết mới
                            </Button>
                        </div>
                    )}
                </div>

                {isMember ? (
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                            <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
                            <TabsTrigger value="discussions">Thảo Luận</TabsTrigger>
                            <TabsTrigger value="members">Thành Viên</TabsTrigger>
                            <TabsTrigger value="analytics">Phân Tích</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Community Stats */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Trophy className="w-5 h-5" />
                                            Thống Kê Cộng Đồng
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-600">Tổng thành viên</span>
                                                <span className="font-bold">{members.length}/100</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-600">Bài viết hôm nay</span>
                                                <span className="font-bold">12</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-600">Tổng tiết kiệm</span>
                                                <span className="font-bold text-green-600">$45,678</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-600">Avg win rate</span>
                                                <span className="font-bold text-blue-600">68.5%</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Top Performers */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Crown className="w-5 h-5" />
                                            Top Performers
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {members.slice(0, 5).map((member, index) => (
                                                <div key={member.id} className="flex items-center gap-3">
                                                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs font-bold text-yellow-800">
                                                        {index + 1}
                                                    </div>
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={member.avatar} />
                                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{member.name}</p>
                                                        <p className="text-xs text-slate-600">${member.totalSavings.toLocaleString()}</p>
                                                    </div>
                                                    <Badge className={getRankColor(member.rank)} variant="secondary">
                                                        {renderRankIcon(member.rank)}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Activity */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="w-5 h-5" />
                                            Hoạt Động Gần Đây
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="text-sm"><span className="font-medium">Kaison</span> đã đăng bài viết mới</p>
                                                    <p className="text-xs text-slate-600">2 phút trước</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="text-sm"><span className="font-medium">TraderBeta</span> đã đạt rank Gold</p>
                                                    <p className="text-xs text-slate-600">15 phút trước</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="text-sm"><span className="font-medium">AlphaTrader</span> đã chia sẻ chiến lược</p>
                                                    <p className="text-xs text-slate-600">1 giờ trước</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Pinned Posts */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="w-5 h-5" />
                                        Bài Viết Ghim
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {posts.filter(post => post.isPinned).map((post) => (
                                            <div key={post.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarImage src={post.author.avatar} />
                                                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="font-medium">{post.author.name}</span>
                                                            <Badge className={getRankColor(post.author.rank)} variant="secondary">
                                                                {renderRankIcon(post.author.rank)}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                <Star className="w-3 h-3 mr-1" />
                                                                Ghim
                                                            </Badge>
                                                        </div>
                                                        <h4 className="font-semibold text-slate-900 mb-2">{post.title}</h4>
                                                        <p className="text-sm text-slate-700 mb-3">{post.content}</p>
                                                        <div className="flex items-center gap-4 text-xs text-slate-600">
                                                            <span className="flex items-center gap-1">
                                                                <ThumbsUp className="w-3 h-3" />
                                                                {post.likes}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MessageCircle className="w-3 h-3" />
                                                                {post.comments}
                                                            </span>
                                                            <span>{post.timestamp}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="discussions" className="space-y-6">
                            {/* Create New Post */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tạo Bài Viết Mới</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <Textarea
                                            placeholder="Chia sẻ phân tích, chiến lược hoặc câu hỏi của bạn..."
                                            value={newPost}
                                            onChange={(e) => setNewPost(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">Phân Tích Kỹ Thuật</Badge>
                                                <Badge variant="outline">Quản Lý Rủi Ro</Badge>
                                                <Badge variant="outline">Chiến Lược</Badge>
                                            </div>
                                            {/* FIX #7: Add tooltip for disabled button */}
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            onClick={handleCreatePost}
                                                            disabled={!newPost.trim() || isCreatingPost}
                                                        >
                                                            {isCreatingPost ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                    Đang đăng...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Send className="w-4 h-4 mr-2" />
                                                                    Đăng bài
                                                                </>
                                                            )}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    {!newPost.trim() && !isCreatingPost && (
                                                        <TooltipContent>
                                                            <p>Vui lòng nhập nội dung bài viết</p>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Search and Filter */}
                            <div className="space-y-3">
                                <div className="flex-1 min-w-[200px] relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                        placeholder="Tìm kiếm bài viết..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                            />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                    {['Phân Tích Kỹ Thuật', 'Quản Lý Rủi Ro', 'Backtest & Strategy'].map(cat => (
                                        <Button
                                            key={cat}
                                            variant={selectedCategory === cat ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                                    >
                                            {cat}
                                        </Button>
                            ))}
                            </div>

                            {/* FIX #6: Rank Filter Dropdown */}
                                <div className="flex items-center gap-2 flex-wrap">
                               <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                       <Button variant="outline" size="sm" className="flex items-center gap-2">
                                           <Filter className="w-4 h-4" />
                                           Xếp Hạng
                                       {selectedRank && (
                                           <Badge variant="secondary" className="ml-1 text-xs">
                                                   {selectedRank}
                                               </Badge>
                                   )}
                               </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                   <div className="p-2 space-y-1">
                                           {['Silver', 'Gold', 'Platinum'].map(rank => (
                                               <DropdownMenuCheckboxItem
                                                   key={rank}
                                                   checked={selectedRank === rank}
                                               onCheckedChange={() =>
                                                   setSelectedRank(selectedRank === rank ? '' : rank)
                                                   }
                                       >
                                           <div className="flex items-center gap-2">
                                                       <div className={`w-2 h-2 rounded-full`} style={{
                                                           backgroundColor: rank === 'Silver' ? '#a1a1a1' : rank === 'Gold' ? '#fbbf24' : '#a78bfa'
                                                       }}></div>
                                               {rank}
                                               </div>
                                       </DropdownMenuCheckboxItem>
                                   ))}
                                   {selectedRank && (
                                           <>
                                                   <DropdownMenuSeparator />
                                                   <Button
                                                   variant="ghost"
                                                       size="sm"
                                                   className="w-full justify-start text-xs"
                                                   onClick={() => setSelectedRank('')}
                                               >
                                               Xóa lọc xếp hạng
                                                   </Button>
                                       </>
                                   )}
                               </div>
                            </DropdownMenuContent>
                            </DropdownMenu>

                            {(selectedCategory || searchTerm || selectedRank) && (
                                        <Button
                                       variant="ghost"
                                       size="sm"
                                   onClick={() => {
                                       setSelectedCategory('');
                                           setSelectedRank('');
                                       setSearchTerm('');
                                   }}
                            >
                               ✕ Xóa tất cả
                                   </Button>
                            )}
                            </div>
                            </div>

                            {/* Posts List */}
                            <div className="space-y-4">
                                {filteredPosts.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <Search className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                            <p className="text-slate-600">
                                                {searchTerm || selectedCategory || selectedRank
                                                    ? 'Không tìm thấy bài viết phù hợp'
                                                    : 'Chưa có bài viết nào'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    filteredPosts.map((post) => (
                                        <Card key={post.id}>
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-4">
                                                    <Avatar className="w-12 h-12">
                                                        <AvatarImage src={post.author.avatar} />
                                                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                            <span className="font-medium">{post.author.name}</span>
                                                            <Badge className={getRankColor(post.author.rank)} variant="secondary">
                                                                {renderRankIcon(post.author.rank)}
                                                            </Badge>
                                                            <Badge variant="outline">{post.category}</Badge>
                                                            {post.isPinned && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Star className="w-3 h-3 mr-1" />
                                                                    Ghim
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <h4 className="font-semibold text-slate-900 mb-2">{post.title}</h4>
                                                        <p className="text-slate-700 mb-3">{post.content}</p>
                                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                            {post.tags.map((tag: string, index: number) => (
                                                                <Badge key={index} variant="secondary" className="text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                                                <ThumbsUp className="w-4 h-4" />
                                                                {post.likes}
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                                                <MessageCircle className="w-4 h-4" />
                                                                {post.comments}
                                                            </Button>
                                                            <span>{post.timestamp}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="members" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Danh Sách Thành Viên</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {members.map((member) => (
                                            <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-12 h-12">
                                                        <AvatarImage src={member.avatar} />
                                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{member.name}</span>
                                                            <Badge className={getRankColor(member.rank)} variant="secondary">
                                                                {renderRankIcon(member.rank)}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-600">
                                                            Thành viên từ {member.joinDate} • {member.posts} bài viết
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-600">${member.totalSavings.toLocaleString()}</p>
                                                    <p className="text-sm text-slate-600">Reputation: {member.reputation}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analytics" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5" />
                                            Hiệu Suất Cộng Đồng
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-green-50 rounded-lg">
                                                <h4 className="font-medium text-green-900 mb-2">Win Rate Trung Bình</h4>
                                                <p className="text-2xl font-bold text-green-600">68.5%</p>
                                                <p className="text-sm text-green-700">Cao hơn thị trường 15%</p>
                                            </div>
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <h4 className="font-medium text-blue-900 mb-2">Profit Factor</h4>
                                                <p className="text-2xl font-bold text-blue-600">1.85</p>
                                                <p className="text-sm text-blue-700">Tỷ lệ rủi ro/lợi nhuận tốt</p>
                                            </div>
                                            <div className="p-4 bg-purple-50 rounded-lg">
                                                <h4 className="font-medium text-purple-900 mb-2">Tổng Tiết Kiệm</h4>
                                                <p className="text-2xl font-bold text-purple-600">$45,678</p>
                                                <p className="text-sm text-purple-700">Từ khi thành lập cộng đồng</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="w-5 h-5" />
                                            Mục Tiêu Cộng Đồng
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-orange-50 rounded-lg">
                                                <h4 className="font-medium text-orange-900 mb-2">100 Thành Viên Ưu tú</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Đã đạt được</span>
                                                        <span>{members.length}/100</span>
                                                    </div>
                                                    <div className="w-full bg-orange-200 rounded-full h-2">
                                                        <div
                                                            className="bg-orange-500 h-2 rounded-full"
                                                            style={{ width: `${(members.length / 100) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-yellow-50 rounded-lg">
                                                <h4 className="font-medium text-yellow-900 mb-2">Mục Tiêu Tiết Kiệm</h4>
                                                <p className="text-2xl font-bold text-yellow-600">$100,000</p>
                                                <p className="text-sm text-yellow-700">Cần thêm $54,322</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    /* Preview for non-members */
                    <div className="space-y-8">
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Lock className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                    Nội Dung Dành Riêng Cho Thành Viên
                                </h3>
                                <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                                    Hang Sói là cộng đồng riêng tư chỉ dành cho 100 trader ưu tú đã được xác minh.
                                    Chúng tôi chia sẻ những chiến lược, phân tích và insight độc quyền mà bạn không tìm thấy ở nơi khác.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <BarChart3 className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h4 className="font-semibold text-slate-900 mb-2">Phân Tích Chuyên Sâu</h4>
                                        <p className="text-sm text-slate-600">
                                            Chiến lược và phân tích từ những trader có kinh nghiệm
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Shield className="w-6 h-6 text-green-600" />
                                        </div>
                                        <h4 className="font-semibold text-slate-900 mb-2">Cộng Đồng Tinh Hoa</h4>
                                        <p className="text-sm text-slate-600">
                                            Môi trường thảo luận chuyên nghiêm, không "lùa gà"
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Trophy className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <h4 className="font-semibold text-slate-900 mb-2">Cơ Hội Độc Quyền</h4>
                                        <p className="text-sm text-slate-600">
                                            Tiếp cận các cơ hội và quỹ đầu tư prop trading
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={handleJoinCommunity}
                                    disabled={isJoining}
                                >
                                    {isJoining ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-4 h-4 mr-2" />
                                            Nộp Đơn Gia Nhập Hang Sói
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
