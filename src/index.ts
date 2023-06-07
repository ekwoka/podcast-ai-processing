import DraftLog from 'draftlog';
import { GPT4All } from 'gpt4all';

import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { cwd, exit } from 'node:process';
import { compose } from 'node:stream';

import { doesExist, hasBin } from './utils/index.js';

DraftLog(console);

const CWD = cwd();

const relativeSource = process.argv[2];

if (!relativeSource) {
  console.error(
    'This script requires being passed a filepath as an argument to the script'
  );
  exit(1);
}

const source = resolve(CWD, relativeSource);

if (!(await doesExist(source))) {
  console.error(
    `file ${source} does not exist. Please check the passed in file path`
  );
  exit(1);
}

{
  const mediaFileTypes = ['.mp4', '.mp3', '.wav', '.flac', '.mov'];
  const ext = extname(source);
  if (!mediaFileTypes.includes(ext)) {
    console.error(
      `files of type ${ext} probably don't contain audio that is parsable. Please check the path`
    );
    exit(1);
  }
}

{
  const necessaryBinaries = ['python', 'pip', 'ffmpeg', 'whisper'];
  const missingBins = await necessaryBinaries.reduce(async (last, next) => {
    const output = await last;
    const has = await hasBin(next);
    if (!has) output.push(next);
    return output;
  }, Promise.resolve([] as string[]));
  if (missingBins.length) {
    console.error(
      `You are missing the following tools: ${missingBins.map(
        (name) => `
        - ${name}`
      )}
Please install them locally to continue`
    );
    exit(1);
  }
}
const gpt4all = new GPT4All();

await gpt4all.init();

await gpt4all.open();

const summarizor = compose(async function* (source: AsyncIterable<string>) {
  let paragraph: string[] = [];
  for await (const line of source) {
    paragraph.push(line);
    if (paragraph.length < 5) continue;
    const proompt =
      '### Instruction: The prompt below is a transcript of a podcast. Write an appropriate summarization to reduce the total length without leaving out details.\n### Prompt:"' +
      paragraph.join('\n') +
      '"\n### Response:';
    paragraph = [];
    const response = await gpt4all.proompt(proompt);
    console.log(proompt, '\n');
    console.log(response, '\n');
    yield JSON.stringify(
      {
        proompt,
        response,
      },
      null,
      2
    );
  }
}, createWriteStream(join(CWD, 'summary.json')));
const transcriptRegex = /\[\d+:\d+\.\d+ --> \d+:\d+\.\d+]\s+([^\n]+)/gm;
const whisper = spawn('whisper', [source], {
  stdio: ['ignore', 'pipe', 'ignore'],
  env: Object.assign(process.env, {
    PYTHONUNBUFFERED: 'True',
  }),
});
whisper.stdout.addListener('data', (datum: Buffer) => {
  const lines = datum.toString().matchAll(transcriptRegex);
  for (const line of lines) {
    console.log(line[1]);
    summarizor.write(line[1]);
  }
});
await new Promise((res) => whisper.addListener('exit', res));

declare module 'node:stream' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace internal {
    function compose<T>(
      ...streams: (Stream | GeneratorFunction | Iterable<T>)[]
    ): TransformStream;
  }
}

gpt4all.close();
