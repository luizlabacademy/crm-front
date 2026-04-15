import { useEffect, useState, useCallback } from "react";
import {
  Phone,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Mail,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Scissors,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  LandingPageConfig,
  LandingPageSlide,
} from "@/features/marketing/types/marketingTypes";

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "crm_landing_page_config";

function loadConfig(): LandingPageConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LandingPageConfig;
  } catch {
    // ignore
  }
  return null;
}

// ─── WhatsApp helper ──────────────────────────────────────────────────────────

function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// ─── Hero Slider ──────────────────────────────────────────────────────────────

function HeroSlider({
  slides,
  whatsappHref,
}: {
  slides: LandingPageSlide[];
  whatsappHref: string;
}) {
  const [current, setCurrent] = useState(0);
  const count = slides.length;

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + count) % count);
  }, [count]);

  // Auto-slide
  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [count, next]);

  if (count === 0) return null;

  const slide = slides[current];

  return (
    <section className="relative w-full h-[85vh] min-h-[500px] overflow-hidden">
      {/* Background image with transition */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-700",
            i === current ? "opacity-100" : "opacity-0",
          )}
          style={{ backgroundImage: `url(${s.imageUrl})` }}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl max-w-3xl leading-tight">
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-xl">
            {slide.subtitle}
          </p>
        )}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-emerald-600 transition-colors"
        >
          <MessageCircle size={20} />
          Agendar pelo WhatsApp
        </a>
      </div>

      {/* Arrows */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
            aria-label="Próximo slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === current ? "w-8 bg-white" : "w-2.5 bg-white/50",
                )}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ─── Services Grid ────────────────────────────────────────────────────────────

function ServicesSection({
  services,
  whatsappHref,
}: {
  services: LandingPageConfig["services"];
  whatsappHref: string;
}) {
  if (services.length === 0) return null;

  return (
    <section id="servicos" className="py-20 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1.5 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-4">
            <Scissors size={13} />
            Nossos Serviços
          </span>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            O que oferecemos
          </h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            Conheça nossos serviços e agende o melhor horário para você
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="group rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {svc.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={svc.imageUrl}
                    alt={svc.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-5 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {svc.name}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {svc.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-base font-bold text-rose-600">
                    {svc.price}
                  </span>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                  >
                    <MessageCircle size={13} />
                    Agendar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CtaBanner({ whatsappHref }: { whatsappHref: string }) {
  return (
    <section className="py-16 bg-gradient-to-r from-rose-500 to-pink-600">
      <div className="mx-auto max-w-3xl px-6 text-center text-white">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Pronta para transformar seu visual?
        </h2>
        <p className="mt-3 text-lg text-white/80">
          Agende agora mesmo pelo WhatsApp e garanta o melhor atendimento.
        </p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-rose-600 shadow-lg hover:bg-gray-50 transition-colors"
        >
          <MessageCircle size={20} />
          Agendar pelo WhatsApp
        </a>
      </div>
    </section>
  );
}

// ─── About / Info Section ─────────────────────────────────────────────────────

function AboutSection({ info }: { info: LandingPageConfig["businessInfo"] }) {
  return (
    <section id="sobre" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left: text */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1.5 text-xs font-semibold text-rose-600 uppercase tracking-wider">
              Sobre nós
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {info.salonName}
            </h2>
            <p className="text-gray-600 leading-relaxed">{info.description}</p>
          </div>

          {/* Right: contact card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm space-y-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Informações de Contato
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Endereço</p>
                  <p className="text-sm text-gray-500">
                    {info.address}
                    <br />
                    {info.city} - {info.state}, {info.zipCode}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Telefone</p>
                  <p className="text-sm text-gray-500">{info.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">E-mail</p>
                  <p className="text-sm text-gray-500">{info.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Horário de Funcionamento
                  </p>
                  <p className="text-sm text-gray-500">
                    Seg a Sex: 9h - 19h
                    <br />
                    Sáb: 9h - 17h
                  </p>
                </div>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3 pt-2">
              {info.instagramUrl && (
                <a
                  href={info.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
              )}
              {info.facebookUrl && (
                <a
                  href={info.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ info }: { info: LandingPageConfig["businessInfo"] }) {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-white">
            {info.logoUrl ? (
              <img
                src={info.logoUrl}
                alt={info.salonName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <Scissors size={20} />
            )}
            <span className="font-semibold text-lg">{info.salonName}</span>
          </div>
          <p className="text-sm max-w-md">
            {info.address} - {info.city}/{info.state}
          </p>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {info.salonName}. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Floating WhatsApp Button ─────────────────────────────────────────────────

function FloatingWhatsApp({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-colors animate-bounce"
      style={{ animationDuration: "2s" }}
      aria-label="Agendar pelo WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({
  salonName,
  logoUrl,
  whatsappHref,
}: {
  salonName: string;
  logoUrl: string;
  whatsappHref: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={salonName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <Scissors
              size={20}
              className={scrolled ? "text-gray-900" : "text-white"}
            />
          )}
          <span
            className={cn(
              "font-bold text-lg transition-colors",
              scrolled ? "text-gray-900" : "text-white",
            )}
          >
            {salonName}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          <a
            href="#servicos"
            className={cn(
              "text-sm font-medium transition-colors",
              scrolled
                ? "text-gray-600 hover:text-gray-900"
                : "text-white/80 hover:text-white",
            )}
          >
            Serviços
          </a>
          <a
            href="#sobre"
            className={cn(
              "text-sm font-medium transition-colors",
              scrolled
                ? "text-gray-600 hover:text-gray-900"
                : "text-white/80 hover:text-white",
            )}
          >
            Sobre
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            <MessageCircle size={15} />
            Agendar
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Back-to-top ──────────────────────────────────────────────────────────────

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-700 transition-colors"
      aria-label="Voltar ao topo"
    >
      <ArrowUp size={18} />
    </button>
  );
}

// ─── Landing Page (external) ──────────────────────────────────────────────────

export function LandingPage() {
  const [config, setConfig] = useState<LandingPageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = loadConfig();
    setConfig(data);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white gap-4 text-center px-6">
        <Scissors size={40} className="text-gray-300" />
        <h1 className="text-xl font-semibold text-gray-900">
          Landing page não configurada
        </h1>
        <p className="text-gray-500 max-w-md">
          Configure sua landing page no painel administrativo para que seus
          clientes possam visualizá-la.
        </p>
      </div>
    );
  }

  const { businessInfo, slides, services } = config;
  const wpHref = whatsappUrl(
    businessInfo.whatsappNumber,
    businessInfo.whatsappMessage,
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar
        salonName={businessInfo.salonName}
        logoUrl={businessInfo.logoUrl}
        whatsappHref={wpHref}
      />
      <HeroSlider slides={slides} whatsappHref={wpHref} />
      <ServicesSection services={services} whatsappHref={wpHref} />
      <CtaBanner whatsappHref={wpHref} />
      <AboutSection info={businessInfo} />
      <Footer info={businessInfo} />
      <FloatingWhatsApp href={wpHref} />
      <BackToTop />
    </div>
  );
}
