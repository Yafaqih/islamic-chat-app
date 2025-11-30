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

          // Trouver l'utilisateur
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            throw new Error('Email ou mot de passe incorrect');
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error('Email ou mot de passe incorrect');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            subscriptionTier: user.subscriptionTier,
            messageCount: user.messageCount
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  useSecureCookies: true,
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Force toujours www.yafaqih.app
      return 'https://www.yafaqih.app';
    },
    async jwt({ token, user, trigger, session }) {
      // Lors de la connexion initiale
      if (user) {
        token.id = user.id;
        token.subscriptionTier = user.subscriptionTier;
        token.messageCount = user.messageCount;
      }

      // Lors de la mise à jour de la session
      if (trigger === "update" && session) {
        token.subscriptionTier = session.subscriptionTier;
        token.messageCount = session.messageCount;
      }

      return token;
    },
    async session({ session, token, user }) {
      if (session?.user) {
        // Pour les sessions avec adapter (Google)
        if (user) {
          session.user.id = user.id;
          session.user.subscriptionTier = user.subscriptionTier || 'free';
          session.user.messageCount = user.messageCount || 0;
        }
        // Pour les sessions JWT (Credentials)
        else if (token) {
          session.user.id = token.id;
          session.user.subscriptionTier = token.subscriptionTier || 'free';
          session.user.messageCount = token.messageCount || 0;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: "jwt", // Utiliser JWT pour supporter Credentials
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)