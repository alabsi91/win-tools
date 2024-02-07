import input from '@inquirer/input';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { readFile, readdir } from 'fs/promises';
import { z } from 'zod';

import { Log } from '@cli/logger.js';
import { spinner } from '@cli/spinner.js';
import Schema from '@schema';
import { recursiveCopy } from '@utils/utils.js';
import path from 'path';

export default async function restoreFiles(txtFilePath: string | undefined, backupPath: string | undefined) {
  txtFilePath = txtFilePath ?? (await input({ message: 'Enter the path of the text file: ' }));
  backupPath = backupPath ?? (await input({ message: 'Enter the path to save the backup files: ' }));

  const loading = spinner('Reading the text file...');

  if (!existsSync(txtFilePath)) {
    loading.error('\nThe text file does not exist.');
    process.exit(1);
  }

  if (!existsSync(backupPath)) {
    loading.error('\nThe backup path does not exist.');
    process.exit(1);
  }

  const pathsStr = await readFile(txtFilePath, { encoding: 'utf-8' });
  const pathsArr = pathsStr
    .split('\n')
    .filter(e => e.trim() && !e.trim().startsWith('#'))
    .map(e => e.trim());

  loading.stop();
  Log.info(`Found "${chalk.yellow(pathsArr.length)}" paths in the text file.\n`);

  const filesInBackupPath = (await readdir(backupPath)).map(e => path.join(backupPath!, e));

  for (let i = 0; i < pathsArr.length; i++) {
    const pathStr = pathsArr[i].replace(/%.+%/g, match => {
      const env = process.env[match.replace(/%/g, '')];
      if (!env) return match;
      return env;
    });

    // get the backup path that matches the pathStr
    const backupPathMatch = filesInBackupPath.find(e => path.basename(e) === path.basename(pathStr));
    if (!backupPathMatch) {
      Log.error(`Failed to find ${chalk.yellow(pathStr)} in the backup path.\n`);
      continue;
    }

    Log.info(`Copying ${chalk.yellow(backupPathMatch)} to ${chalk.yellow(pathStr)}\n`);

    try {
      await recursiveCopy(backupPathMatch, pathStr);
    } catch (error) {
      Log.error(`Failed to copy ${chalk.yellow(backupPathMatch)} to ${chalk.yellow(pathStr)}\n`);
    }
  }
}

restoreFiles.schema = Schema.createCommand({
  command: 'restore-files',
  description: 'Restore files from a text file.',
  aliases: ['restore-folders', 'restore-paths'],
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
      description: 'The path to save the backup folder.',
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
