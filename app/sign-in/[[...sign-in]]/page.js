'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#06060e]">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'bg-[#0a0a12] border border-white/10',
          },
        }}
      />
    </div>
  );
}
