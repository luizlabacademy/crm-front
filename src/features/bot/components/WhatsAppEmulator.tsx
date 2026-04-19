import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  BOT_OPERATION,
  BOT_OPTION_TYPE,
  type BotFlowState,
  type BotOperation,
  type MenuOption,
} from "../types";
import botSchedulingJourneyMock from "@/mocks/GET-bot--scheduling-journey.json";

interface ConversationTurn {
  type: "bot" | "user";
  text?: string;
  label?: string;
}

type BookingCategory = "hair" | "nails" | "all";
type BookingStep = "service" | "day" | "time" | "professional" | "confirmation";

interface BookingJourneyState {
  category: BookingCategory;
  step: BookingStep;
  service?: string;
  day?: string;
  time?: string;
  professional?: string;
  visibleTimesCount?: number;
}

type BookingFlowMock = {
  responseBody: {
    dayPrompt: string;
    timePrompt: string;
    professionalPrompt: string;
    days: string[];
    times: string[];
    categories: Record<
      BookingCategory,
      {
        displayName: string;
        servicePrompt: string;
        services: string[];
        professionals: string[];
      }
    >;
  };
};

const bookingFlowMock = botSchedulingJourneyMock as BookingFlowMock;

const BOOKING_CATEGORY_BY_OPERATION: Partial<
  Record<BotOperation, BookingCategory>
> = {
  [BOT_OPERATION.LIST_HAIR_SERVICES]: "hair",
  [BOT_OPERATION.LIST_NAIL_SERVICES]: "nails",
  [BOT_OPERATION.LIST_ALL_SERVICES]: "all",
};

const capitalizeFirst = (value: string) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const getNextSevenDaysLabels = () => {
  const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
  });
  const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long" });
  const baseDate = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + index);

    const weekday = capitalizeFirst(weekdayFormatter.format(date));
    const month = capitalizeFirst(monthFormatter.format(date));
    const day = date.getDate();

    return `${weekday}, ${day} de ${month}`;
  });
};

const getHalfHourTimeSlots = () => {
  const slots: string[] = [];

  for (let hour = 9; hour <= 22; hour += 1) {
    const hourLabel = hour.toString().padStart(2, "0");
    slots.push(`${hourLabel}:00`);

    if (hour < 22) {
      slots.push(`${hourLabel}:30`);
    }
  }

  return slots;
};

