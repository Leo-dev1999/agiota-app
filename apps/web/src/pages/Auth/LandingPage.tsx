import { Link } from 'react-router-dom'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Cadastro de Clientes',
    desc: 'Cadastre seus clientes com nome, telefone, endereço automático pelo CEP e controle de quem indicou.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Controle de Empréstimos',
    desc: 'Registre empréstimos mensais, diários, semanais ou parcelados. O sistema calcula os juros automaticamente.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
    title: '3 Formas de Cobrança',
    desc: 'O cliente pode pagar só os juros, os juros mais uma amortização do saldo, ou quitar tudo de uma vez.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Sociedade',
    desc: 'Emprestou 50% com um sócio? Informe e o sistema mostra automaticamente a sua parte dos juros.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Dashboard Completo',
    desc: 'Veja de relance o capital em risco, juros a receber, cobranças do dia e pagamentos em atraso.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Acesso Seguro',
    desc: 'Cada usuário tem login e senha próprios. Seus dados ficam isolados e protegidos.',
  },
]

const whatsappNumber = '5511969379916'
const whatsappMessage = encodeURIComponent('Olá, gostaria de ter acesso ao Jurista System')
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-900 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-bold text-lg">Jurista System</span>
        </div>
        <Link
          to="/login"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Já tenho acesso →
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Controle seus empréstimos<br />
            <span className="text-brand-400">de forma simples e rápida</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            O Jurista System foi criado para quem trabalha com empréstimos pessoais e precisa de uma ferramenta prática para acompanhar clientes, cobranças e recebimentos.
          </p>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-300">O que você pode fazer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex gap-4">
                <div className="text-brand-400 shrink-0 mt-0.5">{f.icon}</div>
                <div>
                  <p className="font-semibold mb-1">{f.title}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-center text-gray-300">Como funciona</h2>
          <div className="space-y-4">
            {[
              { step: '1', text: 'Você solicita o acesso pelo WhatsApp e recebe seu usuário e senha.' },
              { step: '2', text: 'Faz login no sistema e cadastra seus clientes.' },
              { step: '3', text: 'Registra os empréstimos informando valor, juros e forma de cobrança.' },
              { step: '4', text: 'A cada pagamento, registra o que foi recebido — só juros, amortização ou quitação.' },
              { step: '5', text: 'O sistema mantém o histórico completo: datas, valores, atrasos e total retornado.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-400 text-sm font-bold flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <p className="text-gray-300 leading-relaxed pt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4">
          <p className="text-gray-400">Quer ter acesso? Fale comigo pelo WhatsApp.</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Solicitar acesso pelo WhatsApp
          </a>
          <p className="text-xs text-gray-600">
            Você será redirecionado para o WhatsApp com a mensagem já preenchida.
          </p>
        </section>
      </main>

      <footer className="border-t border-gray-900 text-center py-6 text-xs text-gray-700">
        Jurista System · Todos os direitos reservados
      </footer>
    </div>
  )
}
