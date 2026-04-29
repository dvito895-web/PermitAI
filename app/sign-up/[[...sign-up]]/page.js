import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div style={{ minHeight: '100vh', background: '#06060e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <SignUp appearance={{
        variables: { colorPrimary: '#a07820', colorBackground: '#0e0e1a', colorText: '#f2efe9', colorInputBackground: '#0a0a14', colorInputText: '#f2efe9' },
        elements: {
          card: { border: '0.5px solid #1c1c2a', boxShadow: '0 8px 40px rgba(0,0,0,.5)', borderRadius: '14px' },
          socialButtonsBlockButton: { background: '#1a1a28', border: '0.5px solid #2a2a38', color: '#f2efe9', borderRadius: '8px' },
          socialButtonsBlockButtonText: { color: '#f2efe9', fontWeight: 600 },
          socialButtonsBlockButtonArrow: { color: '#f2efe9' },
          dividerLine: { background: '#1c1c2a' },
          dividerText: { color: '#5a5650' },
          formFieldLabel: { color: '#8d887f' },
          formFieldInput: { background: '#0a0a14', border: '0.5px solid #1c1c2a', color: '#f2efe9', borderRadius: '8px' },
          footerActionLink: { color: '#a07820' },
          headerTitle: { color: '#f2efe9' },
          headerSubtitle: { color: '#5a5650' },
        }
      }} />
    </div>
  );
}
