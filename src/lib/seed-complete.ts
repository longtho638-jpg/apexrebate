import { db } from '@/lib/db';
import { ToolType, ToolStatus } from '@prisma/client';

async function createSampleUser() {
  try {
    const user = await db.user.upsert({
      where: { email: 'seller@example.com' },
      update: {},
      create: {
        email: 'seller@example.com',
        name: 'Người Bán Công Cụ',
        role: 'USER',
        tradingVolume: 50000,
        preferredBroker: 'binance',
        experience: 'advanced'
      }
    });

    console.log('Sample user created:', user);
    return user;
  } catch (error) {
    console.error('Error creating sample user:', error);
  }
}

export async function seedToolsMarketplace() {
  try {
    // Create sample user first
    const sellerUser = await createSampleUser();
    
    if (!sellerUser) {
      console.log('Failed to create user');
      return;
    }

    // Create categories
    const categories = await Promise.all([
      db.toolCategory.upsert({
        where: { slug: 'indicators' },
        update: {},
        create: {
          name: 'Chỉ báo Kỹ thuật',
          slug: 'indicators',
          description: 'Các chỉ báo phân tích kỹ thuật tùy chỉnh',
          icon: 'trending-up',
          sortOrder: 1
        }
      }),
      db.toolCategory.upsert({
        where: { slug: 'bots' },
        update: {},
        create: {
          name: 'Bot Giao dịch',
          slug: 'bots',
          description: 'Bot tự động hóa giao dịch',
          icon: 'cpu',
          sortOrder: 2
        }
      }),
      db.toolCategory.upsert({
        where: { slug: 'scanners' },
        update: {},
        create: {
          name: 'Market Scanner',
          slug: 'scanners',
          description: 'Công cụ quét thị trường',
          icon: 'radar',
          sortOrder: 3
        }
      }),
      db.toolCategory.upsert({
        where: { slug: 'strategies' },
        update: {},
        create: {
          name: 'Chiến lược Giao dịch',
          slug: 'strategies',
          description: 'Chiến lược giao dịch đã được kiểm chứng',
          icon: 'lightbulb',
          sortOrder: 4
        }
      }),
      db.toolCategory.upsert({
        where: { slug: 'education' },
        update: {},
        create: {
          name: 'Giáo dục',
          slug: 'education',
          description: 'Ebook, khóa học và tài liệu học tập',
          icon: 'book-open',
          sortOrder: 5
        }
      })
    ]);

    // Create sample tools
    const tools = [
      {
        title: 'RSI Divergence Master',
        slug: 'rsi-divergence-master',
        description: 'Chỉ báo RSI nâng cao phát hiện sự phân kỳ một cách tự động. Công cụ này giúp bạn xác định các điểm đảo ngược tiềm năng với độ chính xác cao.',
        shortDescription: 'Chỉ báo RSI phát hiện phân kỳ tự động',
        categoryId: categories[0].id,
        sellerId: sellerUser.id,
        price: 49.99,
        currency: 'USD',
        type: ToolType.INDICATOR,
        status: ToolStatus.PUBLISHED,
        images: [
          'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop'
        ],
        tags: ['RSI', 'Divergence', 'Technical Analysis', 'MT4', 'MT5'],
        features: [
          'Phát hiện phân kỳ ẩn và phân kỳ thông thường',
          'Cảnh báo âm thanh và visual',
          'Tùy chỉnh thời gian RSI',
          'Hỗ trợ multiple timeframe',
          'Tích hợp với TradingView'
        ],
        rating: 4.8,
        reviewCount: 23,
        salesCount: 156,
        isFeatured: true,
        publishedAt: new Date('2024-01-15')
      },
      {
        title: 'Grid Trading Bot Pro',
        slug: 'grid-trading-bot-pro',
        description: 'Bot giao dịch lưới chuyên nghiệp với thuật toán thông minh. Tự động đặt lệnh mua bán theo grid để tối ưu hóa lợi nhuận trong thị trường sideway.',
        shortDescription: 'Bot giao dịch lưới tự động',
        categoryId: categories[1].id,
        sellerId: sellerUser.id,
        price: 199.99,
        currency: 'USD',
        type: ToolType.BOT,
        status: ToolStatus.PUBLISHED,
        images: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
        ],
        tags: ['Grid Trading', 'Bot', 'Automated Trading', 'Binance', 'Bybit'],
        features: [
          'Thuật toán grid thông minh',
          'Quản lý rủi ro tự động',
          'Backtesting chiến lược',
          'Hỗ trợ nhiều sàn giao dịch',
          'Dashboard theo dõi real-time'
        ],
        rating: 4.6,
        reviewCount: 18,
        salesCount: 89,
        isFeatured: true,
        publishedAt: new Date('2024-01-20')
      },
      {
        title: 'Volume Profile Scanner',
        slug: 'volume-profile-scanner',
        description: 'Công cụ quét thị trường dựa trên phân tích khối lượng. Giúp xác định các vùng giá quan trọng và điểm vào lệnh tiềm năng.',
        shortDescription: 'Scanner phân tích khối lượng giá',
        categoryId: categories[2].id,
        sellerId: sellerUser.id,
        price: 79.99,
        currency: 'USD',
        type: ToolType.SCANNER,
        status: ToolStatus.PUBLISHED,
        images: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
        ],
        tags: ['Volume Profile', 'Scanner', 'Market Analysis', 'Support Resistance'],
        features: [
          'Phân tích volume profile real-time',
          'Xác định vùng giá cao/thấp',
          'Cảnh báo breakout volume',
          'Hỗ trợ multiple timeframe',
          'Export dữ liệu phân tích'
        ],
        rating: 4.5,
        reviewCount: 12,
        salesCount: 67,
        isFeatured: false,
        publishedAt: new Date('2024-02-01')
      },
      {
        title: 'Smart Money Concepts',
        slug: 'smart-money-concepts',
        description: 'Chiến lược giao dịch dựa trên các khái niệm smart money. Hướng dẫn chi tiết cách xác định và theo dõi dòng tiền thông minh.',
        shortDescription: 'Chiến lược giao dịch Smart Money',
        categoryId: categories[3].id,
        sellerId: sellerUser.id,
        price: 29.99,
        currency: 'USD',
        type: ToolType.STRATEGY,
        status: ToolStatus.PUBLISHED,
        images: [
          'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop'
        ],
        tags: ['Smart Money', 'Price Action', 'Market Structure', 'Liquidity'],
        features: [
          'Phân tích market structure',
          'Xác định liquidity zones',
          'Chiến lược entry/exit',
          'Quản lý rủi ro',
          'Case studies thực tế'
        ],
        rating: 4.9,
        reviewCount: 31,
        salesCount: 234,
        isFeatured: true,
        publishedAt: new Date('2024-02-10')
      },
      {
        title: 'Crypto Trading Masterclass',
        slug: 'crypto-trading-masterclass',
        description: 'Khóa học toàn diện về giao dịch cryptocurrency. Từ cơ bản đến nâng cao, bao gồm cả phân tích kỹ thuật và fundamental.',
        shortDescription: 'Khóa học giao dịch Crypto toàn diện',
        categoryId: categories[4].id,
        sellerId: sellerUser.id,
        price: 149.99,
        currency: 'USD',
        type: ToolType.COURSE,
        status: ToolStatus.PUBLISHED,
        images: [
          'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=400&h=300&fit=crop'
        ],
        tags: ['Crypto', 'Trading Course', 'Technical Analysis', 'Fundamental Analysis'],
        features: [
          '50+ video bài giảng',
          'Phân tích kỹ thuật nâng cao',
          'Fundamental analysis',
          'Risk management',
          'Community support',
          'Certificate of completion'
        ],
        rating: 4.7,
        reviewCount: 45,
        salesCount: 178,
        isFeatured: false,
        publishedAt: new Date('2024-02-15')
      }
    ];

    for (const toolData of tools) {
      await db.tool.upsert({
        where: { slug: toolData.slug },
        update: toolData,
        create: {
          ...toolData,
          images: JSON.stringify(toolData.images),
          tags: JSON.stringify(toolData.tags),
          features: JSON.stringify(toolData.features)
        }
      });
    }

    // Create sample reviews
    const createdTools = await db.tool.findMany({
      where: { sellerId: sellerUser.id }
    });

    for (const tool of createdTools) {
      const reviews = [
        {
          toolId: tool.id,
          reviewerId: sellerUser.id,
          rating: 5,
          title: 'Tuyệt vời!',
          content: 'Công cụ rất hữu ích và dễ sử dụng. Đã giúp tôi cải thiện kết quả giao dịch đáng kể.',
          pros: ['Dễ sử dụng', 'Hiệu quả cao', 'Hỗ trợ tốt'],
          cons: [],
          isVerified: true,
          status: 'APPROVED'
        },
        {
          toolId: tool.id,
          reviewerId: sellerUser.id,
          rating: 4,
          title: 'Rất tốt',
          content: 'Chất lượng tốt, đáng đồng tiền. Có thể cải thiện thêm về tài liệu hướng dẫn.',
          pros: ['Giá cả hợp lý', 'Chất lượng tốt'],
          cons: ['Cần thêm tài liệu'],
          isVerified: true,
          status: 'APPROVED'
        }
      ];

      for (const reviewData of reviews) {
        await db.toolReview.upsert({
          where: {
            toolId_reviewerId: {
              toolId: reviewData.toolId,
              reviewerId: reviewData.reviewerId
            }
          },
          update: reviewData,
          create: {
            ...reviewData,
            pros: JSON.stringify(reviewData.pros),
            cons: JSON.stringify(reviewData.cons)
          }
        });
      }
    }

    console.log('Tools marketplace seeded successfully!');
  } catch (error) {
    console.error('Error seeding tools marketplace:', error);
  }
}

async function runSeed() {
  await seedToolsMarketplace();
  process.exit(0);
}

runSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});