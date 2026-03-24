'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Upload, 
  AlertTriangle,
  MapPin,
  Shield,
  Zap,
  Building2,
  Star,
  TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-[#06060e] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#06060e]/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-[#E8B420]" />
              <span className="text-2xl font-fraunces font-bold">PermitAI</span>
            </Link>
            
            <div className="hidden md:flex space-x-8 text-sm">
              <Link href="#features" className="hover:text-[#E8B420] transition-colors">Features</Link>
              <Link href="#how-it-works" className="hover:text-[#E8B420] transition-colors">How it Works</Link>
              <Link href="#testimonials" className="hover:text-[#E8B420] transition-colors">Testimonials</Link>
              <Link href="/pricing" className="hover:text-[#E8B420] transition-colors">Pricing</Link>
            </div>
            
            <div className="flex space-x-4">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <button className="bg-[#A07820] hover:bg-[#E8B420] px-6 py-2 rounded-lg transition-all">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="hover:text-[#E8B420] px-6 py-2 transition-colors">
                      Login
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-[#A07820] hover:bg-[#E8B420] px-6 py-2 rounded-lg transition-all">
                      Get Started
                    </button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-fraunces font-bold mb-6 leading-tight">
            Your building permit.
            <br />
            <span className="text-[#E8B420] italic">Without the bad surprises.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            PermitAI indexes all <span className="text-[#E8B420] font-semibold">36,000 Local Urban Plans</span> in France, 
            generates your <span className="text-[#E8B420] font-semibold">official CERFA forms</span>, and files directly with your town hall. 
            <br />
            <span className="text-white font-semibold">Results in 3 minutes.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/analyse">
              <button className="bg-[#A07820] hover:bg-[#E8B420] text-white text-lg px-12 py-4 rounded-lg transition-all flex items-center justify-center gap-2">
                Analyze my land for free
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <button className="border-2 border-[#A07820] text-[#A07820] hover:bg-[#A07820] hover:text-white text-lg px-12 py-4 rounded-lg transition-all">
              Watch demo
            </button>
          </div>
          
          {/* Statistics Band */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {[
              { value: '500K', label: 'permits per year' },
              { value: '30%', label: 'rejected at first filing' },
              { value: '6 months', label: 'avg delay per rejection' },
              { value: '36,000', label: 'PLUs indexed' },
              { value: '15K EUR', label: 'max cost of rejection' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="text-2xl md:text-3xl font-bold text-[#E8B420] mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Sources Section */}
      <section className="py-16 px-6 bg-white/5">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-fraunces font-bold text-center mb-12">
            Official Sources & Partners
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
            {[
              { name: 'Geoportail Urbanisme', desc: 'Official PLU data' },
              { name: 'API Adresse', desc: 'French Government' },
              { name: 'IGN Cadastre', desc: 'Parcel references' },
              { name: 'PLAT AU', desc: 'Town hall digital filing' },
              { name: 'La Poste LRAR', desc: 'Certified postal filing' },
              { name: 'Claude by Anthropic', desc: 'AI Analysis' }
            ].map((partner, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
                <div className="text-lg font-semibold mb-2">{partner.name}</div>
                <div className="text-xs text-gray-400">{partner.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-fraunces font-bold text-center mb-16">
            Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <MapPin className="w-8 h-8" />,
                title: 'Instant PLU analysis for 36,000 towns',
                desc: 'Automatic verification of your project compliance with local urban planning'
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: '13 CERFA forms auto-filled',
                desc: 'All official forms generated in a few clicks'
              },
              {
                icon: <Upload className="w-8 h-8" />,
                title: 'Digital filing via PLAT AU or La Poste LRAR',
                desc: 'Certified submission of your file directly from the app'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'AI-written descriptive notice and documents',
                desc: 'Technical documents automatically generated by artificial intelligence'
              },
              {
                icon: <AlertTriangle className="w-8 h-8" />,
                title: 'Legal alerts and deadline tracking',
                desc: 'Automatic notifications so you never miss a deadline'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Automatic PLU revision monitoring',
                desc: 'Continuous surveillance of regulatory changes'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 rounded-lg p-6">
                <div className="text-[#E8B420] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 mt-20">
        <div className="container mx-auto text-center text-sm text-gray-400">
          <p>© 2025 PermitAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
