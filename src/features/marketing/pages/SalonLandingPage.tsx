import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronsUpDown,
  Clock3,
  Menu,
  MessageCircle,
  QrCode,
  Repeat2,
  Rocket,
  Scissors,
  Sparkles,
  Shield,
  X,
} from "lucide-react";
import { WhatsAppEmulator } from "@/features/bot/components/WhatsAppEmulator";
import { DEFAULT_BOT_FLOW_STATE } from "@/features/bot/constants/defaultBotFlow";

const WHATSAPP_NUMBER = "5511999999999";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Olá! Tenho interesse em conhecer o CRM com WhatsApp Bot para salão de beleza.",
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const plans = [
  {
    id: "go",
    name: "Go",
    price: "R$ 0",
    subtitle: "Plano Free",
    features: [
      "CRM",
      "WhatsApp marketing (limitado)",
      "E-mail marketing (limitado)",
      "Automação de marketing (básica)",
      "Campanhas de marketing (desativadas)",
    ],
    cta: "Começar grátis",
    highlighted: false,
  },
  {
    id: "plus",
    name: "Plus",
    price: "R$ 39",
    subtitle: "Profissional Autônomo",
    features: [
      "CRM completo",
      "WhatsApp marketing",
      "E-mail marketing",
      "Automação de marketing",
      "Campanhas de marketing",
      "Backups automáticos",
      "Suporte via e-mail",
    ],
    cta: "Assinar Plus",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 129",
    subtitle: "Empresarial",
    features: [
      "Tudo do Plus",
      "Usuários e permissões",
      "Integrações avançadas",
      "Relatórios e histórico",
      "Suporte via chat em horário comercial",
    ],
    cta: "Assinar Pro",
    highlighted: true,
  },
] as const;

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? "bg-emerald-950/95 backdrop-blur shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-600">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">SalãoBot</span>
        </div>

        <div className="hidden items-center gap-7 md:flex">
          <a href="#funcionalidades" className="text-sm text-emerald-100/80 hover:text-white">Funcionalidades</a>
          <a href="#como-funciona" className="text-sm text-emerald-100/80 hover:text-white">Como funciona</a>
          <a href="#planos" className="text-sm text-emerald-100/80 hover:text-white">Planos</a>
          <a href="#faq" className="text-sm text-emerald-100/80 hover:text-white">FAQ</a>
        </div>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-400 md:flex"
        >
          <MessageCircle className="h-4 w-4" />
          Testar grátis
        </a>

        <button className="text-emerald-100 md:hidden" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-emerald-900 bg-emerald-950 px-4 pb-4 md:hidden">
          <a href="#funcionalidades" className="block py-3 text-sm text-emerald-100">Funcionalidades</a>
          <a href="#como-funciona" className="block py-3 text-sm text-emerald-100">Como funciona</a>
          <a href="#planos" className="block py-3 text-sm text-emerald-100">Planos</a>
          <a href="#faq" className="block py-3 text-sm text-emerald-100">FAQ</a>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gray-950 pb-20 pt-28 sm:pt-32">
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[480px] w-[480px] rounded-full bg-green-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[420px] w-[420px] rounded-full bg-emerald-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-500/25 bg-green-500/10 px-4 py-1.5 text-sm text-green-300">
            <Scissors className="h-3.5 w-3.5" />
            Feito para pequenos e médios salões
          </div>
          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            CRM + WhatsApp Bot para manter sua agenda cheia
          </h1>
          <p className="mt-4 max-w-xl text-base text-emerald-100/70 sm:text-lg">
            Automatize atendimento, agendamento e reativação de clientes do seu salão com a mesma base do Menu do Chatbot que você já usa no sistema.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3.5 text-base font-bold text-white transition hover:bg-green-400 sm:px-7 sm:py-4 sm:text-lg">
              <MessageCircle className="h-5 w-5" />
              Começar teste gratuito
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#funcionalidades" className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700 px-6 py-3.5 text-base font-semibold text-emerald-100 transition hover:border-emerald-500 hover:text-white sm:px-7 sm:py-4 sm:text-lg">
              Ver como funciona
              <ChevronDown className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-emerald-100/60">
            {[
              "Sem cartão de crédito",
              "14 dias grátis",
              "Setup em minutos",
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto h-[540px] w-full max-w-[360px] overflow-hidden sm:h-[620px] sm:max-w-[390px]">
          <WhatsAppEmulator flowState={DEFAULT_BOT_FLOW_STATE} />
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: <Bot className="h-6 w-6" />, title: "Menu do Chatbot reaproveitado", text: "A mesma estrutura de menu usada no painel para fluxo de atendimento e agendamento." },
    { icon: <Calendar className="h-6 w-6" />, title: "Agendamento automático", text: "Cliente escolhe serviço, dia, horário e profissional direto no WhatsApp." },
    { icon: <Repeat2 className="h-6 w-6" />, title: "Reativação de clientes", text: "Fluxos automáticos para trazer de volta clientes que estão sem retorno." },
    { icon: <MessageCircle className="h-6 w-6" />, title: "Atendimento 24h", text: "Respostas automaticas para duvidas frequentes, mesmo fora do horario comercial." },
    { icon: <CheckCircle className="h-6 w-6" />, title: "Confirmacao e lembrete", text: "Mensagens de confirmacao e lembrete para reduzir faltas e reagendamentos de ultima hora." },
    { icon: <Shield className="h-6 w-6" />, title: "Historico completo no CRM", text: "Tudo registrado por cliente: servicos, conversas e preferencias para vender melhor." },
  ];

  return (
    <section id="funcionalidades" className="bg-gray-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Funcionalidades para salões que querem crescer</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-green-500/10 to-emerald-700/10 p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black/30 text-green-400">{item.icon}</div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-emerald-100/70">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: <QrCode className="h-6 w-6" />,
      title: "Conecte o WhatsApp",
      description:
        "Leia o QR Code e conecte seu numero em menos de 2 minutos.",
      highlight: "Setup inicial rapido",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Cadastre seus serviços",
      description:
        "Cadastre serviços, duração e profissionais em poucos cliques, com configuração simples.",
      highlight: "Configuracao simplificada",
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "Escolha sua Landing Page e comece a vender",
      description:
        "Em poucos minutos seu salao ja recebe agendamentos e novos clientes pelo WhatsApp.",
      highlight: "Venda na mesma hora",
    },
  ] as const;

  return (
    <section id="como-funciona" className="relative overflow-hidden bg-gray-950 py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-20%,rgba(74,222,128,0.12),transparent),radial-gradient(800px_360px_at_8%_20%,rgba(16,185,129,0.1),transparent),radial-gradient(900px_420px_at_92%_85%,rgba(20,184,166,0.1),transparent)]" />
        <div className="absolute -left-28 top-2 h-80 w-80 rounded-full bg-green-400/8 blur-3xl" />
        <div className="absolute right-[30%] top-10 h-60 w-60 rounded-full bg-emerald-400/8 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-teal-400/8 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/12 via-transparent to-gray-950/70" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(134,239,172,0.55) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.04]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Configure rápido e comece a vender em minutos
          </h2>
          <p className="mt-3 text-lg text-emerald-100/70">
            Sem implantação longa, sem equipe técnica e sem complicação.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-green-500/25 bg-green-500/10 px-4 py-1.5 text-sm text-green-300">
            <Clock3 className="h-4 w-4" />
            Do zero ao primeiro agendamento em poucos minutos
          </div>
        </div>

        <div className="relative grid gap-5 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[18%] right-[18%] top-[98px] z-0 hidden h-0.5 bg-gradient-to-r from-transparent via-green-400/45 to-transparent md:block" />
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="relative z-10 rounded-2xl bg-transparent p-6 text-center transition hover:-translate-y-0.5"
            >
              <span className="mb-3 inline-block text-3xl font-extrabold text-green-400/90">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="mb-4 flex items-center justify-center">
                <span className="relative z-20 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-green-500/25 bg-emerald-950 text-green-400 shadow-[0_0_0_4px_rgba(3,7,18,0.85)] [&_svg]:h-8 [&_svg]:w-8">
                  {step.icon}
                </span>
              </div>

              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-green-300/70">
                {step.highlight}
              </p>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-300/80">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="planos" className="bg-gray-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5 text-sm text-green-300">
            <Shield className="h-3.5 w-3.5" />
            Mesmos planos da página de planos
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Escolha seu plano</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className={`rounded-2xl border p-6 ${plan.highlighted ? "border-green-500/60 bg-gradient-to-b from-green-500/15 to-emerald-900/15" : "border-gray-800 bg-gray-900"}`}>
              <h3 className={`text-2xl font-bold ${plan.highlighted ? "text-green-400" : "text-white"}`}>{plan.name}</h3>
              <p className="text-sm text-gray-400">{plan.subtitle}</p>
               <p className="mt-4 text-4xl font-extrabold text-white">{plan.price}<span className="text-sm text-gray-400"> / mês</span></p>
              <ul className="mt-5 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${plan.highlighted ? "bg-green-500 text-white hover:bg-green-400" : "border border-gray-700 text-white hover:border-green-500/60"}`}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    ["E o mesmo Menu do Chatbot do CRM?", "Sim. A landing reaproveita o mesmo componente de simulacao e o mesmo modelo de fluxo do Menu do Chatbot."],
    ["Serve para salao pequeno?", "Sim. Foi pensado para pequenos e medios saloes, incluindo equipes enxutas."],
    ["Precisa de cartao para testar?", "Nao. Voce pode iniciar o teste sem cartao de credito."],
    ["Quanto tempo leva para configurar?", "Na maioria dos casos, voce conecta o WhatsApp e ativa o menu em poucos minutos."],
    ["O bot substitui minha recepcionista?", "Ele automatiza o repetitivo: triagem, agendamento, confirmacao e lembretes. Sua equipe foca no atendimento humano."],
    ["Posso usar com varios profissionais?", "Sim. O fluxo contempla escolha de servico, horario e profissional no WhatsApp."],
    ["Funciona para barbearia tambem?", "Sim. O modelo atende saloes, barbearias e espacos de beleza com pequenos ajustes de servicos."],
    ["Posso cancelar quando quiser?", "Sim. Cancelamento simples, sem burocracia, direto pelo seu atendimento."],
  ] as const;

  return (
    <section id="faq" className="bg-gray-950 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-extrabold text-white">Perguntas frequentes</h2>
        <div className="space-y-3">
          {faqs.map(([q, a], i) => (
            <div key={q} className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
              <button
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-white"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="text-sm font-medium sm:text-base">{q}</span>
                <ChevronsUpDown
                  className={`h-4 w-4 flex-shrink-0 text-emerald-300 transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && <p className="px-5 pb-5 text-sm text-gray-400">{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-gray-900 py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-green-500/15 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(134,239,172,0.55) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      </div>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-green-500/25 bg-gradient-to-br from-green-500/12 via-emerald-900/25 to-emerald-950/35 p-7 text-center sm:p-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-40 w-[28rem] -translate-x-1/2 bg-gradient-to-r from-transparent via-green-400/20 to-transparent blur-2xl" />
            <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-green-400/15 blur-3xl" />
            <div className="absolute -right-16 bottom-8 h-52 w-52 rounded-full bg-emerald-400/15 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(167,243,208,0.7) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          <div className="relative z-10">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/25 bg-green-500/10 px-4 py-1.5 text-sm text-green-300">
            <MessageCircle className="h-4 w-4" />
            Pronto para encher sua agenda?
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Comece hoje e veja seu salão vender em poucos minutos
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-emerald-100/75">
            Ative o CRM + WhatsApp Bot, automatize o atendimento e transforme
            conversas em agendamentos sem complicação.
          </p>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-400 sm:px-7 sm:py-3.5 sm:text-base"
          >
            <MessageCircle className="h-4 w-4" />
            Testar 14 dias grátis
            <ArrowRight className="h-4 w-4" />
          </a>

          <p className="mt-3 text-xs text-emerald-100/60">
            Sem cartão de crédito • Cancelamento simples
          </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center sm:flex-row sm:px-6 lg:px-8 sm:text-left">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-green-400 to-emerald-600">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">SalãoBot</span>
        </div>
        <p className="text-xs text-gray-400">
          CRM + WhatsApp Bot para pequenos e médios salões.
        </p>
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} SalãoBot</p>
      </div>
    </footer>
  );
}

export function SalonLandingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}
