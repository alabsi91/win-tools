import chalk from 'chalk';
import path from 'path';
import { z } from 'zod';

import { Log } from '@cli/logger.js';
import { CONSTANTS, cmdPassThrough } from '@cli/terminal.js';
import Schema from '@schema';
import { getPowerShell, isPowerShellPolicySet } from '@utils/utils.js';

export default async function disableFirewall() {
  const shell = await getPowerShell();
  const scriptPath = path.join(CONSTANTS.projectRoot, 'assets', 'disableFirewall.ps1');
  const isPolicySet = await isPowerShellPolicySet();

  // permission denied
  if (!isPolicySet) {
    Log.error('\nPowerShell execution policy is not set, permission denied.\n');
    Log.info(
      'Please run the following command in an evaluated PowerShell session first:',
      chalk.green('\n"') + chalk.yellow('Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force') + chalk.green('"\n'),
    );
    process.exit(1);
  }

  try {
    await cmdPassThrough`${scriptPath}${{ shell }}`;
    Log.success('\nDisabled Windows firewall, Windows Defender, and Windows Defender Cloud.');
  } catch (error) {
    Log.error('\nAn error occurred while running the command.');
  }
}

disableFirewall.schema = Schema.createCommand({
  command: 'disable-firewall',
  description: 'Disable Windows firewall, Windows Defender, and Windows Defender Cloud.',
  aliases: ['disable-defender'],
  options: [
    {
      name: 'help',
      type: z.boolean().optional(),
      description: 'Show the help message for this command.',
      aliases: ['h'],
    },
  ],
});
