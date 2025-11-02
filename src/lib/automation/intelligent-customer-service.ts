/**
 * 智能客服和聊天机器人系统
 * 基于AI的智能客服，支持多语言、多渠道、自动化问题解答
 */

import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import ZAI from 'z-ai-web-dev-sdk';
import { notificationSystem } from './realtime-notifications';

export interface ChatMessage {
  id: string;
  userId: string;
  sessionId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'quick_reply';
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
  metadata?: any;
}

export interface ChatSession {
  id: string;
  userId: string;
  status: 'active' | 'waiting' | 'closed' | 'transferred';
  assignedAgentId?: string;
  startTime: Date;
  lastActivity: Date;
  messages: ChatMessage[];
  context: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'web' | 'mobile' | 'email' | 'social';
  tags: string[];
}

export interface KnowledgeBase {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  language: string;
  priority: number;
  usageCount: number;
  lastUpdated: Date;
}

export class IntelligentCustomerService {
  private static instance: IntelligentCustomerService;
  private zai: any = null;
  private activeSessions: Map<string, ChatSession> = new Map();
  private knowledgeBase: KnowledgeBase[] = [];
  private agentQueue: string[] = [];
  private conversationFlows: Map<string, any> = new Map();

  static getInstance(): IntelligentCustomerService {
    if (!IntelligentCustomerService.instance) {
      IntelligentCustomerService.instance = new IntelligentCustomerService();
    }
    return IntelligentCustomerService.instance;
  }

  constructor() {
    this.initializeServices();
    this.loadKnowledgeBase();
    this.initializeConversationFlows();
    this.startSessionMonitor();
  }

  /**
   * 初始化聊天会话
   */
  async initializeChatSession(userId: string, channel: string = 'web'): Promise<string> {
    try {
      const sessionId = this.generateSessionId();
      const session: ChatSession = {
        id: sessionId,
        userId,
        status: 'active',
        startTime: new Date(),
        lastActivity: new Date(),
        messages: [],
        context: {},
        priority: 'medium',
        channel: channel as any,
        tags: []
      };

      this.activeSessions.set(sessionId, session);
      
      // 保存会话到缓存
      await this.saveSessionToCache(session);
      
      // 发送欢迎消息
      await this.sendWelcomeMessage(sessionId);
      
      logger.info(`Chat session initialized: ${sessionId} for user: ${userId}`);
      
      return sessionId;

    } catch (error) {
      logger.error('Failed to initialize chat session', error);
      throw error;
    }
  }

  /**
   * 处理用户消息
   */
  async processUserMessage(
    sessionId: string,
    content: string,
    type: 'text' | 'image' | 'file' = 'text',
    metadata?: any
  ): Promise<any> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // 创建用户消息
      const userMessage: ChatMessage = {
        id: this.generateMessageId(),
        userId: session.userId,
        sessionId,
        content,
        type,
        sender: 'user',
        timestamp: new Date(),
        metadata
      };

      // 添加到会话
      session.messages.push(userMessage);
      session.lastActivity = new Date();
      
      // 保存消息
      await this.saveMessage(userMessage);

      // 分析消息意图
      const intent = await this.analyzeMessageIntent(content, session.context);
      
      // 生成响应
      const response = await this.generateBotResponse(intent, session);
      
      // 创建机器人消息
      const botMessage: ChatMessage = {
        id: this.generateMessageId(),
        userId: session.userId,
        sessionId,
        content: response.content,
        type: response.type || 'text',
        sender: 'bot',
        timestamp: new Date(),
        metadata: response.metadata
      };

      // 添加到会话
      session.messages.push(botMessage);
      
      // 保存消息
      await this.saveMessage(botMessage);
      
      // 更新会话上下文
      await this.updateSessionContext(session, intent, response);
      
      // 保存会话
      await this.saveSessionToCache(session);

      // 实时推送给用户
      await this.sendMessageToUser(session.userId, botMessage);

