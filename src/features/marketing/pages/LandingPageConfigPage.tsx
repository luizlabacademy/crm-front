import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Image,
  Store,
  Phone,
  MapPin,
  Instagram,
  MessageCircle,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type {
  LandingPageConfig,
  LandingPageSlide,
  LandingPageService,
} from "@/features/marketing/types/marketingTypes";

// ─── Storage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "crm_landing_page_config";

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: LandingPageConfig = {
  businessInfo: {
    salonName: "Studio Belle",
    tagline: "Beleza, Cuidado e Bem-Estar",
    description:
      "Somos um salão dedicado a realçar sua beleza natural. Oferecemos os melhores serviços de corte, coloração, tratamentos capilares, manicure, pedicure e muito mais.",
    phone: "(11) 99999-9999",
    whatsappNumber: "5511999999999",
    whatsappMessage: "Olá! Gostaria de agendar um horário.",
    email: "contato@studiobelle.com.br",
    address: "Rua das Flores, 123 - Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01000-000",
    instagramUrl: "https://instagram.com/studiobelle",
    facebookUrl: "https://facebook.com/studiobelle",
    logoUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop",
  },
  slides: [
    {
      id: "slide-1",
      imageUrl:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=500&fit=crop",
      title: "Transforme seu Visual",
      subtitle: "Agende agora e ganhe 10% de desconto na primeira visita",
    },
    {
      id: "slide-2",
      imageUrl:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=500&fit=crop",
      title: "Tratamentos Exclusivos",
      subtitle: "Conheça nossos tratamentos capilares premium",
    },
    {
      id: "slide-3",
      imageUrl:
        "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1200&h=500&fit=crop",
      title: "Manicure & Pedicure",
      subtitle: "Unhas perfeitas para todas as ocasiões",
    },
  ],
  services: [
    {
      id: "svc-1",
      name: "Corte Feminino",
      description:
        "Corte personalizado de acordo com o formato do rosto e estilo pessoal.",
      imageUrl:
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop",
      price: "R$ 89,90",
    },
    {
      id: "svc-2",
      name: "Coloração",
      description:
        "Mechas, luzes, balayage e coloração completa com produtos de alta qualidade.",
      imageUrl:
        "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=300&fit=crop",
      price: "A partir de R$ 150,00",
    },
    {
      id: "svc-3",
      name: "Tratamento Capilar",
      description:
        "Hidratação profunda, cauterização e reconstrução para cabelos danificados.",
      imageUrl:
        "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=300&fit=crop",
      price: "R$ 120,00",
    },
    {
      id: "svc-4",
      name: "Manicure & Pedicure",
      description:
        "Cuidados completos para suas unhas com esmaltação comum ou em gel.",
      imageUrl:
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop",
      price: "R$ 45,00",
    },
    {
      id: "svc-5",
      name: "Escova Progressiva",
      description: "Alinhamento dos fios com efeito liso natural e duradouro.",
      imageUrl:
        "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=300&fit=crop",
      price: "R$ 200,00",
    },
    {
      id: "svc-6",
      name: "Design de Sobrancelhas",
      description:
        "Modelagem profissional com henna ou tintura para realçar o olhar.",
      imageUrl:
        "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=300&fit=crop",
      price: "R$ 35,00",
    },
  ],
};

// ─── Load / Save helpers ──────────────────────────────────────────────────────

