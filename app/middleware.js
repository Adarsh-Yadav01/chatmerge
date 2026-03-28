
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      console.log('Middleware: Checking authorization', {
        path: req.nextUrl.pathname,
        tokenExists: !!token,
        userId: token?.id,
        provider: token?.provider,
      });
      if (!token?.id || token?.provider !== 'whatsapp') {
        console.error('Middleware: No valid WhatsApp session', {
          tokenExists: !!token,
          userId: token?.id,
          provider: token?.provider,
        });
        return false;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ['/api/whatsapp/:path*'],
};
