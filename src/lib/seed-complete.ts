import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { ToolType, ToolStatus } from '@prisma/client';

async function createSampleUser() {
  try {
    const user = await db.users.upsert({
      where: { email: 'seller@example.com' },
      update: {},
      create: {
        id: randomUUID(),
        email: 'seller@example.com',
        name: 'Người Bán Công Cụ',
        role: 'USER',
        tradingVolume: 50000,
        preferredBroker: 'binance',
        experience: 'advanced',
        updatedAt: new Date()
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

    // Create categories aligned with Prisma schema
    const categoryDefinitions = [
      {
        key: 'indicators',
        name: 'Chỉ báo Kỹ thuật',
        description: 'Các chỉ báo phân tích kỹ thuật tùy chỉnh',
        icon: 'trending-up'
      },
      {
        key: 'bots',
        name: 'Bot Giao dịch',
        description: 'Bot tự động hóa giao dịch',
        icon: 'cpu'
      },
      {
        key: 'scanners',
        name: 'Market Scanner',
        description: 'Công cụ quét thị trường',
        icon: 'radar'
      },
      {
        key: 'strategies',
        name: 'Chiến lược Giao dịch',
        description: 'Chiến lược giao dịch đã được kiểm chứng',
        icon: 'lightbulb'
      },
      {
        key: 'education',
        name: 'Giáo dục',
        description: 'Ebook, khóa học và tài liệu học tập',
        icon: 'book-open'
      }
    ];

    const categories = await Promise.all(
      categoryDefinitions.map(def =>
        db.tool_categories.upsert({
          where: { name: def.name },
          update: {
            description: def.description,
            icon: def.icon,
            updatedAt: new Date()
          },
          create: {
            id: randomUUID(),
            name: def.name,
            description: def.description,
            icon: def.icon,
            updatedAt: new Date()
          }
        })
      )
    );

    const categoryMap = new Map<string, string>();
    categoryDefinitions.forEach((def, index) => {
      categoryMap.set(def.key, categories[index].id);
    });

    // Create sample tools
    const tools = [
      {
        name: 'RSI Divergence Master',
        description: 'Chỉ báo RSI nâng cao phát hiện sự phân kỳ một cách tự động. Công cụ này giúp bạn xác định các điểm đảo ngược tiềm năng với độ chính xác cao.',
        shortDescription: 'Chỉ báo RSI phát hiện phân kỳ tự động',
        categoryKey: 'indicators',
        price: 49.99,
        type: ToolType.INDICATOR,
        status: ToolStatus.APPROVED,
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
        features: [
          'Phát hiện phân kỳ ẩn và phân kỳ thông thường',
          'Cảnh báo âm thanh và visual',
          'Tùy chỉnh thời gian RSI',
          'Hỗ trợ multiple timeframe',
          'Tích hợp với TradingView'
        ],
        featured: true
      },
      {
        name: 'Grid Trading Bot Pro',
        description: 'Bot giao dịch lưới chuyên nghiệp với thuật toán thông minh. Tự động đặt lệnh mua bán theo grid để tối ưu hóa lợi nhuận trong thị trường sideway.',
        shortDescription: 'Bot giao dịch lưới tự động',
        categoryKey: 'bots',
        price: 199.99,
        type: ToolType.BOT,
        status: ToolStatus.APPROVED,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        features: [
          'Thuật toán grid thông minh',
          'Quản lý rủi ro tự động',
          'Backtesting chiến lược',
          'Hỗ trợ nhiều sàn giao dịch',
          'Dashboard theo dõi real-time'
        ],
        featured: true
      },
      {
        name: 'Volume Profile Scanner',
        description: 'Công cụ quét thị trường dựa trên phân tích khối lượng. Giúp xác định các vùng giá quan trọng và điểm vào lệnh tiềm năng.',
        shortDescription: 'Scanner phân tích khối lượng giá',
        categoryKey: 'scanners',
        price: 79.99,
        type: ToolType.SCANNER,
        status: ToolStatus.APPROVED,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        features: [
          'Phân tích volume profile real-time',
          'Xác định vùng giá cao/thấp',
          'Cảnh báo breakout volume',
          'Hỗ trợ multiple timeframe',
          'Export dữ liệu phân tích'
        ],
        featured: false
      },
      {
        name: 'Smart Money Concepts',
        description: 'Chiến lược giao dịch dựa trên các khái niệm smart money. Hướng dẫn chi tiết cách xác định và theo dõi dòng tiền thông minh.',
        shortDescription: 'Chiến lược giao dịch Smart Money',
        categoryKey: 'strategies',
        price: 29.99,
        type: ToolType.STRATEGY,
        status: ToolStatus.APPROVED,
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
        features: [
          'Phân tích market structure',
          'Xác định liquidity zones',
          'Chiến lược entry/exit',
          'Quản lý rủi ro',
          'Case studies thực tế'
        ],
        featured: true
      },
      {
        name: 'Crypto Trading Masterclass',
        description: 'Khóa học toàn diện về giao dịch cryptocurrency. Từ cơ bản đến nâng cao, bao gồm cả phân tích kỹ thuật và fundamental.',
        shortDescription: 'Khóa học giao dịch Crypto toàn diện',
        categoryKey: 'education',
        price: 149.99,
        type: ToolType.EDUCATION,
        status: ToolStatus.APPROVED,
        image: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=400&h=300&fit=crop',
        features: [
          '50+ video bài giảng',
          'Phân tích kỹ thuật nâng cao',
          'Fundamental analysis',
          'Risk management',
          'Community support'
        ],
        featured: false
      }
    ];

    for (const toolData of tools) {
      const categoryId = categoryMap.get(toolData.categoryKey);
      if (!categoryId) continue;

      await db.tools.upsert({
        where: {
          name_sellerId: {
            name: toolData.name,
            sellerId: sellerUser.id
          }
        },
        update: {},
        create: {
          id: randomUUID(),
          name: toolData.name,
          description: toolData.description,
          price: toolData.price,
          category: categoryId,
          type: toolData.type,
          image: toolData.image,
          features: JSON.stringify(toolData.features),
          requirements: 'Không yêu cầu đặc biệt',
          documentation: toolData.shortDescription,
          status: toolData.status,
          featured: toolData.featured,
          sellerId: sellerUser.id,
          updatedAt: new Date()
        }
      });
    }

    // Create sample reviews
    const createdTools = await db.tools.findMany({
      where: { sellerId: sellerUser.id }
    });

    for (const tool of createdTools) {
      const reviews = [
        {
          toolId: tool.id,
          userId: sellerUser.id,
          rating: 5,
          title: 'Tuyệt vời!',
          content: 'Công cụ rất hữu ích và dễ sử dụng. Đã giúp tôi cải thiện kết quả giao dịch đáng kể.',
          pros: ['Dễ sử dụng', 'Hiệu quả cao', 'Hỗ trợ tốt'],
          cons: [],
          verified: true
        },
        {
          toolId: tool.id,
          userId: sellerUser.id,
          rating: 4,
          title: 'Rất tốt',
          content: 'Chất lượng tốt, đáng đồng tiền. Có thể cải thiện thêm về tài liệu hướng dẫn.',
          pros: ['Giá cả hợp lý', 'Chất lượng tốt'],
          cons: ['Cần thêm tài liệu'],
          verified: true
        }
      ];

      for (const reviewData of reviews) {
        await db.tool_reviews.upsert({
          where: {
            toolId_userId: {
              toolId: reviewData.toolId,
              userId: reviewData.userId
            }
          },
          update: {
            rating: reviewData.rating,
            title: reviewData.title,
            content: reviewData.content,
            pros: JSON.stringify(reviewData.pros),
            cons: JSON.stringify(reviewData.cons),
            verified: reviewData.verified,
            updatedAt: new Date()
          },
          create: {
            id: randomUUID(),
            ...reviewData,
            pros: JSON.stringify(reviewData.pros),
            cons: JSON.stringify(reviewData.cons),
            updatedAt: new Date()
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
