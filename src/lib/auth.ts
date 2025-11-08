import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

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
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user by email with explicit field selection
        const user = await db.users.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true, // ✅ Explicit role selection
            emailVerified: true
          }
        })

        if (!user || !user.password) {
          return null
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        // ✅ Return with validated role (defaults to USER if missing)
        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          role: user.role || 'USER',
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial login - set role and id from user object
      if (user) {
        token.role = user.role || 'USER'
        token.id = user.id
        token.email = user.email
      } 
      // Handle session updates during login
      else if (trigger === 'update' && session?.role) {
        token.role = session.role || token.role || 'USER'
      }
      
      // ✅ Ensure role always exists with valid value
      const validRoles = ['USER', 'ADMIN', 'CONCIERGE']
      if (!token.role || !validRoles.includes(token.role as string)) {
        token.role = 'USER'
      }
      
      return token
    },
    
    async session({ session, token }) {
      // ✅ Enhanced session callback with validation
      if (token && session.user) {
        session.user.id = (token.id || token.sub) as string
        session.user.role = (token.role as string) || 'USER'
        
        // Validate role is a valid enum value
        const validRoles = ['USER', 'ADMIN', 'CONCIERGE']
        if (!validRoles.includes(session.user.role)) {
          session.user.role = 'USER'
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}