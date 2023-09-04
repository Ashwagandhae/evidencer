export type IStorage = {
  count: number;
};
export type ICard = {
  tag: string;
  title: string;
  authors: {
    name: string;
    isPerson: boolean;
    description: string | null;
    id: number;
  }[];
  date: {
    month: string;
    day: string;
    year: string;
  };
  url: string;
  paras: IPara[];
  siteName: string;
  accessDate: {
    month: string;
    day: string;
    year: string;
  };
};
export type IPara = IRun[];
export type IRun = {
  text: string;
  underline: boolean;
  highlight: boolean;
};

export type ITooltipInfo = {
  content?: string;
  disabled?: boolean;
  layout?: string;
  exist?: boolean;
  shortcut?: string;
};
export type IFormatter = {
  key: string;
  format: (card: ICard) => string | null;
};

export type IMessage = {
  text: string;
  id: number;
  error: boolean;
};

export type IPopupKeys = 'login' | 'upload';

export type GetCardDataMessage = {
  message: 'getCardData';
};

export type GotCardDataMessage = {
  message: 'gotCardData';
  card: ICard;
};

export type InlineAutoCutMessage = {
  message: 'inlineAutoCut';
};

export type ArguflowRequestMessage = {
  message: 'arguflowRequest';
  url: string;
  method: 'POST' | 'GET' | 'DELETE';
  body: any;
  parseResponse: boolean;
  expectedStatus: number;
};

export type ArguflowResponseMessage = {
  message: 'arguflowResponse';
  response: any;
};

export type ArguflowErrorMessage = {
  message: 'arguflowError';
  error: any;
};

export type ChromeMessage =
  | GetCardDataMessage
  | GotCardDataMessage
  | InlineAutoCutMessage
  | ArguflowRequestMessage
  | ArguflowResponseMessage
  | ArguflowErrorMessage;
