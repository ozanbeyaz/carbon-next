import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { PrismaClient } from '@repo/db';
import { SessionUser } from '@repo/types/auth';

const db = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          include: { facilityAccess: true },
        });

        // WARNING: In a real app, hash and compare passwords!
        if (user && user.passwordHash === credentials.password) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessibleFacilityIds: user.facilityAccess.map((fa) => fa.facilityId),
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On sign in, `user` object is available
      if (user) {
        const sessionUser = user as SessionUser;
        token.id = sessionUser.id;
        token.role = sessionUser.role;
        token.accessibleFacilityIds = sessionUser.accessibleFacilityIds;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom properties to the session object
      if (session.user) {
        const sessionUser = session.user as SessionUser;
        sessionUser.id = token.id as string;
        sessionUser.role = token.role as any; // Type assertion might be needed
        sessionUser.accessibleFacilityIds = token.accessibleFacilityIds as string[];
      }
      return session;
    },
  },
});
