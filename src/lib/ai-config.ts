/**
 * Cấu hình AI Model Providers
 * Hỗ trợ: OpenAI GPT-4, GPT-4o-mini, Anthropic Claude Sonnet 4.5, v.v.
 */

export type AIProvider = 'openai' | 'anthropic' | 'google';

export type AIModel = 
  | 'gemini-3-pro-preview'
  | 'gpt-4'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-3.5-turbo'
  | 'claude-sonnet-4.5'
  | 'claude-sonnet-3.5'
  | 'claude-opus-3'
  | 'claude-haiku-3';

export interface AIModelConfig {
  provider: AIProvider;
  model: AIModel;
  enabled: boolean;
  maxTokens: number;
  temperature: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  // Giới hạn rate limit (requests per minute)
  rateLimit?: number;
  // Chi phí ước tính (USD per 1M tokens)
  costPer1MTokens?: {
    input: number;
    output: number;
  };
}

export interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;
  organization?: string;
  defaultModel: AIModel;
}

// ====================================
// CẤU HÌNH MẶC ĐỊNH CHO TỪNG MODEL
// ====================================

export const AI_MODEL_CONFIGS: Record<AIModel, AIModelConfig> = {
  // Google Gemini Models
  'gemini-3-pro-preview': {
    provider: 'google',
    model: 'gemini-3-pro-preview',
    enabled: true,
    maxTokens: 32000,
    temperature: 0.7,
    topP: 1,
    rateLimit: 1000,
    costPer1MTokens: {
      input: 1.0,
      output: 4.0
    }
  },
  // OpenAI Models
  'gpt-4': {
    provider: 'openai',
    model: 'gpt-4',
    enabled: true,
    maxTokens: 8192,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    rateLimit: 500,
    costPer1MTokens: {
      input: 30.0,
      output: 60.0
    }
  },
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    enabled: true,
    maxTokens: 16384,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    rateLimit: 500,
    costPer1MTokens: {
      input: 5.0,
      output: 15.0
    }
  },
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    enabled: true,
    maxTokens: 16384,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    rateLimit: 1000,
    costPer1MTokens: {
      input: 0.15,
      output: 0.6
    }
  },
  'gpt-3.5-turbo': {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    enabled: true,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    rateLimit: 1000,
    costPer1MTokens: {
      input: 0.5,
      output: 1.5
    }
  },
  
  // Anthropic Claude Models
  'claude-sonnet-4.5': {
    provider: 'anthropic',
    model: 'claude-sonnet-4.5',
    enabled: true, // ✅ BẬT CHO TẤT CẢ CLIENTS
    maxTokens: 8192,
    temperature: 0.7,
    topP: 1,
    rateLimit: 500,
    costPer1MTokens: {
      input: 3.0,
      output: 15.0
    }
  },
  'claude-sonnet-3.5': {
    provider: 'anthropic',
    model: 'claude-sonnet-3.5',
    enabled: true,
    maxTokens: 8192,
    temperature: 0.7,
    topP: 1,
    rateLimit: 500,
    costPer1MTokens: {
      input: 3.0,
      output: 15.0
    }
  },
  'claude-opus-3': {
    provider: 'anthropic',
    model: 'claude-opus-3',
    enabled: true,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1,
    rateLimit: 300,
    costPer1MTokens: {
      input: 15.0,
      output: 75.0
    }
  },
  'claude-haiku-3': {
    provider: 'anthropic',
    model: 'claude-haiku-3',
    enabled: true,
    maxTokens: 4096,
    temperature: 0.7,
    topP: 1,
    rateLimit: 1000,
    costPer1MTokens: {
      input: 0.25,
      output: 1.25
    }
  }
};

// ====================================
// PROVIDER CONFIGURATIONS (SERVER-SIDE ONLY)
// ====================================

/**
 * Lấy cấu hình OpenAI - CHỈ SỬ DỤNG TRÊN SERVER
 * Gọi hàm này trong API routes hoặc server components
 */
export const getOpenAIConfig = (): AIProviderConfig => {
  if (typeof window !== 'undefined') {
    throw new Error('getOpenAIConfig() chỉ có thể gọi trên server-side');
  }
  
  return {
    apiKey: process.env.OPENAI_API_KEY || '',
    organization: process.env.OPENAI_ORG || undefined,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    defaultModel: (process.env.OPENAI_DEFAULT_MODEL as AIModel) || 'gpt-4o-mini'
  };
};

