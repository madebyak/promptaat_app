import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { checkLoginAttempts, recordLoginAttempt, resetLoginAttempts } from "./rate-limit";

async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username/Email", type: "text" },
        password: { label: "Password", type: "password" },
        isAdmin: { label: "Is Admin", type: "text" },
        recaptchaToken: { label: "reCAPTCHA Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please provide both username and password");
        }

        // Verify reCAPTCHA token
        if (!credentials.recaptchaToken) {
          throw new Error("reCAPTCHA verification required");
        }

        const isRecaptchaValid = await verifyRecaptcha(credentials.recaptchaToken);
        if (!isRecaptchaValid) {
          throw new Error("reCAPTCHA verification failed");
        }

        const isAdmin = credentials.isAdmin === 'true';
        console.log('Auth - Login attempt:', { isAdmin, username: credentials.username }); // Debug log

        // Check rate limiting
        const canAttemptLogin = await checkLoginAttempts(credentials.username);
        if (!canAttemptLogin) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        try {
          if (isAdmin) {
            // Admin login
            const admin = await prisma.adminUser.findUnique({
              where: { username: credentials.username },
            });

            if (!admin) {
              await recordLoginAttempt(credentials.username, false);
              throw new Error("Invalid credentials");
            }

            const isValid = await compare(credentials.password, admin.password);

            if (!isValid) {
              await recordLoginAttempt(credentials.username, false);
              throw new Error("Invalid credentials");
            }

            await resetLoginAttempts(credentials.username);
            await recordLoginAttempt(credentials.username, true);

            console.log('Auth - Admin login successful'); // Debug log
            return {
              id: admin.id.toString(),
              name: admin.username,
              email: admin.username,
              role: "admin",
            };
          } else {
            // Regular user login
            const user = await prisma.user.findUnique({
              where: { email: credentials.username },
            });

            if (!user) {
              await recordLoginAttempt(credentials.username, false);
              throw new Error("Invalid credentials");
            }

            const isValid = await compare(credentials.password, user.password);

            if (!isValid) {
              await recordLoginAttempt(credentials.username, false);
              throw new Error("Invalid credentials");
            }

            await resetLoginAttempts(credentials.username);
            await recordLoginAttempt(credentials.username, true);

            console.log('Auth - User login successful'); // Debug log
            return {
              id: user.id.toString(),
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              image: user.image,
              role: "user",
            };
          }
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
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
      if (token && session.user) {
        console.log('Auth - Session callback:', { token }); // Debug log
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};
