/**
 * Anthropic Claude Service
 * Service để gọi Anthropic Claude API (Sonnet 4.5, Opus, Haiku)
 */

import { getAnthropicConfig, getModelConfig, type AIModel } from './ai-config';
import { logger } from './logging';

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicChatRequest {
  model?: AIModel;
  messages: AnthropicMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  system?: string;
}

export interface AnthropicChatResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence';
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface AnthropicError {
  type: 'error';
  error: {
    type: string;
    message: string;
  };
}

class AnthropicService {
  private config: ReturnType<typeof getAnthropicConfig>;
  private baseURL: string;

  constructor() {
    this.config = getAnthropicConfig();
    this.baseURL = this.config.baseURL || 'https://api.anthropic.com/v1';
  }

  /**
   * Gửi chat completion request tới Claude
   */
  async chat(request: AnthropicChatRequest): Promise<AnthropicChatResponse> {
    const model = request.model || this.config.defaultModel;
    const modelConfig = getModelConfig(model);

    if (modelConfig.provider !== 'anthropic') {
      throw new Error(`Model ${model} không phải là model Anthropic`);
    }

    const payload = {
      model: this.mapModelName(model),
      messages: request.messages,
      max_tokens: request.max_tokens || modelConfig.maxTokens,
      temperature: request.temperature ?? modelConfig.temperature,
      top_p: request.top_p ?? modelConfig.topP,
      stream: request.stream || false,
      ...(request.system && { system: request.system })
    };

    logger.info('Anthropic API request', {
      model,
      messagesCount: request.messages.length,
      maxTokens: payload.max_tokens
    });

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json() as AnthropicError;
        logger.error('Anthropic API error', {
          status: response.status,
          error: errorData
        });
        throw new Error(
          `Anthropic API error: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json() as AnthropicChatResponse;

      logger.info('Anthropic API response', {
        model: data.model,
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
        stopReason: data.stop_reason
      });

      return data;
    } catch (error) {
      logger.error('Anthropic service error', { error });
      throw error;
    }
  }

  /**
   * Stream chat completion từ Claude
   */
  async streamChat(
    request: AnthropicChatRequest,
    onChunk: (text: string) => void,
    onComplete?: (response: AnthropicChatResponse) => void
  ): Promise<void> {
    const model = request.model || this.config.defaultModel;
    const modelConfig = getModelConfig(model);

    if (modelConfig.provider !== 'anthropic') {
      throw new Error(`Model ${model} không phải là model Anthropic`);
    }

    const payload = {
      model: this.mapModelName(model),
      messages: request.messages,
      max_tokens: request.max_tokens || modelConfig.maxTokens,
      temperature: request.temperature ?? modelConfig.temperature,
      top_p: request.top_p ?? modelConfig.topP,
      stream: true,
      ...(request.system && { system: request.system })
    };

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json() as AnthropicError;
        throw new Error(
          `Anthropic API error: ${errorData.error?.message || response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'content_block_delta') {
                const text = parsed.delta?.text || '';
                if (text) {
                  onChunk(text);
                }
              } else if (parsed.type === 'message_stop') {
                if (onComplete) {
                  // Note: Trong streaming, không có full response object
                  // Bạn có thể cần thu thập chunks để tạo response object
                }
              }
            } catch (e) {
              logger.warn('Failed to parse SSE data', { data, error: e });
            }
          }
        }
      }
    } catch (error) {
      logger.error('Anthropic stream error', { error });
      throw error;
    }
  }

  /**
   * Map internal model name sang Anthropic API model name
   */
  private mapModelName(model: AIModel): string {
    const mapping: Record<string, string> = {
      'claude-sonnet-4.5': 'claude-sonnet-4.5-20250514',
      'claude-sonnet-3.5': 'claude-3-5-sonnet-20241022',
      'claude-opus-3': 'claude-3-opus-20240229',
      'claude-haiku-3': 'claude-3-haiku-20240307'
    };

    return mapping[model] || model;
  }

  /**
   * Kiểm tra API key có hợp lệ không
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await this.chat({
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 10
      });
      return response.type === 'message';
    } catch (error) {
      logger.error('API key validation failed', { error });
      return false;
    }
  }

  /**
   * Lấy thông tin về models khả dụng
   */
  getAvailableModels(): AIModel[] {
    return [
      'claude-sonnet-4.5',
      'claude-sonnet-3.5',
      'claude-opus-3',
      'claude-haiku-3'
    ];
  }
}

// Export singleton instance
export const anthropicService = new AnthropicService();

export default AnthropicService;
