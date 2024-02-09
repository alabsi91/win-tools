import path from 'path';
import { z } from 'zod';

import { Log } from '@cli/logger.js';
import { $, CONSTANTS } from '@cli/terminal.js';
import Schema from '@schema';
import { getPowerShell } from '@utils/utils.js';

export default async function cleanStartMenu() {
  const menuTemplatePath = path.join(CONSTANTS.projectRoot, 'assets', 'start2.bin');
  const targetPath = `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Packages\\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\\LocalState`;

  Log.info('\nCleaning start menu...\n');

  try {
    const shell = await getPowerShell();
    await $`Copy-Item -Path "${menuTemplatePath}" -Destination "${targetPath}" -Force; stop-process -name explorer –force${{ shell }}`;
  } catch (error) {
    Log.error(`\nFailed to copy ${menuTemplatePath} to ${targetPath}.\n`);
    process.exit(1);
  }

  Log.success('\nCleaned start menu.\n');
}

cleanStartMenu.schema = Schema.createCommand({
  command: 'clean-start-menu',
  description: 'Cleans the start menu of all shortcuts.',
  aliases: ['cleanstartmenu', 'clean-startmenu'],
  options: [
    {
      name: 'help',
      type: z.boolean().optional(),
      description: 'Show the help message for this command.',
      aliases: ['h'],
    },
  ],
});
