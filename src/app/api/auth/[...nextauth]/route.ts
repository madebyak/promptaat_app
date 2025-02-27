import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username/Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        isAdmin: { label: 'Is Admin', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Please provide both username and password');
        }

        const isAdmin = credentials.isAdmin === 'true';

        if (isAdmin) {
          // Admin login
          console.log('Auth - Attempting admin login'); // Debug log
          const admin = await prisma.adminUser.findUnique({
            where: { username: credentials.username },
          });

          if (!admin) {
            console.log('Auth - Admin not found'); // Debug log
            throw new Error('Invalid credentials');
          }

          const isValid = await compare(credentials.password, admin.password);

          if (!isValid) {
            console.log('Auth - Admin password invalid'); // Debug log
            throw new Error('Invalid credentials');
          }

          console.log('Auth - Admin login successful'); // Debug log
          return {
            id: admin.id.toString(),
            name: admin.username,
            email: admin.username,
            role: 'admin',
          };
        } else {
          // User login
          console.log('Auth - Attempting user login'); // Debug log
          const user = await prisma.user.findUnique({
            where: { email: credentials.username },
          });

          if (!user) {
            console.log('Auth - User not found'); // Debug log
            throw new Error('Invalid credentials');
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            console.log('Auth - User password invalid'); // Debug log
            throw new Error('Invalid credentials');
          }

          console.log('Auth - User login successful'); // Debug log
          return {
            id: user.id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            image: user.image,
            role: 'user',
          };
        }
      },
    }),
  ],
  pages: {
    signIn: (request) => {
      const isAdmin = request?.query?.isAdmin === 'true';
      return isAdmin ? '/admin/login' : '/auth/login';
    },
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('Auth - JWT callback:', { user }); // Debug log
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        if (user.image) token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        console.log('Auth - Session callback:', { token }); // Debug log
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name;
        session.user.email = token.email;
        if (token.picture) session.user.image = token.picture;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

export const GET = handler;
export const POST = handler;
