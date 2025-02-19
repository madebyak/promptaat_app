import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        username: { label: 'Username', type: 'text' }, 
        password: { label: 'Password', type: 'password' },
        isAdmin: { label: 'Is Admin', type: 'boolean' },
      },
      async authorize(credentials) {
        // Admin login flow
        if (credentials?.isAdmin === 'true') {
          if (!credentials?.username || !credentials?.password) {
            throw new Error('Please enter your username and password');
          }

          const admin = await prisma.adminUser.findUnique({
            where: {
              username: credentials.username,
            },
          });

          if (!admin) {
            throw new Error('Invalid credentials');
          }

          const isPasswordValid = await compare(
            credentials.password,
            admin.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          return {
            id: admin.id.toString(),
            username: admin.username,
            isAdmin: true,
          };
        }
        
        // User login flow
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
          isAdmin: false,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        if (user.isAdmin) {
          token.username = user.username;
        } else {
          token.email = user.email;
          token.firstName = user.firstName;
          token.lastName = user.lastName;
          token.image = user.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (!session.user) {
          session.user = {};
        }
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
        if (token.isAdmin) {
          session.user.username = token.username;
        } else {
          session.user.email = token.email;
          session.user.firstName = token.firstName;
          session.user.lastName = token.lastName;
          session.user.image = token.image;
        }
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
