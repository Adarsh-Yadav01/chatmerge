import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { scope: 'openid profile email' } },
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      authorization: {
        url: 'https://www.facebook.com/v23.0/dialog/oauth',
        params: {
          scope: 'public_profile,email,whatsapp_business_management,pages_show_list,ads_management',
          response_type: 'code',
        },
      },
      token: 'https://graph.facebook.com/v23.0/oauth/access_token',
      userinfo: 'https://graph.facebook.com/v23.0/me?fields=id,name,email,picture',
      async profile(profile) {
        console.log('Raw Facebook profile:', profile);
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email || null,
          image: profile.picture?.data?.url || null,
        };
      },
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('No user found with this email');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          instagramUserId: user.instagramUserId?.toString(),
          instagramToken: user.instagramToken,
          whatsappToken: user.whatsappToken,
          whatsappWabaId: user.whatsappWabaId,
          whatsappPhoneId: user.whatsappPhoneId,
        };
      },
    }),
  ],

  callbacks: {
    // ---------------- JWT CALLBACK ----------------
    async jwt({ token, user, account }) {
      // On new login
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.instagramUserId = user.instagramUserId?.toString();
        token.instagramToken = user.instagramToken;
        token.whatsappToken = user.whatsappToken;
        token.whatsappWabaId = user.whatsappWabaId;
        token.whatsappPhoneId = user.whatsappPhoneId;
      }

      // ✅ Add Facebook access token when user logs in via Facebook
      if (account && account.provider === 'facebook') {
        token.facebookAccessToken = account.access_token;
        console.log('Facebook Access Token added to JWT:', token.facebookAccessToken);
      }

      // Always re-fetch from DB to handle updated user data
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.instagramUserId = dbUser.instagramUserId?.toString();
          token.instagramToken = dbUser.instagramToken;
          token.whatsappToken = dbUser.whatsappToken;
          token.whatsappWabaId = dbUser.whatsappWabaId;
          token.whatsappPhoneId = dbUser.whatsappPhoneId;
        }
      }

      console.log('JWT token:', token);
      return token;
    },

    // ---------------- SESSION CALLBACK ----------------
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.instagramUserId = token.instagramUserId;
        session.user.instagramToken = token.instagramToken;
        session.user.whatsappToken = token.whatsappToken;
        session.user.whatsappWabaId = token.whatsappWabaId;
        session.user.whatsappPhoneId = token.whatsappPhoneId;

        // ✅ Add Facebook access token to session for Marketing API usage
        session.facebookAccessToken = token.facebookAccessToken || null;
      }

      console.log('Session with Facebook Access Token:', session);
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
