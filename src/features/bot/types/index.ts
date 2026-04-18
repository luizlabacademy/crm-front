// Flow Builder Types
export interface FlowOption {
  id: string;
  label: string;
  next: string | null; // target node id
}

export interface FlowNode {
  id: string;
  type: "message";
  text: string; // supports {{variable}} syntax
  options: FlowOption[];
}

export interface FlowState {
  nodes: FlowNode[];
  startNodeId: string;
}

// Template Types
export interface BotTemplate {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}
