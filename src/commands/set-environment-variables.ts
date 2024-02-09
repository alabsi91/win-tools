import input from '@inquirer/input';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { z } from 'zod';

import { Log } from '@cli/logger.js';
import Schema from '@schema';
import { setEnvVariable } from '@utils/utils.js';

export default async function setEnvironmentVariables(filePath: string | undefined, isScopeMachine: boolean = false) {
  filePath = filePath ?? (await input({ message: 'Enter the path of the environment variables text file :' }));

  Log.info('Reading text file...\n');

  if (!existsSync(filePath)) {
    Log.error('Backup text file does not exist.\n');
    return;
  }

  const fileStr = await readFile(filePath, { encoding: 'utf-8' });
  const variables = fileStr
    .split('\n')
    .filter(e => e.trim() && !e.trim().startsWith('#'))
    .map(e => {
      if (e.includes('=')) {
        const [key, value] = e.split('=');
        return { key: key.trim(), value: value.trim() };
      }
      return { key: 'PATH', value: e.trim() };
    });

  Log.info(`Found "${chalk.yellow(variables.length)}" environment variables.\n`);

  for (let i = 0; i < variables.length; i++) {
    const variable = variables[i];
    const scope = isScopeMachine ? 'Machine' : 'User';
    Log.info('Setting:', chalk.yellow(variable.key), '=', chalk.green(variable.value), 'for', chalk.bold.red(scope), 'profile');
    await setEnvVariable(variable, scope);
  }
}

setEnvironmentVariables.schema = Schema.createCommand({
  command: 'set-env',
  description: `Set environment variables from a text file \nthat contains environment variables ${chalk.yellow('(one per line)')}.`,
  example: `ANDROID_HOME${chalk.red('=')}F:\\Android\\Sdk\n${chalk.white.dim.italic('# 👇 Will be added to PATH ')}\nF:\\Android\\Sdk\\emulator`,
  aliases: ['set-environment-variables', 'setenv'],
  options: [
    {
      name: 'path',
      type: z.string().optional(),
      description: 'The path to the environment variables text file.',
    },
    {
      name: 'machine',
      type: z.boolean().default(false),
      description: 'Set environment variables for the machine profile.',
      aliases: ['m', 'system', 's'],
    },
    {
      name: 'help',
      type: z.boolean().optional(),
      description: 'Show the help message for this command.',
      aliases: ['h'],
    },
  ],
});
