/**
 * Claude Sonnet 4.5 AI Chat Demo Component
 * Hiển thị giao diện chat để test AI với Claude Sonnet 4.5
 */

'use client';

import { useState } from 'react';
import { useAIChat } from '@/hooks/use-ai-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Trash2, Sparkles } from 'lucide-react';

export default function ClaudeSonnetDemo() {
  const [inputMessage, setInputMessage] = useState('');
  
  const {
    messages,
    sendMessage,
    isLoading,
    error,
    clearMessages,
    currentModel,
    setModel,
    availableModels,
    usage
  } = useAIChat({
    model: 'claude-sonnet-4.5',
    systemPrompt: 'Bạn là trợ lý AI thông minh của ApexRebate, chuyên hỗ trợ về giao dịch tiền điện tử, tính toán phí, và tối ưu hóa lợi nhuận. Trả lời bằng tiếng Việt, ngắn gọn và chính xác.',
    temperature: 0.7,
    maxTokens: 2000
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    
    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              <CardTitle>Claude Sonnet 4.5 AI Chat</CardTitle>
            </div>
            <Badge variant="default" className="bg-purple-600">
              ✅ Enabled for All Clients
            </Badge>
          </div>
          <CardDescription>
            Trò chuyện với AI powered by Anthropic Claude Sonnet 4.5 - Model mạnh nhất hiện tại
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Model Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Model:</label>
            <select
              value={currentModel}
              onChange={(e) => setModel(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
              disabled={isLoading}
            >
              <option value="claude-sonnet-4.5">Claude Sonnet 4.5 (Recommended)</option>
              <option value="claude-sonnet-3.5">Claude Sonnet 3.5</option>
              <option value="claude-opus-3">Claude Opus 3</option>
              <option value="claude-haiku-3">Claude Haiku 3 (Fast)</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
            </select>
            
            <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
              <span>Tokens: {usage.totalInputTokens + usage.totalOutputTokens}</span>
              <span>Cost: ${usage.totalCost.toFixed(4)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chat History</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={clearMessages}
              disabled={messages.length === 0 || isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Bắt đầu trò chuyện với Claude</p>
                <p className="text-sm">Hỏi bất kỳ điều gì về trading, phí giao dịch, hoặc ApexRebate</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages
                  .filter(msg => msg.role !== 'system')
                  .map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {msg.role === 'user' ? 'Bạn' : 'Claude'}
                        </p>
                        <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                        {msg.timestamp && (
                          <p className="text-xs opacity-70 mt-2">
                            {new Date(msg.timestamp).toLocaleTimeString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Claude đang suy nghĩ...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              ❌ Lỗi: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Input Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn của bạn... (Enter để gửi)"
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          
          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputMessage('Giải thích cách tính phí giao dịch trên Binance')}
              disabled={isLoading}
            >
              💰 Tính phí giao dịch
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputMessage('So sánh phí giữa Binance và Bybit')}
              disabled={isLoading}
            >
              ⚖️ So sánh sàn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputMessage('ApexRebate hoạt động như thế nào?')}
              disabled={isLoading}
            >
              ❓ ApexRebate là gì
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputMessage('Chiến lược giao dịch nào tốt cho người mới?')}
              disabled={isLoading}
            >
              📈 Trading tips
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-purple-900 dark:text-purple-100">
                Claude Sonnet 4.5 - Được bật cho tất cả người dùng ApexRebate
              </p>
              <p className="text-purple-700 dark:text-purple-300">
                Model AI mạnh mẽ nhất của Anthropic, có khả năng hiểu ngữ cảnh sâu, 
                trả lời chính xác và hỗ trợ đa ngôn ngữ (Tiếng Việt native support).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
