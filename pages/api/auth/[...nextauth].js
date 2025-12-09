import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "../../../lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email et mot de passe requis');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            throw new Error('Email ou mot de passe incorrect');
          }

          if (user.isBlocked) {
            throw new Error('Votre compte a été suspendu');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error('Email ou mot de passe incorrect');
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { lastActivity: new Date() }
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            subscriptionTier: user.subscriptionTier,
            messageCount: user.messageCount,
            isAdmin: user.isAdmin || false,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Permettre les redirections internes
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Permettre les redirections vers le même domaine
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Par défaut, retourner la base URL
      return baseUrl;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.subscriptionTier = user.subscriptionTier;
        token.messageCount = user.messageCount;
        token.isAdmin = user.isAdmin || false;
      }

      if (trigger === "update" && session) {
        token.subscriptionTier = session.subscriptionTier;
        token.messageCount = session.messageCount;
        if (session.isAdmin !== undefined) {
          token.isAdmin = session.isAdmin;
        }
      }

      return token;
    },
    async session({ session, token, user }) {
      if (session?.user) {
        if (user) {
          session.user.id = user.id;
          session.user.subscriptionTier = user.subscriptionTier || 'free';
          session.user.messageCount = user.messageCount || 0;
          session.user.isAdmin = user.isAdmin || false;
        }
        else if (token) {
          session.user.id = token.id;
          session.user.subscriptionTier = token.subscriptionTier || 'free';
          session.user.messageCount = token.messageCount || 0;
          session.user.isAdmin = token.isAdmin || false;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Mettre à jour lastActivity pour Google sign-in
      if (account?.provider === 'google' && user?.email) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: { lastActivity: new Date() }
          });
        } catch (e) {
          // Nouvel utilisateur, sera créé par l'adapter
        }
      }
      return true;
    }
  },
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)
