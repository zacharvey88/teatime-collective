import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Hardcoded admin users - no database needed!
const ADMIN_USERS = [
  {
    id: '1',
    email: 'zac.harvey@gmail.com',
    name: 'Zac',
    role: 'superadmin',
    password: '$2b$10$w/ABR6hwoBx/.nUt0zShtei6/3R9ZTIBYE4tYg1CPmHTSwkQmABMG'
  },
  {
    id: '2',
    email: 'teatimecollective@hotmail.co.uk',
    name: 'Catherine',
    role: 'admin',
    password: '$2b$10$txsylKk2jyA0Ygx6kCQJrO57.jSRVFudnBv.kacomRt4hiRJQYSx.'
  }
];

const handler = NextAuth({
  pages: {
    signIn: '/admin/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check against hardcoded admin users
        const user = ADMIN_USERS.find(u => u.email === credentials.email);
        if (user) {
          const passwordsMatch = await bcrypt.compare(credentials.password, user.password);
          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
