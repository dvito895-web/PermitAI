'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#06060e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
