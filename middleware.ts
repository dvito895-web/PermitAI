import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/tarifs(.*)',
  '/api/webhooks/clerk(.*)',
  '/api/webhook/stripe(.*)',
  '/api/health(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/analyse(.*)',
  '/cerfa(.*)',
  '/depot(.*)',
  '/suivi(.*)',
]);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request) && !auth().userId) {
    return auth().redirectToSignIn();
  }

  if (auth().userId && isPublicRoute(request)) {
    const signInUrl = new URL('/sign-in', request.url);
    const signUpUrl = new URL('/sign-up', request.url);

    if (
      request.nextUrl.pathname === signInUrl.pathname ||
      request.nextUrl.pathname === signUpUrl.pathname
    ) {
      return Response.redirect(new URL('/dashboard', request.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
