const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function seedToolsMarketplace() {
  console.log('🌱 Seeding Tools Marketplace...');

  try {
    // Create categories
    const categories = await Promise.all([
      db.toolCategory.upsert({
        where: { name: 'Chỉ báo Kỹ thuật' },
        update: {},
        create: {
          name: 'Chỉ báo Kỹ thuật',
          description: 'Các chỉ báo phân tích kỹ thuật chuyên sâu',
          icon: '📊'
        }
      }),
      db.toolCategory.upsert({
        where: { name: 'Trading Bot' },
        update: {},
        create: {
          name: 'Trading Bot',
          description: 'Bot tự động giao dịch theo chiến lược',
          icon: '🤖'
        }
      }),
      db.toolCategory.upsert({
        where: { name: 'Market Scanner' },
        update: {},
        create: {
          name: 'Market Scanner',
          description: 'Công cụ quét và phát hiện cơ hội thị trường',
          icon: '🔍'
        }
      }),
      db.toolCategory.upsert({
        where: { name: 'Chiến lược Giao dịch' },
        update: {},
        create: {
          name: 'Chiến lược Giao dịch',
          description: 'Các chiến lược giao dịch đã được kiểm chứng',
          icon: '📋'
        }
      }),
      db.toolCategory.upsert({
        where: { name: 'Giáo dục' },
        update: {},
        create: {
          name: 'Giáo dục',
          description: 'Tài liệu và khóa học giao dịch',
          icon: '📚'
        }
      })
    ]);

    console.log('✅ Created categories');

    // Find or create a demo seller user
    let sellerUser = await db.user.findFirst({
      where: { email: 'seller@apexrebate.com' }
    });

    if (!sellerUser) {
      sellerUser = await db.user.create({
        data: {
          email: 'seller@apexrebate.com',
          name: 'Tool Seller',
          role: 'USER'
        }
      });
    }

    // Create sample tools
    const sampleTools = [
      {
        name: 'RSI Divergence Master',
        description: 'Công cụ phát hiện phân kỳ RSI tự động với độ chính xác cao. Tích hợp cảnh báo thời gian thực và phân tích đa khung thời gian.',
        price: 49.99,
        category: categories[0].id,
        type: 'INDICATOR',
        image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
        features: JSON.stringify([
          'Phát hiện phân kỳ RSI tự động',
          'Hỗ trợ 9 khung thời gian',
          'Cảnh báo push notification',
          'Tích hợp TradingView',
          'Backtesting miễn phí'
        ]),
        requirements: JSON.stringify([
          'Tài khoản TradingView',
          'Kết nối internet ổn định',
          'Chrome/Firefox/Safari browser'
        ]),
        documentation: '# RSI Divergence Master\n\n## Cài đặt\n1. Cài đặt indicator trên TradingView\n2. Cấu hình các thông số\n3. Bật thông báo\n\n## Sử dụng\n- Chờ tín hiệu phân kỳ\n- Xác nhận với các chỉ báo khác\n- Vào lệnh theo hướng dẫn',
        status: 'APPROVED',
        featured: true,
        sellerId: sellerUser.id
      },
      {
        name: 'Grid Trading Bot Pro',
        description: 'Bot giao dịch lưới thông minh với thuật toán tối ưu hóa lợi nhuận. Tự động điều chỉnh khoảng cách và quản lý rủi ro.',
        price: 199.99,
        category: categories[1].id,
        type: 'BOT',
        image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=300&fit=crop',
        features: JSON.stringify([
          'Thuật toán grid thông minh',
          'Tự động rebalance',
          'Quản lý rủi ro tích hợp',
          'Backtesting nâng cao',
          'API cho sàn lớn'
        ]),
        requirements: JSON.stringify([
          'API key sàn giao dịch',
          'Vốn tối thiểu $500',
          'Kết nối internet 24/7',
          'VPS khuyến nghị'
        ]),
        documentation: '# Grid Trading Bot Pro\n\n## Cài đặt\n1. Lấy API key từ sàn\n2. Cấu hình bot\n3. Thiết lập rủi ro\n4. Bắt đầu giao dịch',
        status: 'APPROVED',
        featured: true,
        sellerId: sellerUser.id
      },
      {
        name: 'Volume Spike Scanner',
        description: 'Công cụ quét đột biến khối lượng giao dịch trên tất cả các cặp tiền. Phát hiện sớm các cơ hội giao dịch tiềm năng.',
        price: 79.99,
        category: categories[2].id,
        type: 'SCANNER',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        features: JSON.stringify([
          'Quét 100+ cặp tiền',
          'Cảnh báo thời gian thực',
          'Lọc theo thị trường',
          'Phân tích on-chain',
          'Export dữ liệu'
        ]),
        requirements: JSON.stringify([
          'Tài khoản Binance/Bybit',
          'WebSocket connection',
          'RAM tối thiểu 4GB'
        ]),
        documentation: '# Volume Spike Scanner\n\n## Hướng dẫn sử dụng\n1. Kết nối API sàn\n2. Chọn cặp tiền quan tâm\n3. Thiết lập ngưỡng volume\n4. Nhận cảnh báo',
        status: 'APPROVED',
        featured: false,
        sellerId: sellerUser.id
      },
      {
        name: 'Smart Money Strategy',
        description: 'Chiến lược giao dịch theo dòng tiền thông minh. Được phát triển dựa trên phân tích hành vi các quỹ đầu tư lớn.',
        price: 299.99,
        category: categories[3].id,
        type: 'STRATEGY',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
        features: JSON.stringify([
          'Phân tích smart money',
          'Công cụ quản lý vốn',
          'Backtesting 10 năm',
          'Community support',
          'Update hàng tháng'
        ]),
        requirements: JSON.stringify([
          'Kinh nghiệm giao dịch 1+ năm',
          'Hiểu biết phân tích kỹ thuật',
          'Kiên nhẫn và kỷ luật'
        ]),
        documentation: '# Smart Money Strategy\n\n## Nguyên tắc\n1. Theo dõi dòng tiền lớn\n2. Xác định vùng cung/cầu\n3. Quản lý rủi ro chặt chẽ\n4. Tuân thủ kỷ luật',
        status: 'APPROVED',
        featured: true,
        sellerId: sellerUser.id
      },
      {
        name: 'Crypto Trading Masterclass',
        description: 'Khóa học giao dịch crypto toàn diện từ cơ bản đến nâng cao. Bao gồm 50+ video và tài liệu thực hành.',
        price: 149.99,
        category: categories[4].id,
        type: 'EDUCATION',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
        features: JSON.stringify([
          '50+ video bài giảng',
          'Tài liệu PDF',
          'Quizzes và bài tập',
          'Community private',
          'Certificate hoàn thành'
        ]),
        requirements: JSON.stringify([
          'Không yêu cầu kinh nghiệm',
          'Thời gian học 20 tiếng',
          'Máy tính hoặc smartphone'
        ]),
        documentation: '# Crypto Trading Masterclass\n\n## Nội dung khóa học\n\n### Module 1: Introduction\n- Crypto basics\n- Market structure\n- Trading psychology\n\n### Module 2: Technical Analysis\n- Chart patterns\n- Indicators\n- Risk management',
        status: 'APPROVED',
        featured: false,
        sellerId: sellerUser.id
      }
    ];

    for (const toolData of sampleTools) {
      await db.tool.upsert({
        where: { 
          name_sellerId: {
            name: toolData.name,
            sellerId: toolData.sellerId
          }
        },
        update: toolData,
        create: toolData
      });
    }

    console.log('✅ Created sample tools');

    // Create some sample reviews
    const tools = await db.tool.findMany();
    const reviewerUser = await db.user.findFirst({
      where: { email: 'user@example.com' }
    });

    if (reviewerUser && tools.length > 0) {
      for (let i = 0; i < Math.min(3, tools.length); i++) {
        const tool = tools[i];
        await db.toolReview.upsert({
          where: {
            toolId_userId: {
              toolId: tool.id,
              userId: reviewerUser.id
            }
          },
          update: {},
          create: {
            toolId: tool.id,
            userId: reviewerUser.id,
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            title: `Great ${tool.type}`,
            content: `This ${tool.type.toLowerCase()} has really helped improve my trading. Highly recommended!`,
            verified: true,
            pros: JSON.stringify(['Easy to use', 'Great support', 'Good value']),
            cons: JSON.stringify(['Learning curve', 'Requires patience'])
          }
        });
      }
    }

    console.log('✅ Created sample reviews');

    console.log('🎉 Tools Marketplace seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding Tools Marketplace:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

seedToolsMarketplace().catch(console.error);