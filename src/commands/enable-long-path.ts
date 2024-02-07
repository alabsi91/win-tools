import { z } from 'zod';

import { spinner } from '@cli/spinner.js';
import { $, CONSTANTS, sleep } from '@cli/terminal.js';
import Schema from '@schema';
import path from 'path';

export default async function enableLongPath() {
  const loading = spinner('Enabling Windows long path...');
  await sleep(1000);

  try {
    await $`regedit.exe /s "${path.join(CONSTANTS.projectRoot, 'assets', 'enableLongPaths.reg')}"`;
  } catch (error) {
    loading.error('Failed to enable Windows long path.');
    console.log(error);
    return;
  }

  loading.success('Enabled Windows long path.');
}

enableLongPath.schema = Schema.createCommand({
  command: 'enable-long-path',
  description: 'Enable Windows long path.',
  aliases: ['enablelongpath', 'long-path'],
  options: [
    {
      name: 'help',
      type: z.boolean().optional(),
      description: 'Show the help message for this command.',
      aliases: ['h'],
    },
  ],
});
