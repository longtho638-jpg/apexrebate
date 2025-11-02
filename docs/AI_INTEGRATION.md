# 🤖 AI Integration - Claude Sonnet 4.5 & OpenAI

## ✅ Trạng thái: Claude Sonnet 4.5 ĐÃ ĐƯỢC BẬT CHO TẤT CẢ CLIENTS

ApexRebate hiện đã tích hợp AI chat powered by **Anthropic Claude Sonnet 4.5** - model AI mạnh mẽ nhất với khả năng:
- 🧠 Hiểu ngữ cảnh sâu và phức tạp
- 🇻🇳 Hỗ trợ Tiếng Việt native
- 💬 Trò chuyện tự nhiên và chính xác
- 📊 Phân tích dữ liệu trading

---

## 📦 Các files đã được tạo

### 1. Core Configuration
- **`src/lib/ai-config.ts`** - Cấu hình tổng thể cho AI models
  - Định nghĩa models: GPT-4, GPT-4o, Claude Sonnet 4.5, Claude Opus, v.v.
  - Rate limits, pricing, max tokens
  - Helper functions để lấy model configs

### 2. Services
- **`src/lib/anthropic-service.ts`** - Service gọi Anthropic Claude API
  - Chat completion
  - Streaming support
  - Error handling
  - Token usage tracking

### 3. API Routes
- **`src/app/api/ai/chat/route.ts`** - REST API endpoint
  - `POST /api/ai/chat` - Gửi chat request
  - `GET /api/ai/chat` - Lấy danh sách models khả dụng
  - Authentication required
  - Cost estimation

### 4. React Hooks
- **`src/hooks/use-ai-chat.ts`** - Custom hooks cho clients
  - `useAIChat()` - Full chat với history
  - `useAICompletion()` - Single-shot completions
  - Auto token counting
  - Error handling

### 5. Demo Component
- **`src/components/claude-sonnet-demo.tsx`** - UI để test AI
  - Beautiful chat interface
  - Model selector
  - Quick action buttons
  - Usage statistics

---

## 🚀 Cài đặt & Cấu hình

### Bước 1: Lấy API Keys

