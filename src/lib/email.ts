import { db } from '@/lib/db'

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface EmailNotification {
  id: string
  userId: string
  type: EmailType
  recipient: string
  subject: string
  content: string
  data?: Record<string, any>
  status: 'pending' | 'sent' | 'failed'
  sentAt?: Date
  error?: string
  createdAt: Date
  scheduledFor?: Date
}

export enum EmailType {
  WELCOME = 'welcome',
  PAYOUT_RECEIVED = 'payout_received',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  TIER_UPGRADE = 'tier_upgrade',
  REFERRAL_SUCCESS = 'referral_success',
  WEEKLY_DIGEST = 'weekly_digest',
  MONTHLY_REPORT = 'monthly_report',
  INACTIVITY_WARNING = 'inactivity_warning',
  MILESTONE_REACHED = 'milestone_reached',
  CONCIERGE_UPDATE = 'concierge_update'
}

export class EmailService {
  private static instance: EmailService
  private zai: any = null

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async initializeZAI() {
    try {
      const ZAI = await import('z-ai-web-dev-sdk')
      this.zai = await ZAI.create()
      console.log('Email service initialized with ZAI SDK')
    } catch (error) {
      console.error('Failed to initialize ZAI SDK for email service:', error)
    }
  }

  async generateEmailContent(type: EmailType, data: Record<string, any>): Promise<EmailTemplate> {
    if (!this.zai) {
      await this.initializeZAI()
    }

    const prompts = {
      [EmailType.WELCOME]: {
        subject: "Chào mừng đến với ApexRebate - Dịch vụ Hoàn phí Concierge",
        context: "Generate a welcome email for a new trader who just joined ApexRebate"
      },
      [EmailType.PAYOUT_RECEIVED]: {
        subject: "ApexRebate: Bạn đã nhận được hoàn phí mới!",
        context: "Generate an email notification for a trader who received a new payout"
      },
      [EmailType.ACHIEVEMENT_UNLOCKED]: {
        subject: "🎉 Chúc mừng! Bạn đã mở khóa thành tựu mới",
        context: "Generate an email to congratulate a trader on unlocking a new achievement"
      },
      [EmailType.TIER_UPGRADE]: {
        subject: "🏆 Nâng cấp thành công! Hạng mới của bạn tại ApexRebate",
        context: "Generate an email to congratulate a trader on upgrading to a new tier"
      },
      [EmailType.REFERRAL_SUCCESS]: {
        subject: "Tuyệt vời! Lời giới thiệu của bạn đã tham gia ApexRebate",
        context: "Generate an email to notify a trader that their referral was successful"
      },
      [EmailType.WEEKLY_DIGEST]: {
        subject: "ApexRebate Weekly Digest - Tổng quan hiệu suất của bạn",
        context: "Generate a weekly digest email with trading performance summary"
      },
      [EmailType.MONTHLY_REPORT]: {
        subject: "ApexRebate Monthly Report - Báo cáo chi tiết tháng {month}",
        context: "Generate a comprehensive monthly report email"
      },
      [EmailType.INACTIVITY_WARNING]: {
        subject: "Bạn có ổn không? Chúng tôi nhớ bạn tại ApexRebate",
        context: "Generate a gentle re-engagement email for inactive traders"
      },
      [EmailType.MILESTONE_REACHED]: {
        subject: "🎯 Cột mốc ấn tượng! Thành tựu của bạn tại ApexRebate",
        context: "Generate an email to celebrate reaching a significant milestone"
      },
      [EmailType.CONCIERGE_UPDATE]: {
        subject: "Cập nhật từ Concierge ApexRebate",
        context: "Generate a personalized update from the concierge service"
      }
    }

    const prompt = prompts[type]
    if (!prompt) {
      throw new Error(`Email type ${type} not supported`)
    }

    try {
      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a professional email writer for ApexRebate, a premium trading rebate service. 
            Write emails in Vietnamese that are:
            - Professional yet friendly
            - Data-driven and personalized
            - Motivational and encouraging
            - Clear and concise
            - Include specific numbers and metrics when provided
            
            The email should be well-structured with:
            1. Compelling subject line
            2. Personalized greeting
            3. Main content with specific data
            4. Call to action
            5. Professional closing`
          },
          {
            role: 'user',
            content: `${prompt.context}
            
            User data: ${JSON.stringify(data, null, 2)}
            
            Generate a complete email with subject and HTML content. The email should be engaging and personalized.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      const content = completion.choices[0]?.message?.content || ''
      
      // Parse the generated content
      const lines = content.split('\n')
      let subject = prompt.subject
      let htmlContent = content
      
      // Try to extract subject if generated
      const subjectMatch = content.match(/Subject[:\s]*(.+?)(?:\n|$)/i)
      if (subjectMatch) {
        subject = subjectMatch[1].trim()
        htmlContent = content.replace(/Subject[:\s]*(.+?)(?:\n|$)/i, '').trim()
      }

      // Convert to HTML format
      const html = this.convertToHTML(htmlContent, data)

      return {
        subject,
        html,
        text: htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
      }

    } catch (error) {
      console.error('Failed to generate email content:', error)
      // Fallback to template
      return this.getFallbackTemplate(type, data)
    }
  }

