import input from '@inquirer/input';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { z } from 'zod';

import { Log } from '@cli/logger.js';
import { spinner } from '@cli/spinner.js';
import Schema from '@schema';
import { recursiveCopy } from '@utils/utils.js';
import path from 'path';

export default async function backupFiles(txtFilePath: string | undefined, backupPath: string | undefined) {
  txtFilePath = txtFilePath ?? (await input({ message: 'Enter the path of the text file: ' }));
  backupPath = backupPath ?? (await input({ message: 'Enter the path to save the backup files: ' }));

  const loading = spinner('Reading the text file...');

  // check if the text file exits
  if (!existsSync(txtFilePath)) {
    loading.error('\nThe text file does not exist.');
    process.exit(1);
  }

  const pathsStr = await readFile(txtFilePath, { encoding: 'utf-8' });
  const pathsArr = pathsStr
    .split('\n')
    .filter(e => e.trim() && !e.trim().startsWith('#'))
    .map(e => e.trim());

  loading.stop();
  Log.info(`Found "${chalk.yellow(pathsArr.length)}" paths in the text file.\n`);

  for (let i = 0; i < pathsArr.length; i++) {
    const pathStr = pathsArr[i].replace(/%.+%/g, match => {
      const env = process.env[match.replace(/%/g, '')];
      if (!env) return match;
      return env;
    });

    Log.info(`Copying ${chalk.yellow(pathStr)} to ${chalk.yellow(backupPath)}\n`);

    try {
      await recursiveCopy(pathStr, path.join(backupPath, path.basename(pathStr)));
    } catch (error) {
      Log.error(`Failed to copy ${chalk.yellow(pathStr)} to ${chalk.yellow(backupPath)}\n`);
    }
  }
}

backupFiles.schema = Schema.createCommand({
  command: 'backup-files',
  description: 'Backup files from a text file.',
  aliases: ['backup-folders', 'backup-paths'],
  options: [
    {
      name: 'textPath',
      type: z.string().optional(),
      description: 'The path to the text file.',
      aliases: ['textFile', 'txt'],
    },
    {
      name: 'backupPath',
      type: z.string().optional(),
      description: 'The path to save the backup files.',
      aliases: ['backupFolder', 'backup'],
    },
    {
      name: 'help',
      type: z.boolean().optional(),
      description: 'Show the help message for this command.',
      aliases: ['h'],
    },
  ],
});
