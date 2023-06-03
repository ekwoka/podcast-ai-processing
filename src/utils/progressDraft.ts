import { inCYAN } from './colors.js';

export function progressDraft(text: string) {
  const start = Date.now();
  const updateStatus = console.draft(inCYAN(`${text} 0.0`));
  return [
    (text: string) => {
      updateStatus(inCYAN(`${text} ${msToS(Date.now() - start)}s`));
    },
    (finalText: string[]) =>
      updateStatus(...finalText, msToS(Date.now() - start) + 's'),
  ] as [(text: string) => void, (finalText: string[]) => void];
}

export function intervalProgress(text = '') {
  const [updateProgress, finalUpdate] = progressDraft(text);
  const progressInterval = setInterval(() => updateProgress(text), 100);
  return (...finalText: string[]) => {
    clearInterval(progressInterval);
    const output = finalText.length ? finalText : [text];
    finalUpdate(output);
  };
}

const msToS = (ms: number): string => (ms / 1000).toFixed(1);