function loadConfig(): LandingPageConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LandingPageConfig;
  } catch {
    // ignore
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config: LandingPageConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className="text-primary">{icon}</span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// ─── Input helpers ────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}) {
  const cls =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cn(cls, "resize-none")}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export function LandingPageConfigPage() {
  const [config, setConfig] = useState<LandingPageConfig>(loadConfig);
  const [activeTab, setActiveTab] = useState<"info" | "slides" | "services">(
    "info",
  );

  // Persist on every save action
  function handleSave() {
    saveConfig(config);
    toast.success("Landing page salva com sucesso!");
  }

  // Initialize localStorage on first load if empty
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveConfig(DEFAULT_CONFIG);
    }
  }, []);

  // ── Business info updaters ──
  function updateBiz<K extends keyof LandingPageConfig["businessInfo"]>(
    key: K,
    value: LandingPageConfig["businessInfo"][K],
  ) {
    setConfig((prev) => ({
      ...prev,
      businessInfo: { ...prev.businessInfo, [key]: value },
    }));
  }

  // ── Slides ──
  function addSlide() {
    const slide: LandingPageSlide = {
      id: `slide-${Date.now()}`,
      imageUrl: "",
      title: "",
      subtitle: "",
    };
    setConfig((prev) => ({ ...prev, slides: [...prev.slides, slide] }));
  }

  function updateSlide(
    id: string,
    field: keyof LandingPageSlide,
    value: string,
  ) {
    setConfig((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === id ? { ...s, [field]: value } : s,
      ),
    }));
  }

  function removeSlide(id: string) {
    setConfig((prev) => ({
      ...prev,
      slides: prev.slides.filter((s) => s.id !== id),
    }));
  }

  function moveSlide(id: string, direction: "up" | "down") {
    setConfig((prev) => {
      const idx = prev.slides.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const newSlides = [...prev.slides];
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= newSlides.length) return prev;
      [newSlides[idx], newSlides[targetIdx]] = [
        newSlides[targetIdx],
        newSlides[idx],
      ];
      return { ...prev, slides: newSlides };
    });
  }

  // ── Services ──
  function addService() {
    const svc: LandingPageService = {
      id: `svc-${Date.now()}`,
      name: "",
      description: "",
      imageUrl: "",
      price: "",
    };
    setConfig((prev) => ({ ...prev, services: [...prev.services, svc] }));
  }

  function updateService(
    id: string,
    field: keyof LandingPageService,
    value: string,
  ) {
    setConfig((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === id ? { ...s, [field]: value } : s,
      ),
    }));
  }

  function removeService(id: string) {
    setConfig((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
  }

  // ── Landing page URL ──
  const landingPageUrl = `${window.location.origin}/landing`;

  const tabs = [
    { key: "info" as const, label: "Informações", icon: <Store size={14} /> },
    {
      key: "slides" as const,
      label: "Slides / Banner",
      icon: <Image size={14} />,
    },
    { key: "services" as const, label: "Serviços", icon: <Globe size={14} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Landing Page</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure a página de apresentação do seu negócio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/landing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ExternalLink size={14} />
            Visualizar
          </a>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Save size={14} />
            Salvar
          </button>
        </div>
      </div>

      {/* Link to external page */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <Globe size={14} className="text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">Link público:</span>
        <a
          href={landingPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary underline break-all"
        >
          {landingPageUrl}
        </a>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab: Info ─── */}
      {activeTab === "info" && (
        <div className="space-y-6">
          <Section title="Dados do Negócio" icon={<Store size={16} />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nome do Salão"
                value={config.businessInfo.salonName}
                onChange={(v) => updateBiz("salonName", v)}
                placeholder="Ex: Studio Belle"
              />
              <Field
                label="Slogan / Tagline"
                value={config.businessInfo.tagline}
                onChange={(v) => updateBiz("tagline", v)}
                placeholder="Ex: Beleza, Cuidado e Bem-Estar"
              />
            </div>
            <Field
              label="Descrição"
              value={config.businessInfo.description}
              onChange={(v) => updateBiz("description", v)}
              placeholder="Descreva o negócio..."
              multiline
            />
            <Field
              label="URL do Logo"
              value={config.businessInfo.logoUrl}
              onChange={(v) => updateBiz("logoUrl", v)}
              placeholder="https://..."
            />
            {config.businessInfo.logoUrl && (
              <div className="flex items-center gap-3">
                <img
                  src={config.businessInfo.logoUrl}
                  alt="Logo"
                  className="h-16 w-16 rounded-lg object-cover border border-border"
                />
                <span className="text-xs text-muted-foreground">
                  Preview do logo
                </span>
              </div>
            )}
          </Section>

          <Section title="Contato & WhatsApp" icon={<Phone size={16} />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Telefone"
                value={config.businessInfo.phone}
                onChange={(v) => updateBiz("phone", v)}
                placeholder="(11) 99999-9999"
              />
              <Field
                label="Número WhatsApp (com DDI, sem sinais)"
                value={config.businessInfo.whatsappNumber}
                onChange={(v) => updateBiz("whatsappNumber", v)}
                placeholder="5511999999999"
              />
            </div>
            <Field
              label="Mensagem padrão do WhatsApp"
              value={config.businessInfo.whatsappMessage}
              onChange={(v) => updateBiz("whatsappMessage", v)}
              placeholder="Olá! Gostaria de agendar um horário."
              multiline
            />
            <Field
              label="E-mail"
              value={config.businessInfo.email}
              onChange={(v) => updateBiz("email", v)}
              placeholder="contato@seudominio.com.br"
              type="email"
            />
          </Section>

          <Section title="Endereço" icon={<MapPin size={16} />}>
            <Field
              label="Endereço"
              value={config.businessInfo.address}
              onChange={(v) => updateBiz("address", v)}
              placeholder="Rua, número - bairro"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Cidade"
                value={config.businessInfo.city}
                onChange={(v) => updateBiz("city", v)}
                placeholder="São Paulo"
              />
              <Field
                label="Estado"
                value={config.businessInfo.state}
                onChange={(v) => updateBiz("state", v)}
                placeholder="SP"
              />
              <Field
                label="CEP"
                value={config.businessInfo.zipCode}
                onChange={(v) => updateBiz("zipCode", v)}
                placeholder="01000-000"
              />
            </div>
          </Section>

          <Section title="Redes Sociais" icon={<Instagram size={16} />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Instagram"
                value={config.businessInfo.instagramUrl}
                onChange={(v) => updateBiz("instagramUrl", v)}
                placeholder="https://instagram.com/seuperfil"
              />
              <Field
                label="Facebook"
                value={config.businessInfo.facebookUrl}
                onChange={(v) => updateBiz("facebookUrl", v)}
                placeholder="https://facebook.com/suapagina"
              />
            </div>
          </Section>
        </div>
      )}

      {/* ─── Tab: Slides ─── */}
      {activeTab === "slides" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Adicione imagens para o banner principal. Se houver mais de uma,
              será exibido como slide automático.
            </p>
            <button
              onClick={addSlide}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus size={13} />
              Novo Slide
            </button>
          </div>

          {config.slides.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Image size={32} className="opacity-30" />
              <p className="text-sm">Nenhum slide adicionado.</p>
            </div>
          )}

          {config.slides.map((slide, idx) => (
            <div
              key={slide.id}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GripVertical size={14} className="text-muted-foreground" />
                  Slide {idx + 1}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveSlide(slide.id, "up")}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-accent disabled:opacity-30"
                    title="Mover para cima"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => moveSlide(slide.id, "down")}
                    disabled={idx === config.slides.length - 1}
                    className="p-1 rounded hover:bg-accent disabled:opacity-30"
                    title="Mover para baixo"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => removeSlide(slide.id)}
                    className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <Field
                label="URL da Imagem"
                value={slide.imageUrl}
                onChange={(v) => updateSlide(slide.id, "imageUrl", v)}
                placeholder="https://..."
              />

              {slide.imageUrl && (
                <img
                  src={slide.imageUrl}
                  alt={`Slide ${idx + 1}`}
                  className="h-40 w-full rounded-lg object-cover border border-border"
                />
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Título"
                  value={slide.title}
                  onChange={(v) => updateSlide(slide.id, "title", v)}
                  placeholder="Ex: Transforme seu Visual"
                />
                <Field
                  label="Subtítulo"
                  value={slide.subtitle}
                  onChange={(v) => updateSlide(slide.id, "subtitle", v)}
                  placeholder="Ex: Agende agora e ganhe 10% de desconto"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Tab: Services ─── */}
      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Adicione os serviços oferecidos com imagem, descrição e preço.
            </p>
            <button
              onClick={addService}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus size={13} />
              Novo Serviço
            </button>
          </div>

          {config.services.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Globe size={32} className="opacity-30" />
              <p className="text-sm">Nenhum serviço adicionado.</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {config.services.map((svc) => (
              <div
                key={svc.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                {svc.imageUrl && (
                  <img
                    src={svc.imageUrl}
                    alt={svc.name}
                    className="h-36 w-full object-cover"
                  />
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {svc.name || "Novo Serviço"}
                    </span>
                    <button
                      onClick={() => removeService(svc.id)}
                      className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <Field
                    label="Nome"
                    value={svc.name}
                    onChange={(v) => updateService(svc.id, "name", v)}
                    placeholder="Ex: Corte Feminino"
                  />
                  <Field
                    label="Descrição"
                    value={svc.description}
                    onChange={(v) => updateService(svc.id, "description", v)}
                    placeholder="Descrição breve do serviço..."
                    multiline
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="URL da Imagem"
                      value={svc.imageUrl}
                      onChange={(v) => updateService(svc.id, "imageUrl", v)}
                      placeholder="https://..."
                    />
                    <Field
                      label="Preço"
                      value={svc.price}
                      onChange={(v) => updateService(svc.id, "price", v)}
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom save bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MessageCircle size={14} />
          <span>
            O botão de agendamento direciona para o WhatsApp:{" "}
            <strong>{config.businessInfo.whatsappNumber || "—"}</strong>
          </span>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Save size={14} />
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}
