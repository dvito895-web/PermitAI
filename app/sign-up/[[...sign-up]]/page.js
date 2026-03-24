'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#06060e]">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
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
