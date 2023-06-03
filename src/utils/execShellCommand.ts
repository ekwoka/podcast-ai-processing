import { exec } from 'node:child_process';

export const execShellCommand = (cmd: string): Promise<string> =>
  new Promise((res) => {
    exec(cmd, (_, stdout, stderr) => {
      res(stdout ? stdout : stderr);
    });
  });
