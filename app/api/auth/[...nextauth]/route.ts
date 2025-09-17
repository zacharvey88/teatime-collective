import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

const ADMIN_USERS = [
  {
    id: '1',
    email: process.env.ADMIN_EMAIL_1 || 'zac.harvey@gmail.com',
    name: process.env.ADMIN_NAME_1 || 'Zac',
    role: process.env.ADMIN_ROLE_1 || 'superadmin',
    password: process.env.ADMIN_PASSWORD_HASH_1 || ''
  },
  {
    id: '2',
    email: process.env.ADMIN_EMAIL_2 || 'teatimecollective@hotmail.co.uk',
    name: process.env.ADMIN_NAME_2 || 'Catherine',
    role: process.env.ADMIN_ROLE_2 || 'admin',
    password: process.env.ADMIN_PASSWORD_HASH_2 || ''
  }
].filter(user => user.password);

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = ADMIN_USERS.find(u => u.email === credentials.email)
        if (user) {
          const passwordsMatch = await bcrypt.compare(credentials.password, user.password)
          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }