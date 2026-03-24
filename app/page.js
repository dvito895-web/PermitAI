'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { ArrowRight, CheckCircle2, FileText, Upload, Shield, MapPin, Building2, Star } from 'lucide-react';
import texts from '@/lib/texts';

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">{texts.nav.logo}</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#fonctionnalites" className="nav-link">{texts.nav.features}</Link>
            <Link href="#temoignages" className="nav-link">{texts.nav.testimonials}</Link>
            <Link href="/tarifs" className="nav-link">{texts.nav.pricing}</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <Link href="/dashboard">
                <button className="btn-primary">{texts.nav.dashboard}</button>
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="nav-link">{texts.nav.login}</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-primary">{texts.nav.getStarted}</button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="hero-title mb-6 animate-fade-in-up">
            {texts.hero.title}
            <br />
            <span className="text-[#e8b420] italic">{texts.hero.titleHighlight}</span>
          </h1>
          
          <p className="hero-subtitle mb-12 max-w-3xl mx-auto animate-fade-in-up">
            {texts.hero.subtitle}
            <br className="hidden md:block" />
            <span className="text-[#f0ede8] font-medium">{texts.hero.subtitleHighlight}</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-in-up">
            <Link href="/analyse">
              <button className="btn-primary inline-flex items-center gap-2">
                {texts.hero.ctaPrimary}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <button className="btn-secondary">{texts.hero.ctaSecondary}</button>
          </div>
        </div>
      </section>

      <section className="stats-container py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {Object.values(texts.stats).map((stat, i) => (
              <div key={i} className="text-center">
                <div className="stat-value mb-2">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-[42px] md:text-[52px] font-fraunces font-medium text-center mb-20">
            {texts.features.title}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {texts.features.items.map((feature, i) => {
              const icons = [MapPin, FileText, Upload, Shield, CheckCircle2, Shield];
              const Icon = icons[i];
              return (
                <div key={i} className="card-premium group cursor-pointer">
                  <div className="text-[#e8b420] mb-6 transition-transform group-hover:scale-110">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-[18px] font-medium mb-3 text-[#f0ede8]">{feature.title}</h3>
                  <p className="text-[14px] text-[#8a857d] leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="temoignages" className="py-24 px-6 bg-[#0b0b14]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-[42px] md:text-[52px] font-fraunces font-medium text-center mb-20">
            {texts.testimonials.title}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {texts.testimonials.items.map((testimonial, i) => (
              <div key={i} className="card-premium">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#e8b420] text-[#e8b420]" />
                  ))}
                </div>
                <p className="text-[14px] text-[#8a857d] mb-6 italic leading-relaxed">
                  &quot;{testimonial.text}&quot;
                </p>
                <div className="border-t border-[#1e1e2c] pt-4">
                  <div className="font-medium text-[#f0ede8] text-[14px]">{testimonial.name}</div>
                  <div className="text-[12px] text-[#3c3830] mb-3">{testimonial.role}</div>
                  <div className="badge-premium inline-block">{testimonial.gain}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {Object.values(texts.metrics).map((metric, i) => (
              <div key={i}>
                <div className="stat-value mb-2">{metric.value}</div>
                <div className="text-[13px] text-[#8a857d]">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-[42px] md:text-[52px] font-fraunces font-medium mb-6">
            {texts.finalCta.title}
          </h2>
          <p className="text-[15px] text-[#8a857d] mb-10">{texts.finalCta.subtitle}</p>
          <Link href="/analyse">
            <button className="btn-primary inline-flex items-center gap-2">
              {texts.finalCta.button}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#1e1e2c] py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="w-5 h-5 text-[#e8b420]" />
                <span className="text-[16px] font-fraunces font-medium">{texts.nav.logo}</span>
              </div>
              <p className="text-[13px] text-[#8a857d] leading-relaxed">{texts.footer.tagline}</p>
            </div>
            
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-[#3c3830] mb-4 font-medium">
                {texts.footer.product}
              </h4>
              <ul className="space-y-3 text-[13px]">
                <li><Link href="/analyse" className="text-[#8a857d] hover:text-[#f0ede8] transition-colors">{texts.footer.links.analyse}</Link></li>
                <li><Link href="/cerfa" className="text-[#8a857d] hover:text-[#f0ede8] transition-colors">{texts.footer.links.cerfa}</Link></li>
                <li><Link href="/tarifs" className="text-[#8a857d] hover:text-[#f0ede8] transition-colors">{texts.footer.links.pricing}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-[#3c3830] mb-4 font-medium">
                {texts.footer.resources}
              </h4>
              <ul className="space-y-3 text-[13px]">
                <li><Link href="/documentation" className="text-[#8a857d] hover:text-[#f0ede8] transition-colors">{texts.footer.links.docs}</Link></li>
                <li><Link href="/support" className="text-[#8a857d] hover:text-[#f0ede8] transition-colors">{texts.footer.links.support}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-[#3c3830] mb-4 font-medium">
                {texts.footer.legal}
              </h4>
              <ul className="space-y-3 text-[13px]">
                <li><Link href="/mentions-legales" className="text-[#8a857d] hover:text-[#f0ede8] transition-colors">{texts.footer.links.legal}</Link></li>
                <li><Link href="/cgu" className="text-[#8a857d] hover:text-[#f0ede8] transition-colors">{texts.footer.links.terms}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#1e1e2c] pt-8 text-center">
            <p className="text-[12px] text-[#3c3830]">{texts.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
