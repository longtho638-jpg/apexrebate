import { useCallback, useMemo, useState } from 'react';

type Role = 'system' | 'user' | 'assistant';

interface AIMessage {
  role: Role;
  content: string;
  timestamp?: string;
}

interface AIUsage {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
}

interface UseAIChatOptions {
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

const DEFAULT_MODELS = [
  'claude-sonnet-4.5',
  'claude-sonnet-3.5',
  'claude-opus-3',
  'claude-haiku-3',
  'gpt-4o',
  'gpt-4o-mini',
];

export function useAIChat(options: UseAIChatOptions) {
  const [messages, setMessages] = useState<AIMessage[]>(() =>
    options.systemPrompt
      ? [{ role: 'system', content: options.systemPrompt }]
      : []
  );
  const [currentModel, setModel] = useState(options.model);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [usage, setUsage] = useState<AIUsage>({
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCost: 0,
  });

  const availableModels = useMemo(() => DEFAULT_MODELS, []);

  const simulateCost = (inputTokens: number, outputTokens: number) => {
    // Approximate cost per token for demo purposes
    const pricePerToken =
      currentModel.includes('mini') || currentModel.includes('haiku')
        ? 0.000001
        : 0.0000025;
    return (inputTokens + outputTokens) * pricePerToken;
  };

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      setIsLoading(true);
      setError(null);

      const timestamp = new Date().toISOString();
      setMessages(prev => [
        ...prev,
        { role: 'user', content: trimmed, timestamp },
      ]);

      try {
        // Simulate latency
        await new Promise(resolve => setTimeout(resolve, 400));

        const responseContent = `(${currentModel}) Demo response: ${trimmed}`;
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: responseContent,
            timestamp: new Date().toISOString(),
          },
        ]);

        const inputTokens = Math.ceil(trimmed.length / 4);
        const outputTokens = Math.ceil(responseContent.length / 4);
        const costDelta = simulateCost(inputTokens, outputTokens);

        setUsage(prev => ({
          totalInputTokens: prev.totalInputTokens + inputTokens,
          totalOutputTokens: prev.totalOutputTokens + outputTokens,
          totalCost: prev.totalCost + costDelta,
        }));
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to send message')
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentModel]
  );

  const clearMessages = useCallback(() => {
    setMessages(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []);
    setUsage({
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCost: 0,
    });
  }, [options.systemPrompt]);

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    clearMessages,
    currentModel,
    setModel,
    availableModels,
    usage,
  };
}
