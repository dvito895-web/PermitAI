import Link from 'next/link';
import { Building2, Code } from 'lucide-react';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">PermitAI</span>
          </Link>
        </div>
      </nav>
      <section className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-[42px] font-medium text-[#f2efe9] mb-6">API PermitAI</h1>
          <p className="text-[16px] text-[#5a5650] mb-12">API REST pour intégrer l'analyse PLU dans vos applications</p>
          <div className="bg-[#0c0c18] border border-[#1c1c2a] rounded-lg p-6 mb-8">
            <h2 className="text-[20px] font-medium text-[#f2efe9] mb-4">Endpoint principal</h2>
            <div className="bg-[#06060e] border border-[#1c1c2a] rounded-lg p-4 mb-4">
              <code className="text-[#4ade80] text-[13px]">POST https://permitai.eu/api/plu/query</code>
            </div>
            <h3 className="text-[16px] font-medium text-[#f2efe9] mb-3">Request</h3>
            <pre className="bg-[#06060e] border border-[#1c1c2a] rounded-lg p-4 text-[12px] text-[#f2efe9] overflow-x-auto mb-4">
{`{
  "address": "12 rue des Lilas, Lyon 69006",
  "description": "Extension 40m²",
  "surface": 40
}`}
            </pre>
            <h3 className="text-[16px] font-medium text-[#f2efe9] mb-3">Response</h3>
            <pre className="bg-[#06060e] border border-[#1c1c2a] rounded-lg p-4 text-[12px] text-[#f2efe9] overflow-x-auto">
{`{
  "success": true,
  "verdict": "conforme",
  "score_confiance": 87,
  "zone": "UB",
  "regles_applicables": [...],
  "cerfa_recommande": "13406"
}`}
            </pre>
          </div>
          <div className="bg-[#a0782022] border border-[#a07820] rounded-lg p-6 text-center">
            <p className="text-[14px] text-[#f2efe9] mb-4">L'API est disponible sur les plans Pro et Cabinet</p>
            <Link href="/tarifs"><button className="px-6 py-3 bg-[#a07820] hover:bg-[#c4960a] text-white rounded-lg text-[14px] font-medium transition-colors">Voir les tarifs</button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}