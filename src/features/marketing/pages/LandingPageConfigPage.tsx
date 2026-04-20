import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
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
  Pencil,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Globe,
  Sparkles,
  Palette,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UpgradeNeededModal, PriceTableModal } from "@/features/billing/components/UpgradeModals";
import { PhotoUploader } from "@/components/shared/PhotoUploader";
import { SlideGalleryModal } from "@/features/marketing/components/SlideGalleryModal";
import { SlideSourcePickerPanel } from "@/features/marketing/components/SlideSourcePickerPanel";
import {
  useItemCategories,
  useCreateItemCategory,
  useItemCategoriesCatalog,
  useUpdateItemCategory,
} from "@/features/catalog/categories/api/useItemCategories";
import {
  useDeleteUpload,
  usePatchUpload,
  useUploadFile,
  useUploadsByType,
} from "@/features/uploads/api/useUploads";
import {
  getUploadViewUrl,
  type UploadResponse,
} from "@/features/uploads/types/uploadTypes";
import type {
  ItemCategoryAvailableType,
  ItemCategoryRequest,
  ItemCategoryResponse,
} from "@/features/catalog/categories/types/itemCategoryTypes";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  getDefaultPageSize,
  setDefaultPageSize,
} from "@/lib/pagination/pageSizePreference";
import type {
  LandingPageConfig,
  LandingPageTheme,
} from "@/features/marketing/types/marketingTypes";

// ─── Storage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "crm_landing_page_config";
const LANDING_SERVICE_CATEGORIES_KEY = "crm_landing_service_categories";

