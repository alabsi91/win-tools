import { z } from 'zod';

import { spinner } from '@cli/spinner.js';
import { $, CONSTANTS, sleep } from '@cli/terminal.js';
import Schema from '@schema';
import path from 'path';

export default async function enableWin10Context() {
  const loading = spinner('Enabling Windows 10 context menu...');
  await sleep(1000);

  try {
    await $`regedit.exe /s "${path.join(CONSTANTS.projectRoot, 'assets', 'enableWin10Context.reg')}"`;
  } catch (error) {
    loading.error('Failed to enable Windows 10 context menu.');
    console.log(error);
    return;
  }

  loading.success('Enabled Windows 10 context menu.');
}

enableWin10Context.schema = Schema.createCommand({
  command: 'enable-old-menu',
  description: 'Enable Windows 10 context menu.',
  aliases: ['enableoldmenu', 'enable-win10-context'],
  options: [
    {
      name: 'help',
      type: z.boolean().optional(),
      description: 'Show the help message for this command.',
      aliases: ['h'],
    },
  ],
});