/**
 * Lấy cấu hình Anthropic - CHỈ SỬ DỤNG TRÊN SERVER
 * Gọi hàm này trong API routes hoặc server components
 */
/**
 * Lấy cấu hình Google Gemini - CHỈ SỬ DỤNG TRÊN SERVER
 * Gọi hàm này trong API routes hoặc server components
 */
export const getGoogleConfig = (): AIProviderConfig => {
  if (typeof window !== 'undefined') {
    throw new Error('getGoogleConfig() chỉ có thể gọi trên server-side');
  }
  
  return {
    apiKey: process.env.GEMINI_API_KEY || '',
    baseURL: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: (process.env.GEMINI_DEFAULT_MODEL as AIModel) || 'gemini-3-pro-preview'
  };
};

export const getAnthropicConfig = (): AIProviderConfig => {
  if (typeof window !== 'undefined') {
    throw new Error('getAnthropicConfig() chỉ có thể gọi trên server-side');
  }
  
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
    defaultModel: (process.env.ANTHROPIC_DEFAULT_MODEL as AIModel) || 'claude-sonnet-4.5'
  };
};

// ====================================
// HELPER FUNCTIONS
// ====================================

/**
 * Lấy cấu hình model dựa trên tên model
 */
export function getModelConfig(model: AIModel): AIModelConfig {
  const config = AI_MODEL_CONFIGS[model];
  if (!config) {
    throw new Error(`Model không được hỗ trợ: ${model}`);
  }
  if (!config.enabled) {
    throw new Error(`Model đã bị vô hiệu hóa: ${model}`);
  }
  return config;
}

/**
 * Lấy tất cả models đang được bật
 */
export function getEnabledModels(): AIModel[] {
  return Object.entries(AI_MODEL_CONFIGS)
    .filter(([_, config]) => config.enabled)
    .map(([model, _]) => model as AIModel);
}

/**
 * Lấy models theo provider
 */
export function getModelsByProvider(provider: AIProvider): AIModel[] {
  return Object.entries(AI_MODEL_CONFIGS)
    .filter(([_, config]) => config.provider === provider && config.enabled)
    .map(([model, _]) => model as AIModel);
}

/**
 * Kiểm tra xem model có được bật không
 */
export function isModelEnabled(model: AIModel): boolean {
  return AI_MODEL_CONFIGS[model]?.enabled ?? false;
}

/**
 * Lấy model mặc định cho provider
 */
export function getDefaultModel(provider: AIProvider): AIModel {
  if (provider === 'openai') {
    return getOpenAIConfig().defaultModel;
  } else if (provider === 'anthropic') {
    return getAnthropicConfig().defaultModel;
  }
  throw new Error(`Provider không được hỗ trợ: ${provider}`);
}

/**
 * Ước tính chi phí (USD) cho một request
 */
export function estimateCost(
  model: AIModel,
  inputTokens: number,
  outputTokens: number
): number {
  const config = getModelConfig(model);
  if (!config.costPer1MTokens) return 0;
  
  const inputCost = (inputTokens / 1_000_000) * config.costPer1MTokens.input;
  const outputCost = (outputTokens / 1_000_000) * config.costPer1MTokens.output;
  
  return inputCost + outputCost;
}

// ====================================
// EXPORT DEFAULT CONFIG
// ====================================

export const DEFAULT_AI_CONFIG = {
  // Model ưu tiên cho các tác vụ khác nhau
  chat: 'gemini-3-pro-preview' as AIModel, // ✅ GEMINI 3.0 PRO PREVIEW // ✅ SỬ DỤNG CLAUDE SONNET 4.5 CHO CHAT
  completion: 'gpt-4o-mini' as AIModel,
  embedding: 'text-embedding-3-small' as const,
  analysis: 'claude-opus-3' as AIModel,
  quickResponse: 'gpt-4o-mini' as AIModel,
  
  // Cài đặt chung
  timeout: 60000, // 60 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
};

const aiConfig = {
  AI_MODEL_CONFIGS,
  getOpenAIConfig,
  getAnthropicConfig,
  getModelConfig,
  getEnabledModels,
  getModelsByProvider,
  isModelEnabled,
  getDefaultModel,
  estimateCost,
  DEFAULT_AI_CONFIG
};

export default aiConfig;