interface LandingServiceCategory {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  showOnSite: boolean;
  availableTypes: ItemCategoryAvailableType[];
}

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: LandingPageConfig = {
  theme: "rose",
  showOnlyServicesWithPhotos: false,
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
    if (raw) {
      const parsed = JSON.parse(raw) as LandingPageConfig;
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        showOnlyServicesWithPhotos: parsed.showOnlyServicesWithPhotos ?? false,
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config: LandingPageConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function saveServiceCategories(categories: LandingServiceCategory[]) {
  localStorage.setItem(LANDING_SERVICE_CATEGORIES_KEY, JSON.stringify(categories));
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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [priceTableOpen, setPriceTableOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [servicePage, setServicePage] = useState(0);
  const [servicePageSize, setServicePageSize] = useState(() => getDefaultPageSize());
  const [serviceRows, setServiceRows] = useState<ItemCategoryResponse[]>([]);
  const [serviceReorderingAction, setServiceReorderingAction] = useState<{
    id: number;
    direction: "up" | "down";
  } | null>(null);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceModalMode, setServiceModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingCategory, setEditingCategory] = useState<ItemCategoryResponse | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalShowOnSite, setModalShowOnSite] = useState(true);
  type SlideSourceTarget =
    | { mode: "new" }
    | { mode: "replace"; slideId: string };
  const [sourcePickerTarget, setSourcePickerTarget] =
    useState<SlideSourceTarget | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [previewSlideUrl, setPreviewSlideUrl] = useState<string | null>(null);
  const [isUploadingSlide, setIsUploadingSlide] = useState(false);
  const [slideUploads, setSlideUploads] = useState<UploadResponse[]>([]);
  const [slideDrafts, setSlideDrafts] = useState<
    Record<string, { title: string; subtitle: string }>
  >({});
  const [savingSlideIds, setSavingSlideIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [reorderingSlideAction, setReorderingSlideAction] = useState<{
    id: string;
    direction: "up" | "down";
  } | null>(null);
  const [removedSlideIds, setRemovedSlideIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [removingSlideIds, setRemovingSlideIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [collapsingSlideIds, setCollapsingSlideIds] = useState<Set<string>>(
    () => new Set(),
  );
  const slideFileInputRef = useRef<HTMLInputElement>(null);
  const uploadSlideMutation = useUploadFile();
  const deleteUploadMutation = useDeleteUpload();
  const patchUploadMutation = usePatchUpload();
  const {
    data: slidesFromApi = [],
    isLoading: isLoadingSlides,
    isError: isErrorSlides,
    refetch: refetchSlides,
  } = useUploadsByType({
    fileType: "SLIDE_OWN",
    enabled: activeTab === "slides",
  });

  const { data: serviceListData, isLoading: isLoadingServices, isError: isErrorServices, refetch: refetchServiceList } =
    useItemCategories({
      page: servicePage,
      size: servicePageSize,
      name: serviceSearch.trim() || undefined,
      availableTypes: "SERVICE",
    });
  const createCategoryMutation = useCreateItemCategory();
  const updateCategoryMutation = useUpdateItemCategory();
  const reorderCategoryMutation = useUpdateItemCategory();

  const { data: allCategories = [], refetch: refetchCategoriesCatalog } =
    useItemCategoriesCatalog();
  const serviceCategories = useMemo(
    () =>
      allCategories.filter((cat) => cat.availableTypes?.includes("SERVICE")),
    [allCategories],
  );
  const landingServiceCategories = useMemo(() => {
    const categories = serviceCategories
      .filter(
        (cat) =>
          !config.showOnlyServicesWithPhotos ||
          Boolean(cat.photo && cat.photo.trim()),
      )
      .map<LandingServiceCategory>((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description ?? "",
        imageUrl: cat.photo ?? "",
        showOnSite: cat.showOnSite ?? true,
        availableTypes: cat.availableTypes ?? [],
      }));

    return categories;
  }, [config.showOnlyServicesWithPhotos, serviceCategories]);

  // Persist on every save action
  function handleSave() {
    saveConfig(config);
    saveServiceCategories(landingServiceCategories);
    toast.success("Landing page salva com sucesso!");
  }

  // Initialize localStorage on first load if empty
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveConfig(DEFAULT_CONFIG);
    }
  }, []);

  useEffect(() => {
    saveServiceCategories(landingServiceCategories);
  }, [landingServiceCategories]);

  useEffect(() => {
    setServiceRows(serviceListData?.content ?? []);
  }, [serviceListData?.content]);

  // ── Theme ──
  function setTheme(theme: LandingPageTheme) {
    setConfig((prev) => ({ ...prev, theme }));
  }

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

  const orderedSlidesFromApi = useMemo(() => {
    const visibleSlides = slidesFromApi.filter(
      (slide) => !removedSlideIds.has(slide.id),
    );

    return [...visibleSlides].sort((a, b) => {
      const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [removedSlideIds, slidesFromApi]);

  useEffect(() => {
    setSlideUploads((prev) => {
      const apiIds = new Set(orderedSlidesFromApi.map((slide) => slide.id));
      const optimistic = prev.filter(
        (slide) => !apiIds.has(slide.id) && !removedSlideIds.has(slide.id),
      );
      return [...optimistic, ...orderedSlidesFromApi];
    });
  }, [orderedSlidesFromApi, removedSlideIds]);

  useEffect(() => {
    setSlideDrafts((prev) => {
      const next = { ...prev };

      for (const slide of slideUploads) {
        if (next[slide.id]) continue;

        const existing = config.slides.find((item) => item.id === slide.id);
        next[slide.id] = {
          title: slide.title ?? existing?.title ?? "",
          subtitle: slide.subtitle ?? existing?.subtitle ?? "",
        };
      }

      return next;
    });
  }, [config.slides, slideUploads]);

  async function removeSlide(id: string) {
    if (removingSlideIds.has(id)) return;

    setRemovingSlideIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      await deleteUploadMutation.mutateAsync({ id, fileType: "SLIDE_OWN" });

      setCollapsingSlideIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      window.setTimeout(() => {
        setSlideUploads((prev) => prev.filter((slide) => slide.id !== id));
        setRemovedSlideIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        setSlideDrafts((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setConfig((prev) => ({
          ...prev,
          slides: prev.slides.filter((slide) => slide.id !== id),
        }));
        setCollapsingSlideIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setRemovingSlideIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 260);
    } catch {
      toast.error("Não foi possível remover o slide. Tente novamente.");
      setRemovingSlideIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function moveSlide(id: string, direction: "up" | "down") {
    if (reorderingSlideAction) return;

    const current = [...slideUploads];
    const idx = current.findIndex((slide) => slide.id === id);
    if (idx < 0) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;

    const reordered = [...current];
    [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
    setSlideUploads(reordered);
    setReorderingSlideAction({ id, direction });

    try {
      for (let i = 0; i < reordered.length; i += 1) {
        const currentSlide = reordered[i];
        const draft = slideDrafts[currentSlide.id];
        await patchUploadMutation.mutateAsync({
          id: currentSlide.id,
          body: {
            fileType: "SLIDE_OWN",
            entityId: currentSlide.entityId,
            sortOrder: i,
            title: draft ? draft.title.trim() : (currentSlide.title ?? undefined),
            subtitle: draft
              ? draft.subtitle.trim()
              : (currentSlide.subtitle ?? undefined),
          },
          fileType: "SLIDE_OWN",
          entityId: currentSlide.entityId,
        });
      }

      void refetchSlides();
    } catch {
      setSlideUploads(current);
      toast.error("Não foi possível atualizar a ordem dos slides.");
    } finally {
      setReorderingSlideAction(null);
    }
  }

  function updateSlideDraft(
    id: string,
    field: "title" | "subtitle",
    value: string,
  ) {
    setSlideDrafts((prev) => ({
      ...prev,
      [id]: {
        title: prev[id]?.title ?? "",
        subtitle: prev[id]?.subtitle ?? "",
        [field]: value,
      },
    }));
  }

  async function saveSlideDetails(
    slide: UploadResponse,
    slideIndex: number,
    imageUrl: string,
  ) {
    if (savingSlideIds.has(slide.id)) return;

    setSavingSlideIds((prev) => {
      const next = new Set(prev);
      next.add(slide.id);
      return next;
    });

    const draft = slideDrafts[slide.id] ?? { title: "", subtitle: "" };
    const trimmedTitle = draft.title.trim();
    const trimmedSubtitle = draft.subtitle.trim();

    try {
      await patchUploadMutation.mutateAsync({
        id: slide.id,
        body: {
          fileType: "SLIDE_OWN",
          entityId: slide.entityId,
          sortOrder: slideIndex,
          title: trimmedTitle || undefined,
          subtitle: trimmedSubtitle || undefined,
        },
        fileType: "SLIDE_OWN",
        entityId: slide.entityId,
      });

      upsertSlideConfigFromUpload(
        slide.id,
        imageUrl,
        trimmedTitle,
        trimmedSubtitle,
      );

      void refetchSlides();
      toast.success("Slide salvo.");
    } catch {
      toast.error("Não foi possível salvar o slide.");
    } finally {
      setSavingSlideIds((prev) => {
        const next = new Set(prev);
        next.delete(slide.id);
        return next;
      });
    }
  }

  // Keep local config list aligned for landing preview
  function upsertSlideConfigFromUpload(
    id: string,
    imageUrl: string,
    title: string,
    subtitle: string,
  ) {
    setConfig((prev) => {
      const payload = {
        id,
        imageUrl,
        title,
        subtitle,
      };
      const exists = prev.slides.some((slide) => slide.id === id);

      return {
        ...prev,
        slides: exists
          ? prev.slides.map((slide) => (slide.id === id ? payload : slide))
          : [payload, ...prev.slides],
      };
    });
  }

  // ── Slide image source (gallery or local upload) ──
  const defaultTenantId = allCategories[0]?.tenantId ?? 1;

  function openSourcePickerForNew() {
    setSourcePickerTarget({ mode: "new" });
  }

  function openSourcePickerForSlide(slideId: string) {
    setSourcePickerTarget({ mode: "replace", slideId });
  }

  function applyPickedSlide(upload: UploadResponse) {
    const pickedUrl = getUploadViewUrl(upload);

    setSourcePickerTarget((current) => {
      if (!current) {
        setRemovedSlideIds((prev) => {
          const next = new Set(prev);
          next.delete(upload.id);
          return next;
        });
        setSlideUploads((prev) => [upload, ...prev.filter((s) => s.id !== upload.id)]);
        setSlideDrafts((prev) => ({
          ...prev,
          [upload.id]: {
            title: upload.title ?? "",
            subtitle: upload.subtitle ?? "",
          },
        }));
        return null;
      }

      if (current.mode === "new") {
        setRemovedSlideIds((prev) => {
          const next = new Set(prev);
          next.delete(upload.id);
          return next;
        });
        setSlideUploads((prev) => [upload, ...prev.filter((s) => s.id !== upload.id)]);
        setSlideDrafts((prev) => ({
          ...prev,
          [upload.id]: {
            title: upload.title ?? "",
            subtitle: upload.subtitle ?? "",
          },
        }));
        requestAnimationFrame(() => {
          document.getElementById(`slide-card-${upload.id}`)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
      } else {
        setSlideUploads((prev) =>
          prev.map((slide) =>
            slide.id === current.slideId
              ? {
                  ...upload,
                  sortOrder: slide.sortOrder ?? upload.sortOrder,
                  legend: upload.legend ?? slide.legend,
                  viewUrl: pickedUrl,
                }
              : slide,
          ),
        );
      }

      void refetchSlides();
      return null;
    });
  }

  function chooseFromGallery() {
    setSourcePickerTarget((current) => current ?? { mode: "new" });
    setGalleryOpen(true);
  }

  function triggerLocalUpload() {
    setSourcePickerTarget((current) => current ?? { mode: "new" });
    slideFileInputRef.current?.click();
  }

  async function handleSlideFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 10MB.");
      return;
    }

    setIsUploadingSlide(true);
    try {
      const uploaded = await uploadSlideMutation.mutateAsync({
        file,
        fileType: "SLIDE_OWN",
        tenantId: defaultTenantId,
        entityId: defaultTenantId,
        sortOrder: 0,
      });
      applyPickedSlide(uploaded);
      toast.success("Slide enviado com sucesso.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setIsUploadingSlide(false);
    }
  }

  async function handleSubmitServiceModal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = modalName.trim();
    if (!name) {
      toast.error("Nome da categoria obrigatorio.");
      return;
    }

    try {
      if (serviceModalMode === "edit" && editingCategory) {
        const mergedTypes = Array.from(
          new Set<ItemCategoryAvailableType>([
            ...(editingCategory.availableTypes ?? []),
            "SERVICE",
          ]),
        );

        const updateBody: ItemCategoryRequest = {
          tenantId: editingCategory.tenantId,
          name,
          description: modalDescription.trim() || null,
          availableTypes: mergedTypes,
          showOnSite: modalShowOnSite,
        };

        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          body: updateBody,
        });
        toast.success("Categoria de servico atualizada.");
      } else {
        const defaultTenantId = allCategories[0]?.tenantId ?? 1;
        const createBody: ItemCategoryRequest = {
          tenantId: defaultTenantId,
          name,
          description: modalDescription.trim() || null,
          availableTypes: ["SERVICE"],
          showOnSite: modalShowOnSite,
        };
        await createCategoryMutation.mutateAsync(createBody);
        toast.success("Categoria de servico criada.");
      }

      await Promise.all([refetchServiceList(), refetchCategoriesCatalog()]);
      setServiceModalOpen(false);
      setEditingCategory(null);
      setModalName("");
      setModalDescription("");
      setModalShowOnSite(true);
    } catch {
      toast.error("Erro ao salvar categoria de servico.");
    }
  }

  function openCreateServiceModal() {
    setServiceModalMode("create");
    setEditingCategory(null);
    setModalName("");
    setModalDescription("");
    setModalShowOnSite(true);
    setServiceModalOpen(true);
  }

  function openEditServiceModal(category: ItemCategoryResponse) {
    setServiceModalMode("edit");
    setEditingCategory(category);
    setModalName(category.name);
    setModalDescription(category.description ?? "");
    setModalShowOnSite(category.showOnSite ?? true);
    setServiceModalOpen(true);
  }

  async function moveServiceCategory(id: number, direction: "up" | "down") {
    if (serviceReorderingAction) return;

    const current = [...serviceRows];
    const idx = current.findIndex((category) => category.id === id);
    if (idx < 0) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return;

    const reordered = [...current];
    [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
    setServiceRows(reordered);
    setServiceReorderingAction({ id, direction });

    const pageOffset = servicePage * servicePageSize;

    try {
      for (let i = 0; i < reordered.length; i += 1) {
        const category = reordered[i];
        await reorderCategoryMutation.mutateAsync({
          id: category.id,
          body: {
            tenantId: category.tenantId,
            name: category.name,
            description: category.description ?? null,
            showOnSite: category.showOnSite ?? true,
            availableTypes:
              category.availableTypes?.length > 0
                ? category.availableTypes
                : ["SERVICE"],
            sortOrder: pageOffset + i,
          },
        });
      }

      await Promise.all([refetchServiceList(), refetchCategoriesCatalog()]);
    } catch {
      setServiceRows(current);
      toast.error("Não foi possível atualizar a ordem das categorias.");
    } finally {
      setServiceReorderingAction(null);
    }
  }

  // ── Landing page URL ──
  const landingPageUrl = `${window.location.origin}/landing`;

  const tabs = [
    { key: "info" as const, label: "Informações", icon: <Store size={14} /> },
    {
      key: "slides" as const,
      label: "Slides",
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
          {/* Theme Selector */}
          <Section title="Estilo Visual" icon={<Palette size={16} />}>
            <p className="text-xs text-muted-foreground -mt-1">
              Escolha o estilo visual da sua landing page pública.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  {
                    key: "rose" as LandingPageTheme,
                    label: "Rose",
                    description: "Alegre e feminino",
                    preview: (
                      <div className="h-20 rounded-lg overflow-hidden border border-gray-100">
                        <div className="h-10 bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white tracking-wide uppercase">
                            Hero
                          </span>
                        </div>
                        <div className="h-10 bg-white flex items-center justify-center gap-1">
                          <div className="h-5 w-5 rounded-sm bg-rose-100 border border-rose-200" />
                          <div className="h-5 w-5 rounded-sm bg-rose-100 border border-rose-200" />
                          <div className="h-5 w-5 rounded-sm bg-rose-100 border border-rose-200" />
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "dark" as LandingPageTheme,
                    label: "Dark Luxo",
                    description: "Elegante e sofisticado",
                    preview: (
                      <div className="h-20 rounded-lg overflow-hidden border border-neutral-700">
                        <div className="h-10 bg-neutral-950 flex items-center justify-center gap-1">
                          <div className="h-px w-6 bg-yellow-400/50" />
                          <Sparkles size={8} className="text-yellow-400/70" />
                          <div className="h-px w-6 bg-yellow-400/50" />
                        </div>
                        <div className="h-10 bg-neutral-900 flex items-center justify-center gap-1">
                          <div className="h-5 w-5 bg-neutral-800 border border-neutral-700" />
                          <div className="h-5 w-5 bg-neutral-800 border border-neutral-700" />
                          <div className="h-5 w-5 bg-neutral-800 border border-neutral-700" />
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "minimal" as LandingPageTheme,
                    label: "Minimal",
                    description: "Limpo e moderno",
                    preview: (
                      <div className="h-20 rounded-lg overflow-hidden border border-gray-200">
                        <div className="h-10 bg-white flex items-end px-3 pb-1">
                          <span className="text-[9px] font-black text-gray-900 tracking-tight uppercase">
                            Studio
                          </span>
                        </div>
                        <div className="h-10 bg-gray-50 flex items-center justify-center gap-px border-t border-gray-200">
                          <div className="h-5 w-5 bg-white border border-gray-200" />
                          <div className="h-5 w-5 bg-white border border-gray-200" />
                          <div className="h-5 w-5 bg-white border border-gray-200" />
                        </div>
                      </div>
                    ),
                  },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTheme(t.key)}
                  className={cn(
                    "relative flex flex-col gap-3 rounded-xl border-2 p-3 text-left transition-colors hover:border-primary/50",
                    config.theme === t.key
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card",
                  )}
                >
                  {config.theme === t.key && (
                    <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check size={11} className="text-primary-foreground" />
                    </div>
                  )}
                  {t.preview}
                  <div>
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Section>
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
            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground">
                Landing Page Pública
              </label>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => setUpgradeModalOpen(true)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-accent"
                >
                  Habilitar landing page
                </button>
                <span className="text-xs text-muted-foreground">{landingPageUrl}</span>
              </div>
            </div>
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
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Nesta área você gerencia os slides que aparecem no Site / Landing Page.
            </p>
            <button
              onClick={openSourcePickerForNew}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Novo Slide
            </button>
          </div>

          {isErrorSlides && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-10 text-center">
              <p className="text-sm text-destructive">
                Não foi possível carregar os slides do tenant.
              </p>
              <button
                type="button"
                onClick={() => void refetchSlides()}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-accent"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!isLoadingSlides && !isErrorSlides && slideUploads.length === 0 && (
            <div className="space-y-4 rounded-xl border border-dashed border-border bg-muted/20 p-5">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Image size={32} className="opacity-30" />
                <p className="text-sm">Nenhum slide próprio encontrado para este tenant.</p>
              </div>

              <SlideSourcePickerPanel
                title="Adicionar primeiro slide"
                description="Escolha da galeria SaaS ou faça upload para criar seus slides próprios."
                onChooseFromGallery={chooseFromGallery}
                onUpload={triggerLocalUpload}
                isUploading={isUploadingSlide}
              />
            </div>
          )}

          {slideUploads.map((slide, idx) => {
            const imageUrl = getUploadViewUrl(slide);
            const isRemoving = removingSlideIds.has(slide.id);
            const isCollapsing = collapsingSlideIds.has(slide.id);
            const isSaving = savingSlideIds.has(slide.id);
            const isMovingUp =
              reorderingSlideAction?.id === slide.id &&
              reorderingSlideAction.direction === "up";
            const isMovingDown =
              reorderingSlideAction?.id === slide.id &&
              reorderingSlideAction.direction === "down";
            const isReorderingAny = reorderingSlideAction !== null;
            const draft = slideDrafts[slide.id] ?? { title: "", subtitle: "" };
            return (
            <div
              key={slide.id}
              id={`slide-card-${slide.id}`}
              className={cn(
                "space-y-4 rounded-xl border border-border bg-card p-4 transition-all duration-300 ease-out",
                isCollapsing && "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  Slide {idx + 1}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openSourcePickerForSlide(slide.id)}
                    className="rounded-md p-2 hover:bg-accent"
                    title="Editar slide"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => void moveSlide(slide.id, "up")}
                    disabled={idx === 0 || isReorderingAny}
                    className="rounded-md p-2 hover:bg-accent disabled:opacity-30"
                    title="Mover para cima"
                  >
                    {isMovingUp ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ChevronUp size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => void moveSlide(slide.id, "down")}
                    disabled={idx === slideUploads.length - 1 || isReorderingAny}
                    className="rounded-md p-2 hover:bg-accent disabled:opacity-30"
                    title="Mover para baixo"
                  >
                    {isMovingDown ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => void removeSlide(slide.id)}
                    disabled={isRemoving}
                    className="rounded-md p-2 text-red-500 hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-950/30"
                    title="Remover"
                  >
                    {isRemoving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>

              {imageUrl ? (
                <button
                  type="button"
                  onClick={() => setPreviewSlideUrl(imageUrl)}
                  className="group relative block w-full overflow-hidden rounded-lg border border-border"
                  title="Visualizar imagem"
                >
                  <img
                    src={imageUrl}
                    alt={`Slide ${idx + 1}`}
                    className="h-48 w-full object-cover"
                  />

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/35">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-black/50 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Eye size={15} />
                      Clique para visualizar
                    </div>
                  </div>
                </button>
              ) : (
                <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
                  <div className="flex flex-col items-center gap-1">
                    <Image size={24} className="opacity-40" />
                    <span className="text-xs">Nenhuma imagem selecionada</span>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Título"
                  value={draft.title}
                  onChange={(v) => updateSlideDraft(slide.id, "title", v)}
                  placeholder="Digite o título..."
                />
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Subtítulo
                  </label>
                  <textarea
                    value={draft.subtitle}
                    onChange={(e) => updateSlideDraft(slide.id, "subtitle", e.target.value)}
                    placeholder="Digite a descrição..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void saveSlideDetails(slide, idx, imageUrl)}
                  disabled={isSaving || isRemoving}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-muted/60 px-4 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Salvar
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* ─── Tab: Services ─── */}
      {activeTab === "services" && (
        <div className="space-y-4">
          {serviceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {serviceModalMode === "edit"
                        ? "Editar Categoria de Servico"
                        : "Nova Categoria de Servico"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setServiceModalOpen(false)}
                    className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
                  >
                    Fechar
                  </button>
                </div>

                {serviceModalMode === "edit" && editingCategory && (
                  <div className="mb-4 rounded-2xl border border-border bg-card p-4">
                    <PhotoUploader
                      fileType="CATEGORY"
                      tenantId={editingCategory.tenantId}
                      entityId={editingCategory.id}
                      fallbackUrl={editingCategory.photo ?? null}
                      disabled={
                        createCategoryMutation.isPending ||
                        updateCategoryMutation.isPending
                      }
                      displayName={editingCategory.name}
                      shape="square"
                    />
                  </div>
                )}

                {serviceModalMode === "create" && (
                  <div className="mb-4 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    Salve a categoria para habilitar o envio de foto.
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmitServiceModal}>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Nome <span className="text-destructive">*</span>
                    </label>
                    <input
                      value={modalName}
                      onChange={(e) => setModalName(e.target.value)}
                      placeholder="Ex: Corte e finalizacao"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Descricao
                    </label>
                    <textarea
                      value={modalDescription}
                      onChange={(e) => setModalDescription(e.target.value)}
                      placeholder="Descreva a categoria"
                      rows={3}
                      className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={modalShowOnSite}
                        onChange={(e) => setModalShowOnSite(e.target.checked)}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                      Exibir no site/landing page
                    </label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setServiceModalOpen(false)}
                      className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={
                        createCategoryMutation.isPending ||
                        updateCategoryMutation.isPending
                      }
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      {createCategoryMutation.isPending ||
                      updateCategoryMutation.isPending
                        ? "Salvando..."
                        : serviceModalMode === "edit"
                          ? "Salvar Categoria"
                          : "Criar Categoria"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Categorias de Servico</p>
              </div>
              <button
                type="button"
                onClick={openCreateServiceModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                <Plus size={13} />
                Nova Categoria
              </button>
            </div>

            <div className="mt-4">
              <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.showOnlyServicesWithPhotos ?? false}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    showOnlyServicesWithPhotos: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Exibir no site / landing page apenas servicos com fotos
              </label>
            </div>
          </div>

          <div className="relative max-w-sm">
            <input
              type="text"
              value={serviceSearch}
              onChange={(e) => {
                setServiceSearch(e.target.value);
                setServicePage(0);
              }}
              placeholder="Buscar categoria por nome..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Thumb
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Nome
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                    Descricao
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                    Exibir no site
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoadingServices ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      </td>
                    </tr>
                  ))
                ) : isErrorServices ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-destructive"
                    >
                      Erro ao carregar categorias de servico.
                    </td>
                  </tr>
                ) : serviceRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Globe size={32} className="text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">
                          Nenhuma categoria de servico encontrada.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  serviceRows.map((category, index) => {
                    const isMovingUp =
                      serviceReorderingAction?.id === category.id &&
                      serviceReorderingAction.direction === "up";
                    const isMovingDown =
                      serviceReorderingAction?.id === category.id &&
                      serviceReorderingAction.direction === "down";
                    const isReorderingService = serviceReorderingAction !== null;

                    return (
                    <tr
                      key={category.id}
                      className="cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => openEditServiceModal(category)}
                    >
                      <td className="px-4 py-3">
                        {category.photo ? (
                          <img
                            src={category.photo}
                            alt={category.name}
                            className="h-10 w-10 rounded-md border border-border object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted">
                            <Image size={14} className="text-muted-foreground" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{category.name}</div>
                        <div className="mt-1 md:hidden">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                              category.showOnSite
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {category.showOnSite ? "Exibir no site" : "Nao exibir no site"}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {category.description?.trim() || (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                            category.showOnSite
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {category.showOnSite ? "Exibir no site" : "Nao exibir no site"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void moveServiceCategory(category.id, "up");
                            }}
                            disabled={index === 0 || isReorderingService}
                            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40"
                            title="Mover para cima"
                          >
                            {isMovingUp ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <ChevronUp size={16} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void moveServiceCategory(category.id, "down");
                            }}
                            disabled={index === serviceRows.length - 1 || isReorderingService}
                            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40"
                            title="Mover para baixo"
                          >
                            {isMovingDown ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditServiceModal(category);
                            }}
                            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            title="Abrir"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>

            <TablePagination
              page={servicePage}
              totalPages={serviceListData?.totalPages ?? 0}
              totalElements={serviceListData?.totalElements ?? 0}
              pageSize={servicePageSize}
              onPageSizeChange={(size) => {
                setDefaultPageSize(size);
                setServicePageSize(size);
                setServicePage(0);
              }}
              onFirst={() => setServicePage(0)}
              onPrev={() => setServicePage((p) => Math.max(0, p - 1))}
              onNext={() => setServicePage((p) => p + 1)}
              onLast={() =>
                setServicePage(Math.max((serviceListData?.totalPages ?? 1) - 1, 0))
              }
            />
          </div>

          {landingServiceCategories.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-xs text-muted-foreground">
              Nenhuma categoria qualificada para exibir na landing no momento.
            </div>
          )}
        </div>
      )}

      {/* Bottom save bar */}
      {activeTab === "info" && (
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
      )}

      <UpgradeNeededModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onViewPlans={() => {
          setUpgradeModalOpen(false);
          setPriceTableOpen(true);
        }}
      />

      <PriceTableModal open={priceTableOpen} onClose={() => setPriceTableOpen(false)} />

      <input
        ref={slideFileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => void handleSlideFileChange(e)}
        className="hidden"
      />

      {sourcePickerTarget !== null && !galleryOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md">
            <SlideSourcePickerPanel
              title={
                sourcePickerTarget.mode === "new"
                  ? "Adicionar novo slide"
                  : "Trocar imagem do slide"
              }
              description="Como você quer adicionar a imagem?"
              onChooseFromGallery={chooseFromGallery}
              onUpload={triggerLocalUpload}
              isUploading={isUploadingSlide}
              onCancel={() => setSourcePickerTarget(null)}
            />
          </div>
        </div>
      )}

      <SlideGalleryModal
        open={galleryOpen}
        onClose={() => {
          setGalleryOpen(false);
          setSourcePickerTarget(null);
        }}
        tenantId={defaultTenantId}
        entityId={defaultTenantId}
        onPicked={(upload) => {
          applyPickedSlide(upload);
        }}
      />

      {previewSlideUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <header className="flex items-center justify-end border-b border-border px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setPreviewSlideUrl(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent"
              aria-label="Fechar visualização"
            >
              <X size={14} />
              Fechar
            </button>
          </header>

          <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
            <img
              src={previewSlideUrl}
              alt="Visualização do slide"
              className="max-h-full w-full max-w-6xl rounded-xl border border-border object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