      logger.info(`Processed message for session: ${sessionId}`, {
        intent: intent.intent,
        confidence: intent.confidence
      });

      return {
        userMessage,
        botMessage,
        intent,
        suggestions: response.suggestions || []
      };

    } catch (error) {
      logger.error('Failed to process user message', error);
      throw error;
    }
  }

  /**
   * 转接到人工客服
   */
  async transferToHumanAgent(
    sessionId: string,
    reason: string,
    priority: 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.status = 'waiting';
      session.priority = priority;
      session.tags.push('human_transfer');

      // 查找可用客服
      const availableAgent = await this.findAvailableAgent();
      
      if (availableAgent) {
        session.assignedAgentId = availableAgent;
        session.status = 'active';
        
        // 通知客服
        await this.notifyAgent(availableAgent, sessionId, reason);
        
        // 通知用户
        await this.sendSystemMessage(
          sessionId,
          '您已被转接到人工客服，请稍候...',
          'info'
        );
      } else {
        // 加入队列
        this.agentQueue.push(sessionId);
        
        // 通知用户排队状态
        const queuePosition = this.agentQueue.indexOf(sessionId) + 1;
        await this.sendSystemMessage(
          sessionId,
          `当前所有客服正忙，您排在第 ${queuePosition} 位，预计等待时间 ${queuePosition * 2} 分钟`,
          'info'
        );
      }

      await this.saveSessionToCache(session);
      
      logger.info(`Session transferred to human agent: ${sessionId}`, {
        reason,
        priority,
        assignedAgent: availableAgent
      });

    } catch (error) {
      logger.error('Failed to transfer to human agent', error);
      throw error;
    }
  }

  /**
   * 结束聊天会话
   */
  async endChatSession(sessionId: string, rating?: number, feedback?: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.status = 'closed';
      
      // 保存评价和反馈
      if (rating !== undefined || feedback) {
        await this.saveSessionFeedback(sessionId, rating, feedback);
      }

      // 生成会话摘要
      const summary = await this.generateSessionSummary(session);
      session.context.summary = summary;

      // 保存最终会话状态
      await this.saveSessionToDatabase(session);
      
      // 从活跃会话中移除
      this.activeSessions.delete(sessionId);

      logger.info(`Chat session ended: ${sessionId}`, {
        duration: Date.now() - session.startTime.getTime(),
        messageCount: session.messages.length,
        rating
      });

    } catch (error) {
      logger.error('Failed to end chat session', error);
      throw error;
    }
  }

  /**
   * 获取会话历史
   */
  async getSessionHistory(userId: string, limit: number = 10): Promise<ChatSession[]> {
    try {
      const cacheKey = `user_sessions_${userId}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        const sessions = JSON.parse(cached);
        return sessions.slice(0, limit);
      }

      // 从数据库获取会话历史
      const sessions = await this.getUserSessionsFromDatabase(userId, limit);
      
      // 缓存结果
      await redis.setex(cacheKey, 3600, JSON.stringify(sessions));
      
      return sessions;

    } catch (error) {
      logger.error('Failed to get session history', error);
      return [];
    }
  }

  /**
   * 搜索知识库
   */
  async searchKnowledgeBase(query: string, language: string = 'vi'): Promise<KnowledgeBase[]> {
    try {
      const cacheKey = `kb_search_${query}_${language}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // 使用ZAI进行智能搜索
      const searchResults = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `你是一个专业的知识库搜索助手。基于用户查询，从知识库中找到最相关的问答对。
            
            知识库内容：
            ${JSON.stringify(this.knowledgeBase.slice(0, 50), null, 2)}
            
            请返回JSON格式的搜索结果：
            {
              "results": [
                {
                  "id": "知识库ID",
                  "category": "分类",
                  "question": "问题",
                  "answer": "答案",
                  "relevanceScore": 数值 (0-1)
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `搜索查询: ${query}\n语言: ${language}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const response = JSON.parse(searchResults.choices[0].message.content);
      
      // 缓存搜索结果
      await redis.setex(cacheKey, 1800, JSON.stringify(response.results));
      
      // 更新知识库使用统计
      await this.updateKnowledgeBaseUsage(response.results);

      return response.results;

    } catch (error) {
      logger.error('Failed to search knowledge base', error);
      return [];
    }
  }

  /**
   * 添加知识库条目
   */
  async addKnowledgeBaseEntry(entry: Omit<KnowledgeBase, 'id' | 'usageCount' | 'lastUpdated'>): Promise<string> {
    try {
      const newEntry: KnowledgeBase = {
        ...entry,
        id: this.generateKBEntryId(),
        usageCount: 0,
        lastUpdated: new Date()
      };

      this.knowledgeBase.push(newEntry);
      
      // 保存到数据库
      await this.saveKnowledgeBaseToDatabase(newEntry);
      
      // 清除相关缓存
      await this.clearKBCache();
      
      logger.info(`Knowledge base entry added: ${newEntry.id}`);
      
      return newEntry.id;

    } catch (error) {
      logger.error('Failed to add knowledge base entry', error);
      throw error;
    }
  }

  /**
   * 获取客服统计
   */
  async getCustomerServiceStats(timeRange: string = '7d'): Promise<any> {
    try {
      const cacheKey = `cs_stats_${timeRange}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const stats = {
        totalSessions: 0,
        activeSessions: this.activeSessions.size,
        averageResponseTime: 0,
        satisfactionScore: 0,
        resolutionRate: 0,
        topTopics: [],
        agentWorkload: {},
        languageDistribution: {},
        channelDistribution: {}
      };

      // 计算统计数据
      for (const session of this.activeSessions.values()) {
        stats.totalSessions++;
        
        // 统计渠道分布
        stats.channelDistribution[session.channel] = 
          (stats.channelDistribution[session.channel] || 0) + 1;
      }

      // 缓存统计结果
      await redis.setex(cacheKey, 300, JSON.stringify(stats));
      
      return stats;

    } catch (error) {
      logger.error('Failed to get customer service stats', error);
      return {};
    }
  }

  /**
   * 私有方法实现
   */
  private async initializeServices(): Promise<void> {
    try {
      this.zai = await ZAI.create();
      logger.info('Customer service AI initialized');
    } catch (error) {
      logger.error('Failed to initialize customer service AI', error);
    }
  }

  private async loadKnowledgeBase(): Promise<void> {
    // 加载预定义的知识库
    this.knowledgeBase = [
      {
        id: 'kb_001',
        category: 'general',
        question: 'ApexRebate是什么？',
        answer: 'ApexRebate是一个专业的交易返佣平台，帮助交易者最大化降低交易成本，提高净收益。我们与各大交易所合作，为您提供最高比例的返佣服务。',
        keywords: ['apexrebate', '介绍', '什么是', '平台'],
        language: 'vi',
        priority: 1,
        usageCount: 0,
        lastUpdated: new Date()
      },
      {
        id: 'kb_002',
        category: 'rebate',
        question: '如何获得交易返佣？',
        answer: '获得返佣很简单：1. 注册ApexRebate账户；2. 通过我们的链接连接交易所账户；3. 正常进行交易；4. 返佣将自动结算到您的账户。',
        keywords: ['返佣', '如何获得', '流程', '步骤'],
        language: 'vi',
        priority: 1,
        usageCount: 0,
        lastUpdated: new Date()
      },
      {
        id: 'kb_003',
        category: 'payment',
        question: '返佣什么时候到账？',
        answer: '返佣结算时间因交易所而异：- Binance: 每日结算 - Bybit: 每日结算 - OKX: 每周结算。具体到账时间会在您的个人中心显示。',
        keywords: ['到账', '时间', '结算', '什么时候'],
        language: 'vi',
        priority: 1,
        usageCount: 0,
        lastUpdated: new Date()
      },
      {
        id: 'kb_004',
        category: 'technical',
        question: '忘记密码怎么办？',
        answer: '请点击登录页面的"忘记密码"链接，输入您的邮箱地址，我们会发送重置密码的链接到您的邮箱。如果没有收到，请检查垃圾邮件文件夹。',
        keywords: ['密码', '忘记', '重置', '登录'],
        language: 'vi',
        priority: 1,
        usageCount: 0,
        lastUpdated: new Date()
      },
      {
        id: 'kb_005',
        category: 'security',
        question: '账户安全如何保障？',
        answer: '我们采用多重安全措施：1. SSL加密传输；2. 双因素认证(2FA)；3. 定期安全审计；4. 资金隔离存储。建议您启用2FA并使用强密码。',
        keywords: ['安全', '保障', '2FA', '加密'],
        language: 'vi',
        priority: 1,
        usageCount: 0,
        lastUpdated: new Date()
      }
    ];

    logger.info(`Knowledge base loaded: ${this.knowledgeBase.length} entries`);
  }

  private initializeConversationFlows(): void {
    // 初始化对话流程
    this.conversationFlows.set('greeting', {
      triggers: ['你好', 'hello', 'hi', '您好'],
      responses: [
        '您好！欢迎使用ApexRebate智能客服，我是您的专属助手小A。',
        '有什么可以帮助您的吗？'
      ],
      suggestions: ['如何获得返佣', '账户问题', '技术支持']
    });

    this.conversationFlows.set('rebate_info', {
      triggers: ['返佣', 'rebate', '佣金', '手续费'],
      responses: [
        '关于交易返佣，我可以为您提供详细信息。',
        '我们的返佣比例是业界最高的，具体比例因交易所而异。'
      ],
      suggestions: ['查看返佣比例', '注册流程', '结算时间']
    });

    logger.info('Conversation flows initialized');
  }

  private async analyzeMessageIntent(content: string, context: any): Promise<any> {
    try {
      const prompt = `分析用户消息的意图和情感：

用户消息: "${content}"
对话上下文: ${JSON.stringify(context, null, 2)}

请返回JSON格式的分析结果：
{
  "intent": "意图类型",
  "confidence": 置信度 (0-1),
  "entities": [{"type": "实体类型", "value": "实体值"}],
  "sentiment": "positive|neutral|negative",
  "urgency": "low|medium|high",
  "category": "问题分类",
  "requiresHumanAgent": boolean
}`;

      const response = await this.zai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      logger.error('Failed to analyze message intent', error);
      return {
        intent: 'unknown',
        confidence: 0.5,
        entities: [],
        sentiment: 'neutral',
        urgency: 'medium',
        category: 'general',
        requiresHumanAgent: false
      };
    }
  }

  private async generateBotResponse(intent: any, session: ChatSession): Promise<any> {
    try {
      // 检查是否需要转人工
      if (intent.requiresHumanAgent || intent.urgency === 'high') {
        await this.transferToHumanAgent(session.id, `高优先级问题: ${intent.intent}`, 'high');
        return {
          content: '我理解您的问题比较紧急，正在为您转接人工客服，请稍候...',
          type: 'text',
          metadata: { transferred: true }
        };
      }

      // 搜索知识库
      const kbResults = await this.searchKnowledgeBase(intent.intent);
      
      if (kbResults.length > 0 && (kbResults[0] as any).relevanceScore > 0.7) {
        const kbEntry = kbResults[0];
        return {
          content: kbEntry.answer,
          type: 'text',
          metadata: { source: 'knowledge_base', kbId: kbEntry.id },
          suggestions: this.generateSuggestions(kbEntry.category)
        };
      }

      // 检查预定义对话流程
      for (const [flowName, flow] of this.conversationFlows.entries()) {
        if (flow.triggers.some(trigger => intent.intent.includes(trigger))) {
          return {
            content: flow.responses.join(' '),
            type: 'text',
            metadata: { source: 'conversation_flow', flow: flowName },
            suggestions: flow.suggestions
          };
        }
      }

      // 使用AI生成响应
      const aiResponse = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `你是ApexRebate的智能客服助手。请基于用户意图生成专业、友好的回复。
            
            用户意图: ${intent.intent}
            置信度: ${intent.confidence}
            分类: ${intent.category}
            紧急程度: ${intent.urgency}
            
            请生成简洁、有用的回复，如果需要更多信息来回答问题，请主动询问。`
          },
          {
            role: 'user',
            content: `用户问题: ${session.messages[session.messages.length - 1].content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      return {
        content: aiResponse.choices[0].message.content,
        type: 'text',
        metadata: { source: 'ai_generated' },
        suggestions: ['转人工客服', '查看帮助文档', '返回首页']
      };

    } catch (error) {
      logger.error('Failed to generate bot response', error);
      return {
        content: '抱歉，我暂时无法理解您的问题。您可以尝试重新描述，或者转接人工客服。',
        type: 'text',
        metadata: { source: 'fallback' },
        suggestions: ['转人工客服', '重新描述问题']
      };
    }
  }

  private generateSuggestions(category: string): string[] {
    const suggestionMap: Record<string, string[]> = {
      'general': ['如何获得返佣', '账户问题', '技术支持'],
      'rebate': ['查看返佣比例', '注册流程', '结算时间'],
      'payment': ['支付方式', '到账时间', '最低提现金额'],
      'technical': ['登录问题', '密码重置', '账户安全'],
      'security': ['2FA设置', '账户保护', '隐私政策']
    };

    return suggestionMap[category] || ['转人工客服', '查看帮助文档'];
  }

  private async updateSessionContext(session: ChatSession, intent: any, response: any): Promise<void> {
    session.context.lastIntent = intent;
    session.context.lastResponse = response;
    session.context.intentHistory = session.context.intentHistory || [];
    session.context.intentHistory.push(intent);
  }

  private async sendWelcomeMessage(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const welcomeMessage: ChatMessage = {
      id: this.generateMessageId(),
      userId: session.userId,
      sessionId,
      content: '您好！欢迎使用ApexRebate智能客服，我是您的专属助手小A。有什么可以帮助您的吗？',
      type: 'text',
      sender: 'bot',
      timestamp: new Date(),
      metadata: { type: 'welcome' }
    };

    session.messages.push(welcomeMessage);
    await this.saveMessage(welcomeMessage);
    await this.sendMessageToUser(session.userId, welcomeMessage);
  }

  private async sendSystemMessage(sessionId: string, content: string, type: 'info' | 'warning' | 'error'): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const systemMessage: ChatMessage = {
      id: this.generateMessageId(),
      userId: session.userId,
      sessionId,
      content,
      type: 'text',
      sender: 'bot',
      timestamp: new Date(),
      metadata: { type: 'system', level: type }
    };

    session.messages.push(systemMessage);
    await this.saveMessage(systemMessage);
    await this.sendMessageToUser(session.userId, systemMessage);
  }

  private async sendMessageToUser(userId: string, message: ChatMessage): Promise<void> {
    await notificationSystem.sendNotification({
      userId,
      type: 'info',
      title: '新消息',
      content: message.content,
      channel: 'websocket',
      priority: 'medium',
      data: {
        type: 'chat_message',
        sessionId: message.sessionId,
        message: message
      }
    });
  }

  private async findAvailableAgent(): Promise<string | null> {
    // 简化的客服分配逻辑
    const agents = ['agent_001', 'agent_002', 'agent_003'];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  private async notifyAgent(agentId: string, sessionId: string, reason: string): Promise<void> {
    await notificationSystem.sendNotification({
      userId: agentId,
      type: 'info',
      title: '新的客服请求',
      content: `用户需要帮助: ${reason}`,
      channel: 'websocket',
      priority: 'high',
      data: {
        type: 'agent_request',
        sessionId,
        reason
      }
    });
  }

  private async saveSessionToCache(session: ChatSession): Promise<void> {
    await redis.setex(`session_${session.id}`, 3600, JSON.stringify(session));
  }

  private async saveMessage(message: ChatMessage): Promise<void> {
    await redis.lpush(`messages_${message.sessionId}`, JSON.stringify(message));
    await redis.expire(`messages_${message.sessionId}`, 86400 * 7); // 保留7天
  }

  private async saveSessionToDatabase(session: ChatSession): Promise<void> {
    // 保存会话到数据库
    await redis.lpush('completed_sessions', JSON.stringify(session));
    await redis.expire('completed_sessions', 86400 * 30); // 保留30天
  }

  private async saveSessionFeedback(sessionId: string, rating?: number, feedback?: string): Promise<void> {
    const feedbackData = {
      sessionId,
      rating,
      feedback,
      timestamp: new Date()
    };
    
    await redis.lpush('session_feedbacks', JSON.stringify(feedbackData));
    await redis.expire('session_feedbacks', 86400 * 90); // 保留90天
  }

  private async generateSessionSummary(session: ChatSession): Promise<string> {
    try {
      const prompt = `为以下客服会话生成简洁摘要：

会话ID: ${session.id}
用户ID: ${session.userId}
开始时间: ${session.startTime}
消息数量: ${session.messages.length}
会话状态: ${session.status}

最近几条消息:
${session.messages.slice(-5).map(m => `[${m.sender}]: ${m.content}`).join('\n')}

请生成50字以内的会话摘要。`;

      const response = await this.zai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 100
      });

      return response.choices[0].message.content.trim();

    } catch (error) {
      logger.error('Failed to generate session summary', error);
      return '客服会话已完成';
    }
  }

  private async getUserSessionsFromDatabase(userId: string, limit: number): Promise<ChatSession[]> {
    // 模拟从数据库获取会话
    const sessions: ChatSession[] = [];
    for (let i = 1; i <= Math.min(limit, 5); i++) {
      sessions.push({
        id: `session_${userId}_${i}`,
        userId,
        status: 'closed',
        startTime: new Date(Date.now() - i * 86400000),
        lastActivity: new Date(Date.now() - i * 86400000 + 3600000),
        messages: [],
        context: {},
        priority: 'medium',
        channel: 'web',
        tags: []
      });
    }
    return sessions;
  }

  private async updateKnowledgeBaseUsage(results: any[]): Promise<void> {
    for (const result of results) {
      const kbEntry = this.knowledgeBase.find(kb => kb.id === result.id);
      if (kbEntry) {
        kbEntry.usageCount++;
        kbEntry.lastUpdated = new Date();
      }
    }
  }

  private async saveKnowledgeBaseToDatabase(entry: KnowledgeBase): Promise<void> {
    await redis.lpush('knowledge_base', JSON.stringify(entry));
    await redis.expire('knowledge_base', 86400 * 30); // 保留30天
  }

  private async clearKBCache(): Promise<void> {
    const keys = await redis.keys('kb_search_*');
    for (const key of keys) {
      await redis.del(key);
    }
  }

  private startSessionMonitor(): void {
    setInterval(async () => {
      try {
        const now = new Date();
        const timeout = 30 * 60 * 1000; // 30分钟超时

        for (const [sessionId, session] of this.activeSessions.entries()) {
          if (now.getTime() - session.lastActivity.getTime() > timeout) {
            // 自动结束超时会话
            await this.endChatSession(sessionId);
            logger.info(`Auto-ended inactive session: ${sessionId}`);
          }
        }
      } catch (error) {
        logger.error('Session monitor error', error);
      }
    }, 60000); // 每分钟检查一次
  }

  // 生成ID的方法
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateKBEntryId(): string {
    return `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例实例
export const customerService = IntelligentCustomerService.getInstance();