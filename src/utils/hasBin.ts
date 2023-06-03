import { execShellCommand } from './execShellCommand.js';

export const hasBin = async (name: string) => {
  const which = await execShellCommand(`which ${name}`);
  return Boolean(which);
};
