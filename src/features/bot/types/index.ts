export type OperationCategory =
  | "capture"
  | "context"
  | "scheduling"
  | "commercial"
  | "payment"
  | "operational"
  | "communication"
  | "retention";

export type ActionType = "READ" | "WRITE" | "DECISION" | "INTEGRATION" | "COMMUNICATION";

export interface BotOperation {
  id: string;
  category: OperationCategory;
  label: string;
  actionType: ActionType;
}

export interface BotMenuItem {
  id: string;
  label: string;
  operations: BotOperation[];
  submenu: BotMenuLevel | null;
}

export interface BotMenuLevel {
  id: string;
  question: string;
  items: BotMenuItem[];
}

export interface BotTemplate {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}
