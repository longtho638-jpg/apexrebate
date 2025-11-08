/**
 * AI Chat API Endpoint
 * Hỗ trợ cả OpenAI và Anthropic Claude
 * Endpoint: POST /api/ai/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { anthropicService } from '@/lib/anthropic-service';
import { 
  getModelConfig, 
  isModelEnabled, 
  estimateCost,
  type AIModel 
} from '@/lib/ai-config';
import { logger } from '@/lib/logging';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  model?: AIModel;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    id: string;
    model: string;
    message: {
      role: 'assistant';
      content: string;
    };
    usage: {
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
    };
    cost_usd?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Vui lòng đăng nhập để sử dụng AI'
          }
        } as ChatResponse,
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json() as ChatRequest;
    const { messages, temperature, max_tokens, stream } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_MESSAGES',
            message: 'Messages phải là một mảng không rỗng'
          }
        } as ChatResponse,
        { status: 400 }
      );
    }

    // Xác định model (mặc định là claude-sonnet-4.5)
    const model = body.model || 'claude-sonnet-4.5';

    // Kiểm tra model có được bật không
    if (!isModelEnabled(model)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MODEL_DISABLED',
            message: `Model ${model} hiện không khả dụng`
          }
        } as ChatResponse,
        { status: 400 }
      );
    }

    const modelConfig = getModelConfig(model);

    logger.info('AI chat request', {
      userId: session.user.id,
      model,
      messagesCount: messages.length
    });

    // Xử lý theo provider
    if (modelConfig.provider === 'anthropic') {
      return await handleAnthropicChat(
        model,
        messages,
        temperature,
        max_tokens,
        stream,
        session.user.id
      );
    } else if (modelConfig.provider === 'openai') {
      return await handleOpenAIChat(
        model,
        messages,
        temperature,
        max_tokens,
        stream,
        session.user.id
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNSUPPORTED_PROVIDER',
            message: `Provider ${modelConfig.provider} chưa được hỗ trợ`
          }
        } as ChatResponse,
        { status: 400 }
      );
    }

  } catch (error) {
    logger.error('AI chat API error', { error });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Lỗi server'
        }
      } as ChatResponse,
      { status: 500 }
    );
  }
}

/**
 * Xử lý chat với Anthropic Claude
 */
async function handleAnthropicChat(
  model: AIModel,
  messages: ChatMessage[],
  temperature?: number,
  maxTokens?: number,
  stream?: boolean,
  userId?: string
): Promise<NextResponse> {
  // Tách system message ra (Anthropic yêu cầu format khác)
  const systemMessage = messages.find(m => m.role === 'system');
  const chatMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

  try {
    const response = await anthropicService.chat({
      model,
      messages: chatMessages,
      temperature,
      max_tokens: maxTokens,
      system: systemMessage?.content
    });

    // Tính chi phí
    const cost = estimateCost(
      model,
      response.usage.input_tokens,
      response.usage.output_tokens
    );

    logger.info('Anthropic chat success', {
      userId,
      model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cost
    });

    return NextResponse.json({
      success: true,
      data: {
        id: response.id,
        model: response.model,
        message: {
          role: 'assistant',
          content: response.content[0]?.text || ''
        },
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens
        },
        cost_usd: cost
      }
    } as ChatResponse);

  } catch (error) {
    logger.error('Anthropic chat error', { error, userId, model });
    throw error;
  }
}

/**
 * Xử lý chat với OpenAI (placeholder - cần implement)
 */
async function handleOpenAIChat(
  model: AIModel,
  messages: ChatMessage[],
  temperature?: number,
  maxTokens?: number,
  stream?: boolean,
  userId?: string
): Promise<NextResponse> {
  // TODO: Implement OpenAI chat
  // Bạn cần cài đặt package: npm install openai
  // import OpenAI from 'openai';
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'OpenAI chat chưa được implement. Vui lòng sử dụng Claude models.'
      }
    } as ChatResponse,
    { status: 501 }
  );
}

/**
 * GET endpoint - Lấy thông tin về models khả dụng
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Vui lòng đăng nhập'
          }
        },
        { status: 401 }
      );
    }

    // Import dynamically để tránh lỗi
    const { getEnabledModels, AI_MODEL_CONFIGS } = await import('@/lib/ai-config');
    const enabledModels = getEnabledModels();

    return NextResponse.json({
      success: true,
      data: {
        models: enabledModels.map(model => ({
          id: model,
          name: model,
          provider: AI_MODEL_CONFIGS[model].provider,
          maxTokens: AI_MODEL_CONFIGS[model].maxTokens,
          costPer1MTokens: AI_MODEL_CONFIGS[model].costPer1MTokens
        })),
        default: 'claude-sonnet-4.5'
      }
    });

  } catch (error) {
    logger.error('Get models API error', { error });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Không thể lấy danh sách models'
        }
      },
      { status: 500 }
    );
  }
}
