import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"
import { sendEmail } from "./email"
import crypto from "crypto"

// Enhanced authentication with email verification, password reset, and 2FA

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })] : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text", required: false }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user by email
        const user = await db.users.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in")
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        // Check 2FA if enabled
        if (user.twoFactorEnabled && credentials.twoFactorCode) {
          const isValid2FA = await verifyTwoFactorCode(user.id, credentials.twoFactorCode)
          if (!isValid2FA) {
            throw new Error("Invalid two-factor code")
          }
        } else if (user.twoFactorEnabled && !credentials.twoFactorCode) {
          throw new Error("Two-factor code required")
        }

        // Update last activity
        await db.users.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.emailVerified = (user as any).emailVerified
        token.twoFactorEnabled = (user as any).twoFactorEnabled
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string;
        (session.user as any).emailVerified = token.emailVerified as boolean;
        (session.user as any).twoFactorEnabled = token.twoFactorEnabled as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
  },
}

// Email verification functions
export async function sendVerificationEmail(email: string) {
  const user = await db.users.findUnique({
    where: { email }
  })

  if (!user || user.emailVerified) {
    return { success: false, error: "User not found or already verified" }
  }

  // Generate verification token
  const token = nanoid(32)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Store verification token
  await db.verification_tokens.create({
    data: {
      identifier: email,
      token,
      expires
    }
  })

  // Send verification email
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`
  
  await sendEmail(
    email,
    "Verify your ApexRebate account",
    `Click here to verify your email: ${verificationUrl}`,
    {
      name: user.name || "Trader",
      verificationUrl,
      expirationHours: 24
    }
  )

  return { success: true }
}

export async function verifyEmail(token: string) {
  const verificationToken = await db.verification_tokens.findUnique({
    where: { token }
  })

  if (!verificationToken || verificationToken.expires < new Date()) {
    return { success: false, error: "Invalid or expired token" }
  }

  // Update user email verification
  await db.users.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() }
  })

  // Delete verification token
  await db.verification_tokens.delete({
    where: { token }
  })

  return { success: true }
}

// Password reset functions
export async function sendPasswordResetEmail(email: string) {
  const user = await db.users.findUnique({
    where: { email }
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  // Generate reset token
  const token = nanoid(32)
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

  // Store reset token
  await db.verification_tokens.create({
    data: {
      identifier: email,
      token,
      expires
    }
  })

  // Send reset email
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
  
  await sendEmail(
    email,
    "Reset your ApexRebate password",
    `Click here to reset your password: ${resetUrl}`,
    {
      name: user.name || "Trader",
      resetUrl,
      expirationHours: 1
    }
  )

  return { success: true }
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await db.verification_tokens.findUnique({
    where: { token }
  })

  if (!resetToken || resetToken.expires < new Date()) {
    return { success: false, error: "Invalid or expired token" }
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12)

  // Update user password
  await db.users.update({
    where: { email: resetToken.identifier },
    data: { password: hashedPassword }
  })

  // Delete reset token
  await db.verification_tokens.delete({
    where: { token }
  })

  return { success: true }
}

// Two-Factor Authentication functions
export async function generateTwoFactorSecret(userId: string) {
  const secret = crypto.randomBytes(20).toString('hex')
  
  // Store secret (in production, encrypt this)
  await db.users.update({
    where: { id: userId },
    data: { twoFactorSecret: secret }
  })

  return secret
}

export async function enableTwoFactor(userId: string, code: string) {
  const user = await db.users.findUnique({
    where: { id: userId }
  })

  if (!user || !user.twoFactorSecret) {
    return { success: false, error: "2FA not set up" }
  }

  const isValid = await verifyTwoFactorCode(userId, code)
  
  if (isValid) {
    await db.users.update({
      where: { id: userId },
      data: { twoFactorEnabled: true }
    })
    return { success: true }
  }

  return { success: false, error: "Invalid code" }
}

export async function verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
  const user = await db.users.findUnique({
    where: { id: userId }
  })

  if (!user || !user.twoFactorSecret) {
    return false
  }

  // In production, use a proper TOTP library like 'otplib'
  // For now, we'll use a simple time-based code
  const timeWindow = Math.floor(Date.now() / (30 * 1000))
  const expectedCode = generateTOTP(user.twoFactorSecret, timeWindow)
  
  return code === expectedCode
}

function generateTOTP(secret: string, timeWindow: number): string {
  // Simple TOTP implementation - in production use 'otplib'
  const hmac = crypto.createHmac('sha1', secret)
  hmac.update(Buffer.from(timeWindow.toString()))
  const digest = hmac.digest()
  
  const offset = digest[digest.length - 1] & 0x0f
  const code = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  ) % 1000000
  
  return code.toString().padStart(6, '0')
}

export async function disableTwoFactor(userId: string, password: string) {
  const user = await db.users.findUnique({
    where: { id: userId }
  })

  if (!user || !user.password) {
    return { success: false, error: "User not found" }
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return { success: false, error: "Invalid password" }
  }

  // Disable 2FA
  await db.users.update({
    where: { id: userId },
    data: { 
      twoFactorEnabled: false,
      twoFactorSecret: null
    }
  })

  return { success: true }
}

// Security functions
export async function checkPasswordStrength(password: string): Promise<{
  isValid: boolean
  score: number
  feedback: string[]
}> {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push("Password must be at least 8 characters long")
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Include at least one uppercase letter")
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Include at least one lowercase letter")
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push("Include at least one number")
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  } else {
    feedback.push("Include at least one special character")
  }

  return {
    isValid: score >= 4,
    score,
    feedback
  }
}

export async function detectSuspiciousActivity(userId: string, activity: string, ip: string) {
  // 当前版本仅记录日志。生产环境可集成至 SIEM/告警系统
  console.warn('[Security] Suspicious activity detected', {
    userId,
    activity,
    ip,
    timestamp: new Date().toISOString()
  })

  // TODO: Implement geo-ip checks, rate limits, device fingerprinting, etc.
}
