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
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  LandingPageConfig,
  LandingPageSlide,
  LandingPageTheme,
} from "@/features/marketing/types/marketingTypes";

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "crm_landing_page_config";
const LANDING_SERVICE_CATEGORIES_KEY = "crm_landing_service_categories";

interface LandingServiceCategory {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  showOnSite: boolean;
  availableTypes: Array<"PRODUCT" | "SERVICE">;
}

function loadConfig(): LandingPageConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LandingPageConfig;
  } catch {
    // ignore
  }
  return null;
}

function loadServiceCategories(): LandingServiceCategory[] {
  try {
    const raw = localStorage.getItem(LANDING_SERVICE_CATEGORIES_KEY);
    if (raw) return JSON.parse(raw) as LandingServiceCategory[];
  } catch {
    // ignore
  }
  return [];
}

// ─── WhatsApp helper ──────────────────────────────────────────────────────────

function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMA: ROSE (padrão — rosa/esmeralda, alegre e feminino)
// ═══════════════════════════════════════════════════════════════════════════════

function RoseHeroSlider({
  slides,
  whatsappHref,
}: {
  slides: LandingPageSlide[];
  whatsappHref: string;
}) {
  const [current, setCurrent] = useState(0);
  const count = slides.length;
  const next = useCallback(() => setCurrent((p) => (p + 1) % count), [count]);
  const prev = useCallback(
    () => setCurrent((p) => (p - 1 + count) % count),
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [count, next]);

  if (count === 0) return null;
  const slide = slides[current];

  return (
    <section className="relative w-full h-[85vh] min-h-[500px] overflow-hidden">
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
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

function RoseServicesSection({
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

function RoseCtaBanner({ whatsappHref }: { whatsappHref: string }) {
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

function RoseAboutSection({
  info,
}: {
  info: LandingPageConfig["businessInfo"];
}) {
  return (
    <section id="sobre" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1.5 text-xs font-semibold text-rose-600 uppercase tracking-wider">
              Sobre nós
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {info.salonName}
            </h2>
            <p className="text-gray-600 leading-relaxed">{info.description}</p>
          </div>
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

function RoseNavbar({
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
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
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

// ═══════════════════════════════════════════════════════════════════════════════
// TEMA: DARK (luxo — dourado sobre preto, elegante e sofisticado)
// ═══════════════════════════════════════════════════════════════════════════════

function DarkHeroSlider({
  slides,
  whatsappHref,
}: {
  slides: LandingPageSlide[];
  whatsappHref: string;
}) {
  const [current, setCurrent] = useState(0);
  const count = slides.length;
  const next = useCallback(() => setCurrent((p) => (p + 1) % count), [count]);
  const prev = useCallback(
    () => setCurrent((p) => (p - 1 + count) % count),
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [count, next]);

  if (count === 0) return null;
  const slide = slides[current];

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-1000",
            i === current ? "opacity-100" : "opacity-0",
          )}
          style={{ backgroundImage: `url(${s.imageUrl})` }}
        />
      ))}
      {/* Dark overlay with slight color tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
      {/* Decorative gold horizontal lines */}
      <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
      <div className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-12 bg-yellow-400/70" />
          <Sparkles size={16} className="text-yellow-400" />
          <div className="h-px w-12 bg-yellow-400/70" />
        </div>
        <h1 className="text-5xl font-light tracking-[0.15em] sm:text-6xl md:text-7xl max-w-4xl leading-tight uppercase">
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="mt-5 text-base sm:text-lg text-yellow-100/70 max-w-xl tracking-widest uppercase text-xs font-medium">
            {slide.subtitle}
          </p>
        )}
        <div className="mt-4 flex items-center gap-4 mb-8">
          <div className="h-px w-8 bg-yellow-400/60" />
          <div className="h-1.5 w-1.5 rounded-full bg-yellow-400/60" />
          <div className="h-px w-8 bg-yellow-400/60" />
        </div>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-yellow-400/70 px-10 py-3.5 text-sm font-semibold tracking-widest uppercase text-yellow-300 hover:bg-yellow-400/10 transition-colors"
        >
          <MessageCircle size={16} />
          Agendar Agora
        </a>
      </div>

      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 border border-white/20 p-2.5 text-white/60 hover:text-white hover:border-yellow-400/50 transition-colors"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 border border-white/20 p-2.5 text-white/60 hover:text-white hover:border-yellow-400/50 transition-colors"
            aria-label="Próximo slide"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-px transition-all",
                  i === current ? "w-10 bg-yellow-400" : "w-4 bg-white/30",
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

function DarkServicesSection({
  services,
  whatsappHref,
}: {
  services: LandingPageConfig["services"];
  whatsappHref: string;
}) {
  if (services.length === 0) return null;
  return (
    <section id="servicos" className="py-24 bg-neutral-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-10 bg-yellow-400/50" />
            <span className="text-xs font-semibold tracking-[0.3em] text-yellow-400/80 uppercase">
              Nossos Serviços
            </span>
            <div className="h-px w-10 bg-yellow-400/50" />
          </div>
          <h2 className="text-3xl font-light tracking-widest text-white uppercase sm:text-4xl">
            O que oferecemos
          </h2>
          <p className="mt-4 text-sm text-neutral-400 max-w-lg mx-auto tracking-wide">
            Conheça nossos serviços e agende o melhor horário para você
          </p>
        </div>
        <div className="grid gap-px bg-neutral-800 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="group bg-neutral-950 overflow-hidden hover:bg-neutral-900 transition-colors"
            >
              {svc.imageUrl && (
                <div className="h-52 overflow-hidden">
                  <img
                    src={svc.imageUrl}
                    alt={svc.name}
                    className="h-full w-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-6 space-y-3">
                <h3 className="text-base font-semibold tracking-wider text-white uppercase">
                  {svc.name}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {svc.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                  <span className="text-sm font-bold text-yellow-400">
                    {svc.price}
                  </span>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-yellow-400/40 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-yellow-400/80 hover:bg-yellow-400/10 transition-colors"
                  >
                    <MessageCircle size={12} />
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

function DarkCtaBanner({ whatsappHref }: { whatsappHref: string }) {
  return (
    <section className="py-20 bg-neutral-900 border-y border-neutral-800">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-12 bg-yellow-400/40" />
          <Sparkles size={14} className="text-yellow-400/60" />
          <div className="h-px w-12 bg-yellow-400/40" />
        </div>
        <h2 className="text-3xl font-light tracking-widest text-white uppercase sm:text-4xl">
          Pronta para se transformar?
        </h2>
        <p className="mt-4 text-sm text-neutral-400 tracking-wide">
          Agende agora mesmo pelo WhatsApp e garanta o melhor atendimento.
        </p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 border border-yellow-400/60 px-10 py-3.5 text-sm font-semibold tracking-widest uppercase text-yellow-300 hover:bg-yellow-400/10 transition-colors"
        >
          <MessageCircle size={16} />
          Agendar pelo WhatsApp
        </a>
      </div>
    </section>
  );
}

function DarkAboutSection({
  info,
}: {
  info: LandingPageConfig["businessInfo"];
}) {
  return (
    <section id="sobre" className="py-24 bg-neutral-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-yellow-400/50" />
              <span className="text-xs font-semibold tracking-[0.3em] text-yellow-400/80 uppercase">
                Sobre nós
              </span>
            </div>
            <h2 className="text-3xl font-light tracking-widest text-white uppercase sm:text-4xl">
              {info.salonName}
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              {info.description}
            </p>
            <div className="flex gap-4 pt-4">
              {info.instagramUrl && (
                <a
                  href={info.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center border border-neutral-700 text-neutral-500 hover:border-yellow-400/50 hover:text-yellow-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
              )}
              {info.facebookUrl && (
                <a
                  href={info.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center border border-neutral-700 text-neutral-500 hover:border-yellow-400/50 hover:text-yellow-400 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
              )}
            </div>
          </div>
          <div className="border border-neutral-800 bg-neutral-900 p-8 space-y-6">
            <h3 className="text-xs font-semibold tracking-[0.3em] text-yellow-400/70 uppercase">
              Informações de Contato
            </h3>
            <div className="space-y-5">
              {[
                {
                  icon: <MapPin size={15} />,
                  label: "Endereço",
                  value: `${info.address}\n${info.city} - ${info.state}, ${info.zipCode}`,
                },
                {
                  icon: <Phone size={15} />,
                  label: "Telefone",
                  value: info.phone,
                },
                {
                  icon: <Mail size={15} />,
                  label: "E-mail",
                  value: info.email,
                },
                {
                  icon: <Clock size={15} />,
                  label: "Horários",
                  value: "Seg a Sex: 9h - 19h\nSáb: 9h - 17h",
                },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 border-b border-neutral-800 pb-4 last:border-0 last:pb-0"
                >
                  <div className="text-yellow-400/60 mt-0.5 shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase mb-1">
                      {label}
                    </p>
                    <p className="text-sm text-neutral-300 whitespace-pre-line">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DarkNavbar({
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
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-800"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={salonName}
              className="h-7 w-7 rounded-full object-cover opacity-90"
            />
          ) : (
            <Scissors size={18} className="text-yellow-400/70" />
          )}
          <span className="font-light tracking-[0.2em] text-white uppercase text-sm">
            {salonName}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-8">
          <a
            href="#servicos"
            className="text-xs font-medium tracking-widest uppercase text-white/50 hover:text-yellow-400 transition-colors"
          >
            Serviços
          </a>
          <a
            href="#sobre"
            className="text-xs font-medium tracking-widest uppercase text-white/50 hover:text-yellow-400 transition-colors"
          >
            Sobre
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border border-yellow-400/50 px-5 py-2 text-xs font-semibold tracking-widest uppercase text-yellow-300 hover:bg-yellow-400/10 transition-colors"
          >
            <MessageCircle size={13} />
            Agendar
          </a>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMA: MINIMAL (limpo/moderno — preto e branco, tipografia forte)
// ═══════════════════════════════════════════════════════════════════════════════

function MinimalHeroSlider({
  slides,
  whatsappHref,
  salonName,
  tagline,
}: {
  slides: LandingPageSlide[];
  whatsappHref: string;
  salonName: string;
  tagline: string;
}) {
  const [current, setCurrent] = useState(0);
  const count = slides.length;
  const next = useCallback(() => setCurrent((p) => (p + 1) % count), [count]);
  const prev = useCallback(
    () => setCurrent((p) => (p - 1 + count) % count),
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [count, next]);

  const slide = slides[current];

  return (
    <section className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white">
      {/* Left: text half */}
      <div className="relative z-10 flex flex-col justify-center px-10 py-24 lg:w-1/2 lg:px-20">
        <div className="space-y-8 max-w-lg">
          <div className="text-xs font-semibold tracking-[0.4em] text-gray-400 uppercase">
            {tagline}
          </div>
          <h1 className="text-5xl font-black leading-[1.05] text-gray-900 sm:text-6xl lg:text-7xl">
            {slide?.title || salonName}
          </h1>
          {slide?.subtitle && (
            <p className="text-base text-gray-500 leading-relaxed max-w-sm">
              {slide.subtitle}
            </p>
          )}
          <div className="flex items-center gap-4 pt-4">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-black transition-colors"
            >
              <MessageCircle size={16} />
              Agendar pelo WhatsApp
            </a>
            <a
              href="#servicos"
              className="text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors underline underline-offset-4"
            >
              Ver serviços
            </a>
          </div>
        </div>

        {count > 1 && (
          <div className="flex items-center gap-4 mt-12">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center border border-gray-200 hover:border-gray-900 transition-colors"
              aria-label="Slide anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs text-gray-400 tracking-widest">
              {String(current + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </span>
            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center border border-gray-200 hover:border-gray-900 transition-colors"
              aria-label="Próximo slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Right: image half */}
      {slide?.imageUrl && (
        <div className="relative lg:w-1/2 h-64 lg:h-auto overflow-hidden">
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
          {/* Subtle vertical line on left border */}
          <div className="absolute inset-y-0 left-0 w-px bg-gray-200 hidden lg:block" />
        </div>
      )}
    </section>
  );
}

function MinimalServicesSection({
  services,
  whatsappHref,
}: {
  services: LandingPageConfig["services"];
  whatsappHref: string;
}) {
  if (services.length === 0) return null;
  return (
    <section id="servicos" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="flex items-end justify-between mb-16 border-b border-gray-200 pb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.4em] text-gray-400 uppercase mb-3">
              Catálogo
            </p>
            <h2 className="text-4xl font-black text-gray-900">
              Nossos Serviços
            </h2>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors"
          >
            <MessageCircle size={15} />
            Agendar
          </a>
        </div>
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 border border-gray-200">
          {services.map((svc, idx) => (
            <div
              key={svc.id}
              className={cn(
                "group border-gray-200 overflow-hidden bg-white hover:bg-gray-50 transition-colors",
                idx % 3 !== 2 ? "lg:border-r" : "",
                idx < services.length - (services.length % 3 || 3)
                  ? "border-b"
                  : "",
              )}
            >
              {svc.imageUrl && (
                <div className="h-48 overflow-hidden border-b border-gray-200">
                  <img
                    src={svc.imageUrl}
                    alt={svc.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-sm font-black tracking-wide text-gray-900 uppercase mb-2">
                  {svc.name}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {svc.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    {svc.price}
                  </span>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors underline underline-offset-4"
                  >
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

function MinimalCtaBanner({ whatsappHref }: { whatsappHref: string }) {
  return (
    <section className="py-20 bg-gray-900">
      <div className="mx-auto max-w-3xl px-6 lg:px-10 text-center">
        <p className="text-xs font-semibold tracking-[0.4em] text-gray-500 uppercase mb-6">
          Pronto para começar?
        </p>
        <h2 className="text-4xl font-black text-white leading-tight sm:text-5xl">
          Agende hoje.
          <br />
          <span className="text-gray-500">Transforme amanhã.</span>
        </h2>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 bg-white px-10 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <MessageCircle size={16} />
          Agendar pelo WhatsApp
        </a>
      </div>
    </section>
  );
}

function MinimalAboutSection({
  info,
}: {
  info: LandingPageConfig["businessInfo"];
}) {
  return (
    <section id="sobre" className="py-24 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_auto] items-start">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.4em] text-gray-400 uppercase mb-4">
              Nossa história
            </p>
            <h2 className="text-4xl font-black text-gray-900 mb-6">
              {info.salonName}
            </h2>
            <p className="text-gray-500 leading-relaxed text-base">
              {info.description}
            </p>
            <div className="flex gap-3 mt-8">
              {info.instagramUrl && (
                <a
                  href={info.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center border border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
              )}
              {info.facebookUrl && (
                <a
                  href={info.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center border border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
              )}
            </div>
          </div>
          <div className="min-w-72 space-y-0 border border-gray-200">
            {[
              {
                icon: <MapPin size={14} />,
                label: "Endereço",
                value: `${info.address}\n${info.city} - ${info.state}`,
              },
              {
                icon: <Phone size={14} />,
                label: "Telefone",
                value: info.phone,
              },
              { icon: <Mail size={14} />, label: "E-mail", value: info.email },
              {
                icon: <Clock size={14} />,
                label: "Horários",
                value: "Seg–Sex: 9h–19h\nSáb: 9h–17h",
              },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-4 p-5 border-b border-gray-200 last:border-0"
              >
                <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
                <div>
                  <p className="text-xs font-black tracking-widest text-gray-900 uppercase mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm text-gray-500 whitespace-pre-line">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MinimalNavbar({
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
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b",
        scrolled
          ? "bg-white border-gray-200"
          : "bg-white/80 backdrop-blur-sm border-transparent",
      )}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 lg:px-10 py-4">
        <div className="flex items-center gap-2.5">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={salonName}
              className="h-7 w-7 rounded-full object-cover grayscale"
            />
          ) : (
            <Scissors size={18} className="text-gray-900" />
          )}
          <span className="font-black tracking-tight text-gray-900 text-base uppercase">
            {salonName}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-8">
          <a
            href="#servicos"
            className="text-xs font-semibold tracking-widest uppercase text-gray-400 hover:text-gray-900 transition-colors"
          >
            Serviços
          </a>
          <a
            href="#sobre"
            className="text-xs font-semibold tracking-widest uppercase text-gray-400 hover:text-gray-900 transition-colors"
          >
            Sobre
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-gray-900 px-5 py-2 text-xs font-bold text-white hover:bg-black transition-colors"
          >
            <MessageCircle size={13} />
            Agendar
          </a>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED: Footer & Floating Button (variants per theme)
// ═══════════════════════════════════════════════════════════════════════════════

function Footer({
  info,
  theme,
}: {
  info: LandingPageConfig["businessInfo"];
  theme: LandingPageTheme;
}) {
  if (theme === "dark") {
    return (
      <footer className="bg-black text-neutral-600 py-10 border-t border-neutral-800">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-neutral-300">
            {info.logoUrl ? (
              <img
                src={info.logoUrl}
                alt={info.salonName}
                className="h-7 w-7 rounded-full object-cover opacity-60"
              />
            ) : (
              <Scissors size={18} className="text-yellow-400/50" />
            )}
            <span className="font-light tracking-[0.2em] uppercase text-sm">
              {info.salonName}
            </span>
          </div>
          <p className="text-xs text-neutral-700">
            {info.address} — {info.city}/{info.state}
          </p>
          <p className="text-xs text-neutral-800">
            &copy; {new Date().getFullYear()} {info.salonName}.
          </p>
        </div>
      </footer>
    );
  }
  if (theme === "minimal") {
    return (
      <footer className="bg-gray-900 text-gray-600 py-10">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            {info.logoUrl ? (
              <img
                src={info.logoUrl}
                alt={info.salonName}
                className="h-6 w-6 rounded-full object-cover grayscale"
              />
            ) : (
              <Scissors size={16} />
            )}
            <span className="font-black uppercase tracking-tight text-sm">
              {info.salonName}
            </span>
          </div>
          <p className="text-xs text-center">
            {info.address} · {info.city}/{info.state}
          </p>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} {info.salonName}
          </p>
        </div>
      </footer>
    );
  }
  // rose (default)
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

function FloatingWhatsApp({
  href,
  theme,
}: {
  href: string;
  theme: LandingPageTheme;
}) {
  const cls =
    theme === "dark"
      ? "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center bg-neutral-900 border border-yellow-400/50 text-yellow-400 shadow-lg hover:bg-neutral-800 transition-colors"
      : theme === "minimal"
        ? "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center bg-gray-900 text-white shadow-lg hover:bg-black transition-colors"
        : "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-colors animate-bounce";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cls}
      style={theme === "rose" ? { animationDuration: "2s" } : {}}
      aria-label="Agendar pelo WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  );
}

function BackToTop({ theme }: { theme: LandingPageTheme }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!visible) return null;
  const cls =
    theme === "dark"
      ? "fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center border border-neutral-700 bg-neutral-950 text-neutral-400 shadow-lg hover:border-yellow-400/50 hover:text-yellow-400 transition-colors"
      : theme === "minimal"
        ? "fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center border border-gray-700 bg-gray-900 text-white shadow-lg hover:bg-black transition-colors"
        : "fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-700 transition-colors";
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cls}
      aria-label="Voltar ao topo"
    >
      <ArrowUp size={18} />
    </button>
  );
}

// ─── Landing Page (external) ──────────────────────────────────────────────────

export function LandingPage() {
  const [config, setConfig] = useState<LandingPageConfig | null>(() => loadConfig());
  const [serviceCategories, setServiceCategories] = useState<LandingServiceCategory[]>(
    () => loadServiceCategories(),
  );

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (
        event.key !== null &&
        event.key !== STORAGE_KEY &&
        event.key !== LANDING_SERVICE_CATEGORIES_KEY
      ) {
        return;
      }

      setConfig(loadConfig());
      setServiceCategories(loadServiceCategories());
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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

  const { businessInfo, slides } = config;
  const services = serviceCategories
    .filter(
      (category) =>
        category.showOnSite &&
        category.availableTypes.includes("SERVICE") &&
        (!config.showOnlyServicesWithPhotos || Boolean(category.imageUrl?.trim())),
    )
    .map((category) => ({
      id: String(category.id),
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      price: "",
    }));
  const theme: LandingPageTheme = config.theme ?? "rose";
  const wpHref = whatsappUrl(
    businessInfo.whatsappNumber,
    businessInfo.whatsappMessage,
  );

  return (
    <div
      className={cn(
        "min-h-screen font-sans",
        theme === "dark"
          ? "bg-neutral-950 text-white"
          : "bg-white text-gray-900",
      )}
    >
      {/* ── ROSE theme ── */}
      {theme === "rose" && (
        <>
          <RoseNavbar
            salonName={businessInfo.salonName}
            logoUrl={businessInfo.logoUrl}
            whatsappHref={wpHref}
          />
          <RoseHeroSlider slides={slides} whatsappHref={wpHref} />
          <RoseServicesSection services={services} whatsappHref={wpHref} />
          <RoseCtaBanner whatsappHref={wpHref} />
          <RoseAboutSection info={businessInfo} />
        </>
      )}

      {/* ── DARK theme ── */}
      {theme === "dark" && (
        <>
          <DarkNavbar
            salonName={businessInfo.salonName}
            logoUrl={businessInfo.logoUrl}
            whatsappHref={wpHref}
          />
          <DarkHeroSlider slides={slides} whatsappHref={wpHref} />
          <DarkServicesSection services={services} whatsappHref={wpHref} />
          <DarkCtaBanner whatsappHref={wpHref} />
          <DarkAboutSection info={businessInfo} />
        </>
      )}

      {/* ── MINIMAL theme ── */}
      {theme === "minimal" && (
        <>
          <MinimalNavbar
            salonName={businessInfo.salonName}
            logoUrl={businessInfo.logoUrl}
            whatsappHref={wpHref}
          />
          <MinimalHeroSlider
            slides={slides}
            whatsappHref={wpHref}
            salonName={businessInfo.salonName}
            tagline={businessInfo.tagline}
          />
          <MinimalServicesSection services={services} whatsappHref={wpHref} />
          <MinimalCtaBanner whatsappHref={wpHref} />
          <MinimalAboutSection info={businessInfo} />
        </>
      )}

      <Footer info={businessInfo} theme={theme} />
      <FloatingWhatsApp href={wpHref} theme={theme} />
      <BackToTop theme={theme} />
    </div>
  );
}
