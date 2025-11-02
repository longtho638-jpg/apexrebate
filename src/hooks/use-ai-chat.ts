/**
 * Custom React Hook để sử dụng AI Chat
 * Hỗ trợ Claude Sonnet 4.5 và các AI models khác
 * 
 * Usage:
 * ```tsx
 * const { messages, sendMessage, isLoading, error } = useAIChat({
 *   model: 'claude-sonnet-4.5',
 *   systemPrompt: 'Bạn là trợ lý ApexRebate...'
 * });
 * 
 * await sendMessage('Giúp tôi tính toán phí giao dịch');
 * ```
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic';
  maxTokens: number;
}

export interface UseAIChatOptions {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  onError?: (error: Error) => void;
  onSuccess?: (message: string) => void;
}

export interface UseAIChatReturn {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  clearMessages: () => void;
  availableModels: AIModel[];
  currentModel: string;
  setModel: (model: string) => void;
  usage: {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
  };
}

export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const {
    model = 'claude-sonnet-4.5',
    systemPrompt,
    temperature,
    maxTokens,
    onError,
    onSuccess
  } = options;

  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Thêm system prompt vào đầu nếu có
    if (systemPrompt) {
      return [{
        role: 'system' as const,
        content: systemPrompt,
        timestamp: new Date()
      }];
    }
    return [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentModel, setCurrentModel] = useState(model);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [usage, setUsage] = useState({
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCost: 0
  });

  // Abort controller để có thể cancel requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load available models khi component mount
  useState(() => {
    if (session?.user) {
      fetchAvailableModels();
    }
  });

  const fetchAvailableModels = async () => {
    try {
      const response = await fetch('/api/ai/chat');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.models) {
          setAvailableModels(data.data.models);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch available models:', err);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!session?.user) {
      const authError = new Error('Vui lòng đăng nhập để sử dụng AI');
      setError(authError);
      onError?.(authError);
      return;
    }

    if (!content.trim()) {
      return;
    }

    // Thêm user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [...messages, userMessage],
          temperature,
          max_tokens: maxTokens
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'AI request failed');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'AI request failed');
      }

      // Thêm assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.data.message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Cập nhật usage stats
      if (data.data.usage) {
        setUsage(prev => ({
          totalInputTokens: prev.totalInputTokens + data.data.usage.input_tokens,
          totalOutputTokens: prev.totalOutputTokens + data.data.usage.output_tokens,
          totalCost: prev.totalCost + (data.data.cost_usd || 0)
        }));
      }

      onSuccess?.(assistantMessage.content);

    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          console.log('Request cancelled');
          return;
        }
        setError(err);
        onError?.(err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [session, messages, currentModel, temperature, maxTokens, onError, onSuccess]);

  const clearMessages = useCallback(() => {
    // Giữ lại system prompt nếu có
    const systemMsg = messages.find(m => m.role === 'system');
    setMessages(systemMsg ? [systemMsg] : []);
    setUsage({
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCost: 0
    });
    setError(null);
  }, [messages]);

  const setModel = useCallback((newModel: string) => {
    setCurrentModel(newModel);
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    clearMessages,
    availableModels,
    currentModel,
    setModel,
    usage
  };
}

/**
 * Hook đơn giản hơn cho single-shot AI requests (không cần chat history)
 */
export function useAICompletion(options: UseAIChatOptions = {}) {
  const {
    model = 'claude-sonnet-4.5',
    systemPrompt,
    temperature,
    maxTokens,
    onError,
    onSuccess
  } = options;

  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const complete = useCallback(async (prompt: string): Promise<string | null> => {
    if (!session?.user) {
      const authError = new Error('Vui lòng đăng nhập để sử dụng AI');
      setError(authError);
      onError?.(authError);
      return null;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const messages: ChatMessage[] = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      
      messages.push({ role: 'user', content: prompt });

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'AI request failed');
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'AI request failed');
      }

      const content = data.data.message.content;
      setResponse(content);
      onSuccess?.(content);
      
      return content;

    } catch (err) {
      if (err instanceof Error) {
        setError(err);
        onError?.(err);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, model, systemPrompt, temperature, maxTokens, onError, onSuccess]);

  return {
    complete,
    isLoading,
    error,
    response
  };
}

export default useAIChat;
