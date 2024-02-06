import input from '@inquirer/input';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { z } from 'zod';

import { Log } from '@cli/logger.js';
import { spinner } from '@cli/spinner.js';
import { cmdPassThrough } from '@cli/terminal.js';
import Schema from '@schema';
import { getPowerShell } from '@utils/utils.js';

export default async function runScripts(filePath?: string, exitOnError = true) {
  filePath = filePath ?? (await input({ message: 'Enter the path of the scripts text file: ' }));

  const loading = spinner('Reading the text file...');

  // check if the text file exits
  if (!existsSync(filePath)) {
    loading.error('\nThe text file does not exist.');
    process.exit(1);
  }

  const scriptsStr = await readFile(filePath, { encoding: 'utf-8' });
  const scriptsArr = scriptsStr
    .split('\n')
    .filter(e => e.trim() && !e.trim().startsWith('#'))
    .map(e => e.trim());

  loading.stop();
  Log.info(`Found "${chalk.yellow(scriptsArr.length)}" scripts in the text file.`);

  for (let i = 0; i < scriptsArr.length; i++) {
    const script = scriptsArr[i];
    Log.info('\nRunning script', chalk.yellow(script));

    if (script.trim().toLocaleLowerCase().startsWith('@powershell')) {
      const shell = await getPowerShell();
      try {
        await cmdPassThrough`${script.replace(/@powershell/i, '')}${{ shell }}`;
      } catch (error) {
        if (exitOnError) {
          Log.error('\nAn error occurred while running the script.\n');
          process.exit(1);
        }
        Log.warn('\nAn error occurred while running the script. Continuing...\n');
      }
      continue;
    }

    try {
      await cmdPassThrough`${script}`;
    } catch (error) {
      if (exitOnError) {
        Log.error('\nAn error occurred while running the script.\n');
        process.exit(1);
      }
      Log.warn('\nAn error occurred while running the script. Continuing...\n');
    }
  }
}

runScripts.schema = Schema.createCommand({
  command: 'run-scripts',
  description: `Run scripts from a text file\nthat contains scripts ${chalk.yellow('(one per line)')}.`,
  example: `npm i -g ts-node\ngit config --global user.name "My Name"\n${chalk.white.dim.italic('# This is a comment')}\n@powershell winget install 7zip`,
  aliases: ['runscripts'],
  options: [
    {
      name: 'path',
      type: z.string().optional(),
      description: 'The path to the scripts text file.',
    },
    {
      name: 'exitOnError',
      type: z.boolean().optional(),
      description: 'Exit the process if an error occurs.',
      aliases: ['e', 'exit'],
    },
    {
      name: 'help',
      type: z.boolean().optional(),
      description: 'Show the help message for this command.',
      aliases: ['h'],
    },
  ],
});
