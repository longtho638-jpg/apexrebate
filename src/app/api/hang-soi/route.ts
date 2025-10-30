import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Authenticate the user
    // 2. Check if user is a member of Hang Sói community
    // 3. Fetch community posts, members, and analytics from database
    // 4. Return personalized data based on membership status

    // For now, return mock data
    const isMember = Math.random() > 0.3; // Randomly determine membership for demo
    
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
    
    const mockMembers = [
      { id: '1', name: 'Kaison', rank: 'Silver', joinDate: '2024-01-15', totalSavings: 2847.50, posts: 23, reputation: 456 },
      { id: '2', name: 'TraderBeta', rank: 'Gold', joinDate: '2024-02-01', totalSavings: 5234.80, posts: 45, reputation: 789 },
      { id: '3', name: 'AlphaTrader', rank: 'Platinum', joinDate: '2023-12-10', totalSavings: 12450.00, posts: 67, reputation: 1234 },
      { id: '4', name: 'CryptoWolf', rank: 'Silver', joinDate: '2024-01-20', totalSavings: 3456.70, posts: 12, reputation: 234 },
      { id: '5', name: 'BullRunner', rank: 'Bronze', joinDate: '2024-03-01', totalSavings: 1234.50, posts: 8, reputation: 123 }
    ];

    return NextResponse.json({
      success: true,
      isMember,
      posts: mockPosts,
      members: mockMembers
    });

  } catch (error) {
    console.error('Hang Sói API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}