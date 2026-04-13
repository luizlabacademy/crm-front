import { useState, useMemo } from "react";
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
import { Home, ChevronLeft, ChevronRight, CalendarCheck } from "lucide-react";
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const WORKERS: MockWorker[] = [
  { id: 1, name: "Ana Lima", color: "bg-violet-500" },
  { id: 2, name: "Carlos Souza", color: "bg-sky-500" },
  { id: 3, name: "Beatriz Melo", color: "bg-emerald-500" },
  { id: 4, name: "Rafael Costa", color: "bg-amber-500" },
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

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 – 20:00
const DAY_WORKERS_VISIBLE = 3;

// ─── Day View ─────────────────────────────────────────────────────────────────

function DayView({
  currentDate,
  appointments,
  workers,
}: {
  currentDate: Date;
  appointments: MockAppointment[];
  workers: MockWorker[];
}) {
  const dayAppts = appointments.filter((a) => {
    const d = parseISO(a.startAt);
    return isValid(d) && isSameDay(d, currentDate);
  });

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[700px]"
        style={{
          gridTemplateColumns: `56px repeat(${workers.length}, minmax(220px, 1fr))`,
        }}
      >
        {/* Header row */}
        <div className="border-b border-r border-border h-10 bg-muted/40" />
        {workers.map((w) => (
          <div
            key={w.id}
            className="border-b border-r border-border h-10 flex items-center justify-center gap-2 px-2 bg-muted/40"
          >
            <span className="flex flex-col items-center leading-tight">
              <span className="flex items-center gap-1.5">
                <span
                  className={cn("h-2 w-2 rounded-full shrink-0", w.color)}
                />
                <span className="text-xs font-semibold text-foreground truncate">
                  {w.name}
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground">
                07:00 – 20:00
              </span>
            </span>
          </div>
        ))}

        {/* Hour rows */}
        {HOURS.map((hour) => (
          <div key={`row-${hour}`} className="contents">
            <div className="border-b border-r border-border h-20 flex items-start justify-end pr-2 pt-1 sticky left-0 bg-background z-10">
              <span className="text-xs text-muted-foreground">
                {hour.toString().padStart(2, "0")}:00
              </span>
            </div>
            {workers.map((w) => {
              const cellAppts = dayAppts.filter((a) => {
                const d = parseISO(a.startAt);
                return a.workerId === w.id && d.getHours() === hour;
              });
              return (
                <div
                  key={`${hour}-${w.id}`}
                  className="border-b border-r border-border h-20 px-1.5 py-1 space-y-1"
                >
                  {cellAppts.map((a) => (
                    <div
                      key={a.id}
                      className={cn(
                        "rounded-md border-l-2 px-2 py-1 text-xs leading-tight cursor-pointer hover:opacity-85 transition-opacity",
                        STATUS_COLOR[a.status],
                      )}
                      title={`${a.customerName} — ${a.title} (${a.durationMinutes}min)`}
                    >
                      <div className="font-medium truncate">{a.title}</div>
                      <div className="text-muted-foreground truncate">
                        {a.customerName}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({
  currentDate,
  appointments,
}: {
  currentDate: Date;
  appointments: MockAppointment[];
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
        {HOURS.map((hour) => (
          <div key={`row-${hour}`} className="contents">
            <div className="border-b border-r border-border h-20 flex items-start justify-end pr-2 pt-1 sticky left-0 bg-background z-10">
              <span className="text-xs text-muted-foreground">
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
                    isSameDay(day, new Date()) && "bg-primary/5",
                  )}
                >
                  {cellAppts.map((a) => {
                    const worker = WORKERS.find((w) => w.id === a.workerId);
                    return (
                      <div
                        key={a.id}
                        className={cn(
                          "rounded-md border-l-2 px-2 py-1 text-xs leading-tight cursor-pointer hover:opacity-85 transition-opacity",
                          STATUS_COLOR[a.status],
                        )}
                        title={`${a.customerName} — ${a.title} (${worker?.name ?? ""})`}
                      >
                        <div className="font-medium truncate">{a.title}</div>
                        <div className="text-muted-foreground truncate">
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
}: {
  currentDate: Date;
  appointments: MockAppointment[];
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

  const appointments = useMemo(() => buildMockAppointments(new Date()), []);

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
    setCurrentDate(new Date());
  }

  const visibleDayWorkers = WORKERS.slice(
    dayWorkerStart,
    dayWorkerStart + DAY_WORKERS_VISIBLE,
  );
  const canMoveWorkersLeft = dayWorkerStart > 0;
  const canMoveWorkersRight =
    dayWorkerStart + DAY_WORKERS_VISIBLE < WORKERS.length;

  function moveWorkersLeft() {
    if (!canMoveWorkersLeft) return;
    setDayWorkerStart((v) => Math.max(0, v - 1));
  }

  function moveWorkersRight() {
    if (!canMoveWorkersRight) return;
    setDayWorkerStart((v) =>
      Math.min(WORKERS.length - DAY_WORKERS_VISIBLE, v + 1),
    );
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
            Home CRM
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
      <div className="flex items-center gap-3 border-b border-border px-4 py-2 shrink-0">
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
          className="rounded-md border border-border px-2 py-0.5 text-xs hover:bg-accent transition-colors"
        >
          Hoje
        </button>
        <span className="text-sm font-medium capitalize">{headerLabel()}</span>

        {view === "day" && WORKERS.length > DAY_WORKERS_VISIBLE && (
          <div className="ml-2 inline-flex items-center gap-1 rounded-md border border-border px-1 py-0.5">
            <button
              onClick={moveWorkersLeft}
              disabled={!canMoveWorkersLeft}
              className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
              title="Colunas anteriores"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-muted-foreground px-1">
              {dayWorkerStart + 1}-
              {Math.min(dayWorkerStart + DAY_WORKERS_VISIBLE, WORKERS.length)}{" "}
              de {WORKERS.length}
            </span>
            <button
              onClick={moveWorkersRight}
              disabled={!canMoveWorkersRight}
              className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
              title="Próximas colunas"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        <div className="ml-auto">
          <Legend />
        </div>
      </div>

      {/* Calendar body */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="h-full rounded-xl border border-border bg-card overflow-hidden">
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              appointments={appointments}
              workers={visibleDayWorkers}
            />
          )}
          {view === "week" && (
            <WeekView currentDate={currentDate} appointments={appointments} />
          )}
          {view === "month" && (
            <MonthView currentDate={currentDate} appointments={appointments} />
          )}
        </div>
      </div>
    </div>
  );
}
