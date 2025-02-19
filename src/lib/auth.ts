import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password");
        }

        // Try to find regular user first
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user) {
          // Verify regular user password
          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user.id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: "user",
          };
        }

        // If no regular user found, try admin
        const admin = await prisma.adminUser.findUnique({
          where: { username: credentials.email },
        });

        if (admin) {
          // Verify admin password
          const isValid = await bcrypt.compare(credentials.password, admin.password);

          if (!isValid) {
            throw new Error("Invalid credentials");
          }

          return {
            id: admin.id.toString(),
            email: admin.username,
            name: admin.username,
            role: "admin",
          };
        }

        throw new Error("Invalid credentials");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        if (user.role === "user") {
          token.firstName = user.firstName;
          token.lastName = user.lastName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        if (token.role === "user") {
          session.user.firstName = token.firstName;
          session.user.lastName = token.lastName;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
