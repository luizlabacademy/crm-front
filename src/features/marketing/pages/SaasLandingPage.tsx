import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Bot,
  Users,
  BarChart3,
  Zap,
  Shield,
  CheckCircle,
  Star,
  ArrowRight,
  ChevronDown,
  Phone,
  Mail,
  Instagram,
  Linkedin,
  Menu,
  X,
  TrendingUp,
  Clock,
  Repeat2,
  Target,
  Bell,
  FileText,
  Globe,
  Smartphone,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
  badge?: string;
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  text: string;
  rating: number;
  avatar: string;
}

interface Stat {
  value: string;
  label: string;
  icon: React.ReactNode;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = "5511999999999";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Olá! Tenho interesse em conhecer o CRM com WhatsApp Bot. Pode me apresentar?",
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const plans: PricingPlan[] = [
  {
    name: "Starter",
    price: "R$ 197",
    period: "/mês",
    description: "Ideal para pequenas equipes que estão começando.",
    features: [
      "1 número de WhatsApp",
      "Até 3 usuários",
      "500 contatos no CRM",
      "Bot com fluxos básicos",
      "Relatórios essenciais",
      "Suporte via chat",
    ],
    highlighted: false,
    cta: "Começar agora",
  },
  {
    name: "Growth",
    price: "R$ 397",
    period: "/mês",
    description: "Para times em crescimento que precisam de mais potência.",
    features: [
      "3 números de WhatsApp",
      "Até 15 usuários",
      "Contatos ilimitados",
      "Bot com IA e fluxos avançados",
      "Pipeline de vendas completo",
      "Automações e integrações",
      "Relatórios avançados",
      "Suporte prioritário",
    ],
    highlighted: true,
    cta: "Assinar Growth",
    badge: "Mais popular",
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    description: "Solução completa para grandes operações e múltiplas filiais.",
    features: [
      "Números ilimitados",
      "Usuários ilimitados",
      "CRM com campos personalizados",
      "IA conversacional avançada",
      "API pública (webhooks)",
      "Onboarding dedicado",
      "SLA 99,9% de uptime",
      "Gerente de conta exclusivo",
    ],
    highlighted: false,
    cta: "Falar com especialista",
  },
];

const testimonials: Testimonial[] = [
  {
    name: "Camila Torres",
    role: "Diretora Comercial",
    company: "Imobiliária Torres & Filhos",
    text: "Triplicamos o volume de atendimentos sem contratar ninguém. O bot responde 24h e qualifica os leads antes de chegar no consultor. Simplesmente incrível.",
    rating: 5,
    avatar: "CT",
  },
  {
    name: "Rafael Mendes",
    role: "CEO",
    company: "Clínica Saúde Viva",
    text: "A integração do WhatsApp com o CRM mudou nossa operação. Conseguimos reduzir o tempo de resposta de horas para segundos e a satisfação dos pacientes disparou.",
    rating: 5,
    avatar: "RM",
  },
  {
    name: "Juliana Costa",
    role: "Gerente de Vendas",
    company: "E-commerce Moda Fácil",
    text: "Em 60 dias aumentamos nossa taxa de conversão em 47%. O pipeline visual e as automações de follow-up fazem toda a diferença no fechamento.",
    rating: 5,
    avatar: "JC",
  },
  {
    name: "Bruno Alves",
    role: "Fundador",
    company: "Agência Digital Pulse",
    text: "Usamos para gerenciar todos os clientes da agência. A visibilidade do funil e os relatórios automáticos nos economizam horas por semana.",
    rating: 5,
    avatar: "BA",
  },
];

const stats: Stat[] = [
  {
    value: "+2.400",
    label: "Empresas ativas",
    icon: <Users className="w-6 h-6" />,
  },
  {
    value: "47%",
    label: "Aumento médio em conversão",
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    value: "3x",
    label: "Mais atendimentos por agente",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    value: "< 30s",
    label: "Tempo médio de resposta",
    icon: <Clock className="w-6 h-6" />,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Planos", href: "#planos" },
    { label: "Depoimentos", href: "#depoimentos" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-950/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              ZapCRM
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#planos"
              className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
            >
              Ver planos
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Testar grátis
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 pb-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-gray-300 hover:text-white text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
            <div className="px-4 pt-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-3 rounded-lg transition-colors text-center"
              >
                Testar grátis
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Mais de 2.400 empresas já usam
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
          CRM + WhatsApp Bot{" "}
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            que vende enquanto
          </span>{" "}
          você dorme
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Automatize atendimentos, qualifique leads e feche mais negócios com o
          único CRM que integra{" "}
          <strong className="text-gray-200">WhatsApp Bot com IA</strong> ao seu
          funil de vendas. Sem código. Resultado em dias.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full sm:w-auto bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5"
          >
            <MessageCircle className="w-5 h-5" />
            Começar teste gratuito
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#funcionalidades"
            className="w-full sm:w-auto border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all flex items-center justify-center gap-2"
          >
            Ver como funciona
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>

        {/* Social proof badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Sem cartão de crédito</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>14 dias grátis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Cancele quando quiser</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Setup em 15 minutos</span>
          </div>
        </div>

        {/* Mock UI preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-950 to-transparent z-10" />
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto shadow-2xl shadow-black/50">
            {/* Fake window bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="flex-1 bg-gray-800 rounded-md h-6 ml-2" />
            </div>
            {/* Fake dashboard */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Leads hoje", value: "143", color: "text-green-400" },
                { label: "Em negociação", value: "38", color: "text-blue-400" },
                { label: "Fechados", value: "12", color: "text-purple-400" },
              ].map((card) => (
                <div key={card.label} className="bg-gray-800/60 rounded-xl p-3 sm:p-4">
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className={`text-xl sm:text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>
            {/* Fake pipeline */}
            <div className="grid grid-cols-4 gap-2">
              {["Novo", "Contato", "Proposta", "Fechado"].map((stage, i) => (
                <div key={stage} className="bg-gray-800/40 rounded-lg p-2">
                  <p className="text-xs text-gray-500 mb-2 font-medium">{stage}</p>
                  {Array.from({ length: i === 0 ? 4 : i === 1 ? 3 : i === 2 ? 2 : 1 }).map((_, j) => (
                    <div
                      key={j}
                      className="bg-gray-700/60 rounded-md h-8 mb-1.5 flex items-center px-2"
                    >
                      <div className="w-4 h-4 rounded-full bg-green-500/40 mr-2 flex-shrink-0" />
                      <div className="h-2 bg-gray-600 rounded flex-1" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="bg-gray-900 border-y border-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 text-green-400 rounded-xl mb-3">
                {stat.icon}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "WhatsApp Bot com IA",
      description:
        "Bot inteligente que responde, qualifica leads e agenda reuniões automaticamente 24 horas por dia, 7 dias por semana.",
      color: "from-green-500/20 to-emerald-600/20 border-green-500/30",
      iconColor: "text-green-400",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Pipeline visual de vendas",
      description:
        "Visualize todo o funil em kanban. Mova negócios entre etapas com drag-and-drop e nunca perca um follow-up.",
      color: "from-blue-500/20 to-cyan-600/20 border-blue-500/30",
      iconColor: "text-blue-400",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "CRM completo de contatos",
      description:
        "Histórico completo de conversas, negócios, tarefas e notas em um único perfil. Contexto total em cada atendimento.",
      color: "from-purple-500/20 to-violet-600/20 border-purple-500/30",
      iconColor: "text-purple-400",
    },
    {
      icon: <Repeat2 className="w-6 h-6" />,
      title: "Automações e fluxos",
      description:
        "Crie fluxos automáticos: mensagens de boas-vindas, follow-ups, pesquisas de satisfação e recuperação de leads frios.",
      color: "from-orange-500/20 to-amber-600/20 border-orange-500/30",
      iconColor: "text-orange-400",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Qualificação automática",
      description:
        "O bot faz perguntas estratégicas e pontua os leads automaticamente. Só chega para o vendedor quem realmente quer comprar.",
      color: "from-pink-500/20 to-rose-600/20 border-pink-500/30",
      iconColor: "text-pink-400",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Notificações inteligentes",
      description:
        "Alertas de lead quente, lembretes de tarefas e notificações de mensagens não respondidas direto no seu celular.",
      color: "from-yellow-500/20 to-amber-600/20 border-yellow-500/30",
      iconColor: "text-yellow-400",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Relatórios e métricas",
      description:
        "Dashboards com taxa de conversão, tempo de resposta, performance por vendedor e ROI das campanhas.",
      color: "from-teal-500/20 to-cyan-600/20 border-teal-500/30",
      iconColor: "text-teal-400",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-canal integrado",
      description:
        "WhatsApp, Instagram DM e e-mail em uma única caixa de entrada unificada. Nunca perca uma mensagem de lead.",
      color: "from-indigo-500/20 to-blue-600/20 border-indigo-500/30",
      iconColor: "text-indigo-400",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "App mobile",
      description:
        "Gerencie sua equipe e atenda clientes de qualquer lugar pelo app disponível para iOS e Android.",
      color: "from-green-500/20 to-teal-600/20 border-green-500/30",
      iconColor: "text-emerald-400",
    },
  ];

  return (
    <section id="funcionalidades" className="bg-gray-950 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Zap className="w-3.5 h-3.5" />
            Tudo que você precisa
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Uma plataforma.{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Resultado completo.
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Do primeiro contato no WhatsApp até o fechamento do negócio. Tudo
            integrado, automatizado e rastreado.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`bg-gradient-to-br ${feature.color} border rounded-2xl p-6 hover:scale-[1.02] transition-transform`}
            >
              <div
                className={`inline-flex items-center justify-center w-11 h-11 bg-gray-900/60 rounded-xl ${feature.iconColor} mb-4`}
              >
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Conecte seu WhatsApp",
      description:
        "Leia o QR code e conecte seu número em menos de 2 minutos. Funciona com WhatsApp Business e número pessoal.",
      icon: <Smartphone className="w-8 h-8" />,
    },
    {
      number: "02",
      title: "Configure o bot",
      description:
        "Use nossos templates prontos ou crie fluxos personalizados com o editor visual drag-and-drop. Sem código.",
      icon: <Bot className="w-8 h-8" />,
    },
    {
      number: "03",
      title: "Importe seus contatos",
      description:
        "Importe da planilha ou capture leads direto pelo bot. O CRM organiza e classifica automaticamente.",
      icon: <Users className="w-8 h-8" />,
    },
    {
      number: "04",
      title: "Venda com inteligência",
      description:
        "Acompanhe o pipeline, automatize follow-ups e feche mais negócios com dados e relatórios em tempo real.",
      icon: <TrendingUp className="w-8 h-8" />,
    },
  ];

  return (
    <section className="bg-gray-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Como funciona?
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Configure em 4 passos simples e comece a ver resultados no mesmo dia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-2xl text-green-400 mb-4 relative z-10">
                {step.icon}
              </div>
              <div className="text-xs font-bold text-green-500/60 tracking-widest mb-1">
                PASSO {step.number}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="planos" className="bg-gray-950 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Shield className="w-3.5 h-3.5" />
            14 dias grátis em todos os planos
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Planos simples e{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              sem surpresas
            </span>
          </h2>
          <p className="text-lg text-gray-400">
            Escolha o plano ideal para o seu tamanho. Faça upgrade quando precisar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlighted
                  ? "bg-gradient-to-b from-green-500/20 to-emerald-900/20 border-2 border-green-500/60 shadow-2xl shadow-green-500/10"
                  : "bg-gray-900 border border-gray-800"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-xl font-bold mb-1 ${
                    plan.highlighted ? "text-green-400" : "text-white"
                  }`}
                >
                  {plan.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 rounded-xl font-semibold text-center transition-all flex items-center justify-center gap-2 ${
                  plan.highlighted
                    ? "bg-green-500 hover:bg-green-400 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                    : "border border-gray-700 hover:border-green-500/50 text-white hover:text-green-400"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Todos os planos incluem suporte na configuração inicial e 14 dias de teste sem
          cobrança. Cancele a qualquer momento.
        </p>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="depoimentos" className="bg-gray-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Empresas que já transformaram{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              suas vendas
            </span>
          </h2>
          <p className="text-lg text-gray-400">
            Mais de 2.400 empresas em todo o Brasil confiam no ZapCRM.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 hover:border-green-500/20 transition-colors"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Precisa de número de WhatsApp Business?",
      answer:
        "Não. O ZapCRM funciona com qualquer número de WhatsApp, seja pessoal ou Business. Para escalar com múltiplos atendentes, recomendamos o Business API, mas não é obrigatório para começar.",
    },
    {
      question: "Meu WhatsApp pode ser banido?",
      answer:
        "Nossa plataforma segue todas as boas práticas e políticas do WhatsApp. Utilizamos conexão oficial via API e nunca fazemos spam. Com uso responsável, não há risco de banimento.",
    },
    {
      question: "Funciona para qualquer tipo de negócio?",
      answer:
        "Sim. Atendemos desde clínicas e imobiliárias até e-commerces e agências digitais. A plataforma é flexível e o bot pode ser configurado para qualquer segmento.",
    },
    {
      question: "Quanto tempo leva para configurar?",
      answer:
        "A maioria dos clientes configura em menos de 30 minutos usando nossos templates prontos. Nossa equipe de onboarding está disponível para ajudar caso precise.",
    },
    {
      question: "Posso migrar meus dados de outro CRM?",
      answer:
        "Sim. Importamos contatos via CSV/Excel e temos integrações nativas com os principais CRMs do mercado. Também oferecemos migração assistida para planos Growth e Enterprise.",
    },
    {
      question: "Como funciona o cancelamento?",
      answer:
        "Sem burocracia. Cancele pelo próprio painel a qualquer momento. Você mantém acesso até o final do período pago e seus dados ficam disponíveis para exportação por 30 dias.",
    },
  ];

  return (
    <section id="faq" className="bg-gray-950 py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-gray-400">
            Não encontrou sua dúvida?{" "}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 underline"
            >
              Fale com a gente no WhatsApp
            </a>
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-white font-medium text-sm sm:text-base pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5">
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="bg-gray-900 py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-900/20 border border-green-500/20 rounded-3xl p-10 sm:p-16 relative overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-green-500/10 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
              Pronto para vender{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                mais e atender melhor?
              </span>
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
              Junte-se a mais de 2.400 empresas que já automatizaram seus
              atendimentos e aumentaram conversões com o ZapCRM.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5" />
                Começar 14 dias grátis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              Sem cartão de crédito · Cancele quando quiser · Suporte em português
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">ZapCRM</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              CRM + WhatsApp Bot para empresas que querem crescer com inteligência.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-gray-300 font-semibold text-sm mb-3">Produto</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {["Funcionalidades", "Planos", "Integrações", "API"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gray-300 font-semibold text-sm mb-3">Empresa</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {["Sobre nós", "Blog", "Cases", "Termos de uso"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gray-300 font-semibold text-sm mb-3">Contato</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                <span>contato@zapcrm.com.br</span>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-gray-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} ZapCRM. Todos os direitos reservados.
          </p>
          <p className="text-gray-600 text-xs">
            CNPJ: 00.000.000/0001-00 · São Paulo, SP
          </p>
        </div>
      </div>
    </footer>
  );
}

function FloatingWhatsapp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-400 text-white w-14 h-14 rounded-full shadow-lg shadow-green-500/40 flex items-center justify-center transition-all hover:scale-110 group"
      title="Falar no WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Falar com especialista
      </span>
    </a>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SaasLandingPage() {
  // Ensure page always starts at top
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={topRef} className="min-h-screen font-sans">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
      <FloatingWhatsapp />
    </div>
  );
}
