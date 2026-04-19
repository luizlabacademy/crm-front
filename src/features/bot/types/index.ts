// Flow Builder Types
export const BOT_OPTION_TYPE = {
  SUBMENU: "submenu",
  OPERATION: "operation",
} as const;

export type BotOptionType =
  (typeof BOT_OPTION_TYPE)[keyof typeof BOT_OPTION_TYPE];

export const BOT_OPERATION = {
  LIST_HAIR_SERVICES: "list_hair_services",
  LIST_NAIL_SERVICES: "list_nail_services",
  LIST_ALL_SERVICES: "list_all_services",
  LIST_AVAILABLE_TIMES: "list_available_times",
  LIST_AVAILABLE_PROFESSIONALS: "list_available_professionals",
  FINISH_SCHEDULING: "finish_scheduling",
  CANCEL_SCHEDULING: "cancel_scheduling",
} as const;

export type BotOperation =
  (typeof BOT_OPERATION)[keyof typeof BOT_OPERATION];

export interface MenuOption {
  label: string;
  type: BotOptionType;
  nextMenuRef: string | null;
  operation: BotOperation | null;
}

export interface Menu {
  ref: string;
  question: string;
  options: MenuOption[];
}

export interface BotFlowState {
  initialMenuRef: string;
  menus: Menu[];
}

// Template Types
export interface BotTemplate {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}
