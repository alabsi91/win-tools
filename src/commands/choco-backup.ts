import confirm from '@inquirer/confirm';
import input from '@inquirer/input';
import Schema from '@schema';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { z } from 'zod';

import { Log } from '@cli/logger.js';
import { spinner } from '@cli/spinner.js';
import { getChocoInstalledPackages, installChoco, isChocoInstalled } from '@utils/utils.js';

export default async function chocoBackup(savePath?: string, overwrite?: boolean) {
  const loading = spinner('Checking if choco is installed...');

  const isChoco = await isChocoInstalled();
  if (!isChoco) {
    loading.error('Choco is not installed. Please install it first.');

    const confirmInstall = await confirm({ message: 'Do you want to install choco ?' });
    if (!confirmInstall) return;

    await installChoco();
  }

  loading.start('Getting packages... ');

  const packagesList = await getChocoInstalledPackages();
  const packagesArr = packagesList.split('\n').map(e => e.trim().replace(/\|.+/, ''));

  loading.stop();
  Log.info(`Found "${chalk.yellow(packagesArr.length)}" packages.\n`);

  const pathToSave = savePath ?? (await input({ message: 'Enter the path to save the backup text file :' }));

  // check if file exists
  if (existsSync(pathToSave)) {
    const isConfirm = overwrite ?? (await confirm({ message: 'The file already exists. Do you want to overwrite it ?' }));
    if (!isConfirm) {
      Log.warn('\bFile already exists. Aborted.');
      return;
    }
  }

  const content = packagesArr.join('\n');
  await writeFile(pathToSave, content, { encoding: 'utf-8' });

  Log.success(`\nFile "${chalk.yellow(pathToSave)}" created successfully.`);
}

chocoBackup.schema = Schema.createCommand({
  command: 'choco-backup',
  description: 'Backup all installed choco packages to a text file.',
  aliases: ['backup-packages'],
  argsType: z.string().array().length(0),
  options: [
    {
      name: 'path',
      type: z.string().optional(),
      description: 'The path to save the backup text file.',
      example: '--path=path/to/file.txt',
    },
    {
      name: 'overwrite',
      type: z.boolean().optional(),
      description: 'Overwrite the file if it already exists.',
      aliases: ['f'],
    },
    {
      name: 'help',
      type: z.boolean().optional(),
      description: 'Show the help message for this command.',
      aliases: ['h'],
    },
  ],
});
