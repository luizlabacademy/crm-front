import { BOT_OPERATION, BOT_OPTION_TYPE, type BotFlowState } from "../types";

export const DEFAULT_BOT_FLOW_STATE: BotFlowState = {
  initialMenuRef: "MENU_PRINCIPAL",
  menus: [
    {
      ref: "MENU_PRINCIPAL",
      question: "Olá! O que deseja?",
      options: [
        {
          label: "Agendar Atendimento",
          type: BOT_OPTION_TYPE.SUBMENU,
          nextMenuRef: "ESCOLHER_CATEGORIA",
          operation: null,
        },
        {
          label: "Ver lista de serviços",
          type: BOT_OPTION_TYPE.OPERATION,
          nextMenuRef: null,
          operation: BOT_OPERATION.LIST_ALL_SERVICES,
        },
        {
          label: "Cancelar meu agendamento",
          type: BOT_OPTION_TYPE.OPERATION,
          nextMenuRef: null,
          operation: BOT_OPERATION.CANCEL_SCHEDULING,
        },
      ],
    },
    {
      ref: "ESCOLHER_CATEGORIA",
      question: "Escolha a categoria do serviço",
      options: [
        {
          label: "Cabeleireiro",
          type: BOT_OPTION_TYPE.OPERATION,
          nextMenuRef: null,
          operation: BOT_OPERATION.LIST_HAIR_SERVICES,
        },
        {
          label: "Manicure / Pedicure",
          type: BOT_OPTION_TYPE.OPERATION,
          nextMenuRef: null,
          operation: BOT_OPERATION.LIST_NAIL_SERVICES,
        },
        {
          label: "Quero ver todos",
          type: BOT_OPTION_TYPE.OPERATION,
          nextMenuRef: null,
          operation: BOT_OPERATION.LIST_ALL_SERVICES,
        },
      ],
    },
  ],
};
