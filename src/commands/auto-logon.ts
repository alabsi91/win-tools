import input from '@inquirer/input';
import c from 'chalk';
import path from 'path';
import { z } from 'zod';

import { Log } from '@cli/logger.js';
import { CONSTANTS, cmdPassThrough } from '@cli/terminal.js';
import Schema from '@schema';
import { getPowerShell, isPowerShellPolicySet } from '@utils/utils.js';

type Params = {
  username?: string;
  domain?: string;
  autoLogonCount?: number;
  removeLegalPrompt?: boolean;
  backupFile?: string;
};

export default async function autoLogon({ username, domain, autoLogonCount, removeLegalPrompt, backupFile }: Params) {
  const hasPermissions = await isPowerShellPolicySet();
  if (!hasPermissions) {
    Log.error('\nPowerShell execution policy is not set, permission denied.\n');
    Log.info(
      'Please run the following command in an elevated PowerShell session first:',
      c.green('\n"') + c.yellow('Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force') + c.green('"\n'),
    );
    process.exit(1);
  }

  username = username ?? (await input({ message: 'Enter the username :' }));

  let scriptOptions = `-Username ${username}`;

  if (domain) scriptOptions += ` -Domain ${domain}`;
  if (removeLegalPrompt) scriptOptions += ' -RemoveLegalPrompt';
  if (backupFile) scriptOptions += ` -BackupFile "${backupFile}"`;
  if (typeof autoLogonCount === 'number') scriptOptions += ` -AutoLogonCount ${autoLogonCount}`;

  const shell = await getPowerShell();
  const scriptPath = path.join(CONSTANTS.projectRoot, 'assets', 'autologon.ps1');

  try {
    await cmdPassThrough`& "${scriptPath}" ${scriptOptions} ${{ shell }}`;
    Log.success('\nEnabled auto logon.\n');
  } catch (error) {
    Log.error('\nFailed to enable auto logon.\n');
  }
}

autoLogon.schema = Schema.createCommand({
  command: 'auto-logon',
  description: 'Enables auto logon using the specified username and password.',
  aliases: ['autologon', 'enable-autologon', 'enableautologon'],
  options: [
    {
      name: 'username',
      type: z.string().optional(),
      description: 'The username of the user to automatically logon as.',
    },
    {
      name: 'domain',
      type: z.string().optional(),
      description: 'The domain of the user to automatically logon as.',
    },
    {
      name: 'autoLogonCount',
      type: z.number().optional(),
      description: 'The number of logons that auto logon will be enabled.',
    },
    {
      name: 'removeLegalPrompt',
      type: z.boolean().optional(),
      description: 'Removes the system banner to ensure interventionless logon.',
      aliases: ['r'],
    },
    {
      name: 'backupFile',
      type: z.string().optional(),
      description: 'If specified the existing settings such as the system banner text \nwill be backed up to the specified file.',
    },
    {
      name: 'help',
      type: z.boolean().optional(),
      description: 'Show the help message for this command.',
      aliases: ['h'],
    },
  ],
});
