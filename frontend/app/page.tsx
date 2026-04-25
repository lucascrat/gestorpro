'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden animated-gradient">
      {/* Blobs decorativos */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-20 left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 lg:px-12">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Gestor</span>
          </div>
          <Link
            href="/admin"
            className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
          >
            Admin
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 px-6 lg:px-12 pt-12 lg:pt-20 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-slate-300">Atendimento 24/7 com IA</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
              Renove seu pacote
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                em segundos.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Converse com nosso assistente, pague via PIX e tenha sua conta renovada
              <span className="text-white font-medium"> automaticamente</span>. Sem espera.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/chat"
                className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Iniciar Atendimento
                </span>
              </Link>

              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl glass hover:bg-white/10 font-medium transition"
              >
                Como funciona
              </a>
            </div>
          </div>

          {/* Features grid */}
          <div id="features" className="grid md:grid-cols-3 gap-6 mt-24">
            {[
              {
                icon: (
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: 'Atendimento Inteligente',
                desc: 'Gemini Flash entende suas dúvidas e responde com precisão sobre pacotes e renovação.',
                gradient: 'from-amber-400 to-orange-500',
              },
              {
                icon: (
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
                title: 'PIX Instantâneo',
                desc: 'QR Code gerado direto no chat. Confirmação automática assim que o pagamento cair.',
                gradient: 'from-emerald-400 to-teal-500',
              },
              {
                icon: (
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Renovação Automática',
                desc: 'Após o pagamento, nosso bot acessa o painel e renova sua conta sem você fazer nada.',
                gradient: 'from-indigo-400 to-purple-500',
              },
            ].map((feat, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-3xl glass hover:bg-white/[0.07] transition-all hover:scale-[1.02]"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.gradient} items-center justify-center mb-4 shadow-lg`}>
                  <div className="w-6 h-6 text-white">{feat.icon}</div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
            {[
              { num: '< 30s', label: 'Tempo médio' },
              { num: '99.9%', label: 'Taxa de sucesso' },
              { num: '24/7', label: 'Disponível' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  {stat.num}
                </div>
                <div className="text-xs md:text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-slate-500">© 2026 Gestor. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
