#!/usr/bin/env node

import select from '@inquirer/select';
import chalk from 'chalk';
import gradient from 'gradient-string';
import { z } from 'zod';

import { Log } from '@cli/logger.js';
import { CONSTANTS, testCliArgsInput } from '@cli/terminal.js';
import Schema from '@schema';

// commands
import autoLogon from '@commands/auto-logon.js';
import backupFiles from '@commands/backup-files.js';
import chocoRestore from '@commands/choco-restore.js';
import cleanStartMenu from '@commands/clean-start-menu.js';
import disableFirewall from '@commands/disable-firewall.js';
import restoreFiles from '@commands/restore-files.js';
import runScripts from '@commands/run-scripts.js';
import setEnvironmentVariables from '@commands/set-environment-variables.js';
import setRegistry from '@commands/set-registry.js';
import uninstallBloat from '@commands/uninstall-bloat.js';

const coolGradient = gradient([
  { color: '#FA8BFF', pos: 0 },
  { color: '#2BD2FF', pos: 0.5 },
  { color: '#2BFF88', pos: 1 },
]);

// ? `https://www.kammerl.de/ascii/AsciiSignature.php` 👈 to convert your app's title to ASCII art.
// ? `https://codebeautify.org/javascript-escape-unescape` 👈 escape your title's string for JavaScript.
console.log(
  coolGradient(String.raw` 
 __     __     __     __   __        ______   ______     ______     __         ______   
/\ \  _ \ \   /\ \   /\ "-.\ \      /\__  _\ /\  __ \   /\  __ \   /\ \       /\  ___\  
\ \ \/ ".\ \  \ \ \  \ \ \-.  \     \/_/\ \/ \ \ \/\ \  \ \ \/\ \  \ \ \____  \ \___  \ 
 \ \__/".~\_\  \ \_\  \ \_\\"\_\       \ \_\  \ \_____\  \ \_____\  \ \_____\  \/\_____\
  \/_/   \/_/   \/_/   \/_/ \/_/        \/_/   \/_____/   \/_____/   \/_____/   \/_____/
`),
);

// Here you can test your CLI arguments while using hot reload in development mode.
if (CONSTANTS.isDev) {
  testCliArgsInput('');
}

async function main() {
  const options = Schema.createOptions({
    cliName: 'win-tools',
    description: 'A CLI tools for Windows.',
    argsType: z.string().array().length(0),
    globalOptions: [
      {
        name: 'help',
        type: z.boolean().optional(),
        description: 'Show this help message.',
        aliases: ['h'],
      },
    ],
  });

  const results = Schema.parse(
    chocoRestore.schema,
    backupFiles.schema,
    restoreFiles.schema,
    setEnvironmentVariables.schema,
    setRegistry.schema,
    autoLogon.schema,
    runScripts.schema,
    uninstallBloat.schema,
    disableFirewall.schema,
    cleanStartMenu.schema,
    options,
  );

  // when parsing arguments fails
  if (!results.success) {
    Schema.formatError(results.error);
    Schema.printHelp();
    process.exit(1);
  }

  const { command } = results.data;

  // When no command is given, you will get the global options.
  if (!command) {
    const { help } = results.data;

    if (help) {
      Schema.printHelp();
      return;
    }

    Log.warn(
      'No command is given. Please select a command from the list to get help.',
      '\nOr run',
      chalk.cyan('`win-tools --help`'),
      'to see the full help message.\n',
    );

    const choices = results.schemas
      .filter(e => e.command)
      .map(e => ({ name: e.command, value: e.command!, description: '\n' + (e.command ? e.description : '') }));

    const answer = await select({
      message: 'Select a command to get help',
      choices,
      pageSize: results.schemas.length,
    });

    console.log('');
    Schema.printHelp({ includeCommands: [answer], includeDescription: false, includeUsage: false, includeGlobalOptions: false });

    return;
  }

  if (command === 'choco-restore') {
    const { path, help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['choco-restore'], includeGlobalOptions: false });
      return;
    }

    await chocoRestore(path);
    return;
  }

  if (command === 'backup-files') {
    const { textPath, backupPath, help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['backup-files'], includeGlobalOptions: false });
      return;
    }

    await backupFiles(textPath, backupPath);
    return;
  }

  if (command === 'restore-files') {
    const { textPath, backupPath, help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['restore-files'], includeGlobalOptions: false });
      return;
    }

    await restoreFiles(textPath, backupPath);
    return;
  }

  if (command === 'set-env') {
    const { path, machine, help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['set-env'], includeGlobalOptions: false });
      return;
    }

    await setEnvironmentVariables(path, machine);
    return;
  }

  if (command === 'set-reg') {
    const { help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['set-reg'], includeGlobalOptions: false });
      return;
    }

    await setRegistry();
    return;
  }

  if (command === 'auto-logon') {
    const { username, domain, autoLogonCount, removeLegalPrompt, backupFile, help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['auto-logon'], includeGlobalOptions: false });
      return;
    }

    await autoLogon({ username, domain, autoLogonCount, removeLegalPrompt, backupFile });
    return;
  }

  if (command === 'run-scripts') {
    const { path, exitOnError, help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['run-scripts'], includeGlobalOptions: false });
      return;
    }

    await runScripts(path, exitOnError);
    return;
  }

  if (command === 'uninstall-bloat') {
    const { help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['uninstall-bloat'], includeGlobalOptions: false });
      return;
    }

    await uninstallBloat();
    return;
  }

  if (command === 'disable-firewall') {
    const { help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['disable-firewall'], includeGlobalOptions: false });
      return;
    }

    await disableFirewall();
    return;
  }

  if (command === 'clean-start-menu') {
    const { help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['clean-start-menu'], includeGlobalOptions: false });
      return;
    }

    await cleanStartMenu();
  }
}

main(); // 🚀 Start the app.