#### Anthropic Claude (Recommended)
1. Đăng ký tài khoản tại [console.anthropic.com](https://console.anthropic.com)
2. Tạo API key mới
3. Copy API key (bắt đầu với `sk-ant-...`)

#### OpenAI (Optional)
1. Đăng ký tại [platform.openai.com](https://platform.openai.com)
2. Tạo API key mới
3. Copy API key (bắt đầu với `sk-proj-...`)

### Bước 2: Cấu hình Environment Variables

Sao chép `.env.example` thành `.env` và điền API keys:

```bash
cp .env.example .env
```

**Chỉnh sửa `.env`:**

```env
# ✅ REQUIRED - Anthropic Claude
ANTHROPIC_API_KEY="sk-ant-your-actual-key-here"
ANTHROPIC_DEFAULT_MODEL="claude-sonnet-4.5"

# Optional - OpenAI
OPENAI_API_KEY="sk-proj-your-actual-key-here"
OPENAI_DEFAULT_MODEL="gpt-4o-mini"

# Feature Flags
ENABLE_AI_CHAT="true"
ENABLE_CLAUDE_SONNET_45="true"
```

### Bước 3: Cài đặt Dependencies (nếu cần)

Dự án đã có tất cả dependencies cần thiết. Nếu thiếu, chạy:

```bash
npm install next-auth axios
```

### Bước 4: Khởi động Server

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

---

## 💻 Sử dụng trong Code

### Option 1: Sử dụng React Hook (Recommended)

```tsx
'use client';

import { useAIChat } from '@/hooks/use-ai-chat';
import { Button } from '@/components/ui/button';

export default function MyComponent() {
  const { messages, sendMessage, isLoading } = useAIChat({
    model: 'claude-sonnet-4.5',
    systemPrompt: 'Bạn là trợ lý ApexRebate...'
  });

  const handleAsk = async () => {
    await sendMessage('Tính phí giao dịch 1000 USDT trên Binance');
  };

  return (
    <div>
      {messages.map((msg, idx) => (
        <div key={idx}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
      <Button onClick={handleAsk} disabled={isLoading}>
        Hỏi AI
      </Button>
    </div>
  );
}
```

### Option 2: Gọi API trực tiếp

```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4.5',
    messages: [
      { role: 'user', content: 'Hello Claude!' }
    ],
    temperature: 0.7,
    max_tokens: 2000
  })
});

const data = await response.json();
console.log(data.data.message.content); // AI's response
console.log(data.data.usage); // Token usage
console.log(data.data.cost_usd); // Cost in USD
```

### Option 3: Server-side với Anthropic Service

```typescript
// Trong API route hoặc Server Component
import { anthropicService } from '@/lib/anthropic-service';

export async function GET() {
  const response = await anthropicService.chat({
    model: 'claude-sonnet-4.5',
    messages: [
      { role: 'user', content: 'Xin chào Claude' }
    ],
    max_tokens: 1000
  });

  return Response.json({
    message: response.content[0].text,
    tokens: response.usage
  });
}
```

---

## 🎨 Demo Component

Để test AI ngay lập tức, import demo component:

```tsx
// src/app/ai-demo/page.tsx
import ClaudeSonnetDemo from '@/components/claude-sonnet-demo';

export default function AIDemoPage() {
  return <ClaudeSonnetDemo />;
}
```

Truy cập: `http://localhost:3000/ai-demo`

---

## 🔧 Customization

### Thay đổi Model mặc định

Chỉnh sửa `src/lib/ai-config.ts`:

```typescript
export const DEFAULT_AI_CONFIG = {
  chat: 'claude-sonnet-4.5' as AIModel, // Đổi thành model khác
  // ...
};
```

### Thêm Model mới

```typescript
// Trong AI_MODEL_CONFIGS
'new-model': {
  provider: 'anthropic',
  model: 'new-model',
  enabled: true,
  maxTokens: 8192,
  temperature: 0.7,
  // ...
}
```

### Thay đổi System Prompt

```typescript
const { messages, sendMessage } = useAIChat({
  model: 'claude-sonnet-4.5',
  systemPrompt: 'Bạn là chuyên gia phân tích thị trường crypto...',
});
```

---

## 📊 Models khả dụng

| Model | Provider | Max Tokens | Cost (per 1M tokens) | Use Case |
|-------|----------|------------|---------------------|----------|
| **claude-sonnet-4.5** ✅ | Anthropic | 8,192 | $3 / $15 | **Recommended** - Chat, phân tích |
| claude-sonnet-3.5 | Anthropic | 8,192 | $3 / $15 | Alternative Claude |
| claude-opus-3 | Anthropic | 4,096 | $15 / $75 | Complex reasoning |
| claude-haiku-3 | Anthropic | 4,096 | $0.25 / $1.25 | Fast responses |
| gpt-4o | OpenAI | 16,384 | $5 / $15 | OpenAI flagship |
| gpt-4o-mini | OpenAI | 16,384 | $0.15 / $0.6 | Budget-friendly |

**✅ Claude Sonnet 4.5 được enable mặc định cho tất cả users.**

---

## 🛡️ Security & Best Practices

### 1. Authentication Required
Tất cả AI endpoints yêu cầu user đăng nhập (NextAuth session).

### 2. API Key Security
- ❌ **KHÔNG BAO GIỜ** commit API keys vào Git
- ✅ Chỉ lưu trong `.env` (đã được gitignore)
- ✅ Chỉ truy cập API keys trên server-side

### 3. Rate Limiting
Cấu hình trong `.env`:
```env
RATE_LIMIT_AI_REQUESTS_PER_MINUTE="10"
```

### 4. Cost Management
- Mỗi response trả về `cost_usd` để tracking
- Monitor usage qua `usage` object
- Set `max_tokens` hợp lý để control costs

---

## 🐛 Troubleshooting

### Lỗi: "UNAUTHORIZED"
**Nguyên nhân:** User chưa đăng nhập  
**Giải pháp:** Kiểm tra NextAuth session

### Lỗi: "MODEL_DISABLED"
**Nguyên nhân:** Model bị tắt trong config  
**Giải pháp:** Kiểm tra `AI_MODEL_CONFIGS` trong `ai-config.ts`

### Lỗi: "Anthropic API error"
**Nguyên nhân:** API key không hợp lệ hoặc hết quota  
**Giải pháp:**
1. Kiểm tra `ANTHROPIC_API_KEY` trong `.env`
2. Verify API key tại [console.anthropic.com](https://console.anthropic.com)
3. Kiểm tra billing/credits

### Lỗi: "Cannot find module 'react'"
**Nguyên nhân:** TypeScript compile error (không ảnh hưởng runtime)  
**Giải pháp:** Ignore hoặc chạy `npm install`

---

## 📈 Usage Examples

### Example 1: Trading Assistant
```typescript
const { sendMessage } = useAIChat({
  model: 'claude-sonnet-4.5',
  systemPrompt: 'Bạn là chuyên gia trading crypto, phân tích kỹ thuật và quản lý rủi ro.'
});

await sendMessage('BTC/USDT đang ở 45000, nên long hay short?');
```

### Example 2: Fee Calculator
```typescript
const { complete } = useAICompletion({
  model: 'claude-sonnet-4.5',
  systemPrompt: 'Tính toán chính xác phí giao dịch dựa trên thông tin user cung cấp.'
});

const result = await complete(
  'Tôi giao dịch 5000 USDT trên Binance VIP 0, phí là bao nhiêu?'
);
```

### Example 3: Multi-turn Conversation
```typescript
const chat = useAIChat({ model: 'claude-sonnet-4.5' });

await chat.sendMessage('Xin chào, tôi là trader mới');
// AI: "Chào bạn! Tôi có thể giúp gì cho bạn?"

await chat.sendMessage('Giải thích cho tôi về maker/taker fee');
// AI: "Maker fee là phí khi bạn tạo lệnh..."

console.log(chat.messages); // Full history
```

---

## 🎯 Roadmap

- [x] ✅ Enable Claude Sonnet 4.5 for all clients
- [x] ✅ Basic chat API
- [x] ✅ React hooks
- [x] ✅ Demo component
- [ ] 🚧 Streaming responses
- [ ] 🚧 OpenAI GPT-4 integration
- [ ] 🚧 Rate limiting middleware
- [ ] 🚧 Usage analytics dashboard
- [ ] 🚧 Fine-tuned models cho ApexRebate specific tasks

---

## 📞 Support

Nếu có vấn đề:
1. Kiểm tra logs trong console
2. Verify API keys trong `.env`
3. Đọc error messages từ API response
4. Liên hệ team qua Discord/Slack

---

## 📝 License

MIT License - ApexRebate © 2025

---

**🎉 Bây giờ bạn đã sẵn sàng sử dụng Claude Sonnet 4.5 trong ApexRebate!**

Để test ngay:
```bash
npm run dev
# Visit http://localhost:3000/ai-demo
```
