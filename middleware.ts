import { auth, authMiddleware, redirectToSignIn } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import Clerk from '@clerk/clerk-sdk-node';

export default authMiddleware({
  publicRoutes: ['/sign-in', '/sign-up'],
  async afterAuth(auth, req, evt) {
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    if (auth.userId && !auth.orgId) {
      const orgList = await Clerk.users.getOrganizationMembershipList({
        userId: auth.userId ?? '',
      });
      auth.orgRole = orgList[0].role;

      if (
        (req.nextUrl.pathname.startsWith('/inventory') ||
          req.nextUrl.pathname.startsWith('/product') ||
          req.nextUrl.pathname.startsWith('/user')) &&
        auth.orgRole !== 'org:admin'
      ) {
        return NextResponse.rewrite(new URL('/denied', req.url));
      }
    }
    return NextResponse.next();
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
