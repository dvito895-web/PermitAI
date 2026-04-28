import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#06060e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#a07820',
            colorBackground: '#06060e',
            colorText: '#f2efe9',
          },
        }}
      />
    </div>
  );
}
