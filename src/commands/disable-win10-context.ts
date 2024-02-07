import { z } from 'zod';

import { spinner } from '@cli/spinner.js';
import { $, CONSTANTS, sleep } from '@cli/terminal.js';
import Schema from '@schema';
import path from 'path';

export default async function disableWin10Context() {
  const loading = spinner('Disabling Windows 10 context menu...');
  await sleep(1000);

  try {
    await $`regedit.exe /s "${path.join(CONSTANTS.projectRoot, 'assets', 'disableWin10Context.reg')}"`;
  } catch (error) {
    loading.error('Failed to disable Windows 10 context menu.');
    console.log(error);
    return;
  }

  loading.success('Disabled Windows 10 context menu.');
}

disableWin10Context.schema = Schema.createCommand({
  command: 'disable-old-menu',
  description: 'Disable Windows 10 context menu.',
  aliases: ['disableoldmenu', 'disable-win10-context'],
  options: [
    {
      name: 'help',
      type: z.boolean().optional(),
      description: 'Show the help message for this command.',
      aliases: ['h'],
    },
  ],
});
