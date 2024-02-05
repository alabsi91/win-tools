import chalk from 'chalk';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { z } from 'zod';

import { Log } from '@cli/logger.js';
import { spinner } from '@cli/spinner.js';
import Schema from '@schema';
import { askForStringInput, askToConfirm, installChoco, installChocoPackage, isChocoInstalled } from '@utils/utils.js';

export default async function chocoRestore(filePath: string | undefined) {
  const loading = spinner('Checking if choco is installed...');

  const isChoco = await isChocoInstalled();
  if (!isChoco) {
    loading.error('Choco is not installed. Please install it first.');

    const confirmInstall = await askToConfirm('Do you want to install choco ?');
    if (!confirmInstall) return;

    await installChoco();
  }

  filePath = filePath ?? (await askForStringInput('Enter the path of the backup text file :'));

  loading.start('Reading backup text file...');

  // check if backup text file exits
  if (!existsSync(filePath)) {
    loading.error('Backup text file does not exist.');
    return;
  }

  const packagesStr = await readFile(filePath, { encoding: 'utf-8' });
  const packagesArr = packagesStr
    .split('\n')
    .filter(e => e.trim() && !e.trim().startsWith('#'))
    .map(e => e.trim());

  loading.stop();
  Log.info(`Found "${chalk.yellow(packagesArr.length)}" packages in the backup text file.`);

  for (let i = 0; i < packagesArr.length; i++) {
    const packageName = packagesArr[i];
    Log.info('\nInstalling package:', chalk.yellow(packageName), '\n');
    await installChocoPackage(packageName);
  }
}

chocoRestore.schema = Schema.createCommand({
  command: 'restore',
  description: `Restore all installed choco packages from a text file\nthat contains packages names ${chalk.yellow('(one per line)')}.`,
  example: `chrome-remote-desktop-chrome\nfirefox\n${chalk.white.dim.italic('# This is a comment')}\nspotify`,
  aliases: ['restore-packages', 'choco-restore', 'install'],
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
