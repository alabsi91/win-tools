import confirm from '@inquirer/confirm';
import input from '@inquirer/input';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { z } from 'zod';

import { Log } from '@cli/logger.js';
import Schema from '@schema';
import { installChoco, installChocoPackage, isChocoInstalled } from '@utils/utils.js';

export default async function chocoRestore(filePath: string | undefined) {
  Log.info('Checking if choco is installed...\n');

  const isChoco = await isChocoInstalled();
  if (!isChoco) {
    Log.error('Choco is not installed. Please install it first.\n');

    const confirmInstall = await confirm({ message: 'Do you want to install choco ?' });
    if (!confirmInstall) return;

    await installChoco();
  }

  filePath = filePath ?? (await input({ message: 'Enter the path of the backup text file: ' }));

  Log.info('Reading backup text file...\n');

  // check if backup text file exits
  if (!existsSync(filePath)) {
    Log.error('Backup text file does not exist.\n');
    process.exit(1);
  }

  const packagesStr = await readFile(filePath, { encoding: 'utf-8' });
  const packagesArr = packagesStr
    .split('\n')
    .filter(e => e.trim() && !e.trim().startsWith('#'))
    .map(e => e.trim());

  Log.info(`Found "${chalk.yellow(packagesArr.length)}" packages in the backup text file.`);

  for (let i = 0; i < packagesArr.length; i++) {
    const packageName = packagesArr[i];
    Log.info('\nInstalling package:', chalk.yellow(packageName), '\n');
    await installChocoPackage(packageName);
  }
}

chocoRestore.schema = Schema.createCommand({
  command: 'choco-restore',
  description: `Restore all installed choco packages from a text file\nthat contains packages names ${chalk.yellow('(one per line)')}.`,
  example: `chrome-remote-desktop-chrome\nfirefox\n${chalk.white.dim.italic('# This is a comment')}\nspotify`,
  aliases: ['restore-packages', 'install'],
  options: [
    {
      name: 'path',
      type: z.string().optional(),
      description: 'The path to the backup text file.',
    },
    {
      name: 'help',
      type: z.boolean().optional(),
      description: 'Show the help message for this command.',
      aliases: ['h'],
    },
  ],
});
