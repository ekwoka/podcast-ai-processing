export const RED = '\x1b[31m';

export const inRED = (text: string) => `${RED}${text}${RESET}`;

export const GREEN = '\x1b[32m';

export const inGREEN = (text: string) => `${GREEN}${text}${RESET}`;

export const CYAN = '\x1b[36m';

export const inCYAN = (text: string) => `${CYAN}${text}${RESET}`;

export const RESET = '\x1b[0m';

export const colors = {
  RED,
  inRED,
  GREEN,
  inGREEN,
  CYAN,
  inCYAN,
};
