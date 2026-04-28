import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/analyse',
  '/analyse/(.*)',
  '/cerfa',
  '/cerfa/(.*)',
  '/blog',
  '/blog/(.*)',
  '/tarifs',
  '/demo',
  '/depot',
  '/suivi',
  '/documentation',
  '/support',
  '/api-docs',
  '/mentions-legales',
  '/politique-confidentialite',
  '/cookies',
  '/cgu',
  '/parrainage',
  '/communes',
  '/communes/(.*)',
  '/sitemap.xml',
  '/robots.txt',
  '/api/webhooks/clerk(.*)',
  '/api/webhook/stripe(.*)',
  '/api/health(.*)',
  '/api/cerfa(.*)',
  '/api/plu/query(.*)',
  '/api/plu/demo(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
