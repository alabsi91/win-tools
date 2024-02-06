#!/usr/bin/env node

import gradient from 'gradient-string';
import { z } from 'zod';

import { CONSTANTS, testCliArgsInput } from '@cli/terminal.js';
import Schema from '@schema';

// commands
import chocoBackup from '@commands/choco-backup.js';
import chocoRestore from '@commands/choco-restore.js';
import disableWin10Context from '@commands/disable-win10-context.js';
import enableLongPath from '@commands/enable-long-path.js';
import enableWin10Context from '@commands/enable-win10-context.js';
import setEnvironmentVariables from '@commands/set-environment-variables.js';
import autoLogon from '@commands/auto-logon.js';

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
  testCliArgsInput('-h');
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
    chocoBackup.schema,
    chocoRestore.schema,
    enableWin10Context.schema,
    disableWin10Context.schema,
    enableLongPath.schema,
    setEnvironmentVariables.schema,
    autoLogon.schema,
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
    Schema.printHelp();
    return;
  }

  if (command === 'backup') {
    const { path, overwrite, help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['backup'], includeGlobalOptions: false });
      return;
    }

    await chocoBackup(path, overwrite);
    return;
  }

  if (command === 'restore') {
    const { path, help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['restore'], includeGlobalOptions: false });
      return;
    }

    await chocoRestore(path);
    return;
  }

  if (command === 'enable-old-menu') {
    const { help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['enable-old-menu'], includeGlobalOptions: false });
      return;
    }

    await enableWin10Context();
    return;
  }

  if (command === 'disable-old-menu') {
    const { help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['disable-old-menu'], includeGlobalOptions: false });
      return;
    }

    await disableWin10Context();
    return;
  }

  if (command === 'enable-long-path') {
    const { help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['enable-long-path'], includeGlobalOptions: false });
      return;
    }

    await enableLongPath();
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

  if (command === 'auto-logon') {
    const { username, domain, autoLogonCount, removeLegalPrompt, backupFile, help } = results.data;

    if (help) {
      Schema.printHelp<typeof results>({ includeCommands: ['auto-logon'], includeGlobalOptions: false });
      return;
    }

    await autoLogon({ username, domain, autoLogonCount, removeLegalPrompt, backupFile });
  }
}

main(); // 🚀 Start the app.