  private convertToHTML(content: string, data: Record<string, any>): string {
    // Basic HTML conversion with personalization
    let html = content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

    // Wrap in proper HTML structure
    html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ApexRebate</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .metric { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
          .highlight { color: #007bff; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 ApexRebate</h1>
            <p>Dịch vụ Hoàn phí Concierge cho Trader chuyên nghiệp</p>
          </div>
          <div class="content">
            <p>${html}</p>
            ${this.generatePersonalizedContent(data)}
          </div>
          <div class="footer">
            <p>© 2024 ApexRebate. All rights reserved.</p>
            <p>Đây là email tự động. Vui lòng không trả lời email này.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return html
  }

  private generatePersonalizedContent(data: Record<string, any>): string {
    let content = ''
    
    if (data.userName) {
      content += `<div class="metric"><strong>Chào ${data.userName},</strong></div>`
    }

    if (data.payoutAmount) {
      content += `<div class="metric">
        <strong>Hoàn phí nhận được:</strong> <span class="highlight">$${data.payoutAmount.toLocaleString()}</span>
      </div>`
    }

    if (data.totalSaved) {
      content += `<div class="metric">
        <strong>Tổng đã tiết kiệm:</strong> <span class="highlight">$${data.totalSaved.toLocaleString()}</span>
      </div>`
    }

    if (data.currentTier) {
      content += `<div class="metric">
        <strong>Hạng hiện tại:</strong> <span class="highlight">${data.currentTier}</span>
      </div>`
    }

    if (data.achievementTitle) {
      content += `<div class="metric">
        <strong>Thành tựh mới:</strong> <span class="highlight">${data.achievementTitle}</span>
      </div>`
    }

    if (data.referralName) {
      content += `<div class="metric">
        <strong>Lời giới thiệu thành công:</strong> <span class="highlight">${data.referralName}</span>
      </div>`
    }

    content += `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">
          Xem Dashboard
        </a>
      </div>
    `

    return content
  }

  private getFallbackTemplate(type: EmailType, data: Record<string, any>): EmailTemplate {
    const templates = {
      [EmailType.WELCOME]: {
        subject: 'Chào mừng đến với ApexRebate!',
        html: `<p>Chào mừng ${data.userName || 'bạn'} đã tham gia ApexRebate!</p>
               <p>Chúng tôi rất vui được đồng hành cùng bạn trên hành trình tối ưu hóa lợi nhuận giao dịch.</p>`
      },
      [EmailType.PAYOUT_RECEIVED]: {
        subject: 'Bạn đã nhận được hoàn phí mới!',
        html: `<p>Chúc mừng! Bạn vừa nhận được hoàn phí <strong>$${data.payoutAmount || 0}</strong>.</p>`
      },
      [EmailType.ACHIEVEMENT_UNLOCKED]: {
        subject: 'Chúc mừng thành tựu mới!',
        html: `<p>Tuyệt vời! Bạn đã mở khóa thành tựh <strong>${data.achievementTitle || 'mới'}</strong>.</p>`
      }
    }

    const template = templates[type] || {
      subject: 'Thông báo từ ApexRebate',
      html: '<p>Bạn có một thông báo mới từ ApexRebate.</p>'
    }

    return {
      subject: template.subject,
      html: this.convertToHTML(template.html, data)
    }
  }

  async createNotification(
    userId: string,
    type: EmailType,
    recipient: string,
    data?: Record<string, any>,
    scheduledFor?: Date
  ): Promise<EmailNotification> {
    const notification: EmailNotification = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      recipient,
      subject: '',
      content: '',
      data,
      status: 'pending',
      createdAt: new Date(),
      scheduledFor
    }

    // Save to database
    try {
      await db.emailNotification.create({
        data: {
          id: notification.id,
          userId,
          type: type,
          recipient,
          subject: notification.subject,
          content: notification.content,
          data: data ? JSON.stringify(data) : null,
          status: notification.status,
          scheduledFor: scheduledFor
        }
      })
    } catch (error) {
      console.error('Failed to save email notification to database:', error)
    }

    return notification
  }

  async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      // Generate email content
      const template = await this.generateEmailContent(notification.type, notification.data || {})
      
      // Update notification with generated content
      notification.subject = template.subject
      notification.content = template.html

      // In a real implementation, you would use a service like SendGrid, AWS SES, or Resend
      // For now, we'll simulate the email sending
      console.log('📧 Sending email:', {
        to: notification.recipient,
        subject: notification.subject,
        type: notification.type
      })

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update notification status
      notification.status = 'sent'
      notification.sentAt = new Date()

      // Update in database
      await db.emailNotification.update({
        where: { id: notification.id },
        data: {
          subject: notification.subject,
          content: notification.content,
          status: 'sent',
          sentAt: notification.sentAt
        }
      })

      console.log('✅ Email sent successfully')
      return true

    } catch (error) {
      console.error('Failed to send email:', error)
      notification.status = 'failed'
      notification.error = error instanceof Error ? error.message : 'Unknown error'

      // Update in database
      await db.emailNotification.update({
        where: { id: notification.id },
        data: {
          status: 'failed',
          error: notification.error
        }
      })

      return false
    }
  }

  async scheduleEmail(
    userId: string,
    type: EmailType,
    recipient: string,
    scheduledFor: Date,
    data?: Record<string, any>
  ): Promise<EmailNotification> {
    return this.createNotification(userId, type, recipient, data, scheduledFor)
  }

  async sendImmediateEmail(
    userId: string,
    type: EmailType,
    recipient: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    const notification = await this.createNotification(userId, type, recipient, data)
    return this.sendEmail(notification)
  }

  async processPendingEmails(): Promise<void> {
    try {
      const pendingEmails = await db.emailNotification.findMany({
        where: {
          status: 'pending',
          OR: [
            { scheduledFor: null },
            { scheduledFor: { lte: new Date() } }
          ]
        },
        orderBy: { createdAt: 'asc' },
        take: 50 // Process in batches
      })

      console.log(`📧 Processing ${pendingEmails.length} pending emails`)

      for (const email of pendingEmails) {
        const notification: EmailNotification = {
          id: email.id,
          userId: email.userId,
          type: email.type as EmailType,
          recipient: email.recipient,
          subject: email.subject,
          content: email.content,
          data: email.data ? JSON.parse(email.data) : undefined,
          status: email.status as 'pending' | 'sent' | 'failed',
          createdAt: email.createdAt,
          sentAt: email.sentAt || undefined,
          error: email.error || undefined,
          scheduledFor: email.scheduledFor || undefined
        }

        await this.sendEmail(notification)
      }

    } catch (error) {
      console.error('Failed to process pending emails:', error)
    }
  }

  async getUserEmailPreferences(userId: string) {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          emailVerified: true
        }
      })

      return {
        enabled: !!user?.emailVerified,
        email: user?.email
      }
    } catch (error) {
      console.error('Failed to get user email preferences:', error)
      return { enabled: false, email: null }
    }
  }

  async unsubscribeUser(userId: string, emailType?: EmailType): Promise<void> {
    // In a real implementation, you would update user preferences
    console.log(`User ${userId} unsubscribed from ${emailType || 'all'} emails`)
  }
}

export const emailService = EmailService.getInstance()

// Simple sendEmail function for backward compatibility
export async function sendEmail(
  to: string,
  subject: string,
  content: string,
  data?: Record<string, any>
): Promise<boolean> {
  try {
    console.log('📧 Sending email:', { to, subject })
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('✅ Email sent successfully')
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}