import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db/mongodb';
import { User } from '@/lib/db/models';
import { verifyPassword } from './password';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: String(user._id),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role || 'client';
        token.name = user.name;
        token.email = user.email;
      }

      // Handle session update (e.g., profile update)
      if (trigger === 'update') {
        // If session data is passed, use it
        if (session?.user) {
          token.name = session.user.name;
          token.email = session.user.email;
        } else {
          // Otherwise fetch fresh data from database
          await connectDB();
          const updatedUser = await User.findById(token.id);
          if (updatedUser) {
            token.name = updatedUser.name;
            token.email = updatedUser.email;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