export function WhatsAppEmulator({ flowState }: { flowState: BotFlowState }) {
  const [currentMenuRef, setCurrentMenuRef] = useState<string | null>(
    flowState.initialMenuRef,
  );
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [bookingJourney, setBookingJourney] =
    useState<BookingJourneyState | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const handleInitialize = () => {
    const startMenu = flowState.menus.find(
      (m) => m.ref === flowState.initialMenuRef,
    );
    if (startMenu) {
      setCurrentMenuRef(startMenu.ref);
      setBookingJourney(null);
      setConversation([{ type: "bot", text: startMenu.question }]);
    }
  };

  const getOperationResponse = (operation: MenuOption["operation"]) => {
    switch (operation) {
      case BOT_OPERATION.LIST_AVAILABLE_TIMES:
        return "Horários disponíveis hoje: 10:00, 11:30, 14:00 e 16:30.";
      case BOT_OPERATION.LIST_AVAILABLE_PROFESSIONALS:
        return "Profissionais disponíveis: Ana, Bruna e Carla.";
      case BOT_OPERATION.FINISH_SCHEDULING:
        return "Perfeito! Vamos finalizar seu agendamento. Informe seu nome completo.";
      case BOT_OPERATION.CANCEL_SCHEDULING:
        return "Tudo bem. Para cancelar, informe o número do seu agendamento.";
      default:
        return "Operação executada com sucesso.";
    }
  };

  const getBookingOptions = (journey: BookingJourneyState) => {
    const categoryData =
      bookingFlowMock.responseBody.categories[journey.category];

    switch (journey.step) {
      case "service":
        return categoryData.services;
      case "day":
        return getNextSevenDaysLabels();
      case "time": {
        const allTimeSlots = getHalfHourTimeSlots();
        const visibleCount = Math.min(
          journey.visibleTimesCount ?? 6,
          allTimeSlots.length,
        );
        const visibleSlots = allTimeSlots.slice(0, visibleCount);

        if (visibleCount < allTimeSlots.length) {
          return [...visibleSlots, "Ver mais horários"];
        }

        return visibleSlots;
      }
      case "professional":
        return categoryData.professionals;
      case "confirmation":
        return ["Confirmar agendamento", "Voltar ao início"];
      default:
        return [];
    }
  };

  const startBookingJourney = (
    category: BookingCategory,
    newConversation: ConversationTurn[],
  ) => {
    const categoryData =
      bookingFlowMock.responseBody.categories[category];

    setBookingJourney({
      category,
      step: "service",
    });
    setConversation([
      ...newConversation,
      {
        type: "bot",
        text: categoryData.servicePrompt,
      },
    ]);
  };

  const handleBookingChoiceClick = (choice: string) => {
    if (!bookingJourney) {
      return;
    }

    const nextConversation: ConversationTurn[] = [
      ...conversation,
      { type: "user", label: choice },
    ];

    if (bookingJourney.step === "service") {
      setBookingJourney({ ...bookingJourney, service: choice, step: "day" });
      setConversation([
        ...nextConversation,
        { type: "bot", text: bookingFlowMock.responseBody.dayPrompt },
      ]);
      return;
    }

    if (bookingJourney.step === "day") {
      setBookingJourney({
        ...bookingJourney,
        day: choice,
        step: "time",
        visibleTimesCount: 6,
      });
      setConversation([
        ...nextConversation,
        { type: "bot", text: `Escolha um horário de ${choice}:` },
      ]);
      return;
    }

    if (bookingJourney.step === "time") {
      if (choice === "Ver mais horários") {
        setBookingJourney({
          ...bookingJourney,
          visibleTimesCount: (bookingJourney.visibleTimesCount ?? 6) + 6,
        });
        return;
      }

      setBookingJourney({
        ...bookingJourney,
        time: choice,
        step: "professional",
      });
      setConversation([
        ...nextConversation,
        { type: "bot", text: bookingFlowMock.responseBody.professionalPrompt },
      ]);
      return;
    }

    if (bookingJourney.step === "professional") {
      const categoryData =
        bookingFlowMock.responseBody.categories[bookingJourney.category];
      const nextJourney: BookingJourneyState = {
        ...bookingJourney,
        professional: choice,
        step: "confirmation",
      };

      setBookingJourney(nextJourney);
      setConversation([
        ...nextConversation,
        {
          type: "bot",
          text:
            "Resumo do agendamento:\n" +
            `Categoria: ${categoryData.displayName}\n` +
            `Serviço: ${nextJourney.service}\n` +
            `Dia: ${nextJourney.day}\n` +
            `Horário: ${nextJourney.time}\n` +
            `Profissional: ${nextJourney.professional}\n\n` +
            "Deseja confirmar?",
        },
      ]);
      return;
    }

    if (bookingJourney.step === "confirmation") {
      if (choice === "Confirmar agendamento") {
        setBookingJourney(null);
        setCurrentMenuRef(null);
        setConversation([
          ...nextConversation,
          {
            type: "bot",
            text: "Agendamento confirmado com sucesso!",
          },
        ]);
        return;
      }

      const startMenu = flowState.menus.find(
        (menu) => menu.ref === flowState.initialMenuRef,
      );

      setBookingJourney(null);
      setCurrentMenuRef(flowState.initialMenuRef);
      setConversation([
        ...nextConversation,
        ...(startMenu
          ? [{ type: "bot" as const, text: startMenu.question }]
          : []),
      ]);
    }
  };

  const handleOptionClick = (option: MenuOption) => {
    const newConversation: ConversationTurn[] = [
      ...conversation,
      { type: "user", label: option.label },
    ];

    if (option.type === BOT_OPTION_TYPE.OPERATION) {
      const category = option.operation
        ? BOOKING_CATEGORY_BY_OPERATION[option.operation]
        : undefined;

      if (category) {
        startBookingJourney(category, newConversation);
        return;
      }

      newConversation.push({
        type: "bot",
        text: getOperationResponse(option.operation),
      });
      setConversation(newConversation);
      return;
    }

    if (option.nextMenuRef) {
      const nextMenu = flowState.menus.find((m) => m.ref === option.nextMenuRef);
      if (nextMenu) {
        newConversation.push({ type: "bot", text: nextMenu.question });
        setConversation(newConversation);
        setCurrentMenuRef(option.nextMenuRef);
        return;
      }
    }

    setConversation(newConversation);
    setCurrentMenuRef(null);
  };

  const currentMenu = flowState.menus.find((m) => m.ref === currentMenuRef);
  const hasBackToMainOption =
    currentMenu?.options.some(
      (option) =>
        option.type === BOT_OPTION_TYPE.SUBMENU &&
        option.nextMenuRef === flowState.initialMenuRef,
    ) ?? false;

  const optionsWithBackToMain: MenuOption[] =
    currentMenu &&
    currentMenu.ref !== flowState.initialMenuRef &&
    !hasBackToMainOption
      ? [
          ...currentMenu.options,
          {
            label: "Voltar ao menu principal",
            type: BOT_OPTION_TYPE.SUBMENU,
            nextMenuRef: flowState.initialMenuRef,
            operation: null,
          },
        ]
      : (currentMenu?.options ?? []);

  const bookingOptions = bookingJourney ? getBookingOptions(bookingJourney) : [];

  useEffect(() => {
    const chatContainer = chatScrollRef.current;
    if (!chatContainer) {
      return;
    }

    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }, [conversation, currentMenuRef]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-transparent">
      <div className="relative h-full w-full max-w-[390px] rounded-[42px] bg-neutral-900 p-[10px] shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
        <div className="absolute left-[-3px] top-28 h-10 w-1 rounded-l-full bg-neutral-700/70" />
        <div className="absolute left-[-3px] top-44 h-16 w-1 rounded-l-full bg-neutral-700/70" />
        <div className="absolute right-[-3px] top-36 h-20 w-1 rounded-r-full bg-neutral-700/70" />

        <div className="relative flex h-full flex-col overflow-hidden rounded-[34px] border border-black/30 bg-[#0b141a]">
          <div className="pointer-events-none absolute left-1/2 top-2 h-6 w-28 -translate-x-1/2 rounded-full bg-black/85" />

          <div className="mt-6 flex items-center gap-3 border-b border-white/10 bg-[#111b21] px-4 py-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold uppercase tracking-wide text-white">
              sb
            </div>
            <div>
              <div className="text-sm font-semibold">Studio Belle</div>
              <div className="text-xs text-emerald-300">Online</div>
            </div>
          </div>

          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto space-y-3 bg-[#0b141a] bg-[radial-gradient(circle_at_top_left,rgba(22,50,58,0.6),transparent_45%)] p-4 [scrollbar-width:thin] [scrollbar-color:rgba(134,150,160,0.6)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#8696a0]/60 hover:[&::-webkit-scrollbar-thumb]:bg-[#8696a0]/80"
          >
            {conversation.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <button
                  onClick={handleInitialize}
                  className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-400"
                >
                  Iniciar conversa
                </button>
              </div>
            ) : (
              <>
                {conversation.map((turn, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex",
                      turn.type === "bot" ? "justify-start" : "justify-end",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                        turn.type === "bot"
                          ? "rounded-tl-sm bg-[#202c33] text-[#e9edef]"
                          : "rounded-tr-sm bg-[#005c4b] text-white",
                      )}
                    >
                      {turn.text || turn.label}
                    </div>
                  </div>
                ))}

                {bookingJourney && bookingOptions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {bookingOptions.map((optionLabel, idx) => (
                      <button
                        key={`${bookingJourney.step}-${idx}`}
                        onClick={() => handleBookingChoiceClick(optionLabel)}
                        className="w-full rounded-xl border border-emerald-400/60 bg-[#111b21] px-4 py-2.5 text-left text-xs font-medium text-emerald-300 transition-colors hover:border-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-200"
                      >
                        {optionLabel}
                      </button>
                    ))}
                  </div>
                )}

                {!bookingJourney &&
                  currentMenu &&
                  optionsWithBackToMain.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {optionsWithBackToMain.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionClick(option)}
                          className="w-full rounded-xl border border-emerald-400/60 bg-[#111b21] px-4 py-2.5 text-left text-xs font-medium text-emerald-300 transition-colors hover:border-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-200"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}

                {currentMenu === undefined && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => {
                        setConversation([]);
                        setCurrentMenuRef(null);
                        handleInitialize();
                      }}
                      className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
                    >
                      Reiniciar conversa
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-white/10 bg-[#111b21] px-4 py-3">
            <div className="rounded-full bg-[#202c33] px-4 py-2 text-xs text-[#8696a0]">
              Digite uma mensagem...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
