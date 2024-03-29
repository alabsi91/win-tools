import path from 'path';
import { z } from 'zod';

import { Log } from '@cli/logger.js';
import { $, CONSTANTS } from '@cli/terminal.js';
import checkbox from '@inquirer/checkbox';
import Schema from '@schema';
import { getPowerShell } from '@utils/utils.js';

export default async function setRegistry() {
  const selected = await checkbox({
    message: 'Which regex do you want to set?',
    choices: regList,
    pageSize: regList.length,
  });

  console.log('');

  for (let i = 0; i < selected.length; i++) {
    const regName = selected[i];
    try {
      await $`regedit.exe /s "${path.join(CONSTANTS.projectRoot, 'assets', regName)}"`;
    } catch (error) {
      Log.error('Failed to set regex.');
      console.log(error);
      process.exit(1);
    }
  }

  // Restart explorer
  const shell = await getPowerShell();
  await $`stop-process -name explorer –force${{ shell }}`;

  Log.success('Set registry successfully.');
}

setRegistry.schema = Schema.createCommand({
  command: 'set-reg',
  description: 'Set registry to enable or disable features.',
  aliases: ['set-registry', 'setreg'],
  options: [
    {
      name: 'help',
      type: z.boolean().optional(),
      description: 'Show the help message for this command.',
      aliases: ['h'],
    },
  ],
});

const regList = [
  { name: 'Enable old Windows 10 context menu', value: 'EnableWin10Context.reg' },
  { name: 'Disable old Windows 10 context menu', value: 'DisableWin10Context.reg' },

  { name: 'Disable Copilot', value: 'DisableCopilot.reg' },
  { name: 'Enable Copilot', value: 'EnableCopilot.reg' },

  { name: 'Disable Telemetry', value: 'DisableTelemetry.reg' },
  { name: 'Enable Telemetry', value: 'EnableTelemetry.reg' },

  { name: 'Disable Taskbar Widgets', value: 'DisableWidgetsTaskbar.reg' },
  { name: 'Enable Taskbar Widgets', value: 'EnableWidgetsTaskbar.reg' },

  { name: 'Disable Windows Suggestions', value: 'DisableWindowsSuggestions.reg' },
  { name: 'Enable Windows Suggestions', value: 'EnableWindowsSuggestions.reg' },

  { name: 'Show Extensions for Known File Types', value: 'ShowExtensionsForKnownFileTypes.reg' },

  { name: 'Show Hidden Folders', value: 'ShowHiddenFolders.reg' },

  { name: 'Disable Mouse Enhance Pointer Precision', value: 'DisableEnhancePointerPrecision.reg' },

  { name: 'Enable dark mode', value: 'EnableDarkMode.reg' },
  { name: 'Enable light mode', value: 'EnableLightMode.reg' },
];
