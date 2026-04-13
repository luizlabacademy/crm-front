import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  setHours,
  setMinutes,
  parseISO,
  isValid,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Home,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "day" | "week" | "month";

interface MockWorker {
  id: number;
  name: string;
  color: string;
}

interface MockAppointment {
  id: number;
  workerId: number;
  customerName: string;
  title: string;
  startAt: string; // ISO
  durationMinutes: number;
  status: "scheduled" | "confirmed" | "done" | "cancelled";
}

interface MockCustomer {
  id: number;
  name: string;
}

interface NewAppointmentDraft {
  title: string;
  customerId: number | null;
  customerName: string;
  workerId: number | null;
  workerName: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: MockAppointment["status"];
  notes: string;
}

function buildDraftFromAppointment(
  appointment: MockAppointment,
): NewAppointmentDraft {
  const start = parseISO(appointment.startAt);
  const worker = WORKERS.find((w) => w.id === appointment.workerId);
  const customer = MOCK_CUSTOMERS.find(
    (c) => c.name === appointment.customerName,
  );

  return {
    title: appointment.title,
    customerId: customer?.id ?? null,
    customerName: appointment.customerName,
    workerId: appointment.workerId,
    workerName: worker?.name ?? "",
    date: toDateInputValue(start),
    time: toTimeInputValue(start),
    durationMinutes: appointment.durationMinutes,
    status: appointment.status,
    notes: "",
  };
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const WORKERS: MockWorker[] = [
  { id: 1, name: "Ana Lima", color: "bg-violet-500" },
  { id: 2, name: "Carlos Souza", color: "bg-sky-500" },
  { id: 3, name: "Beatriz Melo", color: "bg-emerald-500" },
  { id: 4, name: "Rafael Costa", color: "bg-amber-500" },
  { id: 5, name: "Fernanda Rocha", color: "bg-rose-500" },
  { id: 6, name: "Diego Martins", color: "bg-indigo-500" },
  { id: 7, name: "Juliana Freitas", color: "bg-cyan-500" },
  { id: 8, name: "Lucas Ribeiro", color: "bg-lime-500" },
  { id: 9, name: "Renata Araujo", color: "bg-fuchsia-500" },
  { id: 10, name: "Gustavo Pires", color: "bg-teal-500" },
];

const MOCK_CUSTOMERS: MockCustomer[] = [
  { id: 1, name: "Joao Silva" },
  { id: 2, name: "Maria Oliveira" },
  { id: 3, name: "Pedro Alves" },
  { id: 4, name: "Lucia Ferreira" },
  { id: 5, name: "Marcos Dias" },
  { id: 6, name: "Sandra Torres" },
  { id: 7, name: "Bruno Nunes" },
  { id: 8, name: "Patricia Gomes" },
  { id: 9, name: "Thiago Prado" },
  { id: 10, name: "Clara Mendes" },
  { id: 11, name: "Victor Lima" },
  { id: 12, name: "Daniela Costa" },
  { id: 13, name: "Felipe Moreira" },
];

function buildMockAppointments(base: Date): MockAppointment[] {
  const d = (offsetDays: number, h: number, m = 0) => {
    const dt = addDays(base, offsetDays);
    return setMinutes(setHours(dt, h), m).toISOString();
  };
  return [
    {
      id: 1,
      workerId: 1,
      customerName: "Joao Silva",
      title: "Corte de cabelo",
      startAt: d(0, 9, 0),
      durationMinutes: 30,
      status: "confirmed",
    },
    {
      id: 2,
      workerId: 2,
      customerName: "Maria Oliveira",
      title: "Manicure",
      startAt: d(0, 10, 0),
      durationMinutes: 60,
      status: "scheduled",
    },
    {
      id: 3,
      workerId: 1,
      customerName: "Pedro Alves",
      title: "Barba",
      startAt: d(0, 11, 0),
      durationMinutes: 45,
      status: "scheduled",
    },
    {
      id: 4,
      workerId: 3,
      customerName: "Lucia Ferreira",
      title: "Escova",
      startAt: d(1, 9, 30),
      durationMinutes: 60,
      status: "scheduled",
    },
    {
      id: 5,
      workerId: 4,
      customerName: "Marcos Dias",
      title: "Coloracao",
      startAt: d(1, 14, 0),
      durationMinutes: 120,
      status: "confirmed",
    },
    {
      id: 6,
      workerId: 2,
      customerName: "Sandra Torres",
      title: "Pedicure",
      startAt: d(2, 15, 0),
      durationMinutes: 60,
      status: "done",
    },
    {
      id: 7,
      workerId: 1,
      customerName: "Bruno Nunes",
      title: "Corte + Barba",
      startAt: d(3, 10, 0),
      durationMinutes: 60,
      status: "scheduled",
    },
    {
      id: 8,
      workerId: 5,
      customerName: "Patricia Gomes",
      title: "Progressiva",
      startAt: d(0, 13, 0),
      durationMinutes: 90,
      status: "scheduled",
    },
    {
      id: 9,
      workerId: 6,
      customerName: "Thiago Prado",
      title: "Sobrancelha",
      startAt: d(0, 16, 0),
      durationMinutes: 30,
      status: "confirmed",
    },
    {
      id: 10,
      workerId: 7,
      customerName: "Clara Mendes",
      title: "Hidratacao",
      startAt: d(0, 8, 0),
      durationMinutes: 45,
      status: "scheduled",
    },
    {
      id: 11,
      workerId: 8,
      customerName: "Victor Lima",
      title: "Corte Masculino",
      startAt: d(1, 11, 0),
      durationMinutes: 30,
      status: "confirmed",
    },
    {
      id: 12,
      workerId: 9,
      customerName: "Daniela Costa",
      title: "Tintura",
      startAt: d(2, 14, 0),
      durationMinutes: 90,
      status: "scheduled",
    },
    {
      id: 13,
      workerId: 10,
      customerName: "Felipe Moreira",
      title: "Barba Premium",
      startAt: d(3, 17, 0),
      durationMinutes: 45,
      status: "done",
    },
  ];
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<MockAppointment["status"], string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  done: "Concluido",
  cancelled: "Cancelado",
};

const STATUS_COLOR: Record<MockAppointment["status"], string> = {
  scheduled: "border-l-sky-400 bg-sky-50 dark:bg-sky-900/30",
  confirmed: "border-l-emerald-400 bg-emerald-50 dark:bg-emerald-900/30",
  done: "border-l-gray-400 bg-gray-50 dark:bg-gray-800/30",
  cancelled: "border-l-red-400 bg-red-50 dark:bg-red-900/30",
};

// ─── Hours grid ───────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 00:00 – 23:00
const DAY_TIME_COL_WIDTH = 92;
const DAY_WORKER_COL_MIN = 240;
const DAY_WORKER_COL_MAX = 340;
const DAY_HOUR_ROW_HEIGHT = 72;

function toDateInputValue(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function toTimeInputValue(date: Date) {
  return format(date, "HH:mm");
}

function buildDraftFromDate(
  date: Date,
  workerId?: number,
): NewAppointmentDraft {
  const worker = WORKERS.find((w) => w.id === workerId);
  return {
    title: "",
    customerId: null,
    customerName: "",
    workerId: worker?.id ?? null,
    workerName: worker?.name ?? "",
    date: toDateInputValue(date),
    time: toTimeInputValue(date),
    durationMinutes: 60,
    status: "scheduled",
    notes: "",
  };
}

// ─── Day View ─────────────────────────────────────────────────────────────────

function DayView({
  currentDate,
  appointments,
  workers,
  columnWidth,
  onTimeCellClick,
  canMoveWorkersLeft,
  canMoveWorkersRight,
  onMoveWorkersLeft,
  onMoveWorkersRight,
  scrollToNowSignal,
  onAppointmentClick,
}: {
  currentDate: Date;
  appointments: MockAppointment[];
  workers: MockWorker[];
  columnWidth: number;
  onTimeCellClick: (hour: number, minute: 0 | 30, workerId: number) => void;
  canMoveWorkersLeft: boolean;
  canMoveWorkersRight: boolean;
  onMoveWorkersLeft: () => void;
  onMoveWorkersRight: () => void;
  scrollToNowSignal: number;
  onAppointmentClick: (appointment: MockAppointment) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const dayAppts = appointments.filter((a) => {
    const d = parseISO(a.startAt);
    return isValid(d) && isSameDay(d, currentDate);
  });

  const now = new Date();
  const isCurrentDay = isSameDay(now, currentDate);
  const nowLineTop =
    (now.getHours() + now.getMinutes() / 60) * DAY_HOUR_ROW_HEIGHT +
    DAY_HOUR_ROW_HEIGHT / 2;

  useEffect(() => {
    if (!isCurrentDay || !scrollRef.current) return;
    const target = Math.max(0, nowLineTop - 220);
    scrollRef.current.scrollTop = target;
  }, [isCurrentDay, nowLineTop, scrollToNowSignal]);

  const minWidth = `${DAY_TIME_COL_WIDTH + workers.length * columnWidth}px`;
  const columnsTemplate = `${DAY_TIME_COL_WIDTH}px repeat(${workers.length}, ${columnWidth}px)`;

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div className="h-full flex flex-col" style={{ minWidth }}>
        <div
          className="grid sticky top-0 z-30"
          style={{ gridTemplateColumns: columnsTemplate }}
        >
          <div className="border-b border-r border-border h-11 bg-muted flex items-center justify-center px-2 sticky left-0 z-30">
            <div className="flex items-center gap-2 rounded-md bg-background/70 px-1.5 py-0.5">
              <button
                type="button"
                onClick={onMoveWorkersLeft}
                disabled={!canMoveWorkersLeft}
                className="rounded-md p-1.5 hover:bg-accent transition-colors text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                title="Profissionais anteriores"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={onMoveWorkersRight}
                disabled={!canMoveWorkersRight}
                className="rounded-md p-1.5 hover:bg-accent transition-colors text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                title="Próximos profissionais"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          {workers.map((w) => (
            <div
              key={w.id}
              className="border-b border-r border-border h-11 flex items-center justify-center gap-2 px-2 bg-muted"
            >
              <span className="flex flex-col items-center leading-tight">
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn("h-2 w-2 rounded-full shrink-0", w.color)}
                  />
                  <span className="text-sm font-semibold text-foreground truncate">
                    {w.name}
                  </span>
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  00:00 – 23:59
                </span>
              </span>
            </div>
          ))}
        </div>

        <div
          ref={scrollRef}
          className="relative flex-1 min-h-0 overflow-y-auto"
        >
          <div
            className="grid"
            style={{ gridTemplateColumns: columnsTemplate }}
          >
            {HOURS.map((hour, rowIndex) => (
              <div key={`row-${hour}`} className="contents">
                <div
                  className={cn(
                    "border-b border-r border-border h-16 flex items-center justify-end pr-2 sticky left-0 z-10",
                    rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20",
                  )}
                  style={{ height: `${DAY_HOUR_ROW_HEIGHT}px` }}
                >
                  <span className="text-[13px] font-semibold text-muted-foreground">
                    {hour.toString().padStart(2, "0")}:00
                  </span>
                </div>
                {workers.map((w) => {
                  const cellAppts = dayAppts.filter((a) => {
                    const d = parseISO(a.startAt);
                    return a.workerId === w.id && d.getHours() === hour;
                  });
                  const topHalfAppts = cellAppts.filter(
                    (a) => parseISO(a.startAt).getMinutes() < 30,
                  );
                  const bottomHalfAppts = cellAppts.filter(
                    (a) => parseISO(a.startAt).getMinutes() >= 30,
                  );
                  return (
                    <div
                      key={`${hour}-${w.id}`}
                      className={cn(
                        "border-b border-r border-border h-16 px-1.5 py-1 space-y-1 cursor-pointer hover:bg-primary/5",
                        rowIndex % 2 === 0 ? "bg-background" : "bg-muted/10",
                      )}
                      style={{ height: `${DAY_HOUR_ROW_HEIGHT}px` }}
                    >
                      <div
                        className="h-1/2 border-b border-dashed border-border/70 px-0.5 py-0.5 hover:bg-primary/5"
                        onClick={() => onTimeCellClick(hour, 0, w.id)}
                      >
                        {topHalfAppts.map((a) => (
                          <div
                            key={a.id}
                            className={cn(
                              "rounded-md border-l-2 px-2 py-1 text-xs leading-tight cursor-pointer shadow-sm ring-1 ring-black/5 hover:opacity-90 transition-opacity",
                              STATUS_COLOR[a.status],
                            )}
                            title={`${a.customerName} — ${a.title} (${a.durationMinutes}min)`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAppointmentClick(a);
                            }}
                          >
                            <div className="text-[12px] font-semibold truncate">
                              {a.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {a.customerName}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        className="h-1/2 px-0.5 py-0.5 hover:bg-primary/5"
                        onClick={() => onTimeCellClick(hour, 30, w.id)}
                      >
                        {bottomHalfAppts.map((a) => (
                          <div
                            key={a.id}
                            className={cn(
                              "rounded-md border-l-2 px-2 py-1 text-xs leading-tight cursor-pointer shadow-sm ring-1 ring-black/5 hover:opacity-90 transition-opacity",
                              STATUS_COLOR[a.status],
                            )}
                            title={`${a.customerName} — ${a.title} (${a.durationMinutes}min)`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAppointmentClick(a);
                            }}
                          >
                            <div className="text-[12px] font-semibold truncate">
                              {a.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {a.customerName}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {isCurrentDay && (
            <div
              className="pointer-events-none absolute left-0 right-0 z-20"
              style={{ top: `${nowLineTop}px` }}
            >
              <div className="relative">
                <span
                  className="absolute top-[-5px] h-2.5 w-2.5 rounded-full bg-red-500"
                  style={{ left: `${DAY_TIME_COL_WIDTH - 6}px` }}
                />
                <span className="block h-[2px] w-full bg-red-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({
  currentDate,
  appointments,
  onAppointmentClick,
}: {
  currentDate: Date;
  appointments: MockAppointment[];
  onAppointmentClick: (appointment: MockAppointment) => void;
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[760px]"
        style={{ gridTemplateColumns: `56px repeat(7, 1fr)` }}
      >
        {/* Header */}
        <div className="border-b border-r border-border h-10 bg-muted/40" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "border-b border-r border-border h-10 flex flex-col items-center justify-center bg-muted/40",
              isSameDay(day, new Date()) && "bg-primary/5",
            )}
          >
            <span className="text-xs text-muted-foreground capitalize">
              {format(day, "EEE", { locale: ptBR })}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                isSameDay(day, new Date()) ? "text-primary" : "text-foreground",
              )}
            >
              {format(day, "d")}
            </span>
          </div>
        ))}

        {/* Hour rows */}
        {HOURS.map((hour, rowIndex) => (
          <div key={`row-${hour}`} className="contents">
            <div
              className={cn(
                "border-b border-r border-border h-20 flex items-start justify-end pr-2 pt-1 sticky left-0 z-10",
                rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20",
              )}
            >
              <span className="text-[11px] font-medium text-muted-foreground">
                {hour.toString().padStart(2, "0")}:00
              </span>
            </div>
            {days.map((day) => {
              const cellAppts = appointments.filter((a) => {
                const d = parseISO(a.startAt);
                return isValid(d) && isSameDay(d, day) && d.getHours() === hour;
              });
              return (
                <div
                  key={`${hour}-${day.toISOString()}`}
                  className={cn(
                    "border-b border-r border-border h-20 px-1.5 py-1 space-y-1",
                    rowIndex % 2 === 0 ? "bg-background" : "bg-muted/10",
                    isSameDay(day, new Date()) && "bg-primary/5",
                  )}
                >
                  {cellAppts.map((a) => {
                    const worker = WORKERS.find((w) => w.id === a.workerId);
                    return (
                      <div
                        key={a.id}
                        className={cn(
                          "rounded-md border-l-2 px-2 py-1 text-xs leading-tight cursor-pointer shadow-sm hover:opacity-90 transition-opacity",
                          STATUS_COLOR[a.status],
                        )}
                        title={`${a.customerName} — ${a.title} (${worker?.name ?? ""})`}
                        onClick={() => onAppointmentClick(a)}
                      >
                        <div className="text-[12px] font-semibold truncate">
                          {a.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {worker?.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({
  currentDate,
  appointments,
  onAppointmentClick,
}: {
  currentDate: Date;
  appointments: MockAppointment[];
  onAppointmentClick: (appointment: MockAppointment) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: monthEnd });
  // Pad to complete last week
  const remainder = days.length % 7;
  if (remainder !== 0) {
    const extra = 7 - remainder;
    for (let i = 1; i <= extra; i++) {
      days.push(addDays(monthEnd, i));
    }
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const DOW = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

  return (
    <div>
      {/* DOW header */}
      <div className="grid grid-cols-7 border-b border-border">
        {DOW.map((d) => (
          <div
            key={d}
            className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-border">
          {week.map((day) => {
            const dayAppts = appointments.filter((a) => {
              const d = parseISO(a.startAt);
              return isValid(d) && isSameDay(d, day);
            });
            const inMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[80px] border-r border-border p-1",
                  !inMonth && "bg-muted/30",
                )}
              >
                <div
                  className={cn(
                    "text-xs font-medium mb-1 h-5 w-5 flex items-center justify-center rounded-full",
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : inMonth
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayAppts.slice(0, 3).map((a) => {
                    const worker = WORKERS.find((w) => w.id === a.workerId);
                    return (
                      <div
                        key={a.id}
                        className={cn(
                          "rounded border-l-2 px-1 py-0.5 text-xs leading-tight truncate cursor-pointer hover:opacity-80",
                          STATUS_COLOR[a.status],
                        )}
                        title={`${a.customerName} — ${a.title} (${worker?.name ?? ""})`}
                        onClick={() => onAppointmentClick(a)}
                      >
                        {format(parseISO(a.startAt), "HH:mm")} {a.title}
                      </div>
                    );
                  })}
                  {dayAppts.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayAppts.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function AutocompleteField({
  label,
  value,
  options,
  placeholder,
  onChange,
  onSelect,
}: {
  label: string;
  value: string;
  options: { id: number; name: string }[];
  placeholder: string;
  onChange: (value: string) => void;
  onSelect: (option: { id: number; name: string }) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(value.toLowerCase()),
  );

  return (
    <div className="space-y-1.5 relative">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-44 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
          {filtered.slice(0, 8).map((option) => (
            <button
              key={option.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NewAppointmentModal({
  title,
  draft,
  onClose,
  onChange,
  onSubmit,
}: {
  title: string;
  draft: NewAppointmentDraft;
  onClose: () => void;
  onChange: (patch: Partial<NewAppointmentDraft>) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-accent"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Servico
            </label>
            <input
              value={draft.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Ex: Corte + Barba"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <AutocompleteField
            label="Cliente"
            value={draft.customerName}
            options={MOCK_CUSTOMERS}
            placeholder="Buscar cliente..."
            onChange={(value) =>
              onChange({ customerName: value, customerId: null })
            }
            onSelect={(customer) =>
              onChange({ customerId: customer.id, customerName: customer.name })
            }
          />

          <AutocompleteField
            label="Profissional"
            value={draft.workerName}
            options={WORKERS.map((w) => ({ id: w.id, name: w.name }))}
            placeholder="Buscar profissional..."
            onChange={(value) =>
              onChange({ workerName: value, workerId: null })
            }
            onSelect={(worker) =>
              onChange({ workerId: worker.id, workerName: worker.name })
            }
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Data</label>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => onChange({ date: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Horario
            </label>
            <input
              type="time"
              value={draft.time}
              onChange={(e) => onChange({ time: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Duracao (min)
            </label>
            <input
              type="number"
              min={15}
              step={15}
              value={draft.durationMinutes}
              onChange={(e) =>
                onChange({ durationMinutes: Number(e.target.value) || 60 })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Status
            </label>
            <select
              value={draft.status}
              onChange={(e) =>
                onChange({
                  status: e.target.value as MockAppointment["status"],
                })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="scheduled">Agendado</option>
              <option value="confirmed">Confirmado</option>
              <option value="done">Concluido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Observacoes
            </label>
            <textarea
              rows={3}
              value={draft.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Salvar agendamento
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap gap-3">
      {(Object.keys(STATUS_LABEL) as MockAppointment["status"][]).map((s) => (
        <div key={s} className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-3 w-3 rounded-sm border-l-2",
              STATUS_COLOR[s].split(" ")[0],
            )}
          />
          <span className="text-xs text-muted-foreground">
            {STATUS_LABEL[s]}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SchedulesBoardPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("day");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [dayWorkerStart, setDayWorkerStart] = useState(0);
  const [dayWorkersVisibleCount, setDayWorkersVisibleCount] = useState(3);
  const [dayGridWidth, setDayGridWidth] = useState(0);
  const [scrollToNowSignal, setScrollToNowSignal] = useState(0);
  const [workerSearch, setWorkerSearch] = useState("");
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<number[]>(
    WORKERS.map((w) => w.id),
  );
  const [appointments, setAppointments] = useState<MockAppointment[]>(() =>
    buildMockAppointments(new Date()),
  );
  const [editingAppointmentId, setEditingAppointmentId] = useState<
    number | null
  >(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentDraft, setAppointmentDraft] = useState<NewAppointmentDraft>(
    () => buildDraftFromDate(new Date()),
  );
  const dayGridRef = useRef<HTMLDivElement>(null);

  const filteredWorkers = useMemo(
    () => WORKERS.filter((w) => selectedWorkerIds.includes(w.id)),
    [selectedWorkerIds],
  );
  const workersForFilterList = useMemo(
    () =>
      WORKERS.filter((w) =>
        w.name.toLowerCase().includes(workerSearch.toLowerCase()),
      ),
    [workerSearch],
  );
  const allWorkersSelected = selectedWorkerIds.length === WORKERS.length;
  const filteredAppointments = useMemo(
    () => appointments.filter((a) => selectedWorkerIds.includes(a.workerId)),
    [appointments, selectedWorkerIds],
  );

  function prev() {
    if (view === "day") setCurrentDate((d) => addDays(d, -1));
    else if (view === "week") setCurrentDate((d) => addWeeks(d, -1));
    else setCurrentDate((d) => addMonths(d, -1));
  }

  function next() {
    if (view === "day") setCurrentDate((d) => addDays(d, 1));
    else if (view === "week") setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addMonths(d, 1));
  }

  function goToday() {
    setView("day");
    setCurrentDate(new Date());
    setScrollToNowSignal((v) => v + 1);
  }

  useEffect(() => {
    function updateDayViewport() {
      const width = dayGridRef.current?.clientWidth ?? window.innerWidth;
      setDayGridWidth(width);
      const available = Math.max(0, width - DAY_TIME_COL_WIDTH);
      const fitCount = Math.max(1, Math.floor(available / DAY_WORKER_COL_MIN));
      setDayWorkersVisibleCount(Math.min(filteredWorkers.length, fitCount));
    }

    updateDayViewport();
    window.addEventListener("resize", updateDayViewport);
    return () => window.removeEventListener("resize", updateDayViewport);
  }, [filteredWorkers.length]);

  useEffect(() => {
    const maxStart = Math.max(
      0,
      filteredWorkers.length - dayWorkersVisibleCount,
    );
    if (dayWorkerStart > maxStart) {
      setDayWorkerStart(maxStart);
    }
  }, [dayWorkerStart, dayWorkersVisibleCount, filteredWorkers.length]);

  const visibleDayWorkers = filteredWorkers.slice(
    dayWorkerStart,
    dayWorkerStart + dayWorkersVisibleCount,
  );

  const dayColumnWidth = useMemo(() => {
    const available = Math.max(0, dayGridWidth - DAY_TIME_COL_WIDTH);
    const count = Math.max(1, visibleDayWorkers.length);
    const raw = Math.floor(available / count);
    return Math.max(DAY_WORKER_COL_MIN, Math.min(DAY_WORKER_COL_MAX, raw));
  }, [dayGridWidth, visibleDayWorkers.length]);

  const canMoveWorkersLeft = dayWorkerStart > 0;
  const canMoveWorkersRight =
    dayWorkerStart + dayWorkersVisibleCount < filteredWorkers.length;

  function moveWorkersLeft() {
    if (!canMoveWorkersLeft) return;
    setDayWorkerStart((v) => Math.max(0, v - 1));
  }

  function moveWorkersRight() {
    if (!canMoveWorkersRight) return;
    setDayWorkerStart((v) =>
      Math.min(filteredWorkers.length - dayWorkersVisibleCount, v + 1),
    );
  }

  function openNewAppointment(date: Date, workerId?: number) {
    setAppointmentDraft(buildDraftFromDate(date, workerId));
    setEditingAppointmentId(null);
    setIsAppointmentModalOpen(true);
  }

  function openExistingAppointment(appointment: MockAppointment) {
    setAppointmentDraft(buildDraftFromAppointment(appointment));
    setEditingAppointmentId(appointment.id);
    setIsAppointmentModalOpen(true);
  }

  function handleDayCellClick(hour: number, minute: 0 | 30, workerId: number) {
    const clicked = setMinutes(setHours(new Date(currentDate), hour), minute);
    openNewAppointment(clicked, workerId);
  }

  function prevMiniMonth() {
    setCurrentDate((d) => addMonths(d, -1));
  }

  function nextMiniMonth() {
    setCurrentDate((d) => addMonths(d, 1));
  }

  function saveAppointment() {
    const workerId =
      appointmentDraft.workerId ??
      WORKERS.find(
        (w) =>
          w.name.toLowerCase() === appointmentDraft.workerName.toLowerCase(),
      )?.id ??
      null;

    if (
      !workerId ||
      !appointmentDraft.customerName ||
      !appointmentDraft.title
    ) {
      return;
    }

    const startAt = new Date(
      `${appointmentDraft.date}T${appointmentDraft.time}:00`,
    ).toISOString();
    if (editingAppointmentId !== null) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === editingAppointmentId
            ? {
                ...a,
                workerId,
                customerName: appointmentDraft.customerName,
                title: appointmentDraft.title,
                startAt,
                durationMinutes: appointmentDraft.durationMinutes,
                status: appointmentDraft.status,
              }
            : a,
        ),
      );
    } else {
      const nextId =
        appointments.length > 0
          ? Math.max(...appointments.map((a) => a.id)) + 1
          : 1;

      setAppointments((prev) => [
        ...prev,
        {
          id: nextId,
          workerId,
          customerName: appointmentDraft.customerName,
          title: appointmentDraft.title,
          startAt,
          durationMinutes: appointmentDraft.durationMinutes,
          status: appointmentDraft.status,
        },
      ]);
    }

    setEditingAppointmentId(null);
    setIsAppointmentModalOpen(false);
  }

  function toggleWorker(workerId: number) {
    setSelectedWorkerIds((prev) => {
      if (prev.includes(workerId)) return prev.filter((id) => id !== workerId);
      return [...prev, workerId];
    });
  }

  function selectAllWorkers() {
    setSelectedWorkerIds(WORKERS.map((w) => w.id));
  }

  function clearAllWorkers() {
    setSelectedWorkerIds([]);
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const monthDays = eachDayOfInterval({ start: monthGridStart, end: monthEnd });
  const monthRemainder = monthDays.length % 7;
  if (monthRemainder !== 0) {
    const extra = 7 - monthRemainder;
    for (let i = 1; i <= extra; i++) monthDays.push(addDays(monthEnd, i));
  }

  function headerLabel() {
    if (view === "day")
      return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      });
    if (view === "week") {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = addDays(ws, 6);
      return `${format(ws, "d MMM", { locale: ptBR })} – ${format(we, "d MMM yyyy", { locale: ptBR })}`;
    }
    return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between gap-4 border-b border-border px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => void navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Home size={14} />
            Home
          </button>
          <CalendarCheck size={20} className="text-primary shrink-0" />
          <span className="font-semibold text-base">Board de Agendamentos</span>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["day", "week", "month"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {v === "day" ? "Dia" : v === "week" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Calendar nav bar */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-2 shrink-0">
        <button
          onClick={prev}
          className="rounded-md p-1 hover:bg-accent transition-colors text-muted-foreground"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={next}
          className="rounded-md p-1 hover:bg-accent transition-colors text-muted-foreground"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={goToday}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          Hoje
        </button>
        <span className="rounded-md bg-muted px-2.5 py-1 text-sm font-medium capitalize">
          {headerLabel()}
        </span>

        <div className="ml-auto">
          <Legend />
        </div>
      </div>

      {/* Calendar body */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full flex gap-4">
          <aside
            className="w-64 shrink-0 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
            style={{ scrollbarWidth: "thin", scrollbarGutter: "stable" }}
          >
            <button
              type="button"
              onClick={() => openNewAppointment(new Date(currentDate))}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <Plus size={16} />
              Criar
            </button>

            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-2 relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={prevMiniMonth}
                  className="absolute left-0 rounded p-1 text-muted-foreground hover:bg-accent"
                  title="Mes anterior"
                >
                  <ChevronLeft size={14} />
                </button>
                <h3 className="text-sm font-semibold capitalize text-center">
                  {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                </h3>
                <button
                  type="button"
                  onClick={nextMiniMonth}
                  className="absolute right-0 rounded p-1 text-muted-foreground hover:bg-accent"
                  title="Proximo mes"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground mb-1">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                  <span key={`${d}-${i}`}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((day) => (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setCurrentDate(day)}
                    className={cn(
                      "h-8 rounded-md text-xs",
                      isSameDay(day, currentDate)
                        ? "bg-primary text-primary-foreground"
                        : isSameMonth(day, currentDate)
                          ? "hover:bg-accent"
                          : "text-muted-foreground hover:bg-accent/50",
                    )}
                  >
                    {format(day, "d")}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-card p-3 space-y-2">
              <h4 className="text-sm font-semibold">Profissionais</h4>
              <input
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
                placeholder="Buscar profissional..."
                className="w-full rounded-md bg-muted/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allWorkersSelected}
                    onChange={(e) => {
                      if (e.target.checked) selectAllWorkers();
                      else clearAllWorkers();
                    }}
                    className="h-5 w-5 rounded border-2 border-emerald-400/70 accent-emerald-600"
                  />
                  <span>Marcar todos</span>
                </label>
                <button
                  type="button"
                  onClick={clearAllWorkers}
                  className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  Limpar
                </button>
              </div>
              {workersForFilterList.map((worker) => {
                const checked = selectedWorkerIds.includes(worker.id);
                return (
                  <label
                    key={worker.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleWorker(worker.id)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span
                      className={cn("h-2.5 w-2.5 rounded-full", worker.color)}
                    />
                    <span className="text-sm">{worker.name}</span>
                  </label>
                );
              })}
            </div>
          </aside>

          <div
            ref={dayGridRef}
            className="min-w-0 flex-1 rounded-xl border border-border bg-card overflow-hidden"
          >
            {view === "day" && (
              <DayView
                currentDate={currentDate}
                appointments={filteredAppointments}
                workers={visibleDayWorkers}
                columnWidth={dayColumnWidth}
                onTimeCellClick={handleDayCellClick}
                canMoveWorkersLeft={canMoveWorkersLeft}
                canMoveWorkersRight={canMoveWorkersRight}
                onMoveWorkersLeft={moveWorkersLeft}
                onMoveWorkersRight={moveWorkersRight}
                scrollToNowSignal={scrollToNowSignal}
                onAppointmentClick={openExistingAppointment}
              />
            )}
            {view === "week" && (
              <WeekView
                currentDate={currentDate}
                appointments={filteredAppointments}
                onAppointmentClick={openExistingAppointment}
              />
            )}
            {view === "month" && (
              <MonthView
                currentDate={currentDate}
                appointments={filteredAppointments}
                onAppointmentClick={openExistingAppointment}
              />
            )}
          </div>
        </div>
      </div>

      {isAppointmentModalOpen && (
        <NewAppointmentModal
          title={
            editingAppointmentId !== null
              ? `Agendamento #${editingAppointmentId}`
              : "Novo Agendamento"
          }
          draft={appointmentDraft}
          onClose={() => {
            setIsAppointmentModalOpen(false);
            setEditingAppointmentId(null);
          }}
          onChange={(patch) =>
            setAppointmentDraft((prev) => ({ ...prev, ...patch }))
          }
          onSubmit={saveAppointment}
        />
      )}
    </div>
  );
}
