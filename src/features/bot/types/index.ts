// Flow Builder Types
export interface MenuOption {
  label: string;
  nextMenuRef: string | null;
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
